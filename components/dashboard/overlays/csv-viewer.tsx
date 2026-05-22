'use client';

import React, { useState, useEffect } from 'react';
import { useDashboard } from '@/lib/dashboard-context';
import { X, ChevronRight, Download, Search, RefreshCw } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { dataApi } from '@/lib/api-service';

export interface FileTreeNode {
  name: string;
  path: string;
  type: 'folder' | 'file';
  children?: FileTreeNode[];
  isLive?: boolean;
}

export interface CSVFileContent {
  headers: string[];
  rows: Record<string, string | number>[];
  totalRows: number;
  currentPage: number;
  pageSize: number;
  totalPages: number;
}

function buildFileTree(files: any[]): FileTreeNode[] {
  const root: Record<string, any> = {};

  files.forEach(file => {
    const parts = file.path.split('/');
    let current = root;
    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      if (i === parts.length - 1) {
        current[part] = { _isFile: true, ...file };
      } else {
        if (!current[part]) current[part] = {};
        current = current[part];
      }
    }
  });

  function traverse(node: any, pathSoFar: string): FileTreeNode[] {
    const keys = Object.keys(node).filter(k => k !== '_isFile').sort();
    return keys.map(k => {
      const currentPath = pathSoFar ? `${pathSoFar}/${k}` : k;
      if (node[k]._isFile) {
        return {
          name: k,
          path: node[k].path,
          type: 'file',
          isLive: node[k].is_live,
        };
      } else {
        return {
          name: k,
          path: currentPath,
          type: 'folder',
          children: traverse(node[k], currentPath),
        };
      }
    });
  }

  return traverse(root, '');
}

interface FileTreeItemProps {
  node: FileTreeNode;
  onSelect: (node: FileTreeNode) => void;
  selectedPath?: string;
  level?: number;
}

function FileTreeItem({ node, onSelect, selectedPath, level = 0 }: FileTreeItemProps) {
  const [isOpen, setIsOpen] = useState(level === 0 || level === 1);

  const isSelected = selectedPath === node.path;

  return (
    <div>
      <button
        onClick={() => {
          if (node.type === 'folder') {
            setIsOpen(!isOpen);
          } else {
            onSelect(node);
          }
        }}
        className={`w-full text-left px-3 py-2 text-xs flex items-center gap-2 ${
          isSelected ? 'bg-blue-900/50 text-white' : 'text-gray-300 hover:bg-gray-800'
        }`}
        style={{ paddingLeft: `${(level + 1) * 12}px` }}
      >
        {node.type === 'folder' && (
          <ChevronRight size={14} className={`transition-transform ${isOpen ? 'rotate-90' : ''}`} />
        )}
        {node.type === 'folder' ? '📁' : '📄'} 
        <span className="truncate">{node.name}</span>
        {node.isLive && <span className="ml-auto w-2 h-2 rounded-full bg-red-500"></span>}
      </button>
      {node.type === 'folder' && isOpen && node.children && (
        <div>
          {node.children.map((child) => (
            <FileTreeItem key={child.path} node={child} onSelect={onSelect} selectedPath={selectedPath} level={level + 1} />
          ))}
        </div>
      )}
    </div>
  );
}

