import React, { useState } from 'react';
import {
  AlertCircle,
  AlertTriangle,
  Info,
  Terminal,
  Trash2,
  Wand2,
  ExternalLink,
  CheckCircle,
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
  const [activeTab, setActiveTab] = useState<'errors' | 'logs'>('errors');
  const [severityFilter, setSeverityFilter] = useState<'all' | 'error' | 'warning'>('all');

  const filteredErrors = errors.filter((err) => {
    if (severityFilter === 'all') return true;
    return err.severity === severityFilter;
  });

  return (
    <div className="flex flex-col h-full bg-[#283341] border-t border-[#475569] text-white select-none overflow-hidden">
      {/* Console Header matching screenshot: "Debug Console Updates" */}
      <div className="h-8 bg-[#202934] border-b border-[#3b495a] px-3 flex items-center justify-between text-xs">
        <div className="flex items-center gap-3">
          <span className="font-semibold text-slate-200 tracking-wide">
            Debug Console Updates
          </span>

          {/* Sub-tabs: Code Errors vs Live Logs */}
          <div className="flex items-center bg-[#17202a] rounded-lg p-0.5 border border-slate-700">
            <button
              onClick={() => setActiveTab('errors')}
              className={`px-2 py-0.5 rounded text-[11px] font-medium transition flex items-center gap-1 ${
                activeTab === 'errors'
                  ? 'bg-[#334155] text-white'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <span>Code Errors</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                  errors.length > 0 ? 'bg-rose-500 text-white' : 'bg-slate-700 text-slate-300'
                }`}
              >
                {errors.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('logs')}
              className={`px-2 py-0.5 rounded text-[11px] font-medium transition flex items-center gap-1 ${
                activeTab === 'logs'
                  ? 'bg-[#334155] text-white'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Terminal className="w-3 h-3 text-cyan-400" />
              <span>Live Output</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-700 text-slate-300 font-mono">
                {logs.length}
              </span>
            </button>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2">
          {activeTab === 'errors' ? (
            <div className="flex items-center gap-1 text-[11px]">
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
          ) : (
            <button
              onClick={onClearLogs}
              title="Clear runtime logs"
              className="px-2 py-0.5 text-slate-400 hover:text-white hover:bg-slate-700 rounded transition flex items-center gap-1 text-[11px]"
            >
              <Trash2 className="w-3 h-3" />
              <span>Clear</span>
            </button>
          )}
        </div>
      </div>

      {/* Console Content Area */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1.5 text-xs font-mono scrollbar-thin scrollbar-thumb-slate-700">
        {activeTab === 'errors' ? (
          filteredErrors.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-500 py-6">
              <CheckCircle className="w-8 h-8 text-emerald-500/50 mb-2" />
              <p className="text-slate-400 font-sans text-xs">No errors detected in project code.</p>
              <p className="text-[11px] text-slate-600 font-sans mt-0.5">
                Offline linter continuously monitors syntax in HTML, CSS, JS, and JSON.
              </p>
            </div>
          ) : (
            filteredErrors.map((err) => (
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
            ))
          )
        ) : logs.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-slate-500 py-6">
            <Terminal className="w-8 h-8 text-slate-600 mb-2" />
            <p className="text-slate-400 font-sans text-xs">Live console log is empty.</p>
            <p className="text-[11px] text-slate-600 font-sans mt-0.5">
              Logs printed with console.log() or runtime preview errors will display here.
            </p>
          </div>
        ) : (
          logs.map((log) => (
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
          ))
        )}
      </div>
    </div>
  );
};
