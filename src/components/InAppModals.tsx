import React, { useState } from 'react';
import {
  X,
  Copy,
  Check,
  Download,
  FileText,
  Calculator as CalcIcon,
  Code,
  Terminal,
  ExternalLink,
  Eye,
} from 'lucide-react';
import { ULTRON_PYTHON_V2_SCRIPT, ULTRON_REQUIREMENTS_TXT } from '../utils/pythonScript';

interface InAppModalsProps {
  // Notepad
  isNotepadOpen: boolean;
  onCloseNotepad: () => void;

  // Calculator
  isCalculatorOpen: boolean;
  onCloseCalculator: () => void;

  // Python Companion Script
  isPythonModalOpen: boolean;
  onClosePythonModal: () => void;

  // Screenshot Preview
  screenshotUrl: string | null;
  onCloseScreenshot: () => void;
}

export const InAppModals: React.FC<InAppModalsProps> = ({
  isNotepadOpen,
  onCloseNotepad,
  isCalculatorOpen,
  onCloseCalculator,
  isPythonModalOpen,
  onClosePythonModal,
  screenshotUrl,
  onCloseScreenshot,
}) => {
  // Notepad State
  const [notepadText, setNotepadText] = useState(
    '# ULTRON V.2 Workstation Scratchpad\n\n- System diagnostics checked: Nominal\n- Telemetry: CPU & RAM operating under safe threshold\n- Voice Recognition initialized'
  );
  const [copiedNotepad, setCopiedNotepad] = useState(false);

  // Calculator State
  const [calcDisplay, setCalcDisplay] = useState('0');
  const [calcPrev, setCalcPrev] = useState<number | null>(null);
  const [calcOp, setCalcOp] = useState<string | null>(null);
  const [calcResetOnNext, setCalcResetOnNext] = useState(false);

  // Python modal copy state
  const [copiedPython, setCopiedPython] = useState(false);
  const [copiedReqs, setCopiedReqs] = useState(false);
  const [activePythonTab, setActivePythonTab] = useState<'script' | 'reqs' | 'setup'>('script');

  // Calculator helpers
  const handleCalcDigit = (digit: string) => {
    if (calcDisplay === '0' || calcResetOnNext) {
      setCalcDisplay(digit);
      setCalcResetOnNext(false);
    } else {
      setCalcDisplay((prev) => prev + digit);
    }
  };

  const handleCalcOp = (op: string) => {
    setCalcPrev(parseFloat(calcDisplay));
    setCalcOp(op);
    setCalcResetOnNext(true);
  };

  const handleCalcEquals = () => {
    if (calcOp && calcPrev !== null) {
      const current = parseFloat(calcDisplay);
      let result = 0;
      switch (calcOp) {
        case '+':
          result = calcPrev + current;
          break;
        case '-':
          result = calcPrev - current;
          break;
        case '×':
          result = calcPrev * current;
          break;
        case '÷':
          result = current !== 0 ? calcPrev / current : 0;
          break;
      }
      setCalcDisplay(String(Number(result.toFixed(6))));
      setCalcPrev(null);
      setCalcOp(null);
      setCalcResetOnNext(true);
    }
  };

  const handleCalcClear = () => {
    setCalcDisplay('0');
    setCalcPrev(null);
    setCalcOp(null);
  };

  const downloadFile = (content: string, filename: string, type: string) => {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <>
      {/* 1. NOTEPAD MODAL */}
      {isNotepadOpen && (
        <div className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-700 rounded-xl shadow-2xl overflow-hidden flex flex-col h-[480px]">
            {/* Window Bar */}
            <div className="bg-slate-950 px-4 py-2.5 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-amber-400" />
                <span className="text-xs font-mono font-bold text-slate-200">
                  Notepad / Workstation Scratchpad
                </span>
              </div>
              <button
                onClick={onCloseNotepad}
                className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Toolbar */}
            <div className="bg-slate-900/90 px-3 py-1.5 border-b border-slate-800 flex items-center justify-between text-xs font-mono">
              <span className="text-slate-400">
                {notepadText.split(/\s+/).filter(Boolean).length} words • {notepadText.length} chars
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(notepadText);
                    setCopiedNotepad(true);
                    setTimeout(() => setCopiedNotepad(false), 2000);
                  }}
                  className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center gap-1 text-[11px]"
                >
                  {copiedNotepad ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedNotepad ? 'Copied' : 'Copy'}</span>
                </button>
                <button
                  onClick={() => downloadFile(notepadText, 'ultron_notes.txt', 'text/plain')}
                  className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center gap-1 text-[11px]"
                >
                  <Download className="w-3 h-3" />
                  <span>Export</span>
                </button>
                <button
                  onClick={() => setNotepadText('')}
                  className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-rose-400 text-[11px]"
                >
                  Clear
                </button>
              </div>
            </div>

            {/* Editor Area */}
            <textarea
              value={notepadText}
              onChange={(e) => setNotepadText(e.target.value)}
              className="flex-1 w-full bg-slate-950 p-4 text-xs font-mono text-slate-200 resize-none focus:outline-none placeholder:text-slate-600 leading-relaxed"
              placeholder="Type your notes or system records here..."
            />
          </div>
        </div>
      )}

      {/* 2. CALCULATOR MODAL */}
      {isCalculatorOpen && (
        <div className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-xs bg-slate-900 border border-slate-700 rounded-xl shadow-2xl overflow-hidden flex flex-col">
            {/* Window Bar */}
            <div className="bg-slate-950 px-4 py-2.5 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CalcIcon className="w-4 h-4 text-violet-400" />
                <span className="text-xs font-mono font-bold text-slate-200">
                  Calculator Subsystem
                </span>
              </div>
              <button
                onClick={onCloseCalculator}
                className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Display Screen */}
            <div className="bg-slate-950 p-4 border-b border-slate-800 text-right">
              <div className="text-[10px] font-mono text-slate-400 h-4">
                {calcPrev !== null ? `${calcPrev} ${calcOp || ''}` : ''}
              </div>
              <div className="text-2xl font-mono font-bold text-cyan-400 tracking-wider truncate">
                {calcDisplay}
              </div>
            </div>

            {/* Keypad */}
            <div className="p-3 grid grid-cols-4 gap-2 font-mono text-sm">
              <button
                onClick={handleCalcClear}
                className="p-2.5 rounded bg-rose-950/40 text-rose-300 border border-rose-800/40 hover:bg-rose-900/50"
              >
                C
              </button>
              <button
                onClick={() => setCalcDisplay(String(-parseFloat(calcDisplay)))}
                className="p-2.5 rounded bg-slate-800 text-slate-300 hover:bg-slate-700"
              >
                ±
              </button>
              <button
                onClick={() => setCalcDisplay(String(parseFloat(calcDisplay) / 100))}
                className="p-2.5 rounded bg-slate-800 text-slate-300 hover:bg-slate-700"
              >
                %
              </button>
              <button
                onClick={() => handleCalcOp('÷')}
                className="p-2.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800/50 hover:bg-cyan-900"
              >
                ÷
              </button>

              {['7', '8', '9'].map((n) => (
                <button
                  key={n}
                  onClick={() => handleCalcDigit(n)}
                  className="p-2.5 rounded bg-slate-800/90 text-slate-200 hover:bg-slate-700 font-semibold"
                >
                  {n}
                </button>
              ))}
              <button
                onClick={() => handleCalcOp('×')}
                className="p-2.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800/50 hover:bg-cyan-900"
              >
                ×
              </button>

              {['4', '5', '6'].map((n) => (
                <button
                  key={n}
                  onClick={() => handleCalcDigit(n)}
                  className="p-2.5 rounded bg-slate-800/90 text-slate-200 hover:bg-slate-700 font-semibold"
                >
                  {n}
                </button>
              ))}
              <button
                onClick={() => handleCalcOp('-')}
                className="p-2.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800/50 hover:bg-cyan-900"
              >
                -
              </button>

              {['1', '2', '3'].map((n) => (
                <button
                  key={n}
                  onClick={() => handleCalcDigit(n)}
                  className="p-2.5 rounded bg-slate-800/90 text-slate-200 hover:bg-slate-700 font-semibold"
                >
                  {n}
                </button>
              ))}
              <button
                onClick={() => handleCalcOp('+')}
                className="p-2.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800/50 hover:bg-cyan-900"
              >
                +
              </button>

              <button
                onClick={() => handleCalcDigit('0')}
                className="col-span-2 p-2.5 rounded bg-slate-800/90 text-slate-200 hover:bg-slate-700 font-semibold"
              >
                0
              </button>
              <button
                onClick={() => {
                  if (!calcDisplay.includes('.')) handleCalcDigit('.');
                }}
                className="p-2.5 rounded bg-slate-800/90 text-slate-200 hover:bg-slate-700"
              >
                .
              </button>
              <button
                onClick={handleCalcEquals}
                className="p-2.5 rounded bg-cyan-500 text-slate-950 font-bold hover:bg-cyan-400 shadow-[0_0_10px_rgba(6,182,212,0.4)]"
              >
                =
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. PYTHON COMPANION SCRIPT & PYCHARM SETUP MODAL */}
      {isPythonModalOpen && (
        <div className="fixed inset-0 z-40 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-3xl bg-slate-900 border border-slate-700 rounded-xl shadow-2xl overflow-hidden flex flex-col h-[580px]">
            {/* Window Bar */}
            <div className="bg-slate-950 px-4 py-3 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Code className="w-4 h-4 text-cyan-400" />
                <span className="text-xs font-mono font-bold text-slate-100 uppercase tracking-wider">
                  ULTRON V.2 • Python Native PC Companion (PyCharm / VS Code)
                </span>
              </div>
              <button
                onClick={onClosePythonModal}
                className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Navigation Tabs */}
            <div className="bg-slate-950/60 px-4 border-b border-slate-800 flex items-center justify-between text-xs font-mono">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setActivePythonTab('script')}
                  className={`py-2 px-3 border-b-2 font-medium transition-colors ${
                    activePythonTab === 'script'
                      ? 'border-cyan-400 text-cyan-400'
                      : 'border-transparent text-slate-400 hover:text-slate-200'
                  }`}
                >
                  ultron_v2.py
                </button>
                <button
                  onClick={() => setActivePythonTab('reqs')}
                  className={`py-2 px-3 border-b-2 font-medium transition-colors ${
                    activePythonTab === 'reqs'
                      ? 'border-cyan-400 text-cyan-400'
                      : 'border-transparent text-slate-400 hover:text-slate-200'
                  }`}
                >
                  requirements.txt
                </button>
                <button
                  onClick={() => setActivePythonTab('setup')}
                  className={`py-2 px-3 border-b-2 font-medium transition-colors ${
                    activePythonTab === 'setup'
                      ? 'border-cyan-400 text-cyan-400'
                      : 'border-transparent text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Quick Setup Guide
                </button>
              </div>

              <div className="flex items-center gap-2">
                {activePythonTab === 'script' && (
                  <>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(ULTRON_PYTHON_V2_SCRIPT);
                        setCopiedPython(true);
                        setTimeout(() => setCopiedPython(false), 2000);
                      }}
                      className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center gap-1.5 text-[11px]"
                    >
                      {copiedPython ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedPython ? 'Copied' : 'Copy .py'}</span>
                    </button>
                    <button
                      onClick={() =>
                        downloadFile(ULTRON_PYTHON_V2_SCRIPT, 'ultron_v2.py', 'text/x-python')
                      }
                      className="px-2.5 py-1 rounded bg-cyan-600 hover:bg-cyan-500 text-white flex items-center gap-1.5 text-[11px]"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download .py</span>
                    </button>
                  </>
                )}
                {activePythonTab === 'reqs' && (
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(ULTRON_REQUIREMENTS_TXT);
                      setCopiedReqs(true);
                      setTimeout(() => setCopiedReqs(false), 2000);
                    }}
                    className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center gap-1.5 text-[11px]"
                  >
                    {copiedReqs ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedReqs ? 'Copied' : 'Copy'}</span>
                  </button>
                )}
              </div>
            </div>

            {/* Tab Contents */}
            <div className="flex-1 overflow-y-auto p-4 font-mono text-xs text-slate-300 bg-slate-950">
              {activePythonTab === 'script' && (
                <pre className="whitespace-pre overflow-x-auto text-[11px] leading-relaxed text-slate-200">
                  {ULTRON_PYTHON_V2_SCRIPT}
                </pre>
              )}

              {activePythonTab === 'reqs' && (
                <div>
                  <p className="text-slate-400 mb-3 text-xs">
                    Install these dependencies in your Python 3.9+ environment or PyCharm Terminal:
                  </p>
                  <pre className="bg-slate-900 p-3 rounded border border-slate-800 text-cyan-300 text-xs leading-loose">
                    {ULTRON_REQUIREMENTS_TXT}
                  </pre>
                </div>
              )}

              {activePythonTab === 'setup' && (
                <div className="space-y-4 text-xs font-sans text-slate-300">
                  <div className="bg-slate-900 p-3.5 rounded-lg border border-slate-800">
                    <h4 className="font-mono font-bold text-cyan-400 mb-1.5 flex items-center gap-2">
                      <Terminal className="w-4 h-4" /> Step 1: Open Terminal in PyCharm or VS Code
                    </h4>
                    <p className="text-slate-400 mb-2">
                      Open your project folder in PyCharm or any terminal and create your virtual environment:
                    </p>
                    <code className="block bg-slate-950 p-2 rounded text-emerald-400 font-mono text-[11px]">
                      python -m venv venv<br />
                      # On Windows: venv\Scripts\activate<br />
                      # On Mac/Linux: source venv/bin/activate
                    </code>
                  </div>

                  <div className="bg-slate-900 p-3.5 rounded-lg border border-slate-800">
                    <h4 className="font-mono font-bold text-cyan-400 mb-1.5 flex items-center gap-2">
                      <Download className="w-4 h-4" /> Step 2: Install Required Libraries
                    </h4>
                    <code className="block bg-slate-950 p-2 rounded text-emerald-400 font-mono text-[11px]">
                      pip install psutil pyautogui SpeechRecognition PyAudio gTTS pygame pyttsx3 google-genai python-dotenv
                    </code>
                  </div>

                  <div className="bg-slate-900 p-3.5 rounded-lg border border-slate-800">
                    <h4 className="font-mono font-bold text-cyan-400 mb-1.5 flex items-center gap-2">
                      <Code className="w-4 h-4" /> Step 3: Run ULTRON V.2
                    </h4>
                    <code className="block bg-slate-950 p-2 rounded text-emerald-400 font-mono text-[11px]">
                      python ultron_v2.py
                    </code>
                    <p className="text-slate-400 mt-2 text-[11px]">
                      ULTRON will greet you with synthesized voice audio and begin listening for speech commands across English, Hindi, Chinese, Russian, Japanese, and Spanish!
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 4. SCREENSHOT PREVIEW MODAL */}
      {screenshotUrl && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-2xl bg-slate-900 border border-cyan-500/50 rounded-xl shadow-[0_0_50px_rgba(6,182,212,0.3)] overflow-hidden flex flex-col">
            <div className="bg-slate-950 px-4 py-2.5 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-cyan-400" />
                <span className="text-xs font-mono font-bold text-slate-100">
                  Workstation Screenshot Captured
                </span>
              </div>
              <button
                onClick={onCloseScreenshot}
                className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 flex flex-col items-center gap-3">
              <div className="max-h-[360px] overflow-hidden rounded-lg border border-slate-800 shadow-inner">
                <img
                  src={screenshotUrl}
                  alt="Workstation capture"
                  className="max-w-full h-auto object-contain rounded"
                />
              </div>

              <div className="w-full flex items-center justify-between text-xs font-mono pt-2 border-t border-slate-800">
                <span className="text-slate-400">
                  Saved to browser downloads as PNG
                </span>
                <div className="flex items-center gap-2">
                  <a
                    href={screenshotUrl}
                    download={`ULTRON_V2_screenshot_${Date.now()}.png`}
                    className="px-3 py-1.5 rounded bg-cyan-600 hover:bg-cyan-500 text-white flex items-center gap-1.5 text-xs transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download File</span>
                  </a>
                  <button
                    onClick={onCloseScreenshot}
                    className="px-3 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
