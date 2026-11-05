import React, { useState } from 'react';
import {
  X,
  Smartphone,
  Monitor,
  PackageCheck,
  Check,
  FileArchive,
  Layers,
  Loader2,
  Settings,
} from 'lucide-react';
import { Project } from '../../types/editor';
import { downloadBuildOutputsZip } from '../../utils/zipExport';

interface CompileModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: Project;
  onOpenConfig?: () => void;
}

export const CompileModal: React.FC<CompileModalProps> = ({
  isOpen,
  onClose,
  project,
  onOpenConfig,
}) => {
  const [activeTab, setActiveTab] = useState<'mobile' | 'desktop'>('mobile');

  // Mobile output selections
  const [mobileOutputs, setMobileOutputs] = useState({
    apk: true,
    aab: false,
    ipa: false,
  });

  // Desktop output selections
  const [desktopOutputs, setDesktopOutputs] = useState({
    windowsExe: true,
    windowsMsi: false,
    macAppImage: false,
    linuxDeb: false,
  });

  // Build state
  const [isBuilding, setIsBuilding] = useState(false);
  const [buildLogs, setBuildLogs] = useState<string[]>([]);
  const [buildSuccess, setBuildSuccess] = useState(false);

  if (!isOpen) return null;

  const handleStartBuildOutputs = async () => {
    setIsBuilding(true);
    setBuildSuccess(false);
    setBuildLogs([
      'Starting gCAD Universal Compiler v3.4...',
      `Bundling source files for project: "${project.name}"...`,
    ]);

    await new Promise((r) => setTimeout(r, 600));
    setBuildLogs((prev) => [...prev, 'Optimizing HTML/CSS/JS assets...']);

    if (activeTab === 'mobile' || Object.values(mobileOutputs).some(Boolean)) {
      await new Promise((r) => setTimeout(r, 600));
      setBuildLogs((prev) => [
        ...prev,
        'Generating mobile targets: ' +
          Object.entries(mobileOutputs)
            .filter(([_, v]) => v)
            .map(([k]) => k.toUpperCase())
            .join(', '),
      ]);
    }

    if (activeTab === 'desktop' || Object.values(desktopOutputs).some(Boolean)) {
      await new Promise((r) => setTimeout(r, 600));
      setBuildLogs((prev) => [
        ...prev,
        'Generating desktop native binaries: ' +
          Object.entries(desktopOutputs)
            .filter(([_, v]) => v)
            .map(([k]) => k)
            .join(', '),
      ]);
    }

    await new Promise((r) => setTimeout(r, 700));
    setBuildLogs((prev) => [
      ...prev,
      'Compiling all output files into zipped folder "Build output files"...',
    ]);

    // Download actual ZIP archive
    await downloadBuildOutputsZip(project, mobileOutputs, desktopOutputs);

    setBuildLogs((prev) => [
      ...prev,
      'Build outputs generated and saved successfully into "Build output files.zip"!',
    ]);
    setIsBuilding(false);
    setBuildSuccess(true);
  };

  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4 select-none">
      <div className="bg-[#242f3d] border border-[#3f5064] rounded-2xl w-full max-w-2xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 text-white">
        {/* Header */}
        <div className="h-14 bg-[#1e2733] border-b border-[#3b4b5e] px-5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-cyan-500 to-emerald-500 flex items-center justify-center">
              <Layers className="w-4 h-4 text-slate-950 font-bold" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">Compile Output Packages</h2>
              <p className="text-[11px] text-slate-400">
                Select target package formats for mobile and desktop outputs
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

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5 text-xs scrollbar-thin scrollbar-thumb-slate-700">
          {/* Target Tabs: Mobile Outputs vs Desktop Outputs */}
          <div className="flex items-center gap-2 border-b border-slate-700/60 pb-3">
            <button
              onClick={() => setActiveTab('mobile')}
              className={`flex-1 py-2.5 px-4 rounded-xl border flex items-center justify-center gap-2 font-semibold transition ${
                activeTab === 'mobile'
                  ? 'bg-cyan-950/60 text-cyan-300 border-cyan-500/80 shadow-md'
                  : 'bg-[#1a232e] text-slate-400 border-slate-700 hover:text-slate-200'
              }`}
            >
              <Smartphone className="w-4 h-4" />
              <span>Mobile Outputs</span>
            </button>
            <button
              onClick={() => setActiveTab('desktop')}
              className={`flex-1 py-2.5 px-4 rounded-xl border flex items-center justify-center gap-2 font-semibold transition ${
                activeTab === 'desktop'
                  ? 'bg-emerald-950/60 text-emerald-300 border-emerald-500/80 shadow-md'
                  : 'bg-[#1a232e] text-slate-400 border-slate-700 hover:text-slate-200'
              }`}
            >
              <Monitor className="w-4 h-4" />
              <span>Desktop Outputs</span>
            </button>
          </div>

          {/* Mobile Output Selection */}
          {activeTab === 'mobile' && (
            <div className="space-y-4 animate-in fade-in">
              <div className="bg-[#1b232e] p-3.5 rounded-xl border border-slate-700">
                <h4 className="font-semibold text-slate-200 mb-2.5 flex items-center gap-2">
                  <Smartphone className="w-4 h-4 text-cyan-400" />
                  Select Mobile Formats
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  <label className="flex items-center gap-2.5 p-2.5 rounded-lg bg-[#242f3d] border border-slate-600 hover:border-cyan-400 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={mobileOutputs.apk}
                      onChange={(e) =>
                        setMobileOutputs({ ...mobileOutputs, apk: e.target.checked })
                      }
                      className="accent-cyan-400 w-4 h-4 rounded"
                    />
                    <div>
                      <p className="font-bold text-white">APK File Output</p>
                      <p className="text-[10px] text-slate-400">Standard Android package</p>
                    </div>
                  </label>

                  <label className="flex items-center gap-2.5 p-2.5 rounded-lg bg-[#242f3d] border border-slate-600 hover:border-cyan-400 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={mobileOutputs.aab}
                      onChange={(e) =>
                        setMobileOutputs({ ...mobileOutputs, aab: e.target.checked })
                      }
                      className="accent-cyan-400 w-4 h-4 rounded"
                    />
                    <div>
                      <p className="font-bold text-white">AAB File Output</p>
                      <p className="text-[10px] text-slate-400">Google Play App Bundle</p>
                    </div>
                  </label>

                  <label className="flex items-center gap-2.5 p-2.5 rounded-lg bg-[#242f3d] border border-slate-600 hover:border-cyan-400 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={mobileOutputs.ipa}
                      onChange={(e) =>
                        setMobileOutputs({ ...mobileOutputs, ipa: e.target.checked })
                      }
                      className="accent-cyan-400 w-4 h-4 rounded"
                    />
                    <div>
                      <p className="font-bold text-white">IPA File Output</p>
                      <p className="text-[10px] text-slate-400">iOS Apple App archive</p>
                    </div>
                  </label>
                </div>
              </div>

              {/* Sub-actions for mobile settings */}
              <div className="flex items-center justify-between p-3 bg-[#17202b] rounded-xl border border-slate-800">
                <span className="text-[11px] text-slate-400">
                  Android & iOS signing keys are configured centrally in Configurations.
                </span>
                {onOpenConfig && (
                  <button
                    onClick={() => {
                      onClose();
                      onOpenConfig();
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 text-xs transition"
                  >
                    <Settings className="w-3.5 h-3.5" />
                    <span>Open Configurations</span>
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Desktop Output Selection */}
          {activeTab === 'desktop' && (
            <div className="space-y-4 animate-in fade-in">
              <div className="bg-[#1b232e] p-3.5 rounded-xl border border-slate-700">
                <h4 className="font-semibold text-slate-200 mb-2.5 flex items-center gap-2">
                  <Monitor className="w-4 h-4 text-emerald-400" />
                  Select Desktop Formats
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <label className="flex items-center gap-2.5 p-2.5 rounded-lg bg-[#242f3d] border border-slate-600 hover:border-emerald-400 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={desktopOutputs.windowsExe}
                      onChange={(e) =>
                        setDesktopOutputs({ ...desktopOutputs, windowsExe: e.target.checked })
                      }
                      className="accent-emerald-400 w-4 h-4 rounded"
                    />
                    <div>
                      <p className="font-bold text-white">Windows .exe Output File</p>
                      <p className="text-[10px] text-slate-400">Portable standalone executable</p>
                    </div>
                  </label>

                  <label className="flex items-center gap-2.5 p-2.5 rounded-lg bg-[#242f3d] border border-slate-600 hover:border-emerald-400 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={desktopOutputs.windowsMsi}
                      onChange={(e) =>
                        setDesktopOutputs({ ...desktopOutputs, windowsMsi: e.target.checked })
                      }
                      className="accent-emerald-400 w-4 h-4 rounded"
                    />
                    <div>
                      <p className="font-bold text-white">Windows .MSI Output File</p>
                      <p className="text-[10px] text-slate-400">Standard Windows MSI installer</p>
                    </div>
                  </label>

                  <label className="flex items-center gap-2.5 p-2.5 rounded-lg bg-[#242f3d] border border-slate-600 hover:border-emerald-400 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={desktopOutputs.macAppImage}
                      onChange={(e) =>
                        setDesktopOutputs({ ...desktopOutputs, macAppImage: e.target.checked })
                      }
                      className="accent-emerald-400 w-4 h-4 rounded"
                    />
                    <div>
                      <p className="font-bold text-white">macOS .AppImage / DMG File</p>
                      <p className="text-[10px] text-slate-400">Universal Mac/Linux application</p>
                    </div>
                  </label>

                  <label className="flex items-center gap-2.5 p-2.5 rounded-lg bg-[#242f3d] border border-slate-600 hover:border-emerald-400 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={desktopOutputs.linuxDeb}
                      onChange={(e) =>
                        setDesktopOutputs({ ...desktopOutputs, linuxDeb: e.target.checked })
                      }
                      className="accent-emerald-400 w-4 h-4 rounded"
                    />
                    <div>
                      <p className="font-bold text-white">Linux .deb Output File</p>
                      <p className="text-[10px] text-slate-400">Debian/Ubuntu package</p>
                    </div>
                  </label>
                </div>
              </div>

              {/* Sub-actions for desktop settings */}
              <div className="flex items-center justify-between p-3 bg-[#17202b] rounded-xl border border-slate-800">
                <span className="text-[11px] text-slate-400">
                  Windows SignTool and Mac CodeSign keys are managed in Configurations.
                </span>
                {onOpenConfig && (
                  <button
                    onClick={() => {
                      onClose();
                      onOpenConfig();
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-emerald-300 text-xs transition"
                  >
                    <Settings className="w-3.5 h-3.5" />
                    <span>Open Configurations</span>
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Build Output Logs */}
          {buildLogs.length > 0 && (
            <div className="bg-[#141b24] p-3 rounded-xl border border-slate-800 font-mono text-[11px] space-y-1">
              <div className="text-slate-400 text-[10px] uppercase font-bold mb-1">
                Build Compiler Console
              </div>
              {buildLogs.map((log, idx) => (
                <div key={idx} className="text-emerald-400 flex items-center gap-1.5">
                  <span className="text-slate-600">&gt;</span>
                  <span>{log}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Modal Footer with "Start Build outputs" button */}
        <div className="h-16 bg-[#1e2733] border-t border-[#3b4b5e] px-5 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-700/60 hover:bg-slate-700 text-slate-300 hover:text-white transition font-medium text-xs"
          >
            Cancel
          </button>

          {/* "Start Build outputs" button */}
          <button
            onClick={handleStartBuildOutputs}
            disabled={isBuilding}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-emerald-600 hover:from-cyan-500 hover:to-emerald-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-cyan-950/50 transition active:scale-95 disabled:opacity-50"
          >
            {isBuilding ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Compiling Outputs...</span>
              </>
            ) : buildSuccess ? (
              <>
                <FileArchive className="w-4 h-4" />
                <span>Re-download Build Outputs</span>
              </>
            ) : (
              <>
                <PackageCheck className="w-4 h-4" />
                <span>Start Build outputs</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
