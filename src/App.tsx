import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Header } from './components/Header';
import { AIChatBot } from './components/AIChatBot';
import { CodeEditor } from './components/CodeEditor';
import { DebugConsole } from './components/DebugConsole';
import { WebPreview } from './components/WebPreview';
import { CompileModal } from './components/modals/CompileModal';
import { ExportModal } from './components/modals/ExportModal';
import { ConfigModal } from './components/modals/ConfigModal';
import { GuideModal } from './components/modals/GuideModal';
import { ProjectTreeModal } from './components/modals/ProjectTreeModal';
import { CreateProjectModal } from './components/modals/CreateProjectModal';
import { OpenProjectModal } from './components/modals/OpenProjectModal';
import { OnlineProjectsModal } from './components/modals/OnlineProjectsModal';

import {
  CodeFile,
  ConsoleLog,
  LintError,
  PlatformConfig,
  Project,
  SupportedLanguage,
} from './types/editor';
import { INITIAL_PROJECT, SAMPLE_PROJECT_TEMPLATES } from './utils/defaultProjects';
import { scanCodeForErrors } from './utils/linter';
import { downloadProjectZip } from './utils/zipExport';
import { Code2, Sparkles, Terminal, Eye } from 'lucide-react';

export default function App() {
  // Main Project State
  const [project, setProject] = useState<Project>(() => {
    const saved = localStorage.getItem('gcad_active_project');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // fallback
      }
    }
    return INITIAL_PROJECT;
  });

  // Active and open tabs
  const [activeFileId, setActiveFileId] = useState<string>(
    project.files[0]?.id || 'file-1'
  );
  const [openFileIds, setOpenFileIds] = useState<string[]>(
    project.files.map((f) => f.id)
  );

  // Layout Panels Visibility
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isConsoleOpen, setIsConsoleOpen] = useState(false);
  const [isPreviewFullscreen, setIsPreviewFullscreen] = useState(false);
  const [isWindowMaximized, setIsWindowMaximized] = useState(false);

  // Mobile layout active tab: 'editor' | 'preview' | 'chat' | 'console'
  const [mobileActiveTab, setMobileActiveTab] = useState<'editor' | 'preview' | 'chat' | 'console'>('editor');

  // Font size state
  const [fontSize, setFontSize] = useState<number>(14);

  // Resizable split widths & heights
  const [chatWidth, setChatWidth] = useState<number>(320);
  const [editorWidthPercent, setEditorWidthPercent] = useState<number>(50); // Percent of main area
  const [consoleHeight, setConsoleHeight] = useState<number>(190);

  // Errors and Console Logs
  const [errors, setErrors] = useState<LintError[]>([]);
  const [logs, setLogs] = useState<ConsoleLog[]>([]);

  // Platform Config
  const [config, setConfig] = useState<PlatformConfig>(() => {
    const saved = localStorage.getItem('gcad_platform_config');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return {
      androidKeystore: '',
      appleDevCert: '',
      windowsSignKey: '',
      macDeveloperId: '',
      githubToken: '',
      githubRepo: '',
      vercelToken: '',
      vercelProjectId: '',
      cloudStorageKey: '',
      cloudBucket: 'gcad-user-projects',
      geminiApiKey: '',
      aiModel: 'gemini-3.8-flash',
      customApiEndpoint: '',
    };
  });

  // Quick prompt trigger from console "Fix with AI"
  const [quickPromptToTrigger, setQuickPromptToTrigger] = useState<string | null>(null);

  // Modals visibility
  const [isCompileModalOpen, setIsCompileModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);
  const [isGuideModalOpen, setIsGuideModalOpen] = useState(false);
  const [isProjectTreeModalOpen, setIsProjectTreeModalOpen] = useState(false);
  const [isCreateProjectModalOpen, setIsCreateProjectModalOpen] = useState(false);
  const [isOpenProjectModalOpen, setIsOpenProjectModalOpen] = useState(false);
  const [isOnlineProjectsModalOpen, setIsOnlineProjectsModalOpen] = useState(false);

  // Auto-Save Notification
  const [autoSaveNotification, setAutoSaveNotification] = useState<string | null>(null);

  // Resizing references
  const isDraggingHorizontal = useRef(false);
  const isDraggingVertical = useRef(false);
  const isDraggingChat = useRef(false);
  const mainSplitRef = useRef<HTMLDivElement>(null);

  // Synchronize error scanner across project files
  useEffect(() => {
    const detectedErrors = scanCodeForErrors(project.files);
    setErrors(detectedErrors);
  }, [project.files]);

  // Persist project changes to local storage
  useEffect(() => {
    localStorage.setItem('gcad_active_project', JSON.stringify(project));
  }, [project]);

  // Auto-save interval every 5 minutes (as requested)
  useEffect(() => {
    const interval = setInterval(() => {
      localStorage.setItem('gcad_active_project', JSON.stringify(project));
      setAutoSaveNotification('Auto-Saved: Project synced to local workspace');
      setTimeout(() => setAutoSaveNotification(null), 3000);
    }, 5 * 60 * 1000); // 5 minutes

    return () => clearInterval(interval);
  }, [project]);

  // Current active file object
  const activeFile = project.files.find((f) => f.id === activeFileId) || project.files[0] || null;
  const openFiles = project.files.filter((f) => openFileIds.includes(f.id));

  // Handlers for Code Editing
  const handleSelectFile = (file: CodeFile) => {
    setActiveFileId(file.id);
    if (!openFileIds.includes(file.id)) {
      setOpenFileIds((prev) => [...prev, file.id]);
    }
  };

  const handleCloseFile = (fileId: string) => {
    const nextOpen = openFileIds.filter((id) => id !== fileId);
    setOpenFileIds(nextOpen);
    if (activeFileId === fileId) {
      setActiveFileId(nextOpen[nextOpen.length - 1] || '');
    }
  };

  const handleUpdateFileContent = (fileId: string, content: string) => {
    setProject((prev) => ({
      ...prev,
      updatedAt: Date.now(),
      files: prev.files.map((f) => (f.id === fileId ? { ...f, content, isModified: true } : f)),
    }));
  };

  const handleCreateNewFile = (
    name: string,
    language: SupportedLanguage,
    folder?: string
  ) => {
    const newFile: CodeFile = {
      id: `file-${Date.now()}`,
      name,
      language,
      content: language === 'html' ? '<!DOCTYPE html>\n<html>\n<head></head>\n<body>\n  \n</body>\n</html>' : '',
      folder,
      isModified: true,
    };
    setProject((prev) => ({
      ...prev,
      updatedAt: Date.now(),
      files: [...prev.files, newFile],
    }));
    setActiveFileId(newFile.id);
    setOpenFileIds((prev) => [...prev, newFile.id]);
  };

  const handleCreateFolder = (folderPath: string) => {
    if (!project.folders.includes(folderPath)) {
      setProject((prev) => ({
        ...prev,
        folders: [...prev.folders, folderPath],
      }));
    }
  };

  const handleDeleteFile = (fileId: string) => {
    setProject((prev) => ({
      ...prev,
      files: prev.files.filter((f) => f.id !== fileId),
    }));
    handleCloseFile(fileId);
  };

  // AI Agent code updates
  const handleApplyFileUpdates = (
    updates: {
      name: string;
      content: string;
      language: SupportedLanguage;
      action: 'create' | 'update' | 'delete';
    }[]
  ) => {
    setProject((prev) => {
      let updatedFiles = [...prev.files];

      for (const update of updates) {
        if (update.action === 'delete') {
          updatedFiles = updatedFiles.filter((f) => f.name !== update.name);
        } else {
          const existingIdx = updatedFiles.findIndex((f) => f.name === update.name);
          if (existingIdx >= 0) {
            updatedFiles[existingIdx] = {
              ...updatedFiles[existingIdx],
              content: update.content,
              isModified: true,
            };
          } else {
            const newF: CodeFile = {
              id: `file-${Date.now()}-${Math.random().toString(36).substring(7)}`,
              name: update.name,
              language: update.language,
              content: update.content,
              isModified: true,
            };
            updatedFiles.push(newF);
            setOpenFileIds((o) => [...o, newF.id]);
          }
        }
      }

      return {
        ...prev,
        updatedAt: Date.now(),
        files: updatedFiles,
      };
    });

    // Capture in logs
    setLogs((prev) => [
      {
        id: `ai-log-${Date.now()}`,
        timestamp: new Date().toLocaleTimeString(),
        type: 'info',
        message: `gCAD AI Agent modified ${updates.length} file(s) in project.`,
      },
      ...prev,
    ]);
  };

  // Capture preview iframe console logs
  const handleCaptureConsoleLog = useCallback((type: 'log' | 'warn' | 'error' | 'info', message: string) => {
    setLogs((prev) => [
      {
        id: `log-${Date.now()}-${Math.random()}`,
        timestamp: new Date().toLocaleTimeString(),
        type,
        message,
      },
      ...prev.slice(0, 100), // retain latest 100 entries
    ]);
  }, []);

  // Debugger action: deep scan & open console
  const handleDebugClick = () => {
    const currentErrors = scanCodeForErrors(project.files);
    setErrors(currentErrors);
    setIsConsoleOpen(true);
    setMobileActiveTab('console');

    setLogs((prev) => [
      {
        id: `dbg-${Date.now()}`,
        timestamp: new Date().toLocaleTimeString(),
        type: currentErrors.length > 0 ? 'warn' : 'info',
        message: `Diagnostic Scan complete: ${currentErrors.length} error(s) located.`,
      },
      ...prev,
    ]);
  };

  // "Fix with AI" click from debug console
  const handleFixWithAI = (error: LintError) => {
    setIsChatOpen(true);
    setMobileActiveTab('chat');
    setQuickPromptToTrigger(
      `Please fix the error in "${error.fileName}" on line ${error.line}: "${error.message}". Code: ${error.codeSnippet || ''}`
    );
  };

  // Jump to file and select it
  const handleJumpToFile = (fileName: string, line: number) => {
    const file = project.files.find((f) => f.name === fileName);
    if (file) {
      handleSelectFile(file);
      setMobileActiveTab('editor');
    }
  };

  // Resizing mouse events
  const handleMouseDownChat = (e: React.MouseEvent) => {
    e.preventDefault();
    isDraggingChat.current = true;
    document.body.style.cursor = 'col-resize';
  };

  const handleMouseDownHorizontal = (e: React.MouseEvent) => {
    e.preventDefault();
    isDraggingHorizontal.current = true;
    document.body.style.cursor = 'col-resize';
  };

  const handleMouseDownVertical = (e: React.MouseEvent) => {
    e.preventDefault();
    isDraggingVertical.current = true;
    document.body.style.cursor = 'row-resize';
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDraggingChat.current) {
        const newWidth = Math.max(240, Math.min(e.clientX, 500));
        setChatWidth(newWidth);
      } else if (isDraggingHorizontal.current && mainSplitRef.current) {
        const rect = mainSplitRef.current.getBoundingClientRect();
        const offsetX = e.clientX - rect.left;
        const percent = Math.max(25, Math.min((offsetX / rect.width) * 100, 75));
        setEditorWidthPercent(percent);
      } else if (isDraggingVertical.current) {
        const windowHeight = window.innerHeight;
        const newHeight = Math.max(120, Math.min(windowHeight - e.clientY, 450));
        setConsoleHeight(newHeight);
      }
    };

    const handleMouseUp = () => {
      isDraggingChat.current = false;
      isDraggingHorizontal.current = false;
      isDraggingVertical.current = false;
      document.body.style.cursor = 'default';
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  return (
    <div
      className={`w-screen h-screen bg-[#344252] text-slate-100 flex flex-col overflow-hidden font-sans ${
        isWindowMaximized ? 'p-0' : 'p-1 sm:p-2'
      }`}
    >
      {/* Native desktop styled window container matching screenshot */}
      <div className="flex-1 flex flex-col bg-[#384556] rounded-2xl border border-[#4a5a6e] shadow-2xl overflow-hidden relative">
        {/* Main Header */}
        <Header
          isChatOpen={isChatOpen}
          onToggleChat={() => {
            const next = !isChatOpen;
            setIsChatOpen(next);
            if (next) setMobileActiveTab('chat');
          }}
          isConsoleOpen={isConsoleOpen}
          onToggleConsole={() => {
            const next = !isConsoleOpen;
            setIsConsoleOpen(next);
            if (next) setMobileActiveTab('console');
          }}
          errorCount={errors.length}
          onDebugClick={handleDebugClick}
          onOpenGuide={() => setIsGuideModalOpen(true)}
          onOpenConfig={() => setIsConfigModalOpen(true)}
          isWindowMaximized={isWindowMaximized}
          onToggleMaximize={() => setIsWindowMaximized(!isWindowMaximized)}
        />

        {/* Auto-Save Toast Notification */}
        {autoSaveNotification && (
          <div className="absolute top-16 right-5 z-50 bg-[#1e2733] border border-cyan-500/50 text-cyan-300 text-xs px-3.5 py-1.5 rounded-xl shadow-xl flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            <span>{autoSaveNotification}</span>
          </div>
        )}

        {/* ============================================================== */}
        {/* MOBILE VIEW (< md): Full-width vertically stacked layout       */}
        {/* Order: Chat (if enabled) on top, Code editor, Web previewer,   */}
        {/* and Debug console (if enabled) at the very bottom.             */}
        {/* ============================================================== */}
        <div className="flex md:hidden flex-col w-full h-[calc(100vh-56px)] overflow-y-auto overflow-x-hidden p-2 gap-3 pb-8 scrollbar-thin scrollbar-thumb-slate-700">
          {/* 1. Chat bot on top if enabled */}
          {isChatOpen && (
            <div className="w-full h-[360px] shrink-0">
              <AIChatBot
                files={project.files}
                activeFile={activeFile}
                onApplyFileUpdates={handleApplyFileUpdates}
                onClose={() => setIsChatOpen(false)}
                quickPromptToTrigger={quickPromptToTrigger}
                onClearQuickPrompt={() => setQuickPromptToTrigger(null)}
              />
            </div>
          )}

          {/* 2. Code Editor on top of preview (longer / taller) */}
          <div className="w-full h-[470px] shrink-0 rounded-2xl overflow-hidden border border-[#4a5a6e]">
            <CodeEditor
              project={project}
              activeFile={activeFile}
              openFiles={openFiles}
              errors={errors}
              onSelectFile={handleSelectFile}
              onCloseFile={handleCloseFile}
              onUpdateFileContent={handleUpdateFileContent}
              onCreateNewFile={handleCreateNewFile}
              onOpenCreateProject={() => setIsCreateProjectModalOpen(true)}
              onOpenProjectPicker={() => setIsOpenProjectModalOpen(true)}
              onOpenOnlineProjects={() => setIsOnlineProjectsModalOpen(true)}
              onOpenProjectTree={() => setIsProjectTreeModalOpen(true)}
              onSaveProject={() => {
                localStorage.setItem('gcad_active_project', JSON.stringify(project));
                setAutoSaveNotification('Project saved successfully.');
                setTimeout(() => setAutoSaveNotification(null), 2500);
              }}
              onSaveAsProject={() => {
                const newName = prompt('Enter new project name:', `${project.name} Copy`);
                if (newName) {
                  setProject({
                    ...project,
                    id: `proj-${Date.now()}`,
                    name: newName,
                  });
                }
              }}
              onDownloadProject={() => downloadProjectZip(project)}
              fontSize={fontSize}
              onChangeFontSize={setFontSize}
            />
          </div>

          {/* 3. Web Previewer on bottom of editor (longer / taller) */}
          <div className="w-full h-[490px] shrink-0">
            <WebPreview
              files={project.files}
              onCaptureConsoleLog={handleCaptureConsoleLog}
              isFullscreen={isPreviewFullscreen}
              onToggleFullscreen={() => setIsPreviewFullscreen(!isPreviewFullscreen)}
              onOpenCompileModal={() => setIsCompileModalOpen(true)}
              onOpenExportModal={() => setIsExportModalOpen(true)}
            />
          </div>

          {/* 4. Debug Console at bottom of all if enabled */}
          {isConsoleOpen && (
            <div className="w-full h-[270px] shrink-0 rounded-2xl overflow-hidden border border-[#4a5a6e]">
              <DebugConsole
                errors={errors}
                logs={logs}
                onClearLogs={() => setLogs([])}
                onFixWithAI={handleFixWithAI}
                onJumpToFile={handleJumpToFile}
                onCloseConsole={() => setIsConsoleOpen(false)}
              />
            </div>
          )}
        </div>

        {/* ============================================================== */}
        {/* DESKTOP VIEW (md+): Side-by-side split layout matching images */}
        {/* ============================================================== */}
        <div ref={mainSplitRef} className="hidden md:flex flex-1 overflow-hidden relative">
          {/* 1. AI Chat Bot Pane (Left side) */}
          {isChatOpen && (
            <>
              <div
                style={{ width: `${chatWidth}px` }}
                className="h-full shrink-0"
              >
                <AIChatBot
                  files={project.files}
                  activeFile={activeFile}
                  onApplyFileUpdates={handleApplyFileUpdates}
                  onClose={() => setIsChatOpen(false)}
                  quickPromptToTrigger={quickPromptToTrigger}
                  onClearQuickPrompt={() => setQuickPromptToTrigger(null)}
                />
              </div>

              {/* Chat Resizable Divider */}
              <div
                onMouseDown={handleMouseDownChat}
                className="w-1.5 hover:w-2 bg-[#2d3847] hover:bg-cyan-500/80 cursor-col-resize transition-colors duration-150 z-10"
                title="Drag to resize AI Chat pane"
              />
            </>
          )}

          {/* 2. Center / Left Section: Code Editor & Debug Console */}
          <div
            style={{
              width: !isChatOpen ? `${editorWidthPercent}%` : `${editorWidthPercent * 0.85}%`,
            }}
            className="h-full flex flex-col shrink-0 overflow-hidden"
          >
            {/* Code Editing Box */}
            <div className="flex-1 overflow-hidden min-h-[140px]">
              <CodeEditor
                project={project}
                activeFile={activeFile}
                openFiles={openFiles}
                errors={errors}
                onSelectFile={handleSelectFile}
                onCloseFile={handleCloseFile}
                onUpdateFileContent={handleUpdateFileContent}
                onCreateNewFile={handleCreateNewFile}
                onOpenCreateProject={() => setIsCreateProjectModalOpen(true)}
                onOpenProjectPicker={() => setIsOpenProjectModalOpen(true)}
                onOpenOnlineProjects={() => setIsOnlineProjectsModalOpen(true)}
                onOpenProjectTree={() => setIsProjectTreeModalOpen(true)}
                onSaveProject={() => {
                  localStorage.setItem('gcad_active_project', JSON.stringify(project));
                  setAutoSaveNotification('Project saved successfully.');
                  setTimeout(() => setAutoSaveNotification(null), 2500);
                }}
                onSaveAsProject={() => {
                  const newName = prompt('Enter new project name:', `${project.name} Copy`);
                  if (newName) {
                    setProject({
                      ...project,
                      id: `proj-${Date.now()}`,
                      name: newName,
                    });
                  }
                }}
                onDownloadProject={() => downloadProjectZip(project)}
                fontSize={fontSize}
                onChangeFontSize={setFontSize}
              />
            </div>

            {/* Debug Console Box (Bottom of Editor, opened by "Open console") */}
            {isConsoleOpen && (
              <>
                {/* Console Vertical Resizable Divider */}
                <div
                  onMouseDown={handleMouseDownVertical}
                  className="h-1.5 hover:h-2 bg-[#202934] hover:bg-cyan-500/80 cursor-row-resize transition-colors duration-150 z-10"
                  title="Drag to resize Debug Console pane"
                />

                <div
                  style={{ height: `${consoleHeight}px` }}
                  className="shrink-0 overflow-hidden"
                >
                  <DebugConsole
                    errors={errors}
                    logs={logs}
                    onClearLogs={() => setLogs([])}
                    onFixWithAI={handleFixWithAI}
                    onJumpToFile={handleJumpToFile}
                    onCloseConsole={() => setIsConsoleOpen(false)}
                  />
                </div>
              </>
            )}
          </div>

          {/* Horizontal Resizable Divider between Editor and Preview */}
          <div
            onMouseDown={handleMouseDownHorizontal}
            className="w-1.5 hover:w-2 bg-[#2d3847] hover:bg-cyan-500/80 cursor-col-resize transition-colors duration-150 z-10"
            title="Drag to resize Editor vs Preview panes"
          />

          {/* 3. Right Section: Web Preview Box */}
          <div className="flex-1 h-full min-w-[280px] overflow-hidden p-1 sm:p-2 bg-[#384556]">
            <WebPreview
              files={project.files}
              onCaptureConsoleLog={handleCaptureConsoleLog}
              isFullscreen={isPreviewFullscreen}
              onToggleFullscreen={() => setIsPreviewFullscreen(!isPreviewFullscreen)}
              onOpenCompileModal={() => setIsCompileModalOpen(true)}
              onOpenExportModal={() => setIsExportModalOpen(true)}
            />
          </div>
        </div>
      </div>

      {/* Modals */}
      <CompileModal
        isOpen={isCompileModalOpen}
        onClose={() => setIsCompileModalOpen(false)}
        project={project}
        onOpenConfig={() => setIsConfigModalOpen(true)}
      />

      <ExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        project={project}
      />

      <ConfigModal
        isOpen={isConfigModalOpen}
        onClose={() => setIsConfigModalOpen(false)}
        config={config}
        onSaveConfig={(updated) => {
          setConfig(updated);
          localStorage.setItem('gcad_platform_config', JSON.stringify(updated));
        }}
      />

      <GuideModal
        isOpen={isGuideModalOpen}
        onClose={() => setIsGuideModalOpen(false)}
      />

      <ProjectTreeModal
        isOpen={isProjectTreeModalOpen}
        onClose={() => setIsProjectTreeModalOpen(false)}
        project={project}
        activeFile={activeFile}
        onOpenFile={handleSelectFile}
        onCreateFile={handleCreateNewFile}
        onCreateFolder={handleCreateFolder}
        onDeleteFile={handleDeleteFile}
      />

      <CreateProjectModal
        isOpen={isCreateProjectModalOpen}
        onClose={() => setIsCreateProjectModalOpen(false)}
        onCreateProject={(name, desc, templateId) => {
          let chosenTemplate = SAMPLE_PROJECT_TEMPLATES[0];
          if (templateId === 'game') chosenTemplate = SAMPLE_PROJECT_TEMPLATES[1];
          else if (templateId === 'dashboard') chosenTemplate = SAMPLE_PROJECT_TEMPLATES[2];

          const newProj: Project = {
            id: `proj-${Date.now()}`,
            name,
            description: desc,
            createdAt: Date.now(),
            updatedAt: Date.now(),
            folders: ['src', 'assets'],
            files: chosenTemplate.files.map((f, i) => ({
              ...f,
              id: `file-${Date.now()}-${i}`,
            })),
          };
          setProject(newProj);
          setActiveFileId(newProj.files[0]?.id || '');
          setOpenFileIds(newProj.files.map((f) => f.id));
        }}
      />

      <OpenProjectModal
        isOpen={isOpenProjectModalOpen}
        onClose={() => setIsOpenProjectModalOpen(false)}
        currentProject={project}
        onSelectProject={(newProj) => {
          setProject(newProj);
          setActiveFileId(newProj.files[0]?.id || '');
          setOpenFileIds(newProj.files.map((f) => f.id));
        }}
      />

      <OnlineProjectsModal
        isOpen={isOnlineProjectsModalOpen}
        onClose={() => setIsOnlineProjectsModalOpen(false)}
        onImportProject={(importedProj) => {
          setProject(importedProj);
          setActiveFileId(importedProj.files[0]?.id || '');
          setOpenFileIds(importedProj.files.map((f) => f.id));
        }}
      />
    </div>
  );
}
