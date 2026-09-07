export type SupportedLang = 'en' | 'hi' | 'zh' | 'ru' | 'ja' | 'es' | 'de' | 'fr';

export interface LanguageInfo {
  code: SupportedLang;
  speechCode: string;
  name: string;
  nativeName: string;
  flag: string;
  wakeWordSample: string;
}

export interface TelemetryData {
  cpu: number;
  ram: number;
  battery: number;
  isCharging: boolean;
  totalMemoryGB: string;
  freeMemoryGB: string;
  uptimeSeconds: number;
  platform: string;
  cpuModel: string;
  cpuCores: number;
  networkLatencyMs: number;
}

export type UltronStatus = 'idle' | 'listening' | 'thinking' | 'speaking' | 'locked';

export interface AssistantMessage {
  id: string;
  sender: 'user' | 'ultron' | 'system';
  text: string;
  timestamp: string;
  lang?: SupportedLang;
  action?: string;
  actionPayload?: any;
}

export interface AppLauncherItem {
  id: string;
  name: string;
  description: string;
  category: 'system' | 'web' | 'media' | 'dev';
  icon: string;
  url?: string;
  type: 'external' | 'in_app' | 'action';
}