function CSVTable({ 
  data, 
  loading, 
  onPageChange, 
  onSearch 
}: { 
  data: CSVFileContent | null; 
  loading: boolean; 
  onPageChange: (p: number) => void;
  onSearch: (s: string) => void;
}) {
  const [searchQuery, setSearchQuery] = useState('');

  if (loading) {
    return <div className="flex-1 flex items-center justify-center text-gray-500">Loading data...</div>;
  }

  if (!data) {
    return <div className="flex-1 flex items-center justify-center text-gray-500">No data available</div>;
  }

  return (
    <div className="flex flex-col h-full gap-3">
      {/* Search Bar */}
      <div className="flex gap-2">
        <div className="flex-1 relative">
          <Search size={14} className="absolute left-3 top-3 text-gray-500" />
          <Input
            placeholder="Search within file..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && onSearch(searchQuery)}
            className="pl-8 h-8 text-xs bg-gray-800 border-gray-700"
          />
        </div>
        <Button size="sm" variant="outline" className="h-8 text-xs bg-gray-800" onClick={() => onSearch(searchQuery)}>
          Search
        </Button>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto border border-gray-700 rounded bg-gray-900 custom-scrollbar">
        <table className="w-full text-xs whitespace-nowrap">
          <thead className="sticky top-0 bg-gray-800 border-b border-gray-700 shadow-sm z-10">
            <tr>
              {data.headers.map((header, i) => (
                <th key={i} className="px-3 py-2 text-left text-gray-300 font-semibold">
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.rows.map((row, idx) => (
              <tr key={idx} className="border-b border-gray-800 hover:bg-gray-800/80">
                {data.headers.map((header, i) => (
                  <td key={i} className="px-3 py-2 text-gray-400 font-mono">
                    {row[header] !== undefined && row[header] !== null ? String(row[header]) : '-'}
                  </td>
                ))}
              </tr>
            ))}
            {data.rows.length === 0 && (
              <tr>
                <td colSpan={Math.max(1, data.headers.length)} className="text-center py-8 text-gray-500">
                  No records found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between text-xs text-gray-400">
        <div>
          Total records: {data.totalRows.toLocaleString()}
        </div>
        <div className="flex items-center gap-4">
          <span className="px-2 py-1">
            Page {data.currentPage} of {data.totalPages}
          </span>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => onPageChange(data.currentPage - 1)}
              disabled={data.currentPage <= 1}
              className="h-6 text-xs bg-gray-800"
            >
              Prev
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => onPageChange(data.currentPage + 1)}
              disabled={data.currentPage >= data.totalPages}
              className="h-6 text-xs bg-gray-800"
            >
              Next
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function CSVViewer() {
  const { state, dispatch } = useDashboard();
  const [fileTree, setFileTree] = useState<FileTreeNode[]>([]);
  const [selectedFile, setSelectedFile] = useState<FileTreeNode | null>(null);
  
  const [fileData, setFileData] = useState<CSVFileContent | null>(null);
  const [loading, setLoading] = useState(false);
  const [treeLoading, setTreeLoading] = useState(true);
  
  // Fetch files on open
  useEffect(() => {
    if (state.csvViewerState.isOpen) {
      loadFiles();
    }
  }, [state.csvViewerState.isOpen]);

  const loadFiles = async () => {
    setTreeLoading(true);
    try {
      const res = await dataApi.getFiles();
      setFileTree(buildFileTree(res.files));
    } catch (err) {
      console.error('Failed to load files', err);
    } finally {
      setTreeLoading(false);
    }
  };

  const loadFileData = async (file: FileTreeNode, page = 1, search = '') => {
    if (!file || file.type !== 'file') return;
    
    setLoading(true);
    try {
      if (file.name.endsWith('.csv')) {
        const res = await dataApi.readCsv(file.path, page, 50, search);
        
        // Map array of arrays to array of objects using headers
        const rows = res.rows.map(rowArr => {
          const obj: Record<string, string> = {};
          res.headers.forEach((h, i) => { obj[h] = rowArr[i]; });
          return obj;
        });

        setFileData({
          headers: res.headers,
          rows: rows,
          totalRows: res.total_rows,
          currentPage: res.page,
          pageSize: res.per_page,
          totalPages: res.total_pages
        });
      } else {
        // JSONL or LOG
        const res = await dataApi.readJsonl(file.path, page, 50);
        
        const rows = res.entries.map(e => ({
          Line: e.line,
          Data: e.data ? JSON.stringify(e.data) : '-',
          Raw: e.raw || '-'
        }));

        setFileData({
          headers: ['Line', 'Data', 'Raw'],
          rows: rows,
          totalRows: res.total,
          currentPage: res.page,
          pageSize: res.per_page,
          totalPages: res.total_pages
        });
      }
    } catch (err) {
      console.error('Failed to load file data', err);
      setFileData(null);
    } finally {
      setLoading(false);
    }
  };

  if (!state.csvViewerState.isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
      <div className="w-full h-full max-w-7xl bg-gray-900 border border-gray-700 rounded-lg flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-700 px-6 py-4 bg-gray-950 rounded-t-lg">
          <h2 className="text-xl font-bold text-white flex items-center gap-3">
            Data & Logs Explorer
            <Button size="sm" variant="ghost" onClick={loadFiles} className="h-6 w-6 p-0 text-gray-400 hover:text-white">
              <RefreshCw size={14} className={treeLoading ? "animate-spin" : ""} />
            </Button>
          </h2>
          <button
            onClick={() => dispatch({ type: 'CLOSE_CSV_VIEWER' })}
            className="p-2 hover:bg-gray-800 rounded-full transition-colors text-gray-400 hover:text-white"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 flex overflow-hidden">
          {/* File Tree */}
          <div className="w-72 border-r border-gray-700 overflow-y-auto bg-gray-950 custom-scrollbar py-2">
            {treeLoading ? (
              <div className="p-4 text-xs text-gray-500 text-center">Loading files...</div>
            ) : fileTree.length > 0 ? (
              fileTree.map((node) => (
                <FileTreeItem 
                  key={node.path} 
                  node={node} 
                  selectedPath={selectedFile?.path}
                  onSelect={(n) => {
                    setSelectedFile(n);
                    loadFileData(n, 1);
                  }} 
                />
              ))
            ) : (
              <div className="p-4 text-xs text-gray-500 text-center">No files found.</div>
            )}
          </div>

          {/* File Viewer */}
          <div className="flex-1 flex flex-col p-4 overflow-hidden bg-gray-950">
            {selectedFile ? (
              <div className="flex flex-col h-full bg-gray-900 rounded-lg border border-gray-800 p-4 shadow-inner">
                <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-800">
                  <div>
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                      {selectedFile.isLive && <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse"></span>}
                      {selectedFile.path}
                    </h3>
                  </div>
                  <Button size="sm" variant="outline" className="gap-2 bg-gray-800 text-xs">
                    <Download size={14} />
                    Download File
                  </Button>
                </div>
                
                <CSVTable 
                  data={fileData} 
                  loading={loading}
                  onPageChange={(p) => loadFileData(selectedFile, p)}
                  onSearch={(s) => loadFileData(selectedFile, 1, s)}
                />
              </div>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500 text-sm">
                Select a file from the left panel to explore
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
