import React, { useState } from 'react';
import {
  X,
  Folder,
  FolderPlus,
  FileCode,
  Plus,
  Trash2,
  FileText,
  ChevronRight,
  FolderOpen,
} from 'lucide-react';
import { CodeFile, Project, SupportedLanguage } from '../../types/editor';

interface ProjectTreeModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: Project;
  activeFile: CodeFile | null;
  onOpenFile: (file: CodeFile) => void;
  onCreateFile: (name: string, language: SupportedLanguage, folder?: string) => void;
  onCreateFolder: (folderPath: string) => void;
  onDeleteFile: (fileId: string) => void;
}

export const ProjectTreeModal: React.FC<ProjectTreeModalProps> = ({
  isOpen,
  onClose,
  project,
  activeFile,
  onOpenFile,
  onCreateFile,
  onCreateFolder,
  onDeleteFile,
}) => {
  const [newFolderName, setNewFolderName] = useState('');
  const [selectedFolder, setSelectedFolder] = useState<string>('');
  const [isCreatingFolder, setIsCreatingFolder] = useState(false);
  const [isCreatingFile, setIsCreatingFile] = useState(false);
  const [newFileName, setNewFileName] = useState('');

  if (!isOpen) return null;

  const handleCreateFolder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFolderName.trim()) return;

    const fullPath = selectedFolder
      ? `${selectedFolder}/${newFolderName.trim()}`
      : newFolderName.trim();

    onCreateFolder(fullPath);
    setNewFolderName('');
    setIsCreatingFolder(false);
  };

  const handleCreateFile = (e: React.FormEvent) => {
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

    onCreateFile(newFileName.trim(), lang, selectedFolder || undefined);
    setNewFileName('');
    setIsCreatingFile(false);
  };

  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4 select-none">
      <div className="bg-[#242f3d] border border-[#3f5064] rounded-2xl w-full max-w-xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 text-white">
        {/* Header */}
        <div className="h-14 bg-[#1e2733] border-b border-[#3b4b5e] px-5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center">
              <FolderOpen className="w-4 h-4 text-cyan-400" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white truncate max-w-[280px]">
                {project.name}
              </h2>
              <p className="text-[11px] text-slate-400">
                Project Folder Tree & Code Files Explorer
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsCreatingFolder(true)}
              title="Create new folder"
              className="px-2.5 py-1 rounded-lg bg-[#2e3b4b] hover:bg-slate-700 text-xs text-slate-200 border border-slate-600 flex items-center gap-1 transition"
            >
              <FolderPlus className="w-3.5 h-3.5 text-amber-400" />
              <span>+ Folder</span>
            </button>

            <button
              onClick={() => setIsCreatingFile(true)}
              title="Create new file"
              className="px-2.5 py-1 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-xs font-semibold text-white flex items-center gap-1 transition shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ File</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700/60 transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 text-xs scrollbar-thin scrollbar-thumb-slate-700">
          {/* Create Folder Inline Form */}
          {isCreatingFolder && (
            <form
              onSubmit={handleCreateFolder}
              className="p-3 bg-[#1b232e] rounded-xl border border-amber-500/40 space-y-2 animate-in fade-in"
            >
              <p className="font-semibold text-amber-300 text-[11px]">
                Create Folder {selectedFolder ? `inside "${selectedFolder}"` : 'in Root'}
              </p>
              <div className="flex gap-2">
                <input
                  type="text"
                  autoFocus
                  placeholder="e.g. components, assets/images"
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                  className="flex-1 bg-[#121922] border border-slate-700 rounded-lg px-2.5 py-1.5 text-white text-xs focus:outline-none focus:border-amber-400"
                />
                <button
                  type="button"
                  onClick={() => setIsCreatingFolder(false)}
                  className="px-3 py-1.5 rounded-lg bg-slate-700 text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!newFolderName.trim()}
                  className="px-4 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 font-semibold text-white disabled:opacity-50"
                >
                  Create
                </button>
              </div>
            </form>
          )}

          {/* Create File Inline Form */}
          {isCreatingFile && (
            <form
              onSubmit={handleCreateFile}
              className="p-3 bg-[#1b232e] rounded-xl border border-cyan-500/40 space-y-2 animate-in fade-in"
            >
              <p className="font-semibold text-cyan-300 text-[11px]">
                Create File {selectedFolder ? `inside "${selectedFolder}"` : 'in Root'}
              </p>
              <div className="flex gap-2">
                <input
                  type="text"
                  autoFocus
                  placeholder="e.g. app.js, layout.css, data.json"
                  value={newFileName}
                  onChange={(e) => setNewFileName(e.target.value)}
                  className="flex-1 bg-[#121922] border border-slate-700 rounded-lg px-2.5 py-1.5 text-white text-xs focus:outline-none focus:border-cyan-400"
                />
                <button
                  type="button"
                  onClick={() => setIsCreatingFile(false)}
                  className="px-3 py-1.5 rounded-lg bg-slate-700 text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!newFileName.trim()}
                  className="px-4 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 font-semibold text-white disabled:opacity-50"
                >
                  Create
                </button>
              </div>
            </form>
          )}

          {/* Folder List */}
          <div className="space-y-1">
            <div
              onClick={() => setSelectedFolder('')}
              className={`p-2 rounded-lg flex items-center justify-between cursor-pointer transition ${
                selectedFolder === '' ? 'bg-[#313e4f] text-cyan-300' : 'hover:bg-[#2c3848] text-slate-300'
              }`}
            >
              <div className="flex items-center gap-2">
                <Folder className="w-4 h-4 text-amber-400" />
                <span className="font-bold">Project Root</span>
              </div>
              <span className="text-[10px] text-slate-400">
                {project.files.filter((f) => !f.folder).length} files
              </span>
            </div>

            {project.folders.map((folderPath) => (
              <div
                key={folderPath}
                onClick={() => setSelectedFolder(folderPath)}
                className={`p-2 pl-6 rounded-lg flex items-center justify-between cursor-pointer transition ${
                  selectedFolder === folderPath
                    ? 'bg-[#313e4f] text-cyan-300'
                    : 'hover:bg-[#2c3848] text-slate-300'
                }`}
              >
                <div className="flex items-center gap-2">
                  <ChevronRight className="w-3 h-3 text-slate-500" />
                  <Folder className="w-3.5 h-3.5 text-amber-300" />
                  <span className="font-mono">{folderPath}</span>
                </div>
                <span className="text-[10px] text-slate-400">
                  {project.files.filter((f) => f.folder === folderPath).length} files
                </span>
              </div>
            ))}
          </div>

          {/* Files List */}
          <div className="pt-2 border-t border-slate-700/60">
            <div className="text-[10px] uppercase font-bold text-slate-400 mb-2">
              Code Files ({project.files.length})
            </div>
            <div className="space-y-1">
              {project.files.map((file) => (
                <div
                  key={file.id}
                  className={`p-2 rounded-lg flex items-center justify-between group transition ${
                    activeFile?.id === file.id
                      ? 'bg-cyan-950/60 text-cyan-200 border border-cyan-500/40'
                      : 'bg-[#1b232e] hover:bg-[#222c3a] text-slate-200 border border-transparent'
                  }`}
                >
                  <div
                    onClick={() => {
                      onOpenFile(file);
                      onClose();
                    }}
                    className="flex items-center gap-2.5 flex-1 cursor-pointer"
                  >
                    <FileCode className="w-4 h-4 text-cyan-400" />
                    <div>
                      <p className="font-semibold text-xs">{file.name}</p>
                      <p className="text-[10px] text-slate-400 font-mono">
                        {file.folder ? `${file.folder}/` : ''}
                        {file.content.split('\n').length} lines
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        onOpenFile(file);
                        onClose();
                      }}
                      className="px-2.5 py-1 rounded bg-slate-700 hover:bg-cyan-600 text-[11px] text-white transition"
                    >
                      Open
                    </button>
                    {project.files.length > 1 && (
                      <button
                        onClick={() => onDeleteFile(file.id)}
                        title="Delete file"
                        className="p-1 text-slate-400 hover:text-rose-400 rounded transition opacity-0 group-hover:opacity-100"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="h-14 bg-[#1e2733] border-t border-[#3b4b5e] px-5 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-700/60 hover:bg-slate-700 text-slate-300 text-xs"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
