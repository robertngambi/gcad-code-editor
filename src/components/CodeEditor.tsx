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
  AlignLeft,
  Sparkles,
  Play,
  Bug,
} from 'lucide-react';
import { CodeFile, LintError, Project, SupportedLanguage } from '../types/editor';
import { highlightCode } from '../utils/syntaxHighlighter';
import { formatCode } from '../utils/codeFormatter';

export const AVAILABLE_FONTS = [
  { id: 'Fira Code', label: 'Fira Code', family: "'Fira Code', monospace" },
  { id: 'JetBrains Mono', label: 'JetBrains Mono', family: "'JetBrains Mono', monospace" },
  { id: 'Source Code Pro', label: 'Source Code Pro', family: "'Source Code Pro', monospace" },
  { id: 'Courier New', label: 'Courier New', family: "'Courier New', Courier, monospace" },
  { id: 'Inter', label: 'Inter (Sans)', family: "'Inter', sans-serif" },
];

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
  fontFamily: string;
  onChangeFontFamily: (font: string) => void;
  onRunProject?: () => void;
  onDebugScan?: () => void;
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
  fontFamily,
  onChangeFontFamily,
  onRunProject,
  onDebugScan,
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isFormatBoxOpen, setIsFormatBoxOpen] = useState(false);
  const [isFontDropdownOpen, setIsFontDropdownOpen] = useState(false);
  const [isEditingEnabled, setIsEditingEnabled] = useState(true);
  const [isNewFileModalOpen, setIsNewFileModalOpen] = useState(false);
  const [newFileName, setNewFileName] = useState('');
  const [editorToast, setEditorToast] = useState<string | null>(null);

  const menuRef = useRef<HTMLDivElement>(null);
  const formatBoxRef = useRef<HTMLDivElement>(null);
  const tabsScrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const preRef = useRef<HTMLPreElement>(null);
  const gutterRef = useRef<HTMLDivElement>(null);

  // Show temporary toast inside editor
  const showToast = (msg: string) => {
    setEditorToast(msg);
    setTimeout(() => {
      setEditorToast((curr) => (curr === msg ? null : curr));
    }, 2400);
  };

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

  // Selected font styling
  const fontCssValue = useMemo(() => {
    const found = AVAILABLE_FONTS.find((f) => f.id === fontFamily);
    return found ? found.family : "'Fira Code', monospace";
  }, [fontFamily]);

  // Manual Trigger Code Formatting
  const handleFormatCurrentCode = () => {
    if (!activeFile) return;
    const formatted = formatCode(activeFile.content, activeFile.language);
    onUpdateFileContent(activeFile.id, formatted);
    showToast('Code formatted in order (Alt+Shift+F)');
  };

  // Void elements that should NOT have closing tags in HTML
  const VOID_HTML_TAGS = new Set([
    'area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input',
    'link', 'meta', 'param', 'source', 'track', 'wbr', '!doctype',
  ]);

  // Comprehensive keyboard shortcut & smart editing handler
  const handleEditorKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    const textarea = textareaRef.current;
    if (!textarea || !activeFile || !isEditingEnabled) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const val = textarea.value;

    // 1. Shortcut: Ctrl+S / Cmd+S => Save Project
    if ((e.ctrlKey || e.metaKey) && (e.key === 's' || e.key === 'S')) {
      e.preventDefault();
      onSaveProject();
      showToast('Project saved (Ctrl+S)');
      return;
    }

    // 2. Shortcut: Ctrl+Enter / Cmd+Enter => Run Project
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      if (onRunProject) {
        onRunProject();
        showToast('Running project in preview (Ctrl+Enter)');
      }
      return;
    }

    // 3. Shortcut: Alt+Shift+F => Format Code in Order
    if (e.altKey && e.shiftKey && (e.key === 'F' || e.key === 'f')) {
      e.preventDefault();
      handleFormatCurrentCode();
      return;
    }

    // 4. Shortcut: "!" + Tab => Generates full HTML introductory template
    if (e.key === 'Tab' && !e.shiftKey) {
      // Check if character before cursor is '!'
      const charBefore = val.slice(Math.max(0, start - 1), start);
      const isHtmlDoc = activeFile.language === 'html' || activeFile.name.endsWith('.html');

      if (charBefore === '!' && isHtmlDoc) {
        e.preventDefault();
        const htmlBoilerplate = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${project.name || 'Document'}</title>
</head>
<body>
  
</body>
</html>`;

        const updated = val.substring(0, start - 1) + htmlBoilerplate + val.substring(end);
        onUpdateFileContent(activeFile.id, updated);

        // Position cursor inside <body>
        setTimeout(() => {
          const bodyIndex = updated.indexOf('<body>\n  ') + '<body>\n  '.length;
          textarea.selectionStart = textarea.selectionEnd = bodyIndex >= 0 ? bodyIndex : start;
        }, 10);
        showToast('HTML boilerplate generated (! + Tab)');
        return;
      }

      // Normal Tab key indentation (2 spaces)
      e.preventDefault();
      const updated = val.substring(0, start) + '  ' + val.substring(end);
      onUpdateFileContent(activeFile.id, updated);
      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd = start + 2;
      }, 0);
      return;
    }

    // 5. Auto-closing HTML tags: typing '>'
    if (e.key === '>') {
      // Look back for preceding opening tag: e.g. <html or <div class="box"
      const beforeCursor = val.slice(0, start);
      const openTagMatch = beforeCursor.match(/<([a-zA-Z0-9\-]+)(?:\s+[^<>]*)?$/);

      if (openTagMatch) {
        const tagName = openTagMatch[1].toLowerCase();
        const fullMatched = openTagMatch[0];

        // Check it's not a closing tag like </div and not self-closing and not void tag
        if (!fullMatched.startsWith('</') && !fullMatched.endsWith('/') && !VOID_HTML_TAGS.has(tagName)) {
          e.preventDefault();
          const closingTag = `</${tagName}>`;
          const updated = val.substring(0, start) + '>' + closingTag + val.substring(end);
          onUpdateFileContent(activeFile.id, updated);

          // Place cursor right after '>' (between > and </tagName>)
          setTimeout(() => {
            textarea.selectionStart = textarea.selectionEnd = start + 1;
          }, 0);
          return;
        }
      }
    }

    // 6. Auto-closing pairs: (), {}, [], "", '', ``
    const PAIRS: Record<string, string> = {
      '(': ')',
      '[': ']',
      '{': '}',
      '"': '"',
      "'": "'",
      '`': '`',
    };

    if (PAIRS[e.key]) {
      const openChar = e.key;
      const closeChar = PAIRS[openChar];

      // If user has text selected, surround the selected text!
      if (start !== end) {
        e.preventDefault();
        const selected = val.substring(start, end);
        const updated = val.substring(0, start) + openChar + selected + closeChar + val.substring(end);
        onUpdateFileContent(activeFile.id, updated);
        setTimeout(() => {
          textarea.selectionStart = start + 1;
          textarea.selectionEnd = end + 1;
        }, 0);
        return;
      }

      // If typing quote/bracket and the very next character is already that closing character, skip over it
      const nextChar = val.charAt(start);
      if ((openChar === '"' || openChar === "'" || openChar === '`') && nextChar === openChar) {
        e.preventDefault();
        textarea.selectionStart = textarea.selectionEnd = start + 1;
        return;
      }

      // Otherwise insert pair and position caret inside
      e.preventDefault();
      const updated = val.substring(0, start) + openChar + closeChar + val.substring(end);
      onUpdateFileContent(activeFile.id, updated);
      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd = start + 1;
      }, 0);
      return;
    }

    // 7. Auto-closing skip over: ), ], }
    if (e.key === ')' || e.key === ']' || e.key === '}') {
      const nextChar = val.charAt(start);
      if (nextChar === e.key && start === end) {
        e.preventDefault();
        textarea.selectionStart = textarea.selectionEnd = start + 1;
        return;
      }
    }

    // 8. Backspace handler: delete matching empty pair e.g. () -> delete both
    if (e.key === 'Backspace' && start === end && start > 0) {
      const charBefore = val.charAt(start - 1);
      const charAfter = val.charAt(start);
      if (
        (charBefore === '(' && charAfter === ')') ||
        (charBefore === '[' && charAfter === ']') ||
        (charBefore === '{' && charAfter === '}') ||
        (charBefore === '"' && charAfter === '"') ||
        (charBefore === "'" && charAfter === "'") ||
        (charBefore === '`' && charAfter === '`')
      ) {
        e.preventDefault();
        const updated = val.substring(0, start - 1) + val.substring(start + 1);
        onUpdateFileContent(activeFile.id, updated);
        setTimeout(() => {
          textarea.selectionStart = textarea.selectionEnd = start - 1;
        }, 0);
        return;
      }
    }

    // 9. Enter key auto-indent between braces { } or tags > <
    if (e.key === 'Enter' && start === end && start > 0) {
      const charBefore = val.charAt(start - 1);
      const charAfter = val.charAt(start);

      if (charBefore === '{' && charAfter === '}') {
        e.preventDefault();
        // Determine current line indentation
        const linesBefore = val.slice(0, start).split('\n');
        const currentLine = linesBefore[linesBefore.length - 1];
        const indentMatch = currentLine.match(/^\s*/);
        const currentIndent = indentMatch ? indentMatch[0] : '';
        const innerIndent = currentIndent + '  ';

        const insertion = `\n${innerIndent}\n${currentIndent}`;
        const updated = val.substring(0, start) + insertion + val.substring(start);
        onUpdateFileContent(activeFile.id, updated);

        setTimeout(() => {
          textarea.selectionStart = textarea.selectionEnd = start + 1 + innerIndent.length;
        }, 0);
        return;
      }
    }
  };

  // Close menus on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
      if (formatBoxRef.current && !formatBoxRef.current.contains(event.target as Node)) {
        setIsFormatBoxOpen(false);
        setIsFontDropdownOpen(false);
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
      <div className="h-12 bg-[#384556] border-b border-[#475569] px-2.5 flex items-center justify-between gap-2 z-10 shrink-0">
        <div className="flex items-center gap-2 relative">
          {/* Hamburger button (3 lines) */}
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              title="Project Workspace Menu"
              className="w-8 h-8 rounded-lg bg-[#334155]/80 hover:bg-slate-700 border border-slate-500/60 flex items-center justify-center text-slate-200 transition active:scale-95"
            >
              <Menu className="w-4 h-4" />
            </button>

            {/* Hamburger Dropdown Menu */}
            {isMenuOpen && (
              <div className="absolute top-10 left-0 w-64 bg-[#283341] border border-[#4a5a6e] rounded-xl shadow-2xl py-2 z-50 text-xs animate-in fade-in slide-in-from-top-1">
                <div className="px-3 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-700/60 mb-1 flex items-center justify-between">
                  <span>Project Workspace</span>
                </div>

                {/* Run project button */}
                <button
                  onClick={() => {
                    setIsMenuOpen(false);
                    if (onRunProject) onRunProject();
                  }}
                  className="w-full px-3 py-2 text-left hover:bg-slate-700 flex items-center justify-between text-slate-200 hover:text-white transition group"
                >
                  <div className="flex items-center gap-2.5">
                    <Play className="w-4 h-4 text-emerald-400 fill-emerald-400 group-hover:scale-110 transition-transform shrink-0" />
                    <div>
                      <p className="font-semibold text-emerald-300">Run project</p>
                      <p className="text-[10px] text-slate-400">Execute in preview canvas</p>
                    </div>
                  </div>
                  <span className="text-[9px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded font-mono">
                    Ctrl+Enter
                  </span>
                </button>

                {/* Debug project button */}
                <button
                  onClick={() => {
                    setIsMenuOpen(false);
                    if (onDebugScan) onDebugScan();
                  }}
                  className="w-full px-3 py-2 text-left hover:bg-slate-700 flex items-center justify-between text-slate-200 hover:text-white transition group"
                >
                  <div className="flex items-center gap-2.5">
                    <Bug className="w-4 h-4 text-rose-400 group-hover:scale-110 transition-transform shrink-0" />
                    <div>
                      <p className="font-semibold text-rose-300">Debug project</p>
                      <p className="text-[10px] text-slate-400">Deep scan code diagnostics</p>
                    </div>
                  </div>
                  <span className="text-[9px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded font-mono">
                    Scan
                  </span>
                </button>

                <div className="my-1 border-t border-slate-700/60" />

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
                    <span className="font-semibold">Save (Ctrl+S)</span>
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
                  onClick={() => {
                    setIsFormatBoxOpen(!isFormatBoxOpen);
                  }}
                  className="w-full px-3 py-2 text-left hover:bg-slate-700 flex items-center justify-between text-slate-200 hover:text-white transition"
                >
                  <div className="flex items-center gap-2.5">
                    <Type className="w-4 h-4 text-rose-400" />
                    <span className="font-semibold">Format Editor</span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono">{fontSize}px</span>
                </button>
              </div>
            )}
          </div>

          {/* Project name input/pill: (e.g. "My first website") */}
          <button
            onClick={onOpenProjectTree}
            title="Click to view Project File Tree"
            className="h-8 px-3.5 bg-[#334155]/60 hover:bg-[#334155] border border-slate-500/70 rounded-full flex items-center gap-2 text-xs font-medium text-slate-100 transition shadow-inner"
          >
            <span className="truncate max-w-[130px] sm:max-w-[190px]">{project.name}</span>
          </button>

          {/* Format Editor & Font Type Dropdown Button */}
          <div className="relative" ref={formatBoxRef}>
            <button
              onClick={() => setIsFormatBoxOpen(!isFormatBoxOpen)}
              title="Editor Formatting & Font Settings"
              className={`h-8 px-2.5 rounded-lg border text-xs font-medium flex items-center gap-1.5 transition ${
                isFormatBoxOpen
                  ? 'bg-rose-950/60 text-rose-300 border-rose-500/60'
                  : 'bg-[#334155]/80 hover:bg-slate-700 text-slate-200 border-slate-500/60'
              }`}
            >
              <Type className="w-3.5 h-3.5 text-rose-400" />
              <span className="hidden md:inline font-mono">{fontSize}px</span>
            </button>

            {/* Format Editor 3-Column Control & Font Type Selector */}
            {isFormatBoxOpen && (
              <div className="absolute top-10 left-0 w-64 bg-[#1f2834] border border-[#4a5a6e] rounded-xl shadow-2xl p-3 z-50 text-xs animate-in fade-in slide-in-from-top-1 space-y-3">
                {/* 3-Column Font Size Control: [-] [14px] [+] */}
                <div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 flex justify-between items-center">
                    <span>Font Size</span>
                    <span className="text-cyan-400 font-mono font-semibold">{fontSize}px</span>
                  </div>
                  <div className="grid grid-cols-3 gap-1 items-center text-center">
                    <button
                      onClick={() => onChangeFontSize(Math.max(fontSize - 1, 10))}
                      title="Decrease font size"
                      className="py-1 rounded bg-[#2a3646] hover:bg-slate-700 text-slate-200 hover:text-white font-bold text-base active:scale-95 transition border border-slate-600"
                    >
                      -
                    </button>
                    <div className="py-1 bg-[#151c24] text-xs font-mono font-bold text-cyan-300 rounded border border-slate-700 flex items-center justify-center">
                      {fontSize}px
                    </div>
                    <button
                      onClick={() => onChangeFontSize(Math.min(fontSize + 2, 32))}
                      title="Increase font size"
                      className="py-1 rounded bg-[#2a3646] hover:bg-slate-700 text-slate-200 hover:text-white font-bold text-base active:scale-95 transition border border-slate-600"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Font Family / Type Selector */}
                <div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 flex justify-between items-center">
                    <span>Font Family</span>
                    <span className="text-[10px] text-slate-400">{fontFamily}</span>
                  </div>
                  <div className="space-y-1">
                    {AVAILABLE_FONTS.map((font) => (
                      <button
                        key={font.id}
                        onClick={() => {
                          onChangeFontFamily(font.id);
                          showToast(`Font set to ${font.label}`);
                        }}
                        className={`w-full px-2.5 py-1.5 rounded-lg text-left flex items-center justify-between text-xs transition ${
                          fontFamily === font.id
                            ? 'bg-cyan-950/70 text-cyan-300 font-semibold border border-cyan-600/60'
                            : 'hover:bg-slate-700/60 text-slate-300 border border-transparent'
                        }`}
                        style={{ fontFamily: font.family }}
                      >
                        <span>{font.label}</span>
                        {fontFamily === font.id && <Check className="w-3.5 h-3.5 text-cyan-400" />}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Code Format Button: Alt + Shift + F */}
                <div className="pt-2 border-t border-slate-700/60">
                  <button
                    onClick={handleFormatCurrentCode}
                    className="w-full py-1.5 px-2 bg-gradient-to-r from-cyan-900/60 to-blue-900/60 hover:from-cyan-800/80 hover:to-blue-800/80 text-cyan-200 border border-cyan-600/50 rounded-lg font-medium flex items-center justify-center gap-1.5 text-xs transition active:scale-95 shadow-sm"
                  >
                    <AlignLeft className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Format Code (Alt+Shift+F)</span>
                  </button>
                </div>
              </div>
            )}
          </div>
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
      <div className="h-9 bg-[#2e3948] border-b border-[#475569] flex items-center px-1 text-xs shrink-0">
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
      <div className="flex-1 flex overflow-hidden bg-[#2d3847] relative">
        {/* Line Numbers Gutter */}
        <div
          ref={gutterRef}
          className="w-12 bg-[#252f3d] border-r border-[#3e4c5e] text-slate-500 text-right pr-2 select-none overflow-hidden py-3 shrink-0"
          style={{
            fontSize: `${fontSize}px`,
            lineHeight: '1.5',
            fontFamily: fontCssValue,
          }}
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
            className="absolute inset-0 p-3 m-0 overflow-hidden pointer-events-none select-none text-slate-100"
            style={{
              fontSize: `${fontSize}px`,
              lineHeight: '1.5',
              tabSize: 2,
              whiteSpace: 'pre',
              fontFamily: fontCssValue,
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
                ? "Type or paste code here directly... (Tip: '! + Tab' for HTML template, 'Alt+Shift+F' to format)"
                : 'No file open. Click + to create a file or open from project menu.'
            }
            spellCheck={false}
            className={`absolute inset-0 p-3 m-0 w-full h-full bg-transparent resize-none focus:outline-none overflow-auto leading-[1.5] ${
              !isEditingEnabled ? 'cursor-not-allowed' : ''
            }`}
            style={{
              fontSize: `${fontSize}px`,
              lineHeight: '1.5',
              tabSize: 2,
              whiteSpace: 'pre',
              fontFamily: fontCssValue,
              color: activeFile && activeFile.content ? 'transparent' : '#94a3b8',
              caretColor: '#38bdf8',
            }}
          />

          {/* Lock Overlay Badge */}
          {!isEditingEnabled && (
            <div className="absolute top-3 right-3 bg-slate-900/80 backdrop-blur px-2.5 py-1 rounded text-[11px] text-amber-300 border border-amber-500/30 flex items-center gap-1 pointer-events-none z-20">
              <Lock className="w-3 h-3" />
              <span>Editing Locked</span>
            </div>
          )}

          {/* In-Editor Toast for Shortcut feedback */}
          {editorToast && (
            <div className="absolute bottom-4 right-4 bg-[#1a232f]/95 border border-cyan-500/50 text-cyan-300 text-xs px-3 py-1.5 rounded-lg shadow-xl flex items-center gap-2 pointer-events-none z-30 animate-in fade-in slide-in-from-bottom-2">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>{editorToast}</span>
            </div>
          )}
        </div>
      </div>

      {/* Editor Footer Status Bar */}
      <div className="h-6 bg-[#252f3d] border-t border-[#3e4c5e] px-3 flex items-center justify-between text-[10px] text-slate-400 shrink-0">
        <div className="flex items-center gap-3">
          <span className="font-semibold">{activeFile?.language.toUpperCase() || 'PLAINTEXT'}</span>
          <span>UTF-8</span>
          <span>Lines: {lineCount}</span>
          <span className="hidden sm:inline text-slate-500">Font: {fontFamily}</span>
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
          <span className="hidden xs:inline">Auto-Save: 5m</span>
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
