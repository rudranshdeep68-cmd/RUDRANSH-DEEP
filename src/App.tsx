import React, { useState, useEffect, useRef, useCallback } from 'react';
import html2canvas from 'html2canvas';
import {
  Shield,
  Volume2,
  VolumeX,
  Radio,
  FileCode,
  Sparkles,
  RefreshCw,
  Terminal,
} from 'lucide-react';
import {
  AssistantMessage,
  SupportedLang,
  TelemetryData,
  UltronStatus,
} from './types';
import { ArcReactorCore } from './components/ArcReactorCore';
import { TelemetryHUD } from './components/TelemetryHUD';
import { PCControlsPanel } from './components/PCControlsPanel';
import { VoiceTerminalChat } from './components/VoiceTerminalChat';
import { LockScreenOverlay } from './components/LockScreenOverlay';
import { InAppModals } from './components/InAppModals';
import { soundFX, speakText, stopSpeech } from './utils/audioSynth';
import { SUPPORTED_LANGUAGES } from './utils/languages';

export default function App() {
  // Core Status & Voice
  const [status, setStatus] = useState<UltronStatus>('idle');
  const [isListening, setIsListening] = useState(false);
  const [interimTranscript, setInterimTranscript] = useState('');
  const [selectedLang, setSelectedLang] = useState<SupportedLang>('en');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  // Workstation Hardware & Security State
  const [volume, setVolume] = useState<number>(85);
  const [isMuted, setIsMuted] = useState(false);
  const [isLocked, setIsLocked] = useState(false);
  const [audioFeedback, setAudioFeedback] = useState(true);

  // In-App Modals
  const [isNotepadOpen, setIsNotepadOpen] = useState(false);
  const [isCalculatorOpen, setIsCalculatorOpen] = useState(false);
  const [isPythonModalOpen, setIsPythonModalOpen] = useState(false);
  const [screenshotUrl, setScreenshotUrl] = useState<string | null>(null);
  const [isCapturingScreenshot, setIsCapturingScreenshot] = useState(false);

  // Real-time Telemetry Data
  const [telemetry, setTelemetry] = useState<TelemetryData>({
    cpu: 28,
    ram: 62,
    battery: 92,
    isCharging: true,
    totalMemoryGB: '16.0',
    freeMemoryGB: '6.1',
    uptimeSeconds: 7420,
    platform: 'Linux x86_64',
    cpuModel: 'Intel Core i9 / Container Virtual Core',
    cpuCores: 8,
    networkLatencyMs: 24,
  });

  // Conversation & Logs
  const [messages, setMessages] = useState<AssistantMessage[]>([
    {
      id: 'welcome-1',
      sender: 'ultron',
      text: 'Greetings, sir. ULTRON V.2 subroutines are online. Multilingual neural core active (English, Hindi, Chinese, Russian, Japanese, Spanish). How may I assist your workstation today?',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      lang: 'en',
    },
  ]);

  const recognitionRef = useRef<any>(null);
  const appContainerRef = useRef<HTMLDivElement>(null);

  // Fetch host telemetry from Express backend
  const fetchTelemetry = useCallback(async () => {
    try {
      const startTime = performance.now();
      const res = await fetch('/api/telemetry');
      const latency = Math.round(performance.now() - startTime);

      if (res.ok) {
        const data = await res.json();
        setTelemetry((prev) => ({
          ...prev,
          cpu: data.cpu ?? prev.cpu,
          ram: data.ram ?? prev.ram,
          totalMemoryGB: data.totalMemoryGB ?? prev.totalMemoryGB,
          freeMemoryGB: data.freeMemoryGB ?? prev.freeMemoryGB,
          uptimeSeconds: data.uptimeSeconds ?? prev.uptimeSeconds,
          platform: data.platform ?? prev.platform,
          cpuCores: data.cpuCores ?? prev.cpuCores,
          networkLatencyMs: latency || 18,
        }));
      }
    } catch {
      // Fallback slight jitter for live feedback
      setTelemetry((prev) => ({
        ...prev,
        cpu: Math.min(100, Math.max(8, prev.cpu + (Math.floor(Math.random() * 9) - 4))),
        ram: Math.min(100, Math.max(15, prev.ram + (Math.floor(Math.random() * 5) - 2))),
        networkLatencyMs: Math.floor(Math.random() * 15) + 18,
      }));
    }
  }, []);

  // Periodic Telemetry Poll & Battery API
  useEffect(() => {
    fetchTelemetry();
    const interval = setInterval(fetchTelemetry, 6000);

    // Read real battery if supported in browser
    if (typeof navigator !== 'undefined' && 'getBattery' in navigator) {
      (navigator as any).getBattery?.().then((bat: any) => {
        setTelemetry((prev) => ({
          ...prev,
          battery: Math.round(bat.level * 100),
          isCharging: bat.charging,
        }));
        bat.addEventListener('levelchange', () => {
          setTelemetry((prev) => ({ ...prev, battery: Math.round(bat.level * 100) }));
        });
        bat.addEventListener('chargingchange', () => {
          setTelemetry((prev) => ({ ...prev, isCharging: bat.charging }));
        });
      });
    }

    return () => clearInterval(interval);
  }, [fetchTelemetry]);

  // Text-To-Speech wrapper
  const handleSpeak = useCallback(
    (text: string, lang: SupportedLang = selectedLang) => {
      if (isMuted) return;
      setIsSpeaking(true);
      setStatus('speaking');
      speakText(
        text,
        lang,
        () => {
          setIsSpeaking(false);
          setStatus('idle');
        },
        () => {
          setIsSpeaking(true);
          setStatus('speaking');
        }
      );
    },
    [isMuted, selectedLang]
  );

  // Take Screenshot
  const handleTakeScreenshot = useCallback(async () => {
    setIsCapturingScreenshot(true);
    if (audioFeedback) soundFX.shutter();

    try {
      // Small delay for clean DOM paint
      await new Promise((r) => setTimeout(r, 120));
      const target = document.body;
      const canvas = await html2canvas(target, {
        backgroundColor: '#0a0d14',
        scale: 1.5,
        useCORS: true,
      });

      const dataUrl = canvas.toDataURL('image/png');
      setScreenshotUrl(dataUrl);

      // Auto download with timestamp format: ULTRON_V2_screenshot_<timestamp>.png
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const filename = `ULTRON_V2_screenshot_${timestamp}.png`;
      const link = document.createElement('a');
      link.href = dataUrl;
      link.download = filename;
      link.click();

      const snapMsg: AssistantMessage = {
        id: 'snap-' + Date.now(),
        sender: 'ultron',
        text: `Workstation screenshot captured successfully and saved as "${filename}".`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        lang: selectedLang,
        action: 'screenshot',
      };
      setMessages((prev) => [...prev, snapMsg]);
      handleSpeak(snapMsg.text, selectedLang);
    } catch (err) {
      console.error('Screenshot capture failed:', err);
    } finally {
      setIsCapturingScreenshot(false);
    }
  }, [audioFeedback, selectedLang, handleSpeak]);

  // Read out Telemetry
  const handleSpeakTelemetry = useCallback(() => {
    const report = `CPU usage is ${telemetry.cpu} percent. RAM utilization is ${telemetry.ram} percent. Battery is at ${
      telemetry.battery
    } percent and ${telemetry.isCharging ? 'charging' : 'discharging'}. All cores nominal.`;

    const msg: AssistantMessage = {
      id: 'telemetry-' + Date.now(),
      sender: 'ultron',
      text: report,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      lang: selectedLang,
      action: 'telemetry',
    };
    setMessages((prev) => [...prev, msg]);
    handleSpeak(report, selectedLang);
  }, [telemetry, selectedLang, handleSpeak]);

  // Command Execution Hub
  const handleSendCommand = useCallback(
    async (commandText: string) => {
      if (!commandText.trim()) return;

      if (audioFeedback) soundFX.acknowledge();

      // Add user message to log
      const userMsg: AssistantMessage = {
        id: 'user-' + Date.now(),
        sender: 'user',
        text: commandText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        lang: selectedLang,
      };

      setMessages((prev) => [...prev, userMsg]);
      setIsProcessing(true);
      setStatus('thinking');

      try {
        const res = await fetch('/api/command', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            command: commandText,
            lang: selectedLang,
            context: messages.slice(-4).map((m) => ({
              role: m.sender === 'user' ? 'user' : 'assistant',
              content: m.text,
            })),
          }),
        });

        const data = await res.json();
        const detectedLanguage: SupportedLang = data.detectedLanguage || selectedLang;
        const replyText = data.reply || 'Command subroutines acknowledged, sir.';

        // Handle specific action triggers
        if (data.action === 'screenshot') {
          handleTakeScreenshot();
        } else if (data.action === 'telemetry') {
          fetchTelemetry();
        } else if (data.action === 'volume_up') {
          setVolume((v) => Math.min(100, v + 15));
          setIsMuted(false);
        } else if (data.action === 'volume_down') {
          setVolume((v) => Math.max(0, v - 15));
        } else if (data.action === 'mute') {
          setIsMuted((m) => !m);
        } else if (data.action === 'lock_pc') {
          if (audioFeedback) soundFX.lock();
          setIsLocked(true);
          setStatus('locked');
        } else if (data.action === 'open_app' && data.actionPayload) {
          const app = data.actionPayload;
          if (app.url === 'notepad') {
            setIsNotepadOpen(true);
          } else if (app.url === 'calculator') {
            setIsCalculatorOpen(true);
          } else if (app.url === 'pycharm') {
            setIsPythonModalOpen(true);
          } else if (app.url && app.url.startsWith('http')) {
            window.open(app.url, '_blank', 'noopener,noreferrer');
          }
        }

        const ultronMsg: AssistantMessage = {
          id: 'ultron-' + Date.now(),
          sender: 'ultron',
          text: replyText,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          lang: detectedLanguage,
          action: data.action,
        };

        setMessages((prev) => [...prev, ultronMsg]);

        // Speak response out loud
        handleSpeak(replyText, detectedLanguage);
      } catch (err: any) {
        const errorMsg: AssistantMessage = {
          id: 'err-' + Date.now(),
          sender: 'ultron',
          text: `Neural communication issue: ${err.message || 'Check server connection'}`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          lang: selectedLang,
        };
        setMessages((prev) => [...prev, errorMsg]);
        setStatus('idle');
      } finally {
        setIsProcessing(false);
      }
    },
    [
      audioFeedback,
      selectedLang,
      messages,
      handleTakeScreenshot,
      fetchTelemetry,
      handleSpeak,
    ]
  );

  // Browser Speech Recognition Engine
  const startListening = useCallback(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert('Speech Recognition is not supported by your current browser. Please use Google Chrome or Edge.');
      return;
    }

    try {
      stopSpeech();
      if (audioFeedback) soundFX.wake();

      const activeLangObj =
        SUPPORTED_LANGUAGES.find((l) => l.code === selectedLang) || SUPPORTED_LANGUAGES[0];

      const recognition = new SpeechRecognition();
      recognition.lang = activeLangObj.speechCode;
      recognition.interimResults = true;
      recognition.continuous = false;

      recognition.onstart = () => {
        setIsListening(true);
        setStatus('listening');
      };

      recognition.onresult = (event: any) => {
        let interim = '';
        let final = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            final += event.results[i][0].transcript;
          } else {
            interim += event.results[i][0].transcript;
          }
        }

        setInterimTranscript(interim);

        if (final) {
          setInterimTranscript('');
          handleSendCommand(final);
        }
      };

      recognition.onerror = (e: any) => {
        console.warn('Speech recognition status:', e.error);
        setIsListening(false);
        setStatus('idle');
        setInterimTranscript('');
      };

      recognition.onend = () => {
        setIsListening(false);
        if (status === 'listening') {
          setStatus('idle');
        }
        setInterimTranscript('');
      };

      recognition.start();
      recognitionRef.current = recognition;
    } catch (err) {
      console.error('Failed to initiate speech recognition:', err);
      setIsListening(false);
      setStatus('idle');
    }
  }, [audioFeedback, selectedLang, status, handleSendCommand]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    setIsListening(false);
    setStatus('idle');
    setInterimTranscript('');
  }, []);

  const toggleListening = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  return (
    <div
      ref={appContainerRef}
      id="app-root"
      className="min-h-screen bg-[#07090e] text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-black overflow-x-hidden relative"
    >
      {/* Background Subtle Tech Cyber Mesh */}
      <div className="fixed inset-0 bg-[radial-gradient(#1e293b18_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[800px] h-[350px] bg-cyan-500/5 blur-[120px] pointer-events-none rounded-full" />

      {/* Screen flash on screenshot */}
      {isCapturingScreenshot && (
        <div className="fixed inset-0 z-50 bg-white/90 animate-fade-out pointer-events-none" />
      )}

      {/* Fullscreen Workstation Lockdown Overlay */}
      <LockScreenOverlay
        isLocked={isLocked}
        onUnlock={() => {
          setIsLocked(false);
          setStatus('idle');
        }}
      />

      {/* In-App Interactive Modals */}
      <InAppModals
        isNotepadOpen={isNotepadOpen}
        onCloseNotepad={() => setIsNotepadOpen(false)}
        isCalculatorOpen={isCalculatorOpen}
        onCloseCalculator={() => setIsCalculatorOpen(false)}
        isPythonModalOpen={isPythonModalOpen}
        onClosePythonModal={() => setIsPythonModalOpen(false)}
        screenshotUrl={screenshotUrl}
        onCloseScreenshot={() => setScreenshotUrl(null)}
      />

      {/* Top Cyber Navigation Bar */}
      <header
        id="top-cyber-navbar"
        className="relative z-20 border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md px-4 sm:px-6 py-3 flex items-center justify-between"
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-cyan-950/80 border border-cyan-500/40 flex items-center justify-center text-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.3)]">
            <Radio className="w-4 h-4 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm sm:text-base font-black tracking-widest text-slate-100 uppercase">
                ULTRON <span className="text-cyan-400 font-mono">V.2</span>
              </h1>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-800/50">
                MULTILINGUAL AI
              </span>
            </div>
            <p className="text-[10px] text-slate-400 font-mono hidden sm:block">
              Desktop PC Assistant • Voice Recognition • Telemetry • Workstation Automation
            </p>
          </div>
        </div>

        {/* Right Status Matrix */}
        <div className="flex items-center gap-2 sm:gap-3 text-xs font-mono">
          {/* PyCharm Native Script Trigger */}
          <button
            id="pycharm-companion-modal-btn"
            onClick={() => setIsPythonModalOpen(true)}
            className="px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-cyan-300 border border-cyan-800/40 flex items-center gap-1.5 transition-colors cursor-pointer text-[11px]"
            title="View Python Script for PyCharm and local PC execution"
          >
            <FileCode className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden md:inline">Python Companion (.py)</span>
          </button>

          {/* Master Audio Mute Toggle */}
          <button
            id="master-mute-toggle-btn"
            onClick={() => setIsMuted(!isMuted)}
            className={`p-1.5 rounded-lg border transition-colors ${
              isMuted
                ? 'bg-rose-950/50 text-rose-300 border-rose-700/50'
                : 'bg-slate-900 text-slate-300 border-slate-800 hover:bg-slate-800'
            }`}
            title={isMuted ? 'Unmute Audio' : 'Mute Audio'}
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-cyan-400" />}
          </button>

          {/* System Lock Button */}
          <button
            id="lockdown-btn"
            onClick={() => {
              if (audioFeedback) soundFX.lock();
              setIsLocked(true);
              setStatus('locked');
            }}
            className="p-1.5 rounded-lg bg-slate-900 text-rose-400 hover:text-rose-300 border border-slate-800 hover:border-rose-700/50 transition-colors"
            title="Lock Workstation immediately"
          >
            <Shield className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Main Layout Area */}
      <main className="relative z-10 flex-1 max-w-7xl w-full mx-auto p-3 sm:p-5 lg:p-6 grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Left Column: Arc Reactor Core, Diagnostics Telemetry, PC Controls (5 cols on lg) */}
        <div className="lg:col-span-5 flex flex-col gap-5">
          {/* Arc Reactor Centerpiece */}
          <div className="bg-slate-900/85 backdrop-blur-md rounded-xl border border-slate-800 p-3 shadow-xl flex flex-col items-center">
            <ArcReactorCore
              status={status}
              isListening={isListening}
              onToggleMic={toggleListening}
              langCode={selectedLang}
            />

            {/* Spacebar Push-To-Talk Hint */}
            <div className="mt-2 text-[10px] font-mono text-slate-400 flex items-center gap-1.5">
              <span className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-300">
                Click Core
              </span>
              <span>to initiate voice recognition</span>
            </div>
          </div>

          {/* Telemetry HUD */}
          <TelemetryHUD
            telemetry={telemetry}
            onRefresh={fetchTelemetry}
            onSpeakTelemetry={handleSpeakTelemetry}
            isSpeaking={isSpeaking}
          />

          {/* PC Control Matrix (Volume, Screenshot, Lock, Quick Apps) */}
          <PCControlsPanel
            volume={volume}
            isMuted={isMuted}
            onVolumeChange={(v) => {
              setVolume(v);
              setIsMuted(false);
            }}
            onToggleMute={() => setIsMuted(!isMuted)}
            onTakeScreenshot={handleTakeScreenshot}
            isCapturingScreenshot={isCapturingScreenshot}
            onLockPC={() => {
              if (audioFeedback) soundFX.lock();
              setIsLocked(true);
              setStatus('locked');
            }}
            onOpenNotepad={() => setIsNotepadOpen(true)}
            onOpenCalculator={() => setIsCalculatorOpen(true)}
            onOpenPythonScriptModal={() => setIsPythonModalOpen(true)}
          />
        </div>

        {/* Right Column: Command Terminal, Transcripts, Multilingual Voice (7 cols on lg) */}
        <div className="lg:col-span-7 flex flex-col gap-4">
          <VoiceTerminalChat
            messages={messages}
            isListening={isListening}
            onToggleMic={toggleListening}
            onSendCommand={handleSendCommand}
            onSpeakMessage={handleSpeak}
            onClearMessages={() => setMessages([])}
            selectedLang={selectedLang}
            onChangeLang={(lang) => {
              setSelectedLang(lang);
              if (audioFeedback) soundFX.tick();
            }}
            interimTranscript={interimTranscript}
            isProcessing={isProcessing}
          />

          {/* Footer Info & Feature Summary Bar */}
          <div className="bg-slate-950/60 rounded-lg p-3 border border-slate-800/80 flex flex-wrap items-center justify-between gap-2 text-[11px] font-mono text-slate-400">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Gemini 3.8 Flash Neural Core Active</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-slate-300">Multilingual: 8 Languages</span>
              <span className="text-slate-600">•</span>
              <span className="text-cyan-400">PyCharm 3.9+ Ready</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
