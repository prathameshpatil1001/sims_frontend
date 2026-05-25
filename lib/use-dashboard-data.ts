'use client';

import { useEffect, useRef, useCallback } from 'react';
import { useDashboard } from './dashboard-context';
import {
  monitoringApi,
  contractsApi,
  signalsApi,
  paperTradingApi,
  analysisApi,
  type HealthResponse,
  type ContractSnapshot,
  type PositionsResponse,
  type TradeHistoryResponse,
} from './api-service';

const HEALTH_POLL_MS = 5000;
const PRICE_POLL_MS = 2000;
const PAPER_POLL_MS = 5000;
const SIGNAL_POLL_MS = 3000;

export function useDashboardData(symbol: string | null) {
  const { state, dispatch } = useDashboard();
  const symbolRef = useRef(symbol);
  symbolRef.current = symbol;

  const tfRef = useRef(state.zone2State.currentTimeframe);
  tfRef.current = state.zone2State.currentTimeframe;

  // ─── Health polling ─────────────────────────────────────────────────────────
  const fetchHealth = useCallback(async () => {
    try {
      const health: HealthResponse = await monitoringApi.getHealth();

      // Map backend health to frontend HealthIndicator shape
      dispatch({
        type: 'UPDATE_HEALTH',
        payload: {
          status: health.status === 'OK'
            ? 'healthy'
            : health.status === 'DEGRADED'
            ? 'warning'
            : 'critical',
          // tick_latency_ms = actual processing latency (1–50ms) — shown in dropdown
          latency: health.market.tick_latency_ms ?? 0,
          // seconds_since_last_candle drives the health status dot and "Xs ago" label
          secondsSinceLastCandle: health.market.seconds_since_last_candle ?? 0,
          feedHealth: health.market.websocket_connected ? 'connected' : 'disconnected',
          lastUpdate: Date.now(),
          uptime: health.system.uptime_seconds,
          // Extra fields used by health-indicator dropdown
          contractId: health.market.last_candle_symbol,
          killSwitchStatus: health.kill_switch.status,
          pipelineStatus: health.system.pipeline_status,
          modules: health.modules,
          sessionPhase: health.market.session_phase,
          activeRegime: health.market.active_regime,
        } as any,
      });

      // Sync daily PnL from paper trading block
      dispatch({ type: 'SET_DAILY_PNL', payload: health.paper_trading.session_pnl });

      // Sync kill switch state
      if (health.kill_switch.status === 'ACTIVE') {
        dispatch({ type: 'ARM_KILL_SWITCH', payload: true });
      }
    } catch {
      // Network error — mark as offline but don't spam console
    }
  }, [dispatch]);

  // ─── Contract price polling ──────────────────────────────────────────────────
  const fetchPrice = useCallback(async () => {
    const sym = symbolRef.current;
    if (!sym) return;
    try {
      const snap: ContractSnapshot = await contractsApi.getSnapshot(sym);
      if (snap.status?.tradable === false || snap.response_status === 'waiting_for_data' || snap.snapshot?.symbol == null) {
        if (!snap.snapshot) return; // Wait if it doesn't even have a snapshot
      }
      
      const s = snap.snapshot;
      dispatch({
        type: 'UPDATE_PRICE',
        payload: {
          symbol: s.symbol,
          current: s.ltp,
          previous: s.ohlc.close,
          change: s.change_value,
          changePercent: s.change_percent,
          timestamp: Date.now(),
          ohlc: s.ohlc,
          volume: s.volume,
          oi: s.oi,
          oi_stats: s.oi_stats,
          analytics: s.analytics,
          depth: s.depth,
          limits: s.limits,
          data_health: s.data_health,
          insights: s.insights,
          meta: snap.meta,
          status: snap.status,
        } as any,
      });
    } catch { /* ignore */ }
  }, [dispatch]);

  // ─── Signal polling ──────────────────────────────────────────────────────────
  const fetchSignal = useCallback(async () => {
    try {
      const res = await signalsApi.getLatest();
      if (res.status === 'ok' && res.signal) {
        const sig = res.signal as any;
        dispatch({
          type: 'UPDATE_ZONE1',
          payload: {
            signal: {
              direction: sig.direction ?? sig.bias ?? 'NEUTRAL',
              confidence: sig.composite_confidence ?? sig.confidence_score ?? 0,
              signalType: sig.signal_type ?? 'mean-reversion',
              persistenceCounter: sig.persistence_counter ?? 1,
              probLongSuccess: sig.prob_long ?? 0.5,
              probShortSuccess: sig.prob_short ?? 0.5,
              edgeConsistency: {
                candle1: sig.edge_1 ?? 0,
                candle2: sig.edge_2 ?? 0,
                candle3: sig.edge_3 ?? 0,
                candle4: sig.edge_4 ?? 0,
                candle5: sig.edge_5 ?? 0,
              },
              timestamp: Date.now(),
            },
            conditions: sig.conditions ?? [],
            setup: sig.trade_setup
              ? {
                  entry: sig.trade_setup.entry,
                  stopLoss: sig.trade_setup.stop_loss,
                  target1: sig.trade_setup.target_1,
                  target2: sig.trade_setup.target_2,
                  riskReward: sig.trade_setup.risk_reward ?? 2.0,
                  positionSize: sig.trade_setup.lots ?? 1,
                  fillProbability: sig.trade_setup.fill_probability ?? 0.85,
                }
              : null,
            lastUpdate: Date.now(),
          },
        });
      }
    } catch { /* ignore */ }
  }, [dispatch]);

  // ─── Paper trading polling ───────────────────────────────────────────────────
  const fetchPaperTrading = useCallback(async () => {
    try {
      const [posRes, histRes]: [PositionsResponse, TradeHistoryResponse] = await Promise.all([
        paperTradingApi.getPositions(),
        paperTradingApi.getTradeHistory(),
      ]);

      const positions = posRes.positions.map((p) => ({
        id: p.position_id,
        contract: p.position_id.split('-')[0] ?? 'SILVER',
        direction: p.direction,
        entryPrice: p.entry_price,
        quantity: p.lots,
        currentPrice: p.current_price,
        unrealizedPnL: p.unrealized_pnl,
        unrealizedPnLPercent: p.unrealized_pnl_pct,
        stopLoss: p.stop_loss,
        takeProfit: p.target_1,
        entryTime: new Date(p.entry_time).getTime(),
      }));

      const { summary } = histRes;
      const dailyMetrics = {
        grossProfit: summary.best_trade_pnl > 0 ? summary.total_pnl : 0,
        grossLoss: summary.worst_trade_pnl < 0 ? Math.abs(summary.worst_trade_pnl) : 0,
        netProfit: summary.total_pnl,
        netPnLPercent: summary.total_pnl > 0 ? summary.win_rate : -summary.win_rate,
        winRate: summary.win_rate / 100,
        profitFactor: summary.profit_factor,
        largestWin: summary.best_trade_pnl,
        largestLoss: Math.abs(summary.worst_trade_pnl),
        tradeCount: summary.total_trades,
        closedTrades: summary.total_trades,
      };

      const tradeLog = histRes.trades.map((t: any, i: number) => ({
        id: String(i + 1),
        timestamp: t.exit_time ? new Date(t.exit_time).getTime() : Date.now(),
        direction: t.direction ?? 'LONG',
        entryPrice: t.entry_price ?? 0,
        exitPrice: t.exit_price ?? 0,
        quantity: t.lots ?? 1,
        pnl: t.net_pnl ?? 0,
        pnlPercent: t.r_multiple ?? 0,
        duration: t.duration_minutes ?? 0,
        signal: t.exit_reason ?? 'MANUAL',
      }));

      dispatch({
        type: 'UPDATE_ZONE4',
        payload: { positions, dailyMetrics, tradeLog, lastUpdate: Date.now() },
      });

      dispatch({ type: 'SET_DAILY_PNL', payload: summary.total_pnl });
    } catch { /* ignore */ }
  }, [dispatch]);

  // ─── Zone 2 Data polling ───────────────────────────────────────────────────
  const fetchZone2Data = useCallback(async () => {
    const sym = symbolRef.current;
    if (!sym) return;
    try {
      const res = await analysisApi.getCandles(sym, tfRef.current);
      if (res && res.candles && res.candles.length > 0) {
        // Map backend candles to frontend OHLCData
        const ohlcData = res.candles.map((c: any) => {
          // Parse HH:MM:SS to a rough timestamp for the chart
          const [h, m, s] = (c.timestamp || '00:00:00').split(':').map(Number);
          const d = new Date();
          d.setHours(h, m, s, 0);
          return {
            time: Math.floor(d.getTime() / 1000),
            open: c.open,
            high: c.high,
            low: c.low,
            close: c.close,
            volume: c.volume,
          };
        });

        // Compute basic Microstructure from the latest candle
        const latest = res.candles[res.candles.length - 1];
        const volume = latest.volume || 0;
        const buySide = (latest.buy_pressure_pct || 50) / 100 * volume;
        const sellSide = volume - buySide;

        const microstructure = {
          cvd: [
            {
              time: Math.floor(Date.now() / 1000),
              cumulative: buySide - sellSide,
              bidVolume: buySide,
              askVolume: sellSide,
            }
          ],
          volumeOI: [
            {
              time: Math.floor(Date.now() / 1000),
              volume: volume,
              openInterest: latest.oi || 0,
              buySide: buySide,
              sellSide: sellSide,
              color: buySide > sellSide ? 'bull' : 'bear',
            }
          ],
          tradeIntensity: [
            {
              time: Math.floor(Date.now() / 1000),
              intensity: Math.min(100, (latest.trade_count || 0) / 10),
              tradeCount: latest.trade_count || 0,
              largeTradeCount: Math.floor((latest.trade_count || 0) * 0.1),
              avgTradeSize: volume / (latest.trade_count || 1),
            }
          ]
        };

        dispatch({
          type: 'UPDATE_ZONE2',
          payload: {
            ohlcData,
            microstructure: microstructure as any,
          }
        });
      }
    } catch { /* ignore */ }
  }, [dispatch]);

  // ─── Start all polling intervals ─────────────────────────────────────────────
  useEffect(() => {
    // Fetch immediately on mount
    fetchHealth();
    fetchPrice();
    fetchSignal();
    fetchPaperTrading();
    fetchZone2Data();

    const healthTimer = setInterval(fetchHealth, HEALTH_POLL_MS);
    const priceTimer = setInterval(fetchPrice, PRICE_POLL_MS);
    const signalTimer = setInterval(fetchSignal, SIGNAL_POLL_MS);
    const paperTimer = setInterval(fetchPaperTrading, PAPER_POLL_MS);
    const zone2Timer = setInterval(fetchZone2Data, PRICE_POLL_MS); // Update chart often

    return () => {
      clearInterval(healthTimer);
      clearInterval(priceTimer);
      clearInterval(signalTimer);
      clearInterval(paperTimer);
      clearInterval(zone2Timer);
    };
  }, [fetchHealth, fetchPrice, fetchSignal, fetchPaperTrading, fetchZone2Data]);
}
