import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ShieldAlert, KeyRound, Unlock, AlertTriangle } from 'lucide-react';
import { soundFX } from '../utils/audioSynth';

interface LockScreenOverlayProps {
  isLocked: boolean;
  onUnlock: () => void;
}

export const LockScreenOverlay: React.FC<LockScreenOverlayProps> = ({
  isLocked,
  onUnlock,
}) => {
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);

  if (!isLocked) return null;

  const handleKeyPress = (num: string) => {
    if (pin.length < 4) {
      soundFX.tick();
      setPin((prev) => prev + num);
      setError(false);
    }
  };

  const handleClear = () => {
    soundFX.tick();
    setPin('');
    setError(false);
  };

  const handleAttemptUnlock = () => {
    // Standard PIN 1234 or empty override
    if (pin === '1234' || pin === '0000' || pin === '') {
      soundFX.acknowledge();
      setPin('');
      setError(false);
      onUnlock();
    } else {
      soundFX.lock();
      setError(true);
      setPin('');
    }
  };

  return (
    <motion.div
      id="workstation-lock-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-slate-950/95 backdrop-blur-xl flex flex-col items-center justify-center p-4 select-none"
    >
      {/* Background Matrix Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b15_1px,transparent_1px),linear-gradient(to_bottom,#1e293b15_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none" />

      <div className="relative z-10 w-full max-w-sm bg-slate-900/90 border border-rose-500/40 rounded-2xl p-6 shadow-[0_0_60px_rgba(225,29,72,0.25)] flex flex-col items-center text-center">
        {/* Lock Icon */}
        <div className="w-16 h-16 rounded-full bg-rose-950/80 border-2 border-rose-500/50 flex items-center justify-center mb-4 text-rose-500 shadow-[0_0_25px_rgba(244,63,94,0.4)]">
          <ShieldAlert className="w-8 h-8 animate-pulse" />
        </div>

        <h1 className="text-base font-mono font-bold tracking-widest text-slate-100 uppercase">
          Workstation Locked
        </h1>
        <p className="text-xs font-mono text-rose-400 mt-1 mb-5">
          [ULTRON V.2 SECURITY PROTOCOL ENGAGED]
        </p>

        {/* PIN Display */}
        <div className="flex items-center gap-3 mb-4">
          {[0, 1, 2, 3].map((idx) => (
            <div
              key={idx}
              className={`w-3.5 h-3.5 rounded-full border transition-all ${
                pin.length > idx
                  ? 'bg-rose-500 border-rose-400 shadow-[0_0_8px_rgba(244,63,94,0.8)]'
                  : 'bg-slate-800 border-slate-700'
              }`}
            />
          ))}
        </div>

        {error && (
          <div className="flex items-center gap-1.5 text-[11px] font-mono text-rose-400 mb-3 animate-shake">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Invalid Passcode. Enter 1234 or Bypass.</span>
          </div>
        )}

        {/* Numeric Keypad */}
        <div className="grid grid-cols-3 gap-2.5 w-full mb-4">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
            <button
              key={digit}
              onClick={() => handleKeyPress(digit)}
              className="py-3 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-200 font-mono text-sm font-semibold border border-slate-700/60 active:scale-95 transition-all"
            >
              {digit}
            </button>
          ))}
          <button
            onClick={handleClear}
            className="py-3 rounded-lg bg-slate-800/40 hover:bg-slate-800 text-slate-400 font-mono text-xs border border-slate-700/40 active:scale-95 transition-all"
          >
            CLR
          </button>
          <button
            onClick={() => handleKeyPress('0')}
            className="py-3 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-200 font-mono text-sm font-semibold border border-slate-700/60 active:scale-95 transition-all"
          >
            0
          </button>
          <button
            onClick={handleAttemptUnlock}
            className="py-3 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-mono text-xs font-bold border border-rose-500 shadow-[0_0_15px_rgba(225,29,72,0.4)] active:scale-95 transition-all flex items-center justify-center"
          >
            <Unlock className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Quick Bypass Button */}
        <button
          onClick={() => {
            soundFX.acknowledge();
            onUnlock();
          }}
          className="text-xs font-mono text-slate-400 hover:text-cyan-400 transition-colors flex items-center gap-1.5"
        >
          <KeyRound className="w-3.5 h-3.5" />
          <span>Biometric / Admin Bypass (Unlock)</span>
        </button>
      </div>
    </motion.div>
  );
};
