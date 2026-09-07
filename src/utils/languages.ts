import { LanguageInfo, SupportedLang } from '../types';

export const SUPPORTED_LANGUAGES: LanguageInfo[] = [
  {
    code: 'en',
    speechCode: 'en-US',
    name: 'English',
    nativeName: 'English (US)',
    flag: '🇺🇸',
    wakeWordSample: '"Hey Ultron, status report"',
  },
  {
    code: 'hi',
    speechCode: 'hi-IN',
    name: 'Hindi',
    nativeName: 'हिन्दी',
    flag: '🇮🇳',
    wakeWordSample: '"अल्ट्रॉन, सिस्टम की क्या स्थिति है?"',
  },
  {
    code: 'zh',
    speechCode: 'zh-CN',
    name: 'Chinese',
    nativeName: '中文 (普通话)',
    flag: '🇨🇳',
    wakeWordSample: '"奥创，检查系统配置"',
  },
  {
    code: 'ru',
    speechCode: 'ru-RU',
    name: 'Russian',
    nativeName: 'Русский',
    flag: '🇷🇺',
    wakeWordSample: '"Альтрон, покажи статус системы"',
  },
  {
    code: 'ja',
    speechCode: 'ja-JP',
    name: 'Japanese',
    nativeName: '日本語',
    flag: '🇯🇵',
    wakeWordSample: '"ウルトロン、現在の時刻は？"',
  },
  {
    code: 'es',
    speechCode: 'es-ES',
    name: 'Spanish',
    nativeName: 'Español',
    flag: '🇪🇸',
    wakeWordSample: '"Ultron, estado del sistema"',
  },
  {
    code: 'de',
    speechCode: 'de-DE',
    name: 'German',
    nativeName: 'Deutsch',
    flag: '🇩🇪',
    wakeWordSample: '"Ultron, wie spät ist es?"',
  },
  {
    code: 'fr',
    speechCode: 'fr-FR',
    name: 'French',
    nativeName: 'Français',
    flag: '🇫🇷',
    wakeWordSample: '"Ultron, capture d\'écran"',
  },
];

export interface QuickPrompt {
  id: string;
  label: string;
  lang: SupportedLang;
  command: string;
  category: 'status' | 'media' | 'system' | 'intelligence';
}

export const QUICK_PROMPTS: QuickPrompt[] = [
  { id: '1', label: '📊 System Specs', lang: 'en', command: 'Report system telemetry and CPU status', category: 'status' },
  { id: '2', label: '📸 Take Screenshot', lang: 'en', command: 'Take a screenshot of the workstation', category: 'system' },
  { id: '3', label: '⏰ Current Time', lang: 'en', command: 'What is the current time and date?', category: 'status' },
  { id: '4', label: '🎵 Open Spotify', lang: 'en', command: 'Open Spotify', category: 'media' },
  { id: '5', label: '🔒 Lock PC', lang: 'en', command: 'Lock PC now', category: 'system' },
  
  // Hindi हिन्दी
  { id: '6', label: '🇮🇳 सिस्टम स्थिति (Status)', lang: 'hi', command: 'सिस्टम की स्थिति और बैटरी बताओ', category: 'status' },
  { id: '7', label: '🇮🇳 क्या समय है? (Time)', lang: 'hi', command: 'अभी का समय और तारीख क्या है?', category: 'status' },
  { id: '8', label: '🇮🇳 यूट्यूब खोलो (YouTube)', lang: 'hi', command: 'यूट्यूब खोलो', category: 'media' },

  // Chinese 中文
  { id: '9', label: '🇨🇳 系统遥测 (Telemetry)', lang: 'zh', command: '显示系统遥测与CPU占用', category: 'status' },
  { id: '10', label: '🇨🇳 打开谷歌 (Google)', lang: 'zh', command: '打开谷歌', category: 'system' },
  { id: '11', label: '🇨🇳 锁屏 (Lock Screen)', lang: 'zh', command: '锁屏', category: 'system' },

  // Russian Русский
  { id: '12', label: '🇷🇺 Статус ПК (PC Status)', lang: 'ru', command: 'Покажи статус системы и процессора', category: 'status' },
  { id: '13', label: '🇷🇺 Снимок экрана (Screenshot)', lang: 'ru', command: 'Сделай скриншот экрана', category: 'system' },

  // Japanese 日本語
  { id: '14', label: '🇯🇵 時間を確認 (Check Time)', lang: 'ja', command: '現在時刻と日付を教えて', category: 'status' },
  { id: '15', label: '🇯🇵 電卓を開く (Calculator)', lang: 'ja', command: '計算機を開いて', category: 'system' },

  // Spanish Español
  { id: '16', label: '🇪🇸 Diagnóstico (Diagnostics)', lang: 'es', command: 'Dame un diagnóstico completo del sistema', category: 'status' },
  { id: '17', label: '🇪🇸 Subir Volumen (Vol Up)', lang: 'es', command: 'Sube el volumen del audio', category: 'media' },
];
