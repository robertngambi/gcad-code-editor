import React, { useState } from 'react';
import {
  X,
  FolderPlus,
  Layout,
  Gamepad2,
  BarChart3,
  FileCode,
  HardDrive,
} from 'lucide-react';
import { Project } from '../../types/editor';
import { SAMPLE_PROJECT_TEMPLATES } from '../../utils/defaultProjects';

interface CreateProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateProject: (name: string, description: string, templateId?: string) => void;
}

export const CreateProjectModal: React.FC<CreateProjectModalProps> = ({
  isOpen,
  onClose,
  onCreateProject,
}) => {
  const [projectName, setProjectName] = useState('My Next Big Website');
  const [projectDesc, setProjectDesc] = useState('An innovative responsive web application');
  const [saveLocation, setSaveLocation] = useState('C:/Users/Projects/gCAD/');
  const [selectedTemplate, setSelectedTemplate] = useState('blank');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectName.trim()) return;
    onCreateProject(projectName.trim(), projectDesc.trim(), selectedTemplate);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4 select-none">
      <div className="bg-[#242f3d] border border-[#3f5064] rounded-2xl w-full max-w-lg max-h-[92vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 text-white">
        {/* Header */}
        <div className="h-14 bg-[#1e2733] border-b border-[#3b4b5e] px-5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center">
              <FolderPlus className="w-4 h-4 text-cyan-400" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">Create New Project Folder</h2>
              <p className="text-[11px] text-slate-400">
                Initialize project directory on local storage / PC workspace
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

        {/* Form Body */}
        <form
          onSubmit={handleSubmit}
          className="flex-1 overflow-y-auto p-5 space-y-4 text-xs scrollbar-thin scrollbar-thumb-slate-700"
        >
          {/* Project Name */}
          <div>
            <label className="block text-slate-300 font-semibold mb-1">
              Project Name (Folder Name):
            </label>
            <input
              type="text"
              required
              autoFocus
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              placeholder="e.g. My Portfolio Website"
              className="w-full bg-[#121922] border border-slate-700 rounded-lg p-2.5 text-white font-medium focus:outline-none focus:border-cyan-400 text-xs"
            />
          </div>

          {/* PC File Location */}
          <div className="bg-[#1b232e] p-3 rounded-xl border border-slate-700">
            <label className="block text-slate-300 font-semibold mb-1 flex items-center gap-1.5">
              <HardDrive className="w-3.5 h-3.5 text-amber-400" />
              <span>PC Workspace Save Directory:</span>
            </label>
            <input
              type="text"
              value={saveLocation}
              onChange={(e) => setSaveLocation(e.target.value)}
              className="w-full bg-[#121922] border border-slate-700 rounded-lg p-2 text-slate-300 font-mono text-[11px] focus:outline-none focus:border-amber-400"
            />
            <p className="text-[10px] text-slate-400 mt-1">
              Confirmed on PC file storage: <code>{saveLocation}{projectName.toLowerCase().replace(/\s+/g, '-')}</code>
            </p>
          </div>

          {/* Starter Template Selection */}
          <div>
            <label className="block text-slate-300 font-semibold mb-2">
              Choose Starter Architecture:
            </label>
            <div className="grid grid-cols-2 gap-2">
              <div
                onClick={() => setSelectedTemplate('blank')}
                className={`p-3 rounded-xl border cursor-pointer transition ${
                  selectedTemplate === 'blank'
                    ? 'bg-cyan-950/60 border-cyan-500 text-white shadow-sm'
                    : 'bg-[#1b232e] border-slate-700 text-slate-400 hover:text-slate-200'
                }`}
              >
                <div className="flex items-center gap-2 font-bold mb-1">
                  <FileCode className="w-4 h-4 text-cyan-400" />
                  <span>Standard Web</span>
                </div>
                <p className="text-[10px] leading-tight">HTML5, CSS, and modern JS boilerplate</p>
              </div>

              <div
                onClick={() => setSelectedTemplate('game')}
                className={`p-3 rounded-xl border cursor-pointer transition ${
                  selectedTemplate === 'game'
                    ? 'bg-cyan-950/60 border-cyan-500 text-white shadow-sm'
                    : 'bg-[#1b232e] border-slate-700 text-slate-400 hover:text-slate-200'
                }`}
              >
                <div className="flex items-center gap-2 font-bold mb-1">
                  <Gamepad2 className="w-4 h-4 text-emerald-400" />
                  <span>2D Arcade Game</span>
                </div>
                <p className="text-[10px] leading-tight">Canvas 60fps loop with keyboard controls</p>
              </div>

              <div
                onClick={() => setSelectedTemplate('dashboard')}
                className={`p-3 rounded-xl border cursor-pointer transition ${
                  selectedTemplate === 'dashboard'
                    ? 'bg-cyan-950/60 border-cyan-500 text-white shadow-sm'
                    : 'bg-[#1b232e] border-slate-700 text-slate-400 hover:text-slate-200'
                }`}
              >
                <div className="flex items-center gap-2 font-bold mb-1">
                  <BarChart3 className="w-4 h-4 text-purple-400" />
                  <span>SaaS Dashboard</span>
                </div>
                <p className="text-[10px] leading-tight">Tailwind metrics cards & dark layout</p>
              </div>

              <div
                onClick={() => setSelectedTemplate('portfolio')}
                className={`p-3 rounded-xl border cursor-pointer transition ${
                  selectedTemplate === 'portfolio'
                    ? 'bg-cyan-950/60 border-cyan-500 text-white shadow-sm'
                    : 'bg-[#1b232e] border-slate-700 text-slate-400 hover:text-slate-200'
                }`}
              >
                <div className="flex items-center gap-2 font-bold mb-1">
                  <Layout className="w-4 h-4 text-amber-400" />
                  <span>Landing Page</span>
                </div>
                <p className="text-[10px] leading-tight">Hero section with logo slot and CTA</p>
              </div>
            </div>
          </div>

          {/* Footer buttons */}
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-700/60 hover:bg-slate-700 text-slate-300 text-xs"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!projectName.trim()}
              className="px-5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 font-bold text-white text-xs shadow-md transition active:scale-95 disabled:opacity-50"
            >
              Create Project
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
