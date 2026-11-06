import React, { useState, useRef, useEffect } from 'react';
import {
  Menu,
  AlertCircle,
  AlertTriangle,
  Bug,
  Terminal,
  Trash2,
  Wand2,
  ExternalLink,
  CheckCircle,
  Layers,
  X,
} from 'lucide-react';
import { ConsoleLog, LintError } from '../types/editor';

interface DebugConsoleProps {
  errors: LintError[];
  logs: ConsoleLog[];
  onClearLogs: () => void;
  onFixWithAI: (error: LintError) => void;
  onJumpToFile: (fileName: string, line: number) => void;
  onCloseConsole: () => void;
}

export const DebugConsole: React.FC<DebugConsoleProps> = ({
  errors,
  logs,
  onClearLogs,
  onFixWithAI,
  onJumpToFile,
  onCloseConsole,
}) => {
  // Console view mode: 'all' | 'errors' | 'outputs'
  const [viewMode, setViewMode] = useState<'all' | 'errors' | 'outputs'>('errors');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [severityFilter, setSeverityFilter] = useState<'all' | 'error' | 'warning'>('all');

  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredErrors = errors.filter((err) => {
    if (severityFilter === 'all') return true;
    return err.severity === severityFilter;
  });

  return (
    <div className="flex flex-col h-full bg-[#283341] border-t border-[#475569] text-white select-none overflow-hidden">
      {/* Console Header matching screenshot: "Debug Console Updates" */}
      <div className="h-9 bg-[#202934] border-b border-[#3b4b5e] px-2.5 sm:px-3 flex items-center justify-between text-xs relative z-20 shrink-0">
        <div className="flex items-center gap-2 sm:gap-3 overflow-x-auto no-scrollbar">
          {/* 1. Mobile-only Dropdown Hamburger Button */}
          <div className="relative sm:hidden" ref={dropdownRef}>
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              title="Console View Options"
              className="w-7 h-7 rounded-lg bg-[#2a3543] hover:bg-slate-700 border border-slate-600 flex items-center justify-center text-slate-200 hover:text-white transition active:scale-95 shadow-sm"
            >
              <Menu className="w-3.5 h-3.5" />
            </button>

            {/* Dropdown Menu (Mobile only) */}
            {isDropdownOpen && (
              <div className="absolute top-9 left-0 w-48 bg-[#1f2834] border border-[#4a5a6e] rounded-xl shadow-2xl py-1.5 z-50 text-xs animate-in fade-in slide-in-from-top-1">
                <div className="px-3 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-700/60 mb-1">
                  Console Views
                </div>

                {/* 'Code errors' Button */}
                <button
                  onClick={() => {
                    setViewMode('errors');
                    setIsDropdownOpen(false);
                  }}
                  className={`w-full px-3 py-2 text-left flex items-center justify-between transition ${
                    viewMode === 'errors'
                      ? 'bg-rose-950/60 text-rose-300 font-semibold border-l-2 border-rose-500'
                      : 'hover:bg-slate-700/60 text-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-3.5 h-3.5 text-rose-400" />
                    <span>Code errors</span>
                  </div>
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                      errors.length > 0 ? 'bg-rose-600 text-white' : 'bg-slate-700 text-slate-300'
                    }`}
                  >
                    {errors.length}
                  </span>
                </button>

                {/* 'Total outputs' Button */}
                <button
                  onClick={() => {
                    setViewMode('outputs');
                    setIsDropdownOpen(false);
                  }}
                  className={`w-full px-3 py-2 text-left flex items-center justify-between transition ${
                    viewMode === 'outputs'
                      ? 'bg-cyan-950/60 text-cyan-300 font-semibold border-l-2 border-cyan-500'
                      : 'hover:bg-slate-700/60 text-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Terminal className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Total outputs</span>
                  </div>
                  <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-700 text-slate-300 font-mono">
                    {logs.length}
                  </span>
                </button>

                {/* 'All' Button */}
                <button
                  onClick={() => {
                    setViewMode('all');
                    setIsDropdownOpen(false);
                  }}
                  className={`w-full px-3 py-2 text-left flex items-center justify-between transition ${
                    viewMode === 'all'
                      ? 'bg-purple-950/60 text-purple-300 font-semibold border-l-2 border-purple-500'
                      : 'hover:bg-slate-700/60 text-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Layers className="w-3.5 h-3.5 text-purple-400" />
                    <span>All</span>
                  </div>
                  <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-700 text-slate-300 font-mono">
                    {errors.length + logs.length}
                  </span>
                </button>
              </div>
            )}
          </div>

          {/* Console Header Title: "Debug Console Updates" */}
          <span className="font-semibold text-slate-200 tracking-wide text-xs whitespace-nowrap">
            Debug Console Updates
          </span>

          {/* 2. PC / Desktop: Individual View Buttons displayed directly in the header */}
          <div className="hidden sm:flex items-center gap-1.5 ml-1">
            {/* 'Code errors' Individual Button */}
            <button
              onClick={() => setViewMode('errors')}
              className={`px-2.5 py-1 rounded-md text-xs font-medium flex items-center gap-1.5 transition border ${
                viewMode === 'errors'
                  ? 'bg-rose-950/70 text-rose-300 border-rose-500/70 shadow-sm'
                  : 'bg-[#2a3543]/60 hover:bg-[#2a3543] text-slate-300 hover:text-white border-slate-600/50'
              }`}
            >
              <AlertCircle className="w-3.5 h-3.5 text-rose-400" />
              <span>Code errors</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ml-0.5 ${
                  errors.length > 0 ? 'bg-rose-600 text-white' : 'bg-slate-700 text-slate-300'
                }`}
              >
                {errors.length}
              </span>
            </button>

            {/* 'Total outputs' Individual Button */}
            <button
              onClick={() => setViewMode('outputs')}
              className={`px-2.5 py-1 rounded-md text-xs font-medium flex items-center gap-1.5 transition border ${
                viewMode === 'outputs'
                  ? 'bg-cyan-950/70 text-cyan-300 border-cyan-500/70 shadow-sm'
                  : 'bg-[#2a3543]/60 hover:bg-[#2a3543] text-slate-300 hover:text-white border-slate-600/50'
              }`}
            >
              <Terminal className="w-3.5 h-3.5 text-cyan-400" />
              <span>Total outputs</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-700 text-slate-300 font-mono ml-0.5">
                {logs.length}
              </span>
            </button>

            {/* 'All' Individual Button */}
            <button
              onClick={() => setViewMode('all')}
              className={`px-2.5 py-1 rounded-md text-xs font-medium flex items-center gap-1.5 transition border ${
                viewMode === 'all'
                  ? 'bg-purple-950/70 text-purple-300 border-purple-500/70 shadow-sm'
                  : 'bg-[#2a3543]/60 hover:bg-[#2a3543] text-slate-300 hover:text-white border-slate-600/50'
              }`}
            >
              <Layers className="w-3.5 h-3.5 text-purple-400" />
              <span>All</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-700 text-slate-300 font-mono ml-0.5">
                {errors.length + logs.length}
              </span>
            </button>
          </div>
        </div>

        {/* Action buttons on the right of Console Header */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Error Severity Filter (if viewing errors or all) */}
          {(viewMode === 'errors' || viewMode === 'all') && (
            <div className="hidden md:flex items-center gap-1 text-[11px]">
              <button
                onClick={() => setSeverityFilter('all')}
                className={`px-2 py-0.5 rounded transition ${
                  severityFilter === 'all'
                    ? 'bg-slate-700 text-white font-medium'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                All ({errors.length})
              </button>
              <button
                onClick={() => setSeverityFilter('error')}
                className={`px-2 py-0.5 rounded transition ${
                  severityFilter === 'error'
                    ? 'bg-rose-950 text-rose-300 border border-rose-800'
                    : 'text-slate-400 hover:text-rose-300'
                }`}
              >
                Errors ({errors.filter((e) => e.severity === 'error').length})
              </button>
            </div>
          )}

          {/* Clear Button */}
          <button
            onClick={onClearLogs}
            title="Clear console output"
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-700 rounded transition"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>

          {/* Close Console Button */}
          <button
            onClick={onCloseConsole}
            title="Hide console"
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-700 rounded transition"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Console Content Area */}
      <div className="flex-1 overflow-y-auto p-2 space-y-2 text-xs font-mono scrollbar-thin scrollbar-thumb-slate-700">
        {/* 1. CODE ERRORS SECTION */}
        {(viewMode === 'errors' || viewMode === 'all') && (
          <div>
            {viewMode === 'all' && (
              <div className="text-[10px] font-bold text-rose-300 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <AlertCircle className="w-3 h-3 text-rose-400" />
                <span>Code Errors ({filteredErrors.length})</span>
              </div>
            )}

            {filteredErrors.length === 0 ? (
              viewMode === 'errors' && (
                <div className="h-full flex flex-col items-center justify-center text-slate-500 py-6">
                  <CheckCircle className="w-8 h-8 text-emerald-500/50 mb-2" />
                  <p className="text-slate-400 font-sans text-xs">No errors detected in project code.</p>
                  <p className="text-[11px] text-slate-600 font-sans mt-0.5">
                    Click 'Debug' above to run an instant deep scan across all files.
                  </p>
                </div>
              )
            ) : (
              <div className="space-y-1.5">
                {filteredErrors.map((err) => (
                  <div
                    key={err.id}
                    className="bg-[#1e2632] border border-[#374558] rounded-lg p-2.5 hover:border-slate-500 transition flex items-start justify-between gap-3"
                  >
                    <div className="flex items-start gap-2 flex-1 min-w-0">
                      {err.severity === 'error' ? (
                        <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                      ) : (
                        <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                      )}

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <span className="font-semibold text-white bg-slate-800 px-1.5 py-0.5 rounded text-[11px] border border-slate-700">
                            {err.fileName}
                          </span>
                          <span className="text-rose-400 font-bold text-[11px] bg-rose-950/60 px-1.5 py-0.5 rounded border border-rose-900/60">
                            Line {err.line}
                          </span>
                          <span className="text-[10px] uppercase font-bold text-slate-400">
                            {err.severity}
                          </span>
                        </div>

                        <p className="text-slate-200 text-xs font-sans mb-1.5">{err.message}</p>

                        {err.codeSnippet && (
                          <div className="bg-[#141a22] text-slate-300 p-1.5 rounded border border-slate-800 text-[11px] truncate">
                            <span className="text-slate-600 mr-2">{err.line} |</span>
                            <code>{err.codeSnippet}</code>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Fix with AI and Jump button */}
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        onClick={() => onFixWithAI(err)}
                        title="Prompt AI Agent to fix this issue"
                        className="px-2.5 py-1 bg-cyan-900/40 hover:bg-cyan-800/60 text-cyan-300 border border-cyan-700/50 rounded-md text-[11px] font-sans font-medium flex items-center gap-1 transition active:scale-95 shadow-sm"
                      >
                        <Wand2 className="w-3 h-3 text-cyan-400" />
                        <span>Fix with AI</span>
                      </button>

                      <button
                        onClick={() => onJumpToFile(err.fileName, err.line)}
                        title="Open file and locate line"
                        className="p-1 text-slate-400 hover:text-white hover:bg-slate-700 rounded transition"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 2. TOTAL OUTPUTS SECTION */}
        {(viewMode === 'outputs' || viewMode === 'all') && (
          <div className={viewMode === 'all' ? 'pt-3 border-t border-slate-700/60' : ''}>
            {viewMode === 'all' && (
              <div className="text-[10px] font-bold text-cyan-300 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <Terminal className="w-3 h-3 text-cyan-400" />
                <span>Total Outputs ({logs.length})</span>
              </div>
            )}

            {logs.length === 0 ? (
              viewMode === 'outputs' && (
                <div className="h-full flex flex-col items-center justify-center text-slate-500 py-6">
                  <Terminal className="w-8 h-8 text-slate-600 mb-2" />
                  <p className="text-slate-400 font-sans text-xs">Total output log is empty.</p>
                  <p className="text-[11px] text-slate-600 font-sans mt-0.5">
                    Click 'Run' in the header to execute preview code and stream runtime outputs.
                  </p>
                </div>
              )
            ) : (
              <div className="space-y-1">
                {logs.map((log) => (
                  <div
                    key={log.id}
                    className={`p-1.5 rounded flex items-start gap-2 text-[11px] ${
                      log.type === 'error'
                        ? 'bg-rose-950/30 text-rose-300 border border-rose-900/40'
                        : log.type === 'warn'
                        ? 'bg-amber-950/30 text-amber-300 border border-amber-900/40'
                        : 'bg-slate-900/40 text-slate-300 border border-slate-800'
                    }`}
                  >
                    <span className="text-slate-600 text-[10px]">{log.timestamp}</span>
                    <span className="font-semibold uppercase text-[9px] px-1 rounded bg-black/40">
                      {log.type}
                    </span>
                    <span className="flex-1 break-all select-text">{log.message}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
