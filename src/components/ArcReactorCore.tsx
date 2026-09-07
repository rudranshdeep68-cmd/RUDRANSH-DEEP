import React, { useMemo } from 'react';
import { motion } from 'motion/react';
import { Mic, MicOff, Volume2, Cpu, ShieldAlert, Sparkles } from 'lucide-react';
import { UltronStatus } from '../types';

interface ArcReactorCoreProps {
  status: UltronStatus;
  isListening: boolean;
  onToggleMic: () => void;
  langCode: string;
}

export const ArcReactorCore: React.FC<ArcReactorCoreProps> = ({
  status,
  isListening,
  onToggleMic,
  langCode,
}) => {
  // Generate outer tick coordinates
  const ticks = useMemo(() => {
    return Array.from({ length: 36 }).map((_, i) => {
      const angle = (i * 10 * Math.PI) / 180;
      const r1 = 88;
      const r2 = i % 3 === 0 ? 76 : 82;
      return {
        x1: 100 + r1 * Math.cos(angle),
        y1: 100 + r1 * Math.sin(angle),
        x2: 100 + r2 * Math.cos(angle),
        y2: 100 + r2 * Math.sin(angle),
        isMajor: i % 3 === 0,
      };
    });
  }, []);

  // Status configuration
  const statusConfig = {
    idle: {
      label: 'STANDBY',
      subtext: 'Neural Core Online',
      color: 'from-cyan-500 to-blue-600',
      glow: 'shadow-[0_0_35px_rgba(6,182,212,0.35)]',
      textColor: 'text-cyan-400',
      borderColor: 'border-cyan-500/30',
      ringColor: 'stroke-cyan-500',
    },
    listening: {
      label: 'LISTENING',
      subtext: 'Awaiting Voice Input',
      color: 'from-amber-400 to-orange-500',
      glow: 'shadow-[0_0_45px_rgba(245,158,11,0.5)]',
      textColor: 'text-amber-400',
      borderColor: 'border-amber-500/50',
      ringColor: 'stroke-amber-400',
    },
    thinking: {
      label: 'PROCESSING',
      subtext: 'Gemini Neural Net',
      color: 'from-violet-500 to-fuchsia-600',
      glow: 'shadow-[0_0_40px_rgba(168,85,247,0.4)]',
      textColor: 'text-violet-400',
      borderColor: 'border-violet-500/40',
      ringColor: 'stroke-violet-400',
    },
    speaking: {
      label: 'SYNTHESIZING',
      subtext: 'Multilingual Audio',
      color: 'from-emerald-400 to-teal-500',
      glow: 'shadow-[0_0_45px_rgba(16,185,129,0.45)]',
      textColor: 'text-emerald-400',
      borderColor: 'border-emerald-500/40',
      ringColor: 'stroke-emerald-400',
    },
    locked: {
      label: 'WORKSTATION LOCKED',
      subtext: 'Security Protocol Engaged',
      color: 'from-rose-500 to-red-700',
      glow: 'shadow-[0_0_50px_rgba(239,68,68,0.5)]',
      textColor: 'text-rose-400',
      borderColor: 'border-rose-500/50',
      ringColor: 'stroke-rose-500',
    },
  }[status] || {
    label: 'ONLINE',
    subtext: 'Ultron Core',
    color: 'from-cyan-500 to-blue-600',
    glow: 'shadow-[0_0_35px_rgba(6,182,212,0.35)]',
    textColor: 'text-cyan-400',
    borderColor: 'border-cyan-500/30',
    ringColor: 'stroke-cyan-500',
  };

  return (
    <div id="arc-reactor-container" className="flex flex-col items-center justify-center p-4">
      {/* Reactor SVG & Core */}
      <div className="relative w-56 h-56 sm:w-64 sm:h-64 flex items-center justify-center">
        {/* Background Ambient Glow */}
        <div
          className={`absolute inset-4 rounded-full bg-gradient-to-tr ${statusConfig.color} opacity-15 blur-2xl transition-all duration-700`}
        />

        {/* Rotating Outer Tech Ring */}
        <motion.svg
          className="absolute inset-0 w-full h-full pointer-events-none"
          viewBox="0 0 200 200"
          animate={{ rotate: status === 'thinking' ? 360 : 180 }}
          transition={{
            repeat: Infinity,
            duration: status === 'thinking' ? 4 : 28,
            ease: 'linear',
          }}
        >
          {ticks.map((t, i) => (
            <line
              key={i}
              x1={t.x1}
              y1={t.y1}
              x2={t.x2}
              y2={t.y2}
              stroke="currentColor"
              strokeWidth={t.isMajor ? 2.5 : 1}
              className={t.isMajor ? statusConfig.textColor : 'text-slate-600/70'}
            />
          ))}
          <circle
            cx="100"
            cy="100"
            r="94"
            fill="none"
            stroke="currentColor"
            strokeWidth="1"
            strokeDasharray="4 6"
            className="text-slate-700/60"
          />
        </motion.svg>

        {/* Counter-Rotating Segment Ring */}
        <motion.svg
          className="absolute inset-0 w-full h-full pointer-events-none"
          viewBox="0 0 200 200"
          animate={{ rotate: -360 }}
          transition={{
            repeat: Infinity,
            duration: status === 'speaking' ? 8 : 36,
            ease: 'linear',
          }}
        >
          <circle
            cx="100"
            cy="100"
            r="70"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeDasharray="18 12"
            className={statusConfig.textColor}
            opacity="0.6"
          />
        </motion.svg>

        {/* Pulsing Energy Waves when Listening or Speaking */}
        {(status === 'listening' || status === 'speaking') && (
          <motion.div
            className={`absolute inset-6 rounded-full border-2 ${statusConfig.borderColor}`}
            initial={{ scale: 0.9, opacity: 0.8 }}
            animate={{ scale: 1.25, opacity: 0 }}
            transition={{ repeat: Infinity, duration: 1.4, ease: 'easeOut' }}
          />
        )}

        {/* Central Core Interactive Button */}
        <motion.button
          id="ultron-core-button"
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.95 }}
          onClick={onToggleMic}
          className={`relative z-10 w-32 h-32 sm:w-36 sm:h-36 rounded-full bg-slate-950/95 border-2 ${statusConfig.borderColor} ${statusConfig.glow} flex flex-col items-center justify-center p-2 text-center transition-all duration-500 cursor-pointer group`}
          title={isListening ? 'Click to stop listening' : 'Click to speak or say "Ultron"'}
        >
          {/* Internal Geometric Core Accent */}
          <div className="absolute inset-2 rounded-full border border-slate-800/80 pointer-events-none" />

          {/* Central Animated Icon */}
          <div className="relative mb-1">
            {status === 'listening' ? (
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ repeat: Infinity, duration: 0.9 }}
              >
                <Mic className="w-8 h-8 text-amber-400" />
              </motion.div>
            ) : status === 'speaking' ? (
              <motion.div
                animate={{ scale: [1, 1.15, 1] }}
                transition={{ repeat: Infinity, duration: 0.6 }}
              >
                <Volume2 className="w-8 h-8 text-emerald-400" />
              </motion.div>
            ) : status === 'thinking' ? (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 1.8, ease: 'linear' }}
              >
                <Sparkles className="w-8 h-8 text-violet-400" />
              </motion.div>
            ) : status === 'locked' ? (
              <ShieldAlert className="w-8 h-8 text-rose-500" />
            ) : (
              <Cpu className="w-8 h-8 text-cyan-400 group-hover:text-cyan-300 transition-colors" />
            )}
          </div>

          <span className="text-[11px] font-black tracking-widest text-slate-200">
            ULTRON
          </span>
          <span className={`text-[9px] font-mono tracking-wider font-semibold ${statusConfig.textColor}`}>
            V.2
          </span>
        </motion.button>
      </div>

      {/* Dynamic Status Readout */}
      <div className="mt-3 flex flex-col items-center text-center">
        <div className="flex items-center gap-2">
          <span
            className={`inline-block w-2 h-2 rounded-full ${
              status === 'listening'
                ? 'bg-amber-400 animate-ping'
                : status === 'speaking'
                ? 'bg-emerald-400 animate-pulse'
                : status === 'thinking'
                ? 'bg-violet-400 animate-pulse'
                : status === 'locked'
                ? 'bg-rose-500'
                : 'bg-cyan-400'
            }`}
          />
          <span className={`text-xs font-mono font-bold tracking-widest ${statusConfig.textColor}`}>
            {statusConfig.label}
          </span>
          <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-slate-800/90 text-slate-400 border border-slate-700/60">
            {langCode}
          </span>
        </div>
        <p className="text-[11px] text-slate-400 mt-0.5 tracking-wide">
          {statusConfig.subtext}
        </p>
      </div>
    </div>
  );
};
