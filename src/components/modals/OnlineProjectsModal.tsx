import React, { useState } from 'react';
import {
  X,
  Globe,
  Search,
  Star,
  Download,
  ExternalLink,
  Code2,
} from 'lucide-react';
import { ONLINE_STARTER_PROJECTS, SAMPLE_PROJECT_TEMPLATES } from '../../utils/defaultProjects';
import { Project } from '../../types/editor';

interface OnlineProjectsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportProject: (project: Project) => void;
}

export const OnlineProjectsModal: React.FC<OnlineProjectsModalProps> = ({
  isOpen,
  onClose,
  onImportProject,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  if (!isOpen) return null;

  const filteredProjects = ONLINE_STARTER_PROJECTS.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat =
      selectedCategory === 'all' ||
      p.category.toLowerCase().includes(selectedCategory.toLowerCase());
    return matchesSearch && matchesCat;
  });

  const handleSelectOnlineProject = (onlineItem: (typeof ONLINE_STARTER_PROJECTS)[0]) => {
    // Convert to a rich Project instance
    let template = SAMPLE_PROJECT_TEMPLATES.find((t) =>
      onlineItem.name.toLowerCase().includes('game')
        ? t.id === 'retro-canvas-game'
        : t.id === 'saas-dashboard'
    );
    if (!template) template = SAMPLE_PROJECT_TEMPLATES[1];

    const importedProject: Project = {
      id: `online-${Date.now()}`,
      name: onlineItem.name,
      description: onlineItem.description,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      folders: ['src', 'assets'],
      files: template.files.map((f, i) => ({
        ...f,
        id: `file-${Date.now()}-${i}`,
      })),
    };

    onImportProject(importedProject);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4 select-none">
      <div className="bg-[#242f3d] border border-[#3f5064] rounded-2xl w-full max-w-2xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 text-white">
        {/* Header */}
        <div className="h-14 bg-[#1e2733] border-b border-[#3b4b5e] px-5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center">
              <Globe className="w-4 h-4 text-emerald-400" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">Open Online Cloud Projects</h2>
              <p className="text-[11px] text-slate-400">
                Explore, search, and import verified cloud project repositories
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

        {/* Search & Filters */}
        <div className="p-4 bg-[#1b232e] border-b border-slate-700 space-y-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search cloud starters, templates, games, dashboards..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#121922] border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-cyan-400"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto text-xs">
            {['all', 'Landing Page', 'Three.js / Canvas', 'Productivity App', 'Audio / Media'].map(
              (cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1 rounded-full capitalize whitespace-nowrap transition ${
                    selectedCategory === cat
                      ? 'bg-cyan-600 text-white font-semibold'
                      : 'bg-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  {cat}
                </button>
              )
            )}
          </div>
        </div>

        {/* Project Cards Grid */}
        <div className="flex-1 overflow-y-auto p-4 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs scrollbar-thin scrollbar-thumb-slate-700">
          {filteredProjects.map((item) => (
            <div
              key={item.id}
              className="bg-[#1b232e] border border-slate-700 hover:border-cyan-400/60 rounded-xl p-3.5 flex flex-col justify-between transition group shadow-sm hover:shadow-cyan-950/40"
            >
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] uppercase font-bold text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-800/60">
                    {item.category}
                  </span>
                  <div className="flex items-center gap-1 text-amber-400 text-[11px] font-semibold">
                    <Star className="w-3 h-3 fill-amber-400" />
                    <span>{item.stars}</span>
                  </div>
                </div>

                <h3 className="font-bold text-white text-sm mb-1 group-hover:text-cyan-300 transition">
                  {item.name}
                </h3>
                <p className="text-slate-400 text-xs line-clamp-2 mb-3 leading-relaxed">
                  {item.description}
                </p>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-[11px] text-slate-500">
                <span>by @{item.author}</span>
                <button
                  onClick={() => handleSelectOnlineProject(item)}
                  className="px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 font-bold text-white flex items-center gap-1 transition shadow-sm active:scale-95"
                >
                  <Download className="w-3 h-3" />
                  <span>Import Project</span>
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="h-14 bg-[#1e2733] border-t border-[#3b4b5e] px-5 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-700/60 hover:bg-slate-700 text-slate-300 text-xs"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
