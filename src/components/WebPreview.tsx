import React, { useState, useRef, useEffect } from 'react';
import {
  Maximize2,
  Minimize2,
  Smartphone,
  Tablet,
  Monitor,
  RotateCw,
  ChevronDown,
  Layers,
  Menu,
  Download,
  Share2,
  Package,
} from 'lucide-react';
import { CodeFile, DeviceMode } from '../types/editor';

interface WebPreviewProps {
  files: CodeFile[];
  onCaptureConsoleLog: (type: 'log' | 'warn' | 'error' | 'info', message: string) => void;
  isFullscreen: boolean;
  onToggleFullscreen: () => void;
  onOpenCompileModal: () => void;
  onOpenExportModal: () => void;
}

export const WebPreview: React.FC<WebPreviewProps> = ({
  files,
  onCaptureConsoleLog,
  isFullscreen,
  onToggleFullscreen,
  onOpenCompileModal,
  onOpenExportModal,
}) => {
  const [deviceMode, setDeviceMode] = useState<DeviceMode>('pc');
  const [isExportDropdownOpen, setIsExportDropdownOpen] = useState(false);
  const [isDeviceMenuOpen, setIsDeviceMenuOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [isAutoRefreshEnabled, setIsAutoRefreshEnabled] = useState(true);
  const [isNarrow, setIsNarrow] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const exportMenuRef = useRef<HTMLDivElement>(null);

  // Monitor width of preview container to switch device buttons to hamburger icon if narrow (as seen in image 3 & 4)
  useEffect(() => {
    const checkWidth = () => {
      if (containerRef.current) {
        setIsNarrow(containerRef.current.clientWidth < 420);
      }
    };
    checkWidth();
    window.addEventListener('resize', checkWidth);
    return () => window.removeEventListener('resize', checkWidth);
  }, []);

  // Listen for console messages from sandboxed iframe
  useEffect(() => {
    const handleIframeMessage = (event: MessageEvent) => {
      if (event.data && event.data.source === 'gcad-preview-runtime') {
        onCaptureConsoleLog(event.data.type, event.data.message);
      }
    };

    window.addEventListener('message', handleIframeMessage);
    return () => window.removeEventListener('message', handleIframeMessage);
  }, [onCaptureConsoleLog]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (exportMenuRef.current && !exportMenuRef.current.contains(event.target as Node)) {
        setIsExportDropdownOpen(false);
        setIsDeviceMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Debounced auto-refresh when files change
  useEffect(() => {
    if (!isAutoRefreshEnabled) return;
    const timer = setTimeout(() => {
      setRefreshKey((prev) => prev + 1);
    }, 400);
    return () => clearTimeout(timer);
  }, [files, isAutoRefreshEnabled]);

  // Construct combined HTML/CSS/JS source for the sandboxed iframe
  const generatePreviewSrcDoc = () => {
    const htmlFile = files.find((f) => f.name.endsWith('.html')) || {
      content: '<div style="padding:20px; font-family:sans-serif;"><h3>No HTML file found</h3></div>',
    };
    const cssFiles = files.filter((f) => f.name.endsWith('.css'));
    const jsFiles = files.filter((f) => f.name.endsWith('.js') || f.name.endsWith('.ts'));

    const combinedCss = cssFiles.map((f) => `<style>/* ${f.name} */\n${f.content}</style>`).join('\n');

    // Interceptor script to forward console.log, console.error to parent debug console
    const interceptorScript = `
      <script>
        (function() {
          function sendLog(type, args) {
            try {
              var msg = Array.prototype.slice.call(args).map(function(a) {
                if (typeof a === 'object') {
                  try { return JSON.stringify(a); } catch(e) { return String(a); }
                }
                return String(a);
              }).join(' ');
              window.parent.postMessage({ source: 'gcad-preview-runtime', type: type, message: msg }, '*');
            } catch(err) {}
          }

          var oldLog = console.log;
          var oldWarn = console.warn;
          var oldError = console.error;

          console.log = function() { sendLog('log', arguments); oldLog.apply(console, arguments); };
          console.warn = function() { sendLog('warn', arguments); oldWarn.apply(console, arguments); };
          console.error = function() { sendLog('error', arguments); oldError.apply(console, arguments); };

          window.onerror = function(message, source, lineno, colno, error) {
            sendLog('error', 'Uncaught Runtime Error: ' + message + ' (Line: ' + lineno + ')');
            return false;
          };
        })();
      </script>
    `;

    const combinedJs = jsFiles
      .map(
        (f) => `
        <script>
          try {
            // --- ${f.name} ---
            ${f.content}
          } catch(err) {
            console.error('${f.name} Execution Error:', err.message);
          }
        </script>
      `
      )
      .join('\n');

    let fullDoc = htmlFile.content;

    // Inject interceptor in head
    if (fullDoc.includes('<head>')) {
      fullDoc = fullDoc.replace('<head>', `<head>\n${interceptorScript}\n${combinedCss}`);
    } else {
      fullDoc = `${interceptorScript}\n${combinedCss}\n${fullDoc}`;
    }

    // Inject JS before closing body
    if (fullDoc.includes('</body>')) {
      fullDoc = fullDoc.replace('</body>', `${combinedJs}\n</body>`);
    } else {
      fullDoc = `${fullDoc}\n${combinedJs}`;
    }

    return fullDoc;
  };

  // Determine viewport width style based on deviceMode
  const getDeviceStyle = () => {
    switch (deviceMode) {
      case 'mobile':
        return {
          width: '375px',
          height: '667px',
          boxShadow: '0 20px 40px rgba(0,0,0,0.15)',
          borderRadius: '24px',
          border: '10px solid #1e293b',
        };
      case 'tablet':
        return {
          width: '768px',
          height: '100%',
          maxHeight: '900px',
          boxShadow: '0 20px 40px rgba(0,0,0,0.15)',
          borderRadius: '16px',
          border: '8px solid #1e293b',
        };
      case 'pc':
      default:
        return {
          width: '100%',
          height: '100%',
          borderRadius: '0px',
          border: 'none',
        };
    }
  };

  return (
    <div
      ref={containerRef}
      className={`h-full flex flex-col bg-white rounded-2xl border-2 border-slate-300 shadow-xl overflow-hidden transition-all duration-200 ${
        isFullscreen ? 'fixed inset-0 top-14 z-50 rounded-none border-none' : 'relative'
      }`}
    >
      {/* Top Preview Bar matching exact screenshots */}
      <div className="h-11 bg-white border-b border-slate-200 px-3 flex items-center justify-between text-xs select-none relative z-20">
        {/* Left: 3 macOS-style dots: Red, Yellow, Green (as shown on images) */}
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-[#ef4444] shadow-sm" />
          <div className="w-3 h-3 rounded-full bg-[#eab308] shadow-sm" />
          <div className="w-3 h-3 rounded-full bg-[#22c55e] shadow-sm" />
        </div>

        {/* Center / Right controls */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Full / Restore Down Button */}
          <button
            onClick={onToggleFullscreen}
            title={isFullscreen ? 'Restore Down' : 'Full Screen Preview'}
            className="h-7 px-3 rounded-full border border-slate-300 hover:border-slate-400 text-slate-700 hover:text-slate-900 font-medium text-xs flex items-center gap-1 transition bg-white shadow-xs active:scale-95"
          >
            {isFullscreen ? (
              <>
                <Minimize2 className="w-3 h-3" />
                <span>Restore</span>
              </>
            ) : (
              <>
                <Maximize2 className="w-3 h-3" />
                <span>Full</span>
              </>
            )}
          </button>

          {/* Device viewport switchers: Mobile, Tablet, PC */}
          {!isNarrow ? (
            <div className="flex items-center bg-slate-100 rounded-full p-0.5 border border-slate-300">
              <button
                onClick={() => setDeviceMode('mobile')}
                className={`h-6 px-2.5 rounded-full text-xs font-medium transition flex items-center gap-1 ${
                  deviceMode === 'mobile'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Mobile View (375px)"
              >
                <Smartphone className="w-3 h-3" />
                <span className="hidden sm:inline">Mobile</span>
              </button>
              <button
                onClick={() => setDeviceMode('tablet')}
                className={`h-6 px-2.5 rounded-full text-xs font-medium transition flex items-center gap-1 ${
                  deviceMode === 'tablet'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Tablet View (768px)"
              >
                <Tablet className="w-3 h-3" />
                <span className="hidden sm:inline">Tablet</span>
              </button>
              <button
                onClick={() => setDeviceMode('pc')}
                className={`h-6 px-2.5 rounded-full text-xs font-medium transition flex items-center gap-1 ${
                  deviceMode === 'pc'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="PC Desktop View (100%)"
              >
                <Monitor className="w-3 h-3" />
                <span className="hidden sm:inline">PC</span>
              </button>
            </div>
          ) : (
            /* Hamburger device switcher when narrow (Image 3 & 4) */
            <div className="relative">
              <button
                onClick={() => setIsDeviceMenuOpen(!isDeviceMenuOpen)}
                title="Device Modes"
                className="h-7 w-8 rounded-full border border-slate-300 flex items-center justify-center text-slate-700 hover:bg-slate-50 transition"
              >
                <Menu className="w-3.5 h-3.5" />
              </button>

              {isDeviceMenuOpen && (
                <div className="absolute right-0 top-8 bg-white border border-slate-300 rounded-xl shadow-xl py-1 w-32 z-50 text-xs">
                  <button
                    onClick={() => {
                      setDeviceMode('mobile');
                      setIsDeviceMenuOpen(false);
                    }}
                    className="w-full px-3 py-1.5 text-left flex items-center gap-2 hover:bg-slate-100 text-slate-700"
                  >
                    <Smartphone className="w-3.5 h-3.5" />
                    <span>Mobile (375px)</span>
                  </button>
                  <button
                    onClick={() => {
                      setDeviceMode('tablet');
                      setIsDeviceMenuOpen(false);
                    }}
                    className="w-full px-3 py-1.5 text-left flex items-center gap-2 hover:bg-slate-100 text-slate-700"
                  >
                    <Tablet className="w-3.5 h-3.5" />
                    <span>Tablet (768px)</span>
                  </button>
                  <button
                    onClick={() => {
                      setDeviceMode('pc');
                      setIsDeviceMenuOpen(false);
                    }}
                    className="w-full px-3 py-1.5 text-left flex items-center gap-2 hover:bg-slate-100 text-slate-700"
                  >
                    <Monitor className="w-3.5 h-3.5" />
                    <span>PC Desktop</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Refresh preview button */}
          <button
            onClick={() => setRefreshKey((prev) => prev + 1)}
            title="Refresh Preview"
            className="h-7 w-7 rounded-full border border-slate-300 flex items-center justify-center text-slate-700 hover:bg-slate-50 transition active:rotate-180 duration-300"
          >
            <RotateCw className="w-3 h-3" />
          </button>

          {/* Compile Button */}
          <button
            onClick={onOpenCompileModal}
            title="Compile for Mobile APK, AAB, IPA, or Desktop EXE, MSI, AppImage"
            className="h-7 px-2.5 rounded-full bg-slate-900 hover:bg-slate-800 text-white font-medium text-xs flex items-center gap-1 shadow-xs transition active:scale-95"
          >
            <Package className="w-3 h-3 text-cyan-400" />
            <span className="hidden sm:inline">Compile</span>
          </button>

          {/* Export Dropdown matching screenshot */}
          <div className="relative" ref={exportMenuRef}>
            <button
              onClick={() => setIsExportDropdownOpen(!isExportDropdownOpen)}
              className="h-7 px-3 rounded-full border border-slate-300 hover:border-slate-400 text-slate-800 font-medium text-xs flex items-center gap-1 transition bg-white shadow-xs active:scale-95"
            >
              <span>Export</span>
              <ChevronDown className="w-3 h-3 text-slate-500" />
            </button>

            {isExportDropdownOpen && (
              <div className="absolute right-0 top-9 w-48 bg-white border border-slate-200 rounded-xl shadow-2xl py-1.5 z-50 text-xs animate-in fade-in slide-in-from-top-1">
                <button
                  onClick={() => {
                    setIsExportDropdownOpen(false);
                    onOpenExportModal();
                  }}
                  className="w-full px-3 py-2 text-left hover:bg-slate-50 flex items-center gap-2 text-slate-700 hover:text-slate-950 font-medium transition"
                >
                  <Share2 className="w-3.5 h-3.5 text-cyan-600" />
                  <span>Publish (GitHub, Vercel, PWA)</span>
                </button>
                <button
                  onClick={() => {
                    setIsExportDropdownOpen(false);
                    onOpenCompileModal();
                  }}
                  className="w-full px-3 py-2 text-left hover:bg-slate-50 flex items-center gap-2 text-slate-700 hover:text-slate-950 font-medium transition"
                >
                  <Layers className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Compile Output Packages</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Preview Container */}
      <div className="flex-1 bg-slate-100 flex items-center justify-center overflow-auto p-2 sm:p-4">
        <div
          style={getDeviceStyle()}
          className="transition-all duration-300 overflow-hidden bg-white relative flex flex-col"
        >
          <iframe
            key={refreshKey}
            ref={iframeRef}
            srcDoc={generatePreviewSrcDoc()}
            sandbox="allow-scripts allow-modals allow-forms allow-same-origin"
            title="gCAD Live Project Preview"
            className="w-full h-full border-0 bg-white"
          />
        </div>
      </div>
    </div>
  );
};
