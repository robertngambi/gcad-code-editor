import React, { useState } from 'react';
import {
  X,
  Settings,
  Smartphone,
  Monitor,
  Globe,
  Bot,
  Key,
  ShieldCheck,
  Check,
  HelpCircle,
  Save,
  CheckCircle2,
} from 'lucide-react';
import { PlatformConfig } from '../../types/editor';

interface ConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: PlatformConfig;
  onSaveConfig: (updated: PlatformConfig) => void;
}

export const ConfigModal: React.FC<ConfigModalProps> = ({
  isOpen,
  onClose,
  config,
  onSaveConfig,
}) => {
  const [formData, setFormData] = useState<PlatformConfig>({ ...config });
  const [activeTab, setActiveTab] = useState<'mobile' | 'desktop' | 'online' | 'ai'>('mobile');
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveConfig(formData);
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4 select-none">
      <div className="bg-[#242f3d] border border-[#3f5064] rounded-2xl w-full max-w-2xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 text-white">
        {/* Header */}
        <div className="h-14 bg-[#1e2733] border-b border-[#3b4b5e] px-5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center">
              <Settings className="w-4 h-4 text-amber-400" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">Central Project Configurations</h2>
              <p className="text-[11px] text-slate-400">
                Configure Mobile, Desktop, Online Cloud Saving, and AI Bot once
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

        {/* Unified Category Tabs */}
        <div className="bg-[#1b232e] border-b border-slate-700 px-4 py-2 flex items-center gap-2 overflow-x-auto text-xs">
          <button
            type="button"
            onClick={() => setActiveTab('mobile')}
            className={`px-3 py-1.5 rounded-lg font-medium transition flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'mobile'
                ? 'bg-cyan-600 text-white font-semibold shadow-xs'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>Mobile</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('desktop')}
            className={`px-3 py-1.5 rounded-lg font-medium transition flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'desktop'
                ? 'bg-emerald-600 text-white font-semibold shadow-xs'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <Monitor className="w-3.5 h-3.5" />
            <span>Desktop</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('online')}
            className={`px-3 py-1.5 rounded-lg font-medium transition flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'online'
                ? 'bg-indigo-600 text-white font-semibold shadow-xs'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            <span>Online File Saving</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('ai')}
            className={`px-3 py-1.5 rounded-lg font-medium transition flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'ai'
                ? 'bg-purple-600 text-white font-semibold shadow-xs'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <Bot className="w-3.5 h-3.5" />
            <span>Chat Bot (AI Agent)</span>
          </button>
        </div>

        {/* Form Body */}
        <form
          onSubmit={handleSubmit}
          className="flex-1 overflow-y-auto p-5 space-y-4 text-xs scrollbar-thin scrollbar-thumb-slate-700"
        >
          {/* TAB 1: Mobile Configurations */}
          {activeTab === 'mobile' && (
            <div className="space-y-3 animate-in fade-in">
              <div className="bg-[#1b232e] p-4 rounded-xl border border-slate-700 space-y-3">
                <h4 className="font-semibold text-cyan-300 flex items-center gap-2">
                  <Smartphone className="w-4 h-4 text-cyan-400" />
                  Mobile Output Signing Credentials
                </h4>
                <p className="text-slate-400 text-xs">
                  These keys are used when compiling APK, AAB (Google Play), and iOS IPA binaries.
                </p>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">
                    Android Keystore / SHA-256 Signature (for APK & AAB):
                  </label>
                  <input
                    type="password"
                    placeholder="Paste Android Keystore key or SHA-256 certificate"
                    value={formData.androidKeystore}
                    onChange={(e) =>
                      setFormData({ ...formData, androidKeystore: e.target.value })
                    }
                    className="w-full bg-[#121922] border border-slate-700 rounded-lg p-2.5 text-white font-mono text-[11px] focus:outline-none focus:border-cyan-400"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">
                    Apple Developer Certificate / Provisioning Profile (for iOS IPA):
                  </label>
                  <input
                    type="password"
                    placeholder="Paste Apple Dev Certificate / Ad-Hoc mobileprovision token"
                    value={formData.appleDevCert}
                    onChange={(e) =>
                      setFormData({ ...formData, appleDevCert: e.target.value })
                    }
                    className="w-full bg-[#121922] border border-slate-700 rounded-lg p-2.5 text-white font-mono text-[11px] focus:outline-none focus:border-cyan-400"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Desktop Configurations */}
          {activeTab === 'desktop' && (
            <div className="space-y-3 animate-in fade-in">
              <div className="bg-[#1b232e] p-4 rounded-xl border border-slate-700 space-y-3">
                <h4 className="font-semibold text-emerald-300 flex items-center gap-2">
                  <Monitor className="w-4 h-4 text-emerald-400" />
                  Desktop Native Binaries CodeSign Tokens
                </h4>
                <p className="text-slate-400 text-xs">
                  Configured once to sign Windows EXE/MSI installers and macOS / Linux universal bundles.
                </p>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">
                    Windows SignTool Key / EV Code Signing Token:
                  </label>
                  <input
                    type="password"
                    placeholder="Paste Windows Authenticode or SignTool Certificate"
                    value={formData.windowsSignKey}
                    onChange={(e) =>
                      setFormData({ ...formData, windowsSignKey: e.target.value })
                    }
                    className="w-full bg-[#121922] border border-slate-700 rounded-lg p-2.5 text-white font-mono text-[11px] focus:outline-none focus:border-emerald-400"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">
                    macOS Developer ID / Notarization Token:
                  </label>
                  <input
                    type="password"
                    placeholder="Paste Apple Developer ID or Notarization API key"
                    value={formData.macDeveloperId}
                    onChange={(e) =>
                      setFormData({ ...formData, macDeveloperId: e.target.value })
                    }
                    className="w-full bg-[#121922] border border-slate-700 rounded-lg p-2.5 text-white font-mono text-[11px] focus:outline-none focus:border-emerald-400"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: Online File Saving Configurations */}
          {activeTab === 'online' && (
            <div className="space-y-3 animate-in fade-in">
              <div className="bg-[#1b232e] p-4 rounded-xl border border-slate-700 space-y-3">
                <h4 className="font-semibold text-indigo-300 flex items-center gap-2">
                  <Globe className="w-4 h-4 text-indigo-400" />
                  Online Cloud Storage & Host Integrations
                </h4>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">
                    GitHub Personal Access Token (PAT):
                  </label>
                  <input
                    type="password"
                    placeholder="ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                    value={formData.githubToken}
                    onChange={(e) =>
                      setFormData({ ...formData, githubToken: e.target.value })
                    }
                    className="w-full bg-[#121922] border border-slate-700 rounded-lg p-2 text-white font-mono text-[11px] focus:outline-none focus:border-indigo-400"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">
                    Vercel API Deployment Token:
                  </label>
                  <input
                    type="password"
                    placeholder="Paste Vercel Bearer Token"
                    value={formData.vercelToken}
                    onChange={(e) =>
                      setFormData({ ...formData, vercelToken: e.target.value })
                    }
                    className="w-full bg-[#121922] border border-slate-700 rounded-lg p-2 text-white font-mono text-[11px] focus:outline-none focus:border-indigo-400"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div>
                    <label className="block text-slate-300 font-medium mb-1">
                      Cloud Storage Key (S3 / Cloud Storage):
                    </label>
                    <input
                      type="password"
                      placeholder="Access Key / Secret"
                      value={formData.cloudStorageKey}
                      onChange={(e) =>
                        setFormData({ ...formData, cloudStorageKey: e.target.value })
                      }
                      className="w-full bg-[#121922] border border-slate-700 rounded-lg p-2 text-white font-mono text-[11px] focus:outline-none focus:border-indigo-400"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 font-medium mb-1">
                      Cloud Storage Bucket Name:
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. gcad-user-storage"
                      value={formData.cloudBucket}
                      onChange={(e) =>
                        setFormData({ ...formData, cloudBucket: e.target.value })
                      }
                      className="w-full bg-[#121922] border border-slate-700 rounded-lg p-2 text-white font-mono text-[11px] focus:outline-none focus:border-indigo-400"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: Chat Bot Configurations */}
          {activeTab === 'ai' && (
            <div className="space-y-3 animate-in fade-in">
              <div className="bg-[#1b232e] p-4 rounded-xl border border-slate-700 space-y-3">
                <h4 className="font-semibold text-purple-300 flex items-center gap-2">
                  <Bot className="w-4 h-4 text-purple-400" />
                  Chat Bot (AI Agent Engine)
                </h4>
                <p className="text-slate-400 text-xs">
                  Powers the full-time code generation agent, error fixing, and logo integration.
                </p>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">
                    Gemini AI API Key (Injected via AI Studio Secrets):
                  </label>
                  <input
                    type="password"
                    placeholder="Auto-injected from server environment (GEMINI_API_KEY)"
                    value={formData.geminiApiKey}
                    onChange={(e) =>
                      setFormData({ ...formData, geminiApiKey: e.target.value })
                    }
                    className="w-full bg-[#121922] border border-slate-700 rounded-lg p-2.5 text-white font-mono text-[11px] focus:outline-none focus:border-purple-400"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">
                    The editor automatically uses your server-side API key. You can also specify an alternate key here.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div>
                    <label className="block text-slate-300 font-medium mb-1">AI Model:</label>
                    <select
                      value={formData.aiModel || 'gemini-3.8-flash'}
                      onChange={(e) => setFormData({ ...formData, aiModel: e.target.value })}
                      className="w-full bg-[#121922] border border-slate-700 rounded-lg p-2 text-white text-[11px] focus:outline-none focus:border-purple-400"
                    >
                      <option value="gemini-3.8-flash">gemini-3.8-flash (Recommended & Fast)</option>
                      <option value="gemini-3.1-flash-lite">gemini-3.1-flash-lite (Ultra Lightweight)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-slate-300 font-medium mb-1">
                      Custom Proxy / Endpoint (Optional):
                    </label>
                    <input
                      type="text"
                      placeholder="/api/ai/chat (Default)"
                      value={formData.customApiEndpoint}
                      onChange={(e) =>
                        setFormData({ ...formData, customApiEndpoint: e.target.value })
                      }
                      className="w-full bg-[#121922] border border-slate-700 rounded-lg p-2 text-white font-mono text-[11px] focus:outline-none focus:border-purple-400"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Unified Configuration Guide */}
          <div className="bg-[#141b24] p-3.5 rounded-xl border border-slate-800 space-y-1.5 font-sans">
            <h5 className="font-semibold text-amber-300 text-xs flex items-center gap-1.5">
              <HelpCircle className="w-3.5 h-3.5 text-amber-400" />
              Unified Configuration Guide
            </h5>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              All credentials entered here are persisted in your project workspace. You configure
              them once, and they automatically apply whenever you compile mobile outputs (APK, AAB, IPA),
              desktop native packages (EXE, MSI, AppImage), save to cloud hosts, or prompt the AI Chat Bot.
            </p>
          </div>

          {savedSuccess && (
            <div className="p-3 bg-emerald-950/40 border border-emerald-600/50 rounded-xl flex items-center gap-2 text-emerald-300 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>All configurations confirmed and saved successfully!</span>
            </div>
          )}

          {/* Footer Action: Configure Once */}
          <div className="flex justify-end gap-2 pt-2 border-t border-slate-700/60">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-700/60 hover:bg-slate-700 text-slate-300 text-xs"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-600 to-cyan-600 hover:from-amber-500 hover:to-cyan-500 font-bold text-white text-xs flex items-center gap-1.5 shadow-md active:scale-95 transition"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Confirm & Save All Configurations</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
