# HealthTranslate

**AI-Powered Medical Translation Application**

HealthTranslate is a prototype application designed to facilitate real-time, accurate communication between healthcare professionals and patients who speak different languages. It leverages Generative AI to ensure medical terminology is correctly understood and translated.

## 🔗 Links

- **Live Demo:** [Insert Demo Link Here]
- **Creation Process Video:** [Insert Video Link Here]

## ✨ Features

- **Real-time Speech Recognition:** Captures voice input directly from the browser using the Web Speech API.
- **Medical-Grade Translation:** Uses DeepSeek R1 (via OpenRouter) to analyze context, correct phonetic errors in medical terms, and provide accurate translations.
- **Text-to-Speech (TTS):** Reads out the translated text using the browser's native synthesis engine, matching the accent to the target language.
- **Dynamic Language Detection:** Automatically populates language dropdowns based on the voices available in the user's operating system/browser.
- **Privacy-Centric:** No audio or text is stored in a database. All processing happens in-memory or via secure stateless API calls.
- **Modern UI:** Built with Next.js and Tailwind CSS for a clean, responsive experience.

## 🛠️ Tech Stack

- **Frontend:** Next.js 14 (App Router), React, TypeScript
- **Styling:** Tailwind CSS
- **AI Integration:** OpenAI SDK (connected to OpenRouter)
- **Model:** `deepseek/deepseek-r1:free` (Reasoning model for better context)
- **Browser APIs:**
  - `SpeechRecognition` (for input)
  - `speechSynthesis` (for output)

## ⚠️ Limitations

1.  **Browser Compatibility:**
    - The **Speech Recognition** feature relies on the Web Speech API, which is currently fully supported primarily in **Chromium-based browsers** (Chrome, Edge). Firefox and Safari support may be limited or require specific configuration.
2.  **Voice Availability:**
    - The available languages for Text-to-Speech are determined by the user's operating system and browser. If a specific language pack is not installed on the device, it may not appear in the dropdown.
3.  **AI Latency:**
    - As this prototype uses a free-tier LLM endpoint, translation speed may vary depending on API load.
    - There is also limit of 50 request/day.

## 📝 Assumptions

1.  **User Environment:** It is assumed the user is running the application in a modern, Chromium-based browser (e.g., Google Chrome) on a device with a working microphone and speakers.
2.  **Connectivity:** An active internet connection is required for the translation API to function.
3.  **Security:** This is a prototype. While it does not store data, it is not fully HIPAA compliant out-of-the-box and should not be used with real PII (Personally Identifiable Information) in a production setting without further security auditing.

## 🚀 Getting Started

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/DantalianV/healthcare-translation-app
    cd healthcare-translation-app
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Configure Environment:**
    Create a `.env` file in the root directory and add your OpenRouter API key:
    ```env
    OPENROUTER_API_KEY=your_api_key_here
    ```

4.  **Run the application:**
    ```bash
    npm run dev
    ```