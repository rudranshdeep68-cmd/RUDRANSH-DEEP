import React from 'react';
import {
  Volume2,
  VolumeX,
  Volume1,
  Camera,
  Lock,
  ExternalLink,
  FileText,
  Calculator,
  Code,
  Youtube,
  Globe,
  Music,
  Terminal,
} from 'lucide-react';

interface PCControlsPanelProps {
  volume: number;
  isMuted: boolean;
  onVolumeChange: (newVol: number) => void;
  onToggleMute: () => void;
  onTakeScreenshot: () => void;
  isCapturingScreenshot: boolean;
  onLockPC: () => void;
  onOpenNotepad: () => void;
  onOpenCalculator: () => void;
  onOpenPythonScriptModal: () => void;
}

export const PCControlsPanel: React.FC<PCControlsPanelProps> = ({
  volume,
  isMuted,
  onVolumeChange,
  onToggleMute,
  onTakeScreenshot,
  isCapturingScreenshot,
  onLockPC,
  onOpenNotepad,
  onOpenCalculator,
  onOpenPythonScriptModal,
}) => {
  const openExternal = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const currentVolume = isMuted ? 0 : volume;

  return (
    <div
      id="pc-controls-panel"
      className="bg-slate-900/85 backdrop-blur-md rounded-xl border border-slate-800 p-4 shadow-xl flex flex-col gap-4"
    >
      {/* Section Header */}
      <div className="flex items-center justify-between border-b border-slate-800/80 pb-2.5">
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-cyan-400" />
          <h2 className="text-xs font-mono font-bold tracking-widest text-slate-200 uppercase">
            Workstation Control Matrix
          </h2>
        </div>
        <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950/40 px-2 py-0.5 rounded border border-cyan-800/40">
          OS: Active
        </span>
      </div>

      {/* Row 1: Volume Subsystem & Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Audio Volume Controller */}
        <div className="bg-slate-950/60 rounded-lg p-3 border border-slate-800/70 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-mono text-slate-300 flex items-center gap-1.5">
              {isMuted || currentVolume === 0 ? (
                <VolumeX className="w-4 h-4 text-rose-400" />
              ) : currentVolume > 60 ? (
                <Volume2 className="w-4 h-4 text-cyan-400" />
              ) : (
                <Volume1 className="w-4 h-4 text-cyan-400" />
              )}
              Audio Output
            </span>
            <span className="text-[11px] font-mono font-bold text-slate-200">
              {isMuted ? 'MUTED' : `${currentVolume}%`}
            </span>
          </div>

          <div className="flex items-center gap-2 mb-2">
            <input
              id="volume-range-slider"
              type="range"
              min="0"
              max="100"
              value={currentVolume}
              onChange={(e) => onVolumeChange(Number(e.target.value))}
              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
            />
          </div>

          <div className="flex items-center justify-between gap-1.5">
            <button
              id="vol-down-btn"
              onClick={() => onVolumeChange(Math.max(0, currentVolume - 10))}
              className="flex-1 py-1 text-[10px] font-mono rounded bg-slate-800/80 hover:bg-slate-700 text-slate-300 border border-slate-700/60 transition-colors"
            >
              -10%
            </button>
            <button
              id="vol-mute-btn"
              onClick={onToggleMute}
              className={`flex-1 py-1 text-[10px] font-mono rounded border transition-colors ${
                isMuted
                  ? 'bg-rose-950/50 text-rose-300 border-rose-600/60'
                  : 'bg-slate-800/80 text-slate-300 border-slate-700/60 hover:bg-slate-700'
              }`}
            >
              {isMuted ? 'Unmute' : 'Mute'}
            </button>
            <button
              id="vol-up-btn"
              onClick={() => onVolumeChange(Math.min(100, currentVolume + 10))}
              className="flex-1 py-1 text-[10px] font-mono rounded bg-slate-800/80 hover:bg-slate-700 text-slate-300 border border-slate-700/60 transition-colors"
            >
              +10%
            </button>
          </div>
        </div>

        {/* Security & Screenshot Matrix */}
        <div className="bg-slate-950/60 rounded-lg p-3 border border-slate-800/70 flex flex-col justify-between gap-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono text-slate-300">Quick Commands</span>
            <span className="text-[10px] font-mono text-slate-400">pyautogui / OS</span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              id="screenshot-action-btn"
              onClick={onTakeScreenshot}
              disabled={isCapturingScreenshot}
              className="p-2 rounded-lg bg-slate-800/90 hover:bg-slate-700 text-slate-200 border border-slate-700/70 hover:border-cyan-500/50 transition-all flex flex-col items-center justify-center gap-1 text-center group cursor-pointer"
              title="Capture screenshot and download as PNG"
            >
              <Camera className="w-4 h-4 text-cyan-400 group-hover:scale-110 transition-transform" />
              <span className="text-[10px] font-mono font-medium">
                {isCapturingScreenshot ? 'Snapping...' : 'Screenshot'}
              </span>
            </button>

            <button
              id="lock-pc-action-btn"
              onClick={onLockPC}
              className="p-2 rounded-lg bg-slate-800/90 hover:bg-rose-950/60 text-slate-200 border border-slate-700/70 hover:border-rose-500/50 transition-all flex flex-col items-center justify-center gap-1 text-center group cursor-pointer"
              title="Lock workstation with security passcode"
            >
              <Lock className="w-4 h-4 text-rose-400 group-hover:scale-110 transition-transform" />
              <span className="text-[10px] font-mono font-medium text-rose-300">Lock PC</span>
            </button>
          </div>
        </div>
      </div>

      {/* Row 2: Software & Web Launchers (as mapped in the python open_application function) */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-mono text-slate-400">Application Dispatcher</span>
          <button
            onClick={onOpenPythonScriptModal}
            className="text-[10px] font-mono text-cyan-400 hover:text-cyan-300 underline underline-offset-2"
          >
            PyCharm Companion Script (.py)
          </button>
        </div>

        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
          <button
            onClick={() => openExternal('https://www.youtube.com')}
            className="p-2 rounded bg-slate-950/60 hover:bg-slate-800 border border-slate-800/80 hover:border-slate-700 text-slate-300 hover:text-white flex flex-col items-center gap-1 transition-all group"
            title="Open YouTube in browser"
          >
            <Youtube className="w-4 h-4 text-red-400 group-hover:scale-110 transition-transform" />
            <span className="text-[10px] font-mono">YouTube</span>
          </button>

          <button
            onClick={() => openExternal('https://www.google.com')}
            className="p-2 rounded bg-slate-950/60 hover:bg-slate-800 border border-slate-800/80 hover:border-slate-700 text-slate-300 hover:text-white flex flex-col items-center gap-1 transition-all group"
            title="Open Google Chrome Search"
          >
            <Globe className="w-4 h-4 text-blue-400 group-hover:scale-110 transition-transform" />
            <span className="text-[10px] font-mono">Chrome</span>
          </button>

          <button
            onClick={() => openExternal('https://open.spotify.com')}
            className="p-2 rounded bg-slate-950/60 hover:bg-slate-800 border border-slate-800/80 hover:border-slate-700 text-slate-300 hover:text-white flex flex-col items-center gap-1 transition-all group"
            title="Launch Spotify Web Player"
          >
            <Music className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" />
            <span className="text-[10px] font-mono">Spotify</span>
          </button>

          <button
            onClick={onOpenNotepad}
            className="p-2 rounded bg-slate-950/60 hover:bg-slate-800 border border-slate-800/80 hover:border-slate-700 text-slate-300 hover:text-white flex flex-col items-center gap-1 transition-all group"
            title="Launch in-app Notepad"
          >
            <FileText className="w-4 h-4 text-amber-400 group-hover:scale-110 transition-transform" />
            <span className="text-[10px] font-mono">Notepad</span>
          </button>

          <button
            onClick={onOpenCalculator}
            className="p-2 rounded bg-slate-950/60 hover:bg-slate-800 border border-slate-800/80 hover:border-slate-700 text-slate-300 hover:text-white flex flex-col items-center gap-1 transition-all group"
            title="Launch in-app Calculator"
          >
            <Calculator className="w-4 h-4 text-violet-400 group-hover:scale-110 transition-transform" />
            <span className="text-[10px] font-mono">Calc</span>
          </button>

          <button
            onClick={() => openExternal('https://vscode.dev')}
            className="p-2 rounded bg-slate-950/60 hover:bg-slate-800 border border-slate-800/80 hover:border-slate-700 text-slate-300 hover:text-white flex flex-col items-center gap-1 transition-all group"
            title="Launch Visual Studio Code"
          >
            <Code className="w-4 h-4 text-sky-400 group-hover:scale-110 transition-transform" />
            <span className="text-[10px] font-mono">VS Code</span>
          </button>
        </div>
      </div>
    </div>
  );
};
