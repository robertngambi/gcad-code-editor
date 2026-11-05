import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  Menu,
  ChevronLeft,
  ChevronRight,
  Plus,
  X,
  Download,
  FolderOpen,
  FolderPlus,
  Globe,
  Save,
  FileEdit,
  Type,
  Lock,
  Unlock,
  FileCode,
  Check,
  AlertTriangle,
} from 'lucide-react';
import { CodeFile, LintError, Project, SupportedLanguage } from '../types/editor';
import { highlightCode } from '../utils/syntaxHighlighter';

interface CodeEditorProps {
  project: Project;
  activeFile: CodeFile | null;
  openFiles: CodeFile[];
  errors: LintError[];
  onSelectFile: (file: CodeFile) => void;
  onCloseFile: (fileId: string) => void;
  onUpdateFileContent: (fileId: string, content: string) => void;
  onCreateNewFile: (name: string, language: SupportedLanguage) => void;
  onOpenCreateProject: () => void;
  onOpenProjectPicker: () => void;
  onOpenOnlineProjects: () => void;
  onOpenProjectTree: () => void;
  onSaveProject: () => void;
  onSaveAsProject: () => void;
  onDownloadProject: () => void;
  fontSize: number;
  onChangeFontSize: (newSize: number) => void;
}

export const CodeEditor: React.FC<CodeEditorProps> = ({
  project,
  activeFile,
  openFiles,
  errors,
  onSelectFile,
  onCloseFile,
  onUpdateFileContent,
  onCreateNewFile,
  onOpenCreateProject,
  onOpenProjectPicker,
  onOpenOnlineProjects,
  onOpenProjectTree,
  onSaveProject,
  onSaveAsProject,
  onDownloadProject,
  fontSize,
  onChangeFontSize,
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isFormatBoxOpen, setIsFormatBoxOpen] = useState(false);
  const [isEditingEnabled, setIsEditingEnabled] = useState(true);
  const [isNewFileModalOpen, setIsNewFileModalOpen] = useState(false);
  const [newFileName, setNewFileName] = useState('');

  const menuRef = useRef<HTMLDivElement>(null);
  const tabsScrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const preRef = useRef<HTMLPreElement>(null);
  const gutterRef = useRef<HTMLDivElement>(null);

  // Synchronize scrolling between textarea, underlying syntax highlighted pre, and line numbers gutter
  const handleEditorScroll = () => {
    if (textareaRef.current) {
      const top = textareaRef.current.scrollTop;
      const left = textareaRef.current.scrollLeft;
      if (preRef.current) {
        preRef.current.scrollTop = top;
        preRef.current.scrollLeft = left;
      }
      if (gutterRef.current) {
        gutterRef.current.scrollTop = top;
      }
    }
  };

  // Syntax highlighting HTML string
  const highlightedHtml = useMemo(() => {
    return highlightCode(activeFile?.content || '', activeFile?.language || 'javascript');
  }, [activeFile?.content, activeFile?.language]);

  // Tab key indent handler
  const handleEditorKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const textarea = textareaRef.current;
      if (!textarea || !activeFile) return;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const val = textarea.value;
      const updated = val.substring(0, start) + '  ' + val.substring(end);
      onUpdateFileContent(activeFile.id, updated);
      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd = start + 2;
      }, 0);
    }
  };

  // Close menus on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
        setIsFormatBoxOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Scroll tabs horizontally
  const scrollTabs = (direction: 'left' | 'right') => {
    if (tabsScrollRef.current) {
      tabsScrollRef.current.scrollBy({
        left: direction === 'left' ? -150 : 150,
        behavior: 'smooth',
      });
    }
  };

  // Helper for language icons & colors
  const getLanguageIcon = (lang: SupportedLanguage, name: string) => {
    if (name.endsWith('.html')) return <span className="text-orange-400 font-bold">&lt;&gt;</span>;
    if (name.endsWith('.css')) return <span className="text-blue-400 font-bold">#</span>;
    if (name.endsWith('.js')) return <span className="text-yellow-400 font-bold">JS</span>;
    if (name.endsWith('.ts')) return <span className="text-cyan-400 font-bold">TS</span>;
    if (name.endsWith('.json')) return <span className="text-emerald-400 font-bold">&#123;&#125;</span>;
    if (name.endsWith('.py')) return <span className="text-amber-400 font-bold">PY</span>;
    if (name.endsWith('.md')) return <span className="text-purple-400 font-bold">MD</span>;
    return <FileCode className="w-3.5 h-3.5 text-slate-400" />;
  };

  // Check if a file has errors to show wavy underline as in App.json
  const fileHasErrors = (fileId: string) => {
    return errors.some((e) => e.fileId === fileId && e.severity === 'error');
  };

  // Code content split by lines
  const lines = (activeFile?.content ?? '').split('\n');
  const lineCount = Math.max(lines.length, 1);

  // Active file errors map for gutter indicator
  const activeFileErrorLines = new Set(
    errors.filter((e) => e.fileId === activeFile?.id).map((e) => e.line)
  );

  const handleCreateFileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFileName.trim()) return;

    let lang: SupportedLanguage = 'javascript';
    const lower = newFileName.toLowerCase();
    if (lower.endsWith('.html')) lang = 'html';
    else if (lower.endsWith('.css')) lang = 'css';
    else if (lower.endsWith('.js')) lang = 'javascript';
    else if (lower.endsWith('.ts')) lang = 'typescript';
    else if (lower.endsWith('.json')) lang = 'json';
    else if (lower.endsWith('.py')) lang = 'python';
    else if (lower.endsWith('.md')) lang = 'markdown';

    onCreateNewFile(newFileName.trim(), lang);
    setNewFileName('');
    setIsNewFileModalOpen(false);
  };

  return (
    <div className="flex flex-col h-full bg-[#384556] text-white select-none relative overflow-hidden">
      {/* Top Toolbar matching screenshot exactly */}
      <div className="h-12 bg-[#384556] border-b border-[#475569] px-2.5 flex items-center justify-between gap-2 z-10">
        <div className="flex items-center gap-2 relative">
          {/* Hamburger button (3 lines) */}
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              title="Project Menu"
              className="w-8 h-8 rounded-lg bg-[#334155]/80 hover:bg-slate-700 border border-slate-500/60 flex items-center justify-center text-slate-200 transition active:scale-95"
            >
              <Menu className="w-4 h-4" />
            </button>

            {/* Hamburger Dropdown Menu */}
            {isMenuOpen && (
              <div className="absolute top-10 left-0 w-64 bg-[#283341] border border-[#4a5a6e] rounded-xl shadow-2xl py-2 z-50 text-xs animate-in fade-in slide-in-from-top-1">
                <div className="px-3 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-700/60 mb-1">
                  Project Workspace
                </div>
                <button
                  onClick={() => {
                    setIsMenuOpen(false);
                    onOpenCreateProject();
                  }}
                  className="w-full px-3 py-2 text-left hover:bg-slate-700 flex items-center gap-2.5 text-slate-200 hover:text-white transition"
                >
                  <FolderPlus className="w-4 h-4 text-cyan-400" />
                  <div>
                    <p className="font-semibold">Create project</p>
                    <p className="text-[10px] text-slate-400">Start new project folder</p>
                  </div>
                </button>

                <button
                  onClick={() => {
                    setIsMenuOpen(false);
                    onOpenProjectPicker();
                  }}
                  className="w-full px-3 py-2 text-left hover:bg-slate-700 flex items-center gap-2.5 text-slate-200 hover:text-white transition"
                >
                  <FolderOpen className="w-4 h-4 text-amber-400" />
                  <div>
                    <p className="font-semibold">Open project</p>
                    <p className="text-[10px] text-slate-400">Select local folder/project</p>
                  </div>
                </button>

                <button
                  onClick={() => {
                    setIsMenuOpen(false);
                    onOpenOnlineProjects();
                  }}
                  className="w-full px-3 py-2 text-left hover:bg-slate-700 flex items-center gap-2.5 text-slate-200 hover:text-white transition"
                >
                  <Globe className="w-4 h-4 text-emerald-400" />
                  <div>
                    <p className="font-semibold">Open online</p>
                    <p className="text-[10px] text-slate-400">Search online starter repos</p>
                  </div>
                </button>

                <div className="my-1 border-t border-slate-700/60" />

                <button
                  onClick={() => {
                    setIsMenuOpen(false);
                    onSaveProject();
                  }}
                  className="w-full px-3 py-2 text-left hover:bg-slate-700 flex items-center gap-2.5 text-slate-200 hover:text-white transition"
                >
                  <Save className="w-4 h-4 text-sky-400" />
                  <div className="flex-1 flex justify-between items-center">
                    <span className="font-semibold">Save</span>
                    <span className="text-[9px] bg-slate-800 px-1.5 py-0.5 rounded text-slate-400">
                      Auto: 5m
                    </span>
                  </div>
                </button>

                <button
                  onClick={() => {
                    setIsMenuOpen(false);
                    onSaveAsProject();
                  }}
                  className="w-full px-3 py-2 text-left hover:bg-slate-700 flex items-center gap-2.5 text-slate-200 hover:text-white transition"
                >
                  <FileEdit className="w-4 h-4 text-purple-400" />
                  <div>
                    <p className="font-semibold">Save as</p>
                    <p className="text-[10px] text-slate-400">Rename project & copy</p>
                  </div>
                </button>

                <div className="my-1 border-t border-slate-700/60" />

                {/* Format Editor entry inside menu */}
                <button
                  onClick={() => setIsFormatBoxOpen(!isFormatBoxOpen)}
                  className="w-full px-3 py-2 text-left hover:bg-slate-700 flex items-center justify-between text-slate-200 hover:text-white transition"
                >
                  <div className="flex items-center gap-2.5">
                    <Type className="w-4 h-4 text-rose-400" />
                    <span className="font-semibold">Format Editor</span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono">{fontSize}px</span>
                </button>

                {/* Format Editor 3-column control */}
                {isFormatBoxOpen && (
                  <div className="mx-3 my-2 p-2 bg-[#1e2733] border border-slate-700 rounded-lg">
                    <div className="grid grid-cols-3 gap-1 items-center text-center">
                      <button
                        onClick={() => onChangeFontSize(Math.max(fontSize - 1, 10))}
                        className="py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white font-bold text-sm active:scale-95"
                      >
                        -
                      </button>
                      <span className="text-xs font-mono font-semibold text-cyan-300">
                        {fontSize}px
                      </span>
                      <button
                        onClick={() => onChangeFontSize(Math.min(fontSize + 1, 32))}
                        className="py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white font-bold text-sm active:scale-95"
                      >
                        +
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Project name input/pill: (e.g. "My first website") */}
          <button
            onClick={onOpenProjectTree}
            title="Click to view Project File Tree"
            className="h-8 px-3.5 bg-[#334155]/60 hover:bg-[#334155] border border-slate-500/70 rounded-full flex items-center gap-2 text-xs font-medium text-slate-100 transition shadow-inner"
          >
            <span className="truncate max-w-[140px] sm:max-w-[200px]">{project.name}</span>
          </button>
        </div>

        {/* Right side of editor toolbar */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Edit button: toggle manual code editing */}
          <button
            onClick={() => setIsEditingEnabled(!isEditingEnabled)}
            title={isEditingEnabled ? 'Disable manual editing' : 'Enable manual editing'}
            className={`h-8 px-2.5 rounded-lg border text-xs font-medium flex items-center gap-1.5 transition ${
              isEditingEnabled
                ? 'bg-emerald-950/40 text-emerald-300 border-emerald-600/50'
                : 'bg-slate-700/40 text-slate-400 border-slate-600'
            }`}
          >
            {isEditingEnabled ? (
              <Unlock className="w-3.5 h-3.5 text-emerald-400" />
            ) : (
              <Lock className="w-3.5 h-3.5 text-slate-400" />
            )}
            <span className="hidden sm:inline">Edit</span>
          </button>

          {/* Download button in rounded rectangle */}
          <button
            onClick={onDownloadProject}
            title="Download project files (.zip)"
            className="h-8 px-3 rounded-lg bg-[#334155]/80 hover:bg-slate-700 border border-slate-500/60 text-xs font-medium text-slate-200 hover:text-white flex items-center gap-1.5 transition active:scale-95"
          >
            <Download className="w-3.5 h-3.5 text-cyan-400" />
            <span className="font-medium">Download</span>
          </button>

          {/* Number of code files indicator (e.g., 4) in rounded rectangle */}
          <div
            title={`${project.files.length} Code Files in Project`}
            className="h-8 min-w-[32px] px-2 rounded-lg bg-[#334155]/80 border border-slate-500/60 flex items-center justify-center text-xs font-bold text-cyan-400 shadow-sm"
          >
            {project.files.length}
          </div>
        </div>
      </div>

      {/* Code File Tabs Bar matching screenshot */}
      <div className="h-9 bg-[#2e3948] border-b border-[#475569] flex items-center px-1 text-xs">
        {/* Left scroll navigation arrow */}
        <button
          onClick={() => scrollTabs('left')}
          title="Scroll tabs left"
          className="w-6 h-7 flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-700/60 rounded transition"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
        </button>

        {/* Scrollable file tabs */}
        <div
          ref={tabsScrollRef}
          className="flex-1 flex items-center gap-1 overflow-x-auto no-scrollbar scroll-smooth px-1"
        >
          {openFiles.map((file) => {
            const isActive = activeFile?.id === file.id;
            const hasErr = fileHasErrors(file.id);

            return (
              <div
                key={file.id}
                onClick={() => onSelectFile(file)}
                className={`group flex items-center gap-1.5 px-3 py-1 rounded-md cursor-pointer transition select-none text-[11px] border ${
                  isActive
                    ? 'bg-[#384556] text-white border-slate-500/60 font-medium'
                    : 'bg-[#252f3c] text-slate-400 hover:text-slate-200 border-transparent hover:bg-slate-800'
                }`}
              >
                {/* Format icon */}
                <span className="text-[10px] font-mono">
                  {getLanguageIcon(file.language, file.name)}
                </span>

                {/* Tab File Name (with red wavy error marker if has error, like App.json in screenshot) */}
                <span
                  className={`truncate max-w-[90px] ${
                    hasErr ? 'border-b-2 border-rose-500 border-dotted text-rose-300' : ''
                  }`}
                >
                  {file.name}
                </span>

                {/* Close 'X' button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onCloseFile(file.id);
                  }}
                  title="Close tab"
                  className="opacity-60 group-hover:opacity-100 hover:text-rose-400 rounded p-0.5 transition"
                >
                  <X className="w-2.5 h-2.5" />
                </button>
              </div>
            );
          })}
        </div>

        {/* Right scroll navigation arrow */}
        <button
          onClick={() => scrollTabs('right')}
          title="Scroll tabs right"
          className="w-6 h-7 flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-700/60 rounded transition"
        >
          <ChevronRight className="w-3.5 h-3.5" />
        </button>

        {/* '+' Button to create new code file */}
        <button
          onClick={() => setIsNewFileModalOpen(true)}
          title="Create New Code File"
          className="w-6 h-7 flex items-center justify-center text-slate-300 hover:text-white hover:bg-slate-700/60 rounded transition ml-1"
        >
          <Plus className="w-3.5 h-3.5 text-cyan-400" />
        </button>
      </div>

      {/* Editor Body: Line numbers and Syntax Highlighted Code Canvas */}
      <div className="flex-1 flex overflow-hidden bg-[#2d3847] font-mono relative">
        {/* Line Numbers Gutter */}
        <div
          ref={gutterRef}
          className="w-12 bg-[#252f3d] border-r border-[#3e4c5e] text-slate-500 text-right pr-2 select-none overflow-hidden py-3 shrink-0"
          style={{ fontSize: `${fontSize}px`, lineHeight: '1.5' }}
        >
          {Array.from({ length: lineCount }).map((_, idx) => {
            const lineNum = idx + 1;
            const hasError = activeFileErrorLines.has(lineNum);
            return (
              <div
                key={lineNum}
                className={`flex items-center justify-end gap-1 ${
                  hasError ? 'text-rose-400 font-bold bg-rose-950/40' : ''
                }`}
              >
                {hasError && <span className="w-1.5 h-1.5 rounded-full bg-rose-500 inline-block" />}
                <span>{lineNum}</span>
              </div>
            );
          })}
        </div>

        {/* Code Canvas Container with Live Syntax Coloring */}
        <div className="flex-1 relative overflow-hidden h-full">
          {/* Syntax Highlighted PRE Layer rendered underneath */}
          <pre
            ref={preRef}
            aria-hidden="true"
            className="absolute inset-0 p-3 m-0 overflow-hidden font-mono pointer-events-none select-none text-slate-100"
            style={{
              fontSize: `${fontSize}px`,
              lineHeight: '1.5',
              tabSize: 2,
              whiteSpace: 'pre',
            }}
            dangerouslySetInnerHTML={{
              __html: (highlightedHtml || '') + '\n',
            }}
          />

          {/* Transparent TextArea on top to capture user live typing, selections, and cursors */}
          <textarea
            ref={textareaRef}
            onScroll={handleEditorScroll}
            onKeyDown={handleEditorKeyDown}
            readOnly={!isEditingEnabled}
            value={activeFile ? activeFile.content : ''}
            onChange={(e) => {
              if (activeFile) {
                onUpdateFileContent(activeFile.id, e.target.value);
              }
            }}
            placeholder={
              activeFile
                ? 'Type or paste code here directly...'
                : 'No file open. Click + to create a file or open from project menu.'
            }
            spellCheck={false}
            className={`absolute inset-0 p-3 m-0 w-full h-full bg-transparent font-mono resize-none focus:outline-none overflow-auto leading-[1.5] ${
              !isEditingEnabled ? 'cursor-not-allowed' : ''
            }`}
            style={{
              fontSize: `${fontSize}px`,
              lineHeight: '1.5',
              tabSize: 2,
              whiteSpace: 'pre',
              color: activeFile && activeFile.content ? 'transparent' : '#94a3b8',
              caretColor: '#38bdf8',
            }}
          />

          {!isEditingEnabled && (
            <div className="absolute top-3 right-3 bg-slate-900/80 backdrop-blur px-2.5 py-1 rounded text-[11px] text-amber-300 border border-amber-500/30 flex items-center gap-1 pointer-events-none z-20">
              <Lock className="w-3 h-3" />
              <span>Editing Locked</span>
            </div>
          )}
        </div>
      </div>

      {/* Editor Footer Status Bar */}
      <div className="h-6 bg-[#252f3d] border-t border-[#3e4c5e] px-3 flex items-center justify-between text-[10px] text-slate-400">
        <div className="flex items-center gap-3">
          <span>{activeFile?.language.toUpperCase() || 'PLAINTEXT'}</span>
          <span>UTF-8</span>
          <span>Lines: {lineCount}</span>
        </div>
        <div className="flex items-center gap-2">
          {activeFileErrorLines.size > 0 ? (
            <span className="text-rose-400 flex items-center gap-1 font-semibold">
              <AlertTriangle className="w-3 h-3" />
              {activeFileErrorLines.size} Error{activeFileErrorLines.size > 1 ? 's' : ''} in file
            </span>
          ) : (
            <span className="text-emerald-400 flex items-center gap-1">
              <Check className="w-3 h-3" /> No syntax errors
            </span>
          )}
          <span className="text-slate-500">|</span>
          <span>Auto-Save: 5m</span>
        </div>
      </div>

      {/* Create New File Modal */}
      {isNewFileModalOpen && (
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <form
            onSubmit={handleCreateFileSubmit}
            className="w-full max-w-sm bg-[#283341] border border-[#4a5a6e] rounded-2xl p-4 shadow-2xl text-xs"
          >
            <h3 className="font-bold text-sm text-white mb-2">Create New File</h3>
            <p className="text-slate-400 text-[11px] mb-3">
              Enter file name with extension (e.g. <code>app.js</code>, <code>styles.css</code>,{' '}
              <code>component.tsx</code>)
            </p>
            <input
              type="text"
              autoFocus
              value={newFileName}
              onChange={(e) => setNewFileName(e.target.value)}
              placeholder="e.g. utils.js"
              className="w-full bg-[#1b232d] border border-slate-600 rounded-lg p-2.5 text-white placeholder-slate-500 mb-4 focus:outline-none focus:border-cyan-400"
            />
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsNewFileModalOpen(false)}
                className="px-3 py-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!newFileName.trim()}
                className="px-4 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-semibold disabled:opacity-50"
              >
                Create
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
