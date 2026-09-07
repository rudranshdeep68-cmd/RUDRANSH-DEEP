export const ULTRON_PYTHON_V2_SCRIPT = `"""
=============================================================================
             🤖 ULTRON V.2 - MULTILINGUAL PC DESKTOP AI ASSISTANT 🤖
=============================================================================
Enhanced Version 2.0 | Optimized for PyCharm, VS Code & Python 3.9+
Cross-Platform: Windows, macOS, Linux
Features:
  - 🎙️ Speech Recognition (Multilingual Google Speech API)
  - 🗣️ Multilingual Voice Output (Hindi, Chinese, Russian, Japanese, Spanish, etc.)
  - 💻 Full PC Control (Apps, websites, volume, screenshots, lock PC)
  - 📊 Real-time Hardware Telemetry (psutil CPU, RAM, Battery)
  - 🧠 Google Gemini 3.8 / 2.5 Flash Neural Reasoning (@google/genai)
  - 🌐 Live Web Retrieval and System Diagnostic Logging
=============================================================================
"""

import os
import sys
import time
import datetime
import webbrowser
import subprocess
import threading
import platform

# 1. System Automation & Diagnostics
try:
    import psutil
    import pyautogui
except ImportError:
    print("⚠️ Missing psutil or pyautogui. Run: pip install psutil pyautogui")

# 2. Voice Input / Speech Recognition
try:
    import speech_recognition as sr
except ImportError:
    print("⚠️ Missing speech_recognition. Run: pip install SpeechRecognition PyAudio")

# 3. Multilingual Text-To-Speech (gTTS + Pygame or pyttsx3)
try:
    from gtts import gTTS
    import pygame
    pygame.mixer.init()
    HAS_GTTS = True
except ImportError:
    HAS_GTTS = False

try:
    import pyttsx3
    offline_engine = pyttsx3.init()
    offline_engine.setProperty('rate', 175)
    offline_engine.setProperty('volume', 1.0)
    HAS_PYTTSX3 = True
except Exception:
    HAS_PYTTSX3 = False

# 4. Gemini AI Brain
try:
    from google import genai
    from dotenv import load_dotenv
    load_dotenv()

    GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
    if GEMINI_API_KEY:
        ai_client = genai.Client(api_key=GEMINI_API_KEY)
        HAS_GEMINI = True
    else:
        ai_client = None
        HAS_GEMINI = False
except Exception:
    HAS_GEMINI = False

# =============================================================================
# ⚙️ CONFIGURATION SETTINGS
# =============================================================================
AI_NAME = "ULTRON V.2"
WAKE_WORDS = ["ultron", "hey ultron", "अल्ट्रॉन", "奥创", "альтрон"]
DEFAULT_LANG = "en"  # 'en', 'hi', 'zh', 'ru', 'ja', 'es'
CURRENT_OS = platform.system().lower()

# =============================================================================
# 🗣️ MULTILINGUAL VOICE SYNTHESIZER
# =============================================================================
def speak(text: str, lang: str = "en"):
    print(f"\\n🤖 [{AI_NAME}]: {text}")
    lang_map = {
        'en': 'en', 'hi': 'hi', 'zh': 'zh-CN',
        'ru': 'ru', 'ja': 'ja', 'es': 'es',
        'de': 'de', 'fr': 'fr'
    }
    target_lang = lang_map.get(lang.lower(), 'en')

    # Character auto-detection
    if any('\\u0900' <= char <= '\\u097F' for char in text):
        target_lang = 'hi'
    elif any('\\u4e00' <= char <= '\\u9fa5' for char in text):
        target_lang = 'zh-CN'
    elif any('\\u0400' <= char <= '\\u04FF' for char in text):
        target_lang = 'ru'
    elif any('\\u3040' <= char <= '\\u30ff' for char in text):
        target_lang = 'ja'

    if HAS_GTTS:
        try:
            temp_file = "temp_ultron_voice.mp3"
            tts = gTTS(text=text, lang=target_lang, slow=False)
            tts.save(temp_file)

            pygame.mixer.music.load(temp_file)
            pygame.mixer.music.play()
            while pygame.mixer.music.get_busy():
                pygame.time.Clock().tick(10)

            pygame.mixer.music.unload()
            if os.path.exists(temp_file):
                try:
                    os.remove(temp_file)
                except Exception:
                    pass
            return
        except Exception:
            pass

    if HAS_PYTTSX3:
        try:
            offline_engine.say(text)
            offline_engine.runAndWait()
        except Exception as e:
            print(f"(Speech synthesis error: {e})")

# =============================================================================
# 🎙️ SPEECH RECOGNITION
# =============================================================================
def listen_command(language_code: str = "en-US") -> str:
    recognizer = sr.Recognizer()
    recognizer.dynamic_energy_threshold = True
    recognizer.pause_threshold = 0.8

    with sr.Microphone() as source:
        print(f"\\n🎧 [ULTRON LISTENING] Speak now ({language_code})...")
        try:
            recognizer.adjust_for_ambient_noise(source, duration=0.5)
            audio = recognizer.listen(source, timeout=6, phrase_time_limit=10)
        except sr.WaitTimeoutError:
            return ""
        except Exception as e:
            print(f"Mic error: {e}")
            return ""

    try:
        query = recognizer.recognize_google(audio, language=language_code)
        print(f"🗣️ You said: \\"{query}\\"")
        return query
    except (sr.UnknownValueError, sr.RequestError):
        return ""

# =============================================================================
# 💻 PC CONTROL & AUTOMATION
# =============================================================================
def take_screenshot():
    try:
        desktop_dir = os.path.join(os.path.expanduser("~"), "Desktop")
        timestamp = datetime.datetime.now().strftime("%Y-%m-%d_%H-%M-%S")
        filename = os.path.join(desktop_dir, f"ULTRON_V2_screenshot_{timestamp}.png")
        screenshot = pyautogui.screenshot()
        screenshot.save(filename)
        speak("Screenshot taken and saved to your Desktop, sir.", "en")
        print(f"📸 Saved to: {filename}")
    except Exception as e:
        speak(f"Could not take screenshot: {e}", "en")

def get_system_telemetry() -> str:
    try:
        cpu = psutil.cpu_percent(interval=0.5)
        ram = psutil.virtual_memory().percent
        battery = psutil.sensors_battery()
        bat_status = ""
        if battery:
            plugged = "charging" if battery.power_plugged else "on battery"
            bat_status = f"Battery is at {battery.percent}% ({plugged})."
        else:
            bat_status = "System running on direct AC wall power."
        return f"CPU usage is {cpu}%. RAM utilization is {ram}%. {bat_status}"
    except Exception as e:
        return f"Diagnostic unavailable: {e}"

def control_volume(action: str):
    try:
        if action == "up":
            for _ in range(5):
                pyautogui.press("volumeup")
            speak("Volume increased.", "en")
        elif action == "down":
            for _ in range(5):
                pyautogui.press("volumedown")
            speak("Volume decreased.", "en")
        elif action == "mute":
            pyautogui.press("volumemute")
            speak("Audio muted.", "en")
    except Exception as e:
        print(f"Volume error: {e}")

def lock_computer():
    speak("Locking workstation now, sir.", "en")
    if "windows" in CURRENT_OS:
        import ctypes
        ctypes.windll.user32.LockWorkStation()
    elif "darwin" in CURRENT_OS:
        os.system("/System/Library/CoreServices/Menu\\\\ Extras/User.menu/Contents/Resources/CGSession -suspend")
    else:
        os.system("xdg-screensaver lock")

def open_application(app_name: str):
    app_lower = app_name.lower()
    if "youtube" in app_lower:
        speak("Opening YouTube.", "en")
        webbrowser.open("https://www.youtube.com")
        return
    if "google" in app_lower or "chrome" in app_lower:
        speak("Opening Chrome.", "en")
        webbrowser.open("https://www.google.com")
        return
    if "spotify" in app_lower:
        speak("Launching Spotify.", "en")
        if "windows" in CURRENT_OS:
            os.system("start spotify:")
        elif "darwin" in CURRENT_OS:
            os.system("open -a Spotify")
        else:
            os.system("spotify &")
        return
    if "notepad" in app_lower:
        speak("Opening Notepad.", "en")
        if "windows" in CURRENT_OS:
            subprocess.Popen(["notepad.exe"])
        elif "darwin" in CURRENT_OS:
            os.system("open -a TextEdit")
        return
    if "calculator" in app_lower or "calc" in app_lower:
        speak("Opening Calculator.", "en")
        if "windows" in CURRENT_OS:
            subprocess.Popen(["calc.exe"])
        elif "darwin" in CURRENT_OS:
            os.system("open -a Calculator")
        return
    if "code" in app_lower or "vscode" in app_lower:
        speak("Opening Visual Studio Code.", "en")
        os.system("code .")
        return
    webbrowser.open(f"https://www.google.com/search?q={app_name}")

# =============================================================================
# 🧠 GEMINI AI REASONING
# =============================================================================
def ask_gemini(query: str, lang: str = "en") -> str:
    if not HAS_GEMINI or not ai_client:
        return "I am running in offline local mode. Add your GEMINI_API_KEY to .env for full reasoning."
    try:
        sys_inst = (
            f"You are {AI_NAME}, a loyal, hyper-competent and witty desktop AI assistant. "
            "Match the language of the prompt (Hindi, Chinese, Russian, Japanese, Spanish, English). "
            "Keep voice responses concise, conversational, and around 1-3 sentences."
        )
        response = ai_client.models.generate_content(
            model='gemini-2.5-flash',
            contents=query,
            config={'system_instruction': sys_inst, 'temperature': 0.7}
        )
        return response.text.strip()
    except Exception as e:
        return f"AI subsystem error: {e}"

# =============================================================================
# 🎯 COMMAND PROCESSOR
# =============================================================================
def process_command(cmd: str):
    if not cmd:
        return
    c = cmd.lower()
    lang = "en"
    if any('\\u0900' <= ch <= '\\u097F' for ch in cmd):
        lang = "hi"
    elif any('\\u4e00' <= ch <= '\\u9fa5' for ch in cmd):
        lang = "zh"
    elif any('\\u0400' <= ch <= '\\u04FF' for ch in cmd):
        lang = "ru"
    elif any('\\u3040' <= ch <= '\\u30ff' for ch in cmd):
        lang = "ja"
    elif "hola" in c or "abrir" in c or "captura" in c:
        lang = "es"

    if any(k in c for k in ["exit", "quit", "stop", "बंद करो", "退出", "выход"]):
        speak("Ultron V.2 systems shutting down. Have a productive day, sir!", lang)
        sys.exit(0)
    elif any(k in c for k in ["status", "battery", "cpu", "ram", "specs", "सिस्टम", "बैटरी", "电量"]):
        speak(get_system_telemetry(), lang)
    elif any(k in c for k in ["screenshot", "screen shot", "स्क्रीनशॉट", "截屏"]):
        take_screenshot()
    elif "volume up" in c or "आवाज़ बढ़ाओ" in c or "音量加" in c:
        control_volume("up")
    elif "volume down" in c or "आवाज़ कम करो" in c or "音量减" in c:
        control_volume("down")
    elif "mute" in c or "म्यूट" in c or "静音" in c:
        control_volume("mute")
    elif "lock pc" in c or "lock computer" in c or "कंप्यूटर लॉक" in c or "锁屏":
        lock_computer()
    elif "open youtube" in c or "यूट्यूब खोलो" in c or "打开油管":
        open_application("youtube")
    elif "open chrome" in c or "open google" in c:
        open_application("chrome")
    elif "open spotify" in c or "स्पॉटिफाय खोलो" in c:
        open_application("spotify")
    elif "open notepad" in c or "नोटपैड":
        open_application("notepad")
    elif "open calculator" in c or "कैलकुलेटर":
        open_application("calculator")
    elif any(k in c for k in ["time", "date", "समय", "तारीख", "几点", "время"]):
        now = datetime.datetime.now().strftime("%I:%M %p on %A, %B %d")
        speak(f"The current time is {now}, sir.", lang)
    else:
        reply = ask_gemini(cmd, lang)
        speak(reply, lang)

def main():
    print(f"✨ {AI_NAME} MULTILINGUAL PC AI ASSISTANT ONLINE ✨")
    speak(f"Greetings, sir. {AI_NAME} subroutines initialized and standing by.", DEFAULT_LANG)
    while True:
        try:
            cmd = listen_command("en-US")
            if cmd:
                process_command(cmd)
            time.sleep(0.3)
        except KeyboardInterrupt:
            print("\\n[!] Interrupted by user. Exiting...")
            break
        except Exception as e:
            print(f"Error: {e}")
            time.sleep(1)

if __name__ == "__main__":
    main()
`;

export const ULTRON_REQUIREMENTS_TXT = `psutil>=5.9.0
pyautogui>=0.9.54
SpeechRecognition>=3.10.0
PyAudio>=0.2.14
gTTS>=2.4.0
pygame>=2.5.0
pyttsx3>=2.90
google-genai>=2.4.0
python-dotenv>=1.0.0
`;
