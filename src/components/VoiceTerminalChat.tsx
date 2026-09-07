import React, { useRef, useEffect, useState } from 'react';
import {
  Send,
  Mic,
  MicOff,
  Volume2,
  Trash2,
  Terminal,
  Bot,
  User,
  Sparkles,
  CheckCircle2,
  Globe,
} from 'lucide-react';
import { AssistantMessage, SupportedLang } from '../types';
import { QUICK_PROMPTS, SUPPORTED_LANGUAGES } from '../utils/languages';

interface VoiceTerminalChatProps {
  messages: AssistantMessage[];
  isListening: boolean;
  onToggleMic: () => void;
  onSendCommand: (cmd: string) => void;
  onSpeakMessage: (text: string, lang?: SupportedLang) => void;
  onClearMessages: () => void;
  selectedLang: SupportedLang;
  onChangeLang: (lang: SupportedLang) => void;
  interimTranscript: string;
  isProcessing: boolean;
}

export const VoiceTerminalChat: React.FC<VoiceTerminalChatProps> = ({
  messages,
  isListening,
  onToggleMic,
  onSendCommand,
  onSpeakMessage,
  onClearMessages,
  selectedLang,
  onChangeLang,
  interimTranscript,
  isProcessing,
}) => {
  const [inputVal, setInputVal] = useState('');
  const [filterCategory, setFilterCategory] = useState<'all' | 'status' | 'media' | 'system'>('all');
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll on new message
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, interimTranscript]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputVal.trim() || isProcessing) return;
    onSendCommand(inputVal.trim());
    setInputVal('');
  };

  const activeLanguage = SUPPORTED_LANGUAGES.find((l) => l.code === selectedLang) || SUPPORTED_LANGUAGES[0];

  return (
    <div
      id="voice-terminal-chat-container"
      className="bg-slate-900/85 backdrop-blur-md rounded-xl border border-slate-800 p-4 shadow-xl flex flex-col h-[520px] lg:h-[580px]"
    >
      {/* Terminal Header */}
      <div className="flex items-center justify-between border-b border-slate-800/80 pb-3 mb-3">
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-cyan-400" />
          <h2 className="text-xs font-mono font-bold tracking-widest text-slate-200 uppercase">
            Command Terminal & Voice Log
          </h2>
        </div>

        <div className="flex items-center gap-2">
          {/* Language Selector Dropdown */}
          <div className="relative flex items-center">
            <Globe className="w-3.5 h-3.5 text-slate-400 absolute left-2 pointer-events-none" />
            <select
              id="language-select-dropdown"
              value={selectedLang}
              onChange={(e) => onChangeLang(e.target.value as SupportedLang)}
              className="bg-slate-800/90 text-slate-200 text-[11px] font-mono pl-7 pr-2.5 py-1 rounded border border-slate-700/80 focus:outline-none focus:border-cyan-500 cursor-pointer"
            >
              {SUPPORTED_LANGUAGES.map((l) => (
                <option key={l.code} value={l.code}>
                  {l.flag} {l.nativeName}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={onClearMessages}
            className="p-1 rounded text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
            title="Clear terminal log"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Multilingual Quick Command Chips */}
      <div className="mb-2 pb-2 border-b border-slate-800/60 overflow-x-auto flex items-center gap-1.5 scrollbar-none py-1">
        <span className="text-[10px] font-mono text-slate-400 whitespace-nowrap mr-1">
          Quick Prompts:
        </span>
        {QUICK_PROMPTS.map((p) => (
          <button
            key={p.id}
            onClick={() => onSendCommand(p.command)}
            className="text-[10px] font-mono px-2.5 py-1 rounded-full bg-slate-800/80 hover:bg-cyan-950/40 text-slate-300 hover:text-cyan-300 border border-slate-700/60 hover:border-cyan-600/50 whitespace-nowrap transition-all cursor-pointer"
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Scrollable Message Logs */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto pr-2 space-y-3 font-mono text-xs scrollbar-thin scrollbar-thumb-slate-700"
      >
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex flex-col ${
              msg.sender === 'user' ? 'items-end' : 'items-start'
            }`}
          >
            <div className="flex items-center gap-1.5 mb-1 text-[10px] text-slate-400">
              {msg.sender === 'user' ? (
                <>
                  <span>You</span>
                  <User className="w-3 h-3 text-cyan-400" />
                </>
              ) : msg.sender === 'ultron' ? (
                <>
                  <Bot className="w-3 h-3 text-cyan-400" />
                  <span className="font-bold text-cyan-400">ULTRON</span>
                  {msg.lang && (
                    <span className="px-1 py-0.2 rounded bg-slate-800 text-[9px] uppercase border border-slate-700">
                      {msg.lang}
                    </span>
                  )}
                </>
              ) : (
                <span className="text-amber-400">[SYSTEM]</span>
              )}
              <span>•</span>
              <span>{msg.timestamp}</span>
            </div>

            <div
              className={`relative max-w-[90%] rounded-lg p-3 ${
                msg.sender === 'user'
                  ? 'bg-cyan-950/50 border border-cyan-700/40 text-cyan-100'
                  : msg.sender === 'ultron'
                  ? 'bg-slate-950/80 border border-slate-800 text-slate-200'
                  : 'bg-slate-950/40 border border-amber-500/30 text-amber-300'
              }`}
            >
              <p className="whitespace-pre-wrap leading-relaxed">{msg.text}</p>

              {/* Action executed indicator tag */}
              {msg.action && msg.action !== 'none' && (
                <div className="mt-2 pt-1.5 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-cyan-400">
                  <span className="flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                    Executed: <strong className="uppercase">{msg.action}</strong>
                  </span>
                  <button
                    onClick={() => onSpeakMessage(msg.text, msg.lang)}
                    className="flex items-center gap-1 text-slate-400 hover:text-slate-200"
                    title="Speak again"
                  >
                    <Volume2 className="w-3 h-3" />
                    <span>Replay</span>
                  </button>
                </div>
              )}

              {msg.sender === 'ultron' && (!msg.action || msg.action === 'none') && (
                <div className="mt-1.5 flex justify-end">
                  <button
                    onClick={() => onSpeakMessage(msg.text, msg.lang)}
                    className="text-[10px] text-slate-400 hover:text-slate-200 flex items-center gap-1"
                    title="Listen to this response"
                  >
                    <Volume2 className="w-3 h-3" />
                    <span>Speak</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}

        {/* Live Interim Transcript when Listening */}
        {isListening && interimTranscript && (
          <div className="flex flex-col items-end animate-pulse">
            <span className="text-[10px] text-amber-400 font-mono mb-1">
              [Live Transcribing...]
            </span>
            <div className="bg-amber-950/30 border border-amber-500/40 rounded-lg p-2.5 text-amber-200 max-w-[85%]">
              "{interimTranscript}"
            </div>
          </div>
        )}

        {/* Neural Processing Indicator */}
        {isProcessing && (
          <div className="flex items-center gap-2 text-cyan-400 text-xs py-1">
            <Sparkles className="w-4 h-4 animate-spin" />
            <span>Consulting ULTRON neural matrix...</span>
          </div>
        )}
      </div>

      {/* Input Form & Microphone Trigger */}
      <form onSubmit={handleSubmit} className="mt-3 pt-3 border-t border-slate-800/80 flex items-center gap-2">
        <button
          type="button"
          onClick={onToggleMic}
          className={`p-2.5 rounded-lg border transition-all flex items-center justify-center ${
            isListening
              ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.5)] animate-pulse'
              : 'bg-slate-800 text-slate-200 border-slate-700 hover:bg-slate-700'
          }`}
          title={isListening ? 'Stop listening' : `Listen (${activeLanguage.name})`}
        >
          {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4 text-cyan-400" />}
        </button>

        <input
          id="terminal-command-input"
          type="text"
          value={inputVal}
          onChange={(e) => setInputVal(e.target.value)}
          placeholder={`Enter command or speech in ${activeLanguage.name} (e.g. ${activeLanguage.wakeWordSample})...`}
          className="flex-1 bg-slate-950/80 text-slate-100 font-mono text-xs rounded-lg px-3 py-2.5 border border-slate-800 focus:outline-none focus:border-cyan-500/80 placeholder:text-slate-600"
          disabled={isProcessing}
        />

        <button
          type="submit"
          disabled={!inputVal.trim() || isProcessing}
          className="p-2.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 disabled:opacity-40 disabled:hover:bg-cyan-600 text-white font-mono text-xs transition-colors flex items-center justify-center cursor-pointer"
          title="Send command"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};
