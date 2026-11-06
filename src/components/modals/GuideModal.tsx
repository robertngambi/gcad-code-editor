import React from 'react';
import {
  X,
  BookOpen,
  Sparkles,
  Bug,
  FolderTree,
  Package,
  WifiOff,
  Keyboard,
  Layers,
} from 'lucide-react';

interface GuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GuideModal: React.FC<GuideModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4 select-none">
      <div className="bg-[#242f3d] border border-[#3f5064] rounded-2xl w-full max-w-2xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 text-white">
        {/* Header */}
        <div className="h-14 bg-[#1e2733] border-b border-[#3b4b5e] px-5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center">
              <BookOpen className="w-4 h-4 text-cyan-400" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">gCAD Code Editor Quick Guide</h2>
              <p className="text-[11px] text-slate-400">
                Complete overview of editing, AI Agent, debugging, and multi-format compiling
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700/60 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4 text-xs scrollbar-thin scrollbar-thumb-slate-700 font-sans leading-relaxed">
          {/* Section: AI Agent & Logo Placement */}
          <div className="bg-[#1b232e] p-4 rounded-xl border border-slate-700 space-y-2">
            <div className="flex items-center gap-2 font-bold text-cyan-300 text-sm">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <span>Full-Time AI Coding Agent & Logo Integration</span>
            </div>
            <p className="text-slate-300">
              Click <strong>Open Chat</strong> (turns light green to <strong>Hide Chat</strong>) on
              the top-right to reveal the AI Agent.
            </p>
            <ul className="list-disc list-inside space-y-1 text-slate-400 ml-1">
              <li>
                <strong>Circular '+' button:</strong> Click inside the prompt bar to attach any image
                or brand logo. Prompt the agent: <em>"Use this attached image as our header logo"</em>
                and it will automatically embed it into your project code!
              </li>
              <li>
                <strong>Project Synthesis:</strong> Type prompts like <em>"Create an online portfolio"</em>{' '}
                or <em>"Build a retro arcade game"</em> and watch the agent create code files live.
              </li>
              <li>
                <strong>Process Execution Monitor:</strong> Located on top of the chat box, tracking
                real-time compilation steps and status.
              </li>
            </ul>
          </div>

          {/* Section: Keyboard Shortcuts & Smart Coding */}
          <div className="bg-[#1b232e] p-4 rounded-xl border border-slate-700 space-y-2">
            <div className="flex items-center gap-2 font-bold text-sky-300 text-sm">
              <Keyboard className="w-4 h-4 text-sky-400" />
              <span>Smart Coding & Keyboard Shortcuts</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-300 pt-1">
              <div className="bg-[#161d26] p-2 rounded-lg border border-slate-800">
                <span className="font-mono font-bold text-cyan-300 bg-slate-800 px-1.5 py-0.5 rounded text-[11px] mr-1.5">
                  ! + Tab
                </span>
                <span className="text-slate-400">Generates full HTML5 boilerplate code instantly.</span>
              </div>
              <div className="bg-[#161d26] p-2 rounded-lg border border-slate-800">
                <span className="font-mono font-bold text-cyan-300 bg-slate-800 px-1.5 py-0.5 rounded text-[11px] mr-1.5">
                  Alt + Shift + F
                </span>
                <span className="text-slate-400">Formats entire code in order with clean 2-space indentation.</span>
              </div>
              <div className="bg-[#161d26] p-2 rounded-lg border border-slate-800">
                <span className="font-mono font-bold text-cyan-300 bg-slate-800 px-1.5 py-0.5 rounded text-[11px] mr-1.5">
                  &lt;tag&gt;
                </span>
                <span className="text-slate-400">Auto-closes tags (e.g. typing &gt; after &lt;html inserts &lt;/html&gt;).</span>
              </div>
              <div className="bg-[#161d26] p-2 rounded-lg border border-slate-800">
                <span className="font-mono font-bold text-cyan-300 bg-slate-800 px-1.5 py-0.5 rounded text-[11px] mr-1.5">
                  ( ) { } [ ] " ' `
                </span>
                <span className="text-slate-400">Auto-closes pairs and surrounds selected code blocks.</span>
              </div>
              <div className="bg-[#161d26] p-2 rounded-lg border border-slate-800">
                <span className="font-mono font-bold text-cyan-300 bg-slate-800 px-1.5 py-0.5 rounded text-[11px] mr-1.5">
                  Ctrl + S
                </span>
                <span className="text-slate-400">Instant manual project save (also auto-saves every 5 min).</span>
              </div>
              <div className="bg-[#161d26] p-2 rounded-lg border border-slate-800">
                <span className="font-mono font-bold text-cyan-300 bg-slate-800 px-1.5 py-0.5 rounded text-[11px] mr-1.5">
                  Ctrl + Enter
                </span>
                <span className="text-slate-400">Executes & refreshes previewer (same as 'Run project' in editor menu).</span>
              </div>
            </div>
          </div>

          {/* Section: Code Editor & Formatting */}
          <div className="bg-[#1b232e] p-4 rounded-xl border border-slate-700 space-y-2">
            <div className="flex items-center gap-2 font-bold text-amber-300 text-sm">
              <FolderTree className="w-4 h-4 text-amber-400" />
              <span>Workspace & Editor Menu</span>
            </div>
            <p className="text-slate-300">
              The hamburger menu (<code>☰</code>) on the editor toolbar provides:
            </p>
            <ul className="list-disc list-inside space-y-1 text-slate-400 ml-1">
              <li>
                <strong>Run project:</strong> Execute code in the live preview canvas (also press <code>Ctrl+Enter</code>).
              </li>
              <li>
                <strong>Debug project:</strong> Run deep diagnostic error scan and open console updates.
              </li>
              <li>
                <strong>Create project / Open project:</strong> Manage folders on your PC and import projects.
              </li>
              <li>
                <strong>Format Editor:</strong> Adjust code font size with <code>[-]</code> <code>[14px]</code> <code>[+]</code> and select your preferred font family (Fira Code, JetBrains Mono, Source Code Pro, Courier New, Inter).
              </li>
              <li>
                <strong>Edit button:</strong> Toggle manual typing enabled or locked.
              </li>
              <li>
                <strong>Auto-Save:</strong> Projects automatically auto-save every 5 minutes.
              </li>
            </ul>
          </div>

          {/* Section: Debugging & Console */}
          <div className="bg-[#1b232e] p-4 rounded-xl border border-slate-700 space-y-2">
            <div className="flex items-center gap-2 font-bold text-rose-300 text-sm">
              <Bug className="w-4 h-4 text-rose-400" />
              <span>Error Detection & Debug Console</span>
            </div>
            <p className="text-slate-300">
              The <strong>Open console</strong> button in the header features a small red rounded box
              showing the live count of syntax errors detected in your code.
            </p>
            <p className="text-slate-400">
              When opened, the console shows the exact file, error description, and offending line
              number. Click <strong>"Fix with AI"</strong> on any error to let the agent repair the
              code instantly!
            </p>
          </div>

          {/* Section: Universal Compiler */}
          <div className="bg-[#1b232e] p-4 rounded-xl border border-slate-700 space-y-2">
            <div className="flex items-center gap-2 font-bold text-emerald-300 text-sm">
              <Package className="w-4 h-4 text-emerald-400" />
              <span>Universal Compile Outputs</span>
            </div>
            <p className="text-slate-300">
              Click <strong>Compile</strong> on the preview bar:
            </p>
            <ul className="list-disc list-inside space-y-1 text-slate-400 ml-1">
              <li>
                <strong>Mobile Outputs:</strong> Android APK, AAB (Google Play), and iOS IPA.
              </li>
              <li>
                <strong>Desktop Outputs:</strong> Windows .exe, Windows .MSI, macOS .AppImage / DMG,
                and Linux .deb.
              </li>
              <li>
                <strong>Start Build outputs:</strong> Compiles all selected targets into a zipped
                folder and places it in your project as <code>Build output files.zip</code>.
              </li>
            </ul>
          </div>

          {/* Section: Offline Capabilities */}
          <div className="bg-[#1b232e] p-4 rounded-xl border border-slate-700 space-y-2">
            <div className="flex items-center gap-2 font-bold text-purple-300 text-sm">
              <WifiOff className="w-4 h-4 text-purple-400" />
              <span>100% Offline Capability</span>
            </div>
            <p className="text-slate-300">
              gCAD Code Editor works seamlessly offline: error analysis, live preview, auto-save,
              code formatting, and zip building all execute client-side. The AI bot connects to
              Gemini when online and switches to intelligent local rule-engine when offline.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="h-14 bg-[#1e2733] border-t border-[#3b4b5e] px-5 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 font-bold text-white text-xs transition"
          >
            Got it, Let's Code
          </button>
        </div>
      </div>
    </div>
  );
};
