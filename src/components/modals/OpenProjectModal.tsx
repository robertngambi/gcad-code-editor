import React, { useRef, useState } from 'react';
import {
  X,
  FolderOpen,
  Folder,
  FileCode,
  Upload,
  CheckCircle2,
  HardDrive,
} from 'lucide-react';
import { Project } from '../../types/editor';
import { SAMPLE_PROJECT_TEMPLATES } from '../../utils/defaultProjects';

interface OpenProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentProject: Project;
  onSelectProject: (project: Project) => void;
}

export const OpenProjectModal: React.FC<OpenProjectModalProps> = ({
  isOpen,
  onClose,
  currentProject,
  onSelectProject,
}) => {
  const [selectedProjectId, setSelectedProjectId] = useState<string>(currentProject.id);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleConfirm = () => {
    const found = SAMPLE_PROJECT_TEMPLATES.find((p) => p.id === selectedProjectId);
    if (found) {
      onSelectProject(found);
    }
    onClose();
  };

  const handleZipUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Simulate opening from PC file directory
    const newProj: Project = {
      id: `imported-${Date.now()}`,
      name: file.name.replace(/\.[^/.]+$/, ''),
      description: 'Project imported from PC disk directory',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      folders: ['src', 'assets'],
      files: [
        {
          id: 'imp-1',
          name: 'index.html',
          language: 'html',
          content: `<!DOCTYPE html>\n<html>\n<head><title>${file.name}</title></head>\n<body>\n  <h1>Project Imported from PC</h1>\n  <p>Location: ${file.name}</p>\n</body>\n</html>`,
        },
        {
          id: 'imp-2',
          name: 'style.css',
          language: 'css',
          content: 'body { font-family: sans-serif; padding: 2rem; background: #0f172a; color: white; }',
        },
      ],
    };
    onSelectProject(newProj);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4 select-none">
      <div className="bg-[#242f3d] border border-[#3f5064] rounded-2xl w-full max-w-lg max-h-[85vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 text-white">
        {/* Header */}
        <div className="h-14 bg-[#1e2733] border-b border-[#3b4b5e] px-5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center">
              <FolderOpen className="w-4 h-4 text-amber-400" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">Open Existing Project</h2>
              <p className="text-[11px] text-slate-400">
                Browse PC workspace folders or import existing code directories
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
        <div className="flex-1 overflow-y-auto p-4 space-y-3 text-xs scrollbar-thin scrollbar-thumb-slate-700">
          <div className="flex items-center justify-between bg-[#1b232e] p-3 rounded-xl border border-slate-700">
            <div className="flex items-center gap-2">
              <HardDrive className="w-4 h-4 text-cyan-400" />
              <div>
                <p className="font-semibold text-white">PC Directory Import</p>
                <p className="text-[10px] text-slate-400">Select folder or project archive (.zip)</p>
              </div>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept=".zip,.json"
              onChange={handleZipUpload}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 font-bold text-white flex items-center gap-1.5 transition shadow-sm active:scale-95"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Browse PC...</span>
            </button>
          </div>

          <div className="text-[10px] uppercase font-bold text-slate-400 pt-2">
            Available Local Projects
          </div>

          <div className="space-y-2">
            {SAMPLE_PROJECT_TEMPLATES.map((proj) => {
              const isSelected = selectedProjectId === proj.id;
              return (
                <div
                  key={proj.id}
                  onClick={() => setSelectedProjectId(proj.id)}
                  className={`p-3 rounded-xl border cursor-pointer transition flex items-center justify-between ${
                    isSelected
                      ? 'bg-amber-950/40 border-amber-500/80 text-white shadow-md'
                      : 'bg-[#1b232e] border-slate-700 text-slate-300 hover:border-slate-500'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Folder className={`w-5 h-5 ${isSelected ? 'text-amber-400' : 'text-slate-400'}`} />
                    <div>
                      <p className="font-bold text-white text-xs">{proj.name}</p>
                      <p className="text-[10px] text-slate-400">
                        {proj.files.length} code files • {proj.description}
                      </p>
                    </div>
                  </div>

                  {isSelected && (
                    <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="h-14 bg-[#1e2733] border-t border-[#3b4b5e] px-5 flex items-center justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-700/60 hover:bg-slate-700 text-slate-300 text-xs"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 font-bold text-white text-xs shadow-md transition active:scale-95"
          >
            Open Project
          </button>
        </div>
      </div>
    </div>
  );
};
