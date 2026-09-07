import React from 'react';
import { Cpu, HardDrive, Battery, BatteryCharging, Wifi, Activity, Volume2, RefreshCw } from 'lucide-react';
import { TelemetryData } from '../types';

interface TelemetryHUDProps {
  telemetry: TelemetryData;
  onRefresh: () => void;
  onSpeakTelemetry: () => void;
  isSpeaking: boolean;
}

export const TelemetryHUD: React.FC<TelemetryHUDProps> = ({
  telemetry,
  onRefresh,
  onSpeakTelemetry,
  isSpeaking,
}) => {
  // Metric color helper
  const getMetricColor = (val: number) => {
    if (val < 50) return 'text-emerald-400 border-emerald-500/30 bg-emerald-950/20';
    if (val < 80) return 'text-amber-400 border-amber-500/30 bg-amber-950/20';
    return 'text-rose-400 border-rose-500/30 bg-rose-950/20';
  };

  const getBarColor = (val: number) => {
    if (val < 50) return 'bg-emerald-400';
    if (val < 80) return 'bg-amber-400';
    return 'bg-rose-500';
  };

  return (
    <div
      id="telemetry-hud-card"
      className="bg-slate-900/85 backdrop-blur-md rounded-xl border border-slate-800 p-4 shadow-xl flex flex-col justify-between"
    >
      {/* Header with Title and Quick Actions */}
      <div className="flex items-center justify-between border-b border-slate-800/80 pb-3 mb-3">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-cyan-400 animate-pulse" />
          <h2 className="text-xs font-mono font-bold tracking-widest text-slate-200 uppercase">
            PC Telemetry Diagnostics
          </h2>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            id="speak-telemetry-btn"
            onClick={onSpeakTelemetry}
            className={`px-2 py-1 text-[10px] font-mono rounded flex items-center gap-1 transition-all border ${
              isSpeaking
                ? 'bg-emerald-900/40 text-emerald-300 border-emerald-500/50'
                : 'bg-slate-800/80 text-slate-300 border-slate-700/60 hover:bg-slate-700'
            }`}
            title="Speak system status report via Ultron voice"
          >
            <Volume2 className="w-3 h-3" />
            <span>Voice Report</span>
          </button>
          <button
            id="refresh-telemetry-btn"
            onClick={onRefresh}
            className="p-1 rounded text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
            title="Refresh diagnostics"
          >
            <RefreshCw className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Grid of Key Gauges */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
        {/* CPU Gauge */}
        <div className="bg-slate-950/60 rounded-lg p-2.5 border border-slate-800/70 flex flex-col justify-between">
          <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 mb-1">
            <span className="flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5 text-cyan-400" />
              CPU Load
            </span>
            <span className="font-bold text-slate-200">{telemetry.cpu}%</span>
          </div>
          <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden mb-1.5">
            <div
              className={`h-full transition-all duration-500 rounded-full ${getBarColor(telemetry.cpu)}`}
              style={{ width: `${Math.min(100, Math.max(5, telemetry.cpu))}%` }}
            />
          </div>
          <span className="text-[10px] font-mono text-slate-400 truncate">
            {telemetry.cpuCores} Cores ({telemetry.platform})
          </span>
        </div>

        {/* RAM Gauge */}
        <div className="bg-slate-950/60 rounded-lg p-2.5 border border-slate-800/70 flex flex-col justify-between">
          <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 mb-1">
            <span className="flex items-center gap-1.5">
              <HardDrive className="w-3.5 h-3.5 text-cyan-400" />
              RAM Usage
            </span>
            <span className="font-bold text-slate-200">{telemetry.ram}%</span>
          </div>
          <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden mb-1.5">
            <div
              className={`h-full transition-all duration-500 rounded-full ${getBarColor(telemetry.ram)}`}
              style={{ width: `${Math.min(100, Math.max(5, telemetry.ram))}%` }}
            />
          </div>
          <span className="text-[10px] font-mono text-slate-400 truncate">
            {telemetry.totalMemoryGB} GB Total
          </span>
        </div>

        {/* Battery / Power Gauge */}
        <div className="bg-slate-950/60 rounded-lg p-2.5 border border-slate-800/70 flex flex-col justify-between col-span-2 sm:col-span-1">
          <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 mb-1">
            <span className="flex items-center gap-1.5">
              {telemetry.isCharging ? (
                <BatteryCharging className="w-3.5 h-3.5 text-emerald-400" />
              ) : (
                <Battery className="w-3.5 h-3.5 text-cyan-400" />
              )}
              Power / Batt
            </span>
            <span className="font-bold text-slate-200">{telemetry.battery}%</span>
          </div>
          <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden mb-1.5">
            <div
              className={`h-full transition-all duration-500 rounded-full ${getBarColor(
                100 - telemetry.battery
              )}`}
              style={{ width: `${telemetry.battery}%` }}
            />
          </div>
          <span className="text-[10px] font-mono text-slate-400">
            {telemetry.isCharging ? '⚡ Direct AC / Charging' : '🔋 Discharging'}
          </span>
        </div>
      </div>

      {/* Host Telemetry Bar */}
      <div className="mt-3 pt-2.5 border-t border-slate-800/60 flex flex-wrap items-center justify-between gap-2 text-[10px] font-mono text-slate-400">
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1 text-slate-300">
            <Wifi className="w-3 h-3 text-cyan-400" />
            Ping: <strong className="text-slate-100">{telemetry.networkLatencyMs}ms</strong>
          </span>
          <span className="text-slate-600">•</span>
          <span className="truncate max-w-[130px] sm:max-w-none text-slate-300">
            Uptime: {Math.floor(telemetry.uptimeSeconds / 3600)}h {Math.floor((telemetry.uptimeSeconds % 3600) / 60)}m
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="px-1.5 py-0.5 rounded bg-slate-800 text-cyan-300 border border-slate-700/60">
            psutil ONLINE
          </span>
          <span className="px-1.5 py-0.5 rounded bg-slate-800 text-emerald-300 border border-slate-700/60">
            HEALTHY
          </span>
        </div>
      </div>
    </div>
  );
};
