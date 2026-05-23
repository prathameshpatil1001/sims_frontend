'use client';

import React, { useState, useEffect } from 'react';
import { adminApi, authApi } from '@/lib/api-service';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from '@/components/ui/dialog';
import { X } from 'lucide-react';
import { AdminLoginModal } from './admin-login-modal';

interface AdminSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type TabType = 'credentials' | 'security' | 'thresholds';

export function AdminSettingsModal({ isOpen, onClose }: AdminSettingsModalProps) {
  const [activeTab, setActiveTab] = useState<TabType>('credentials');
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [adminToken, setAdminToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // API Credentials State
  const [apiKey, setApiKey] = useState('');
  const [apiSecret, setApiSecret] = useState('');
  const [showApiSecret, setShowApiSecret] = useState(false);

  // Security State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Thresholds State
  const [thresholds, setThresholds] = useState<Record<string, number>>({});
  const [editingThreshold, setEditingThreshold] = useState<string | null>(null);

  // Check for existing admin session on mount
  useEffect(() => {
    const existingToken = sessionStorage.getItem('smis_admin_token');
    if (existingToken) {
      setAdminToken(existingToken);
    }
  }, []);

  // Load thresholds when admin is authenticated
  useEffect(() => {
    if (adminToken && activeTab === 'thresholds') {
      loadThresholds();
    }
  }, [adminToken, activeTab]);

  const loadThresholds = async () => {
    setIsLoading(true);
    try {
      const data = await adminApi.getThresholds();
      setThresholds(data);
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'Failed to load thresholds');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAdminLoginSuccess = (token: string) => {
    setAdminToken(token);
    setShowLoginModal(false);
    setErrorMessage(null);
  };

  const handleSaveCredentials = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminToken) {
      setShowLoginModal(true);
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      await adminApi.updateApiCredentials(apiKey, apiSecret);
      setSuccessMessage('API credentials saved successfully');
      setApiKey('');
      setApiSecret('');
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'Failed to save credentials');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminToken) {
      setShowLoginModal(true);
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMessage('Passwords do not match');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      await adminApi.changeAdminPassword(currentPassword, newPassword);
      setSuccessMessage('Password changed successfully');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'Failed to change password');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateThreshold = async (key: string, value: number) => {
    if (!adminToken) {
      setShowLoginModal(true);
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      await adminApi.updateThreshold(key, value);
      setThresholds((prev) => ({ ...prev, [key]: value }));
      setEditingThreshold(null);
      setSuccessMessage(`Threshold '${key}' updated`);
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'Failed to update threshold');
    } finally {
      setIsLoading(false);
    }
  };

  const handleTriggerOAuth = async () => {
    try {
      const { login_url } = await authApi.getLoginUrl();
      window.open(login_url, '_blank', 'noopener,noreferrer');
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'Failed to get login URL');
    }
  };

  const handleClose = () => {
    onClose();
    setErrorMessage(null);
    setSuccessMessage(null);
  };

  return (
    <>
      <AdminLoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onSuccess={handleAdminLoginSuccess}
      />

      <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Admin Settings</DialogTitle>
            <DialogClose asChild>
              <button className="absolute right-4 top-4 text-gray-400 hover:text-gray-300">
                <X size={20} />
              </button>
            </DialogClose>
          </DialogHeader>

          {/* Tabs */}
          <div className="flex gap-2 border-b border-gray-700 -mx-6 px-6">
            <button
              onClick={() => setActiveTab('credentials')}
              className={`px-4 py-2 text-sm font-medium transition-colors ${
                activeTab === 'credentials'
                  ? 'text-blue-400 border-b-2 border-blue-400'
                  : 'text-gray-400 hover:text-gray-300'
              }`}
            >
              API Credentials
            </button>
            <button
              onClick={() => setActiveTab('security')}
              className={`px-4 py-2 text-sm font-medium transition-colors ${
                activeTab === 'security'
                  ? 'text-blue-400 border-b-2 border-blue-400'
                  : 'text-gray-400 hover:text-gray-300'
              }`}
            >
              Security
            </button>
            <button
              onClick={() => setActiveTab('thresholds')}
              className={`px-4 py-2 text-sm font-medium transition-colors ${
                activeTab === 'thresholds'
                  ? 'text-blue-400 border-b-2 border-blue-400'
                  : 'text-gray-400 hover:text-gray-300'
              }`}
            >
              Thresholds
            </button>
          </div>

          {/* Messages */}
          {errorMessage && (
            <div className="p-3 rounded bg-red-950 text-red-200 text-sm">{errorMessage}</div>
          )}
          {successMessage && (
            <div className="p-3 rounded bg-green-950 text-green-200 text-sm">{successMessage}</div>
          )}

          {/* Tab Content */}
          <div className="space-y-4">
            {activeTab === 'credentials' && (
              <form onSubmit={handleSaveCredentials} className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-300">Zerodha API Key</label>
                  <Input
                    type="text"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder="Enter API key"
                    disabled={isLoading}
                    className="bg-gray-900 border-gray-700 mt-1"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-300">Zerodha API Secret</label>
                  <div className="relative mt-1">
                    <Input
                      type={showApiSecret ? 'text' : 'password'}
                      value={apiSecret}
                      onChange={(e) => setApiSecret(e.target.value)}
                      placeholder="Enter API secret"
                      disabled={isLoading}
                      className="bg-gray-900 border-gray-700"
                    />
                    <button
                      type="button"
                      onClick={() => setShowApiSecret(!showApiSecret)}
                      className="absolute right-3 top-3 text-gray-400 hover:text-gray-300 text-sm"
                    >
                      {showApiSecret ? 'Hide' : 'Show'}
                    </button>
                  </div>
                </div>

                <Button type="submit" disabled={isLoading || !apiKey || !apiSecret}>
                  Save Credentials
                </Button>

                {apiKey && apiSecret && (
                  <div className="pt-4 border-t border-gray-700">
                    <p className="text-sm text-gray-400 mb-3">After saving, trigger OAuth:</p>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleTriggerOAuth}
                      className="w-full"
                    >
                      Login with Zerodha →
                    </Button>
                  </div>
                )}
              </form>
            )}

            {activeTab === 'security' && (
              <form onSubmit={handleChangePassword} className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-300">Current Password</label>
                  <Input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Enter current password"
                    disabled={isLoading}
                    className="bg-gray-900 border-gray-700 mt-1"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-300">New Password</label>
                  <Input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new password"
                    disabled={isLoading}
                    className="bg-gray-900 border-gray-700 mt-1"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-300">Confirm New Password</label>
                  <Input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm new password"
                    disabled={isLoading}
                    className="bg-gray-900 border-gray-700 mt-1"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={isLoading || !currentPassword || !newPassword || !confirmPassword}
                >
                  Change Password
                </Button>
              </form>
            )}

            {activeTab === 'thresholds' && (
              <div className="space-y-3">
                {isLoading && !Object.keys(thresholds).length ? (
                  <p className="text-gray-400 text-sm">Loading thresholds...</p>
                ) : Object.keys(thresholds).length > 0 ? (
                  Object.entries(thresholds).map(([key, value]) => (
                    <div key={key} className="flex items-center gap-3 p-3 bg-gray-900 rounded">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-300">{key}</p>
                      </div>
                      {editingThreshold === key ? (
                        <div className="flex gap-2">
                          <Input
                            type="number"
                            defaultValue={value}
                            onChange={(e) => {
                              const newValue = parseFloat(e.target.value);
                              handleUpdateThreshold(key, newValue);
                            }}
                            className="w-24 bg-gray-800 border-gray-600"
                            autoFocus
                          />
                        </div>
                      ) : (
                        <div className="flex gap-2">
                          <span className="text-sm text-gray-400">{value}</span>
                          <button
                            onClick={() => setEditingThreshold(key)}
                            className="text-xs text-blue-400 hover:text-blue-300"
                          >
                            Edit
                          </button>
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <p className="text-gray-400 text-sm">No thresholds configured</p>
                )}
              </div>
            )}
          </div>

          {!adminToken && (
            <div className="p-4 rounded bg-amber-950 text-amber-200 text-sm">
              <p>You need to be logged in as admin to make changes.</p>
              <Button
                variant="outline"
                size="sm"
                className="mt-2"
                onClick={() => setShowLoginModal(true)}
              >
                Login as Admin
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
