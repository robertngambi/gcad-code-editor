import React from 'react';
import {
  Code2,
  Bug,
  HelpCircle,
  Settings,
  Minus,
  Square,
  X,
  Sparkles,
} from 'lucide-react';

interface HeaderProps {
  isChatOpen: boolean;
  onToggleChat: () => void;
  isConsoleOpen: boolean;
  onToggleConsole: () => void;
  errorCount: number;
  onDebugClick: () => void;
  onOpenGuide: () => void;
  onOpenConfig: () => void;
  isWindowMaximized: boolean;
  onToggleMaximize: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  isChatOpen,
  onToggleChat,
  isConsoleOpen,
  onToggleConsole,
  errorCount,
  onDebugClick,
  onOpenGuide,
  onOpenConfig,
  isWindowMaximized,
  onToggleMaximize,
}) => {
  return (
    <header className="h-14 bg-[#384556] border-b border-[#475569] flex items-center justify-between px-2 sm:px-3 select-none text-white relative z-20 shrink-0">
      {/* Brand logo & title */}
      <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
        <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-gradient-to-tr from-lime-400 to-cyan-400 flex items-center justify-center shadow-md shadow-cyan-900/40">
          <span className="font-mono font-bold text-slate-950 text-xs sm:text-sm tracking-tighter">
            &lt;/&gt;
          </span>
        </div>
        <div className="flex items-center gap-1 font-bold tracking-tight text-sm sm:text-lg">
          <span className="text-[#38bdf8]">gCAD</span>
          <span className="text-white hidden xs:inline">Code</span>
          <span className="text-[#facc15]">Editor</span>
        </div>
      </div>

      {/* Header controls & actions */}
      <div className="flex items-center gap-1 sm:gap-2 overflow-x-auto no-scrollbar py-1">
        {/* Quick Guide */}
        <button
          onClick={onOpenGuide}
          title="Quick Guide & Documentation"
          className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 text-xs text-slate-300 hover:text-white hover:bg-slate-700/60 rounded-lg transition border border-transparent hover:border-slate-500/40"
        >
          <HelpCircle className="w-3.5 h-3.5 text-cyan-400" />
          <span>Guide</span>
        </button>

        {/* Configurations */}
        <button
          onClick={onOpenConfig}
          title="API and Platform Configurations"
          className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 text-xs text-slate-300 hover:text-white hover:bg-slate-700/60 rounded-lg transition border border-transparent hover:border-slate-500/40"
        >
          <Settings className="w-3.5 h-3.5 text-amber-400" />
          <span>Configurations</span>
        </button>

        {/* Debug button */}
        <button
          onClick={onDebugClick}
          title="Run instant project error diagnostics"
          className="flex items-center gap-1 px-2 sm:px-3 py-1.5 text-xs font-medium text-slate-200 bg-slate-700/50 hover:bg-slate-700 border border-slate-500/60 rounded-full transition shadow-sm active:scale-95 shrink-0"
        >
          <Bug className="w-3.5 h-3.5 text-rose-400" />
          <span className="hidden sm:inline">Debug</span>
        </button>

        {/* Open Chat / Hide Chat */}
        <button
          onClick={onToggleChat}
          className={`px-2.5 sm:px-4 py-1.5 text-xs font-semibold rounded-full transition-all duration-200 flex items-center gap-1 sm:gap-1.5 shadow-sm shrink-0 ${
            isChatOpen
              ? 'bg-[#84cc16] hover:bg-[#78cf39] text-slate-950 font-bold border border-[#a3e635]'
              : 'bg-[#334155]/60 hover:bg-slate-700 text-slate-200 border border-slate-500/60'
          }`}
        >
          <Sparkles
            className={`w-3.5 h-3.5 ${
              isChatOpen ? 'text-slate-950' : 'text-lime-400'
            }`}
          />
          <span className="whitespace-nowrap">{isChatOpen ? 'Hide Chat' : 'Open Chat'}</span>
        </button>

        {/* Open console / Hide console with Red Error Badge */}
        <div className="relative shrink-0">
          <button
            onClick={onToggleConsole}
            className={`px-2.5 sm:px-4 py-1.5 text-xs font-semibold rounded-full transition-all duration-200 flex items-center gap-1 sm:gap-1.5 shadow-sm ${
              isConsoleOpen
                ? 'bg-[#84cc16] hover:bg-[#78cf39] text-slate-950 font-bold border border-[#a3e635]'
                : 'bg-[#334155]/60 hover:bg-slate-700 text-slate-200 border border-slate-500/60'
          }`}
        >
          <Code2
            className={`w-3.5 h-3.5 ${
              isConsoleOpen ? 'text-slate-950' : 'text-cyan-400'
            }`}
          />
          <span className="whitespace-nowrap">{isConsoleOpen ? 'Hide console' : 'Open console'}</span>
        </button>

        {/* Red error indicator badge on top right */}
        {errorCount > 0 && (
          <span
            title={`${errorCount} syntax or lint errors found`}
            className="absolute -top-1.5 -right-1.5 min-w-[17px] h-[17px] bg-rose-600 border border-white text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1 shadow-md animate-pulse"
          >
            {errorCount}
          </span>
        )}
      </div>

      {/* Window controls: Minimize, Maximize/Restore, Close */}
      <div className="hidden sm:flex items-center gap-1 sm:gap-1.5 ml-1 pl-1 sm:ml-2 sm:pl-2 border-l border-slate-600/60 shrink-0">
        <button
          onClick={() => {}}
          title="Minimize"
          className="w-6 h-6 flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-700/60 rounded transition"
        >
          <Minus className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={onToggleMaximize}
          title={isWindowMaximized ? 'Restore Down' : 'Maximize'}
          className="w-6 h-6 flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-700/60 rounded transition"
        >
          <Square className="w-3 h-3" />
        </button>
        <button
          onClick={() => {}}
          title="Close Editor"
          className="w-6 h-6 flex items-center justify-center text-slate-400 hover:text-white hover:bg-rose-600 rounded transition"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
    </header>
  );
};
