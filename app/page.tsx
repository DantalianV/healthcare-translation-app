"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { useSpeechRecognition } from "./useSpeechRecognition";
import { useSpeechSynthesis } from "./useSpeechSynthesis";

export default function Home() {
  const [inputText, setInputText] = useState("");
  const { isRecording, startRecording, stopRecording, transcript } = useSpeechRecognition();
  const [baseText, setBaseText] = useState("");
  const [sourceLanguage, setSourceLanguage] = useState("en-US");
  const [targetLanguage, setTargetLanguage] = useState("es-ES");
  const [translatedText, setTranslatedText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const wasRecording = useRef(false);
  const { speak, voices } = useSpeechSynthesis();

  const languages = useMemo(() => {
    if (!voices.length) return [];
    const uniqueLangs = [...new Set(voices.map((v) => v.lang))];
    return uniqueLangs
      .map((lang) => {
        try {
          const langName = new Intl.DisplayNames(["en"], { type: "language" }).of(lang.split("-")[0]);
          return { value: lang, label: `${langName} (${lang})` };
        } catch (e) {
          return { value: lang, label: lang }; // Fallback for codes Intl doesn't know
        }
      })
      .sort((a, b) => a.label.localeCompare(b.label));
  }, [voices]);

  // Set default languages once they are loaded
  useEffect(() => {
    if (languages.length > 0) {
      // Ensure the default selection is valid
      if (!languages.find((l) => l.value === sourceLanguage)) {
        setSourceLanguage(languages.find((l) => l.value.startsWith("en"))?.value || languages[0].value);
      }
      if (!languages.find((l) => l.value === targetLanguage)) {
        setTargetLanguage(languages.find((l) => l.value.startsWith("es"))?.value || languages[0].value);
      }
    }
  }, [languages, sourceLanguage, targetLanguage]);

  // Update input text when speech transcript changes
  useEffect(() => {
    if (isRecording && transcript) {
      const prefix = baseText ? `${baseText} ` : "";
      setInputText(`${prefix}${transcript}`);
    }
  }, [transcript, isRecording, baseText]);

  // Trigger translation when recording stops
  useEffect(() => {
    if (wasRecording.current && !isRecording) {
      handleTranslate();
    }
    wasRecording.current = isRecording;
  }, [isRecording]);

  const handleTranslate = async () => {
    if (!inputText.trim()) return;

    // Convert language code (e.g., "es-ES") to language name (e.g., "Spanish") for the AI prompt
    const targetLanguageName = new Intl.DisplayNames(["en"], { type: "language" }).of(targetLanguage.split("-")[0]);

    setIsLoading(true);
    try {
      const response = await fetch("/api/translate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: inputText,
          targetLanguage: targetLanguageName,
        }),
      });

      const data = await response.json();
      if (data.translatedText) {
        setTranslatedText(data.translatedText);
      }
    } catch (error) {
      console.error("Translation error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleMicClick = () => {
    if (isRecording) {
      stopRecording();
    } else {
      setBaseText(inputText); // Save current text before appending speech
      startRecording(sourceLanguage);
    }
  };

  const handleSpeak = () => {
    speak(translatedText, targetLanguage);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-50 font-sans">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60 dark:border-slate-800 dark:bg-slate-950/80">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white">
              {/* Medical Cross Icon */}
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="h-5 w-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
            </div>
            <span className="text-lg font-bold tracking-tight">HealthTranslate</span>
          </div>
          <div className="flex items-center gap-4">
             <span className="text-xs font-medium text-slate-500 dark:text-slate-400 hidden sm:inline-block">
                Prototype v0.1
             </span>
          </div>
        </div>
      </header>

      <main className="container mx-auto flex flex-col items-center px-4 py-10 md:py-16">
        
        {/* Hero Section */}
        <div className="mb-10 text-center max-w-2xl">
          <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl md:text-5xl mb-4">
            <span className="text-blue-600">AI-Powered</span> Medical Translation
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-400">
            Real-time, accurate voice translation for healthcare professionals. 
            Designed to assist in patient communication.
          </p>
        </div>

        {/* Translation Interface */}
        <div className="w-full max-w-4xl rounded-2xl border border-slate-200 bg-white shadow-xl shadow-slate-200/50 dark:border-slate-800 dark:bg-slate-900 dark:shadow-none overflow-hidden">
          
          {/* Language Selector Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between border-b border-slate-100 bg-slate-50/50 p-4 dark:border-slate-800 dark:bg-slate-900/50 gap-4">
            <div className="flex-1 w-full sm:w-auto">
              <select
                value={sourceLanguage}
                onChange={(e) => setSourceLanguage(e.target.value)}
                disabled={!languages.length}
                className="w-full rounded-lg border-slate-200 bg-white px-3 py-2 text-sm font-medium shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 disabled:opacity-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
              >
                {languages.map((lang) => (
                  <option key={lang.value} value={lang.value}>
                    {lang.label}
                  </option>
                ))}
              </select>
            </div>

            <button className="rounded-full p-2 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors text-slate-500">
               {/* Swap Icon */}
               <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21 3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" />
                </svg>
            </button>

            <div className="flex-1 w-full sm:w-auto">
              <select 
                value={targetLanguage}
                onChange={(e) => setTargetLanguage(e.target.value)}
                disabled={!languages.length}
                className="w-full rounded-lg border-slate-200 bg-white px-3 py-2 text-sm font-medium shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 disabled:opacity-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
              >
                {languages.map((lang) => (
                  <option key={lang.value} value={lang.value}>
                    {lang.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Input/Output Area */}
          <div className="grid md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-100 dark:divide-slate-800 min-h-[300px]">
            
            {/* Source Input */}
            <div className="relative flex flex-col p-6">
              <textarea 
                className="flex-1 resize-none bg-transparent text-lg outline-none placeholder:text-slate-400 dark:placeholder:text-slate-600"
                placeholder="Tap the microphone to start speaking..."
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
              />
              <div className="mt-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                <button 
                  onClick={handleMicClick}
                  className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition-all ${
                    isRecording 
                      ? "bg-red-100 text-red-600 ring-2 ring-red-500 ring-offset-2 dark:bg-red-900/30 dark:text-red-400" 
                      : "bg-blue-50 text-blue-600 hover:bg-blue-100 dark:bg-blue-900/20 dark:text-blue-400 dark:hover:bg-blue-900/40"
                  }`}
                >
                  {isRecording ? (
                    <>
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                      </span>
                      Recording...
                    </>
                  ) : (
                    <>
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                        <path d="M8.25 4.5a3.75 3.75 0 1 1 7.5 0v8.25a3.75 3.75 0 1 1-7.5 0V4.5Z" />
                        <path d="M6 10.5a.75.75 0 0 1 .75.75v1.5a5.25 5.25 0 1 0 10.5 0v-1.5a.75.75 0 0 1 1.5 0v1.5a6.751 6.751 0 0 1-6 6.709v2.291h3a.75.75 0 0 1 0 1.5h-7.5a.75.75 0 0 1 0-1.5h3v-2.291a6.751 6.751 0 0 1-6-6.709v-1.5A.75.75 0 0 1 6 10.5Z" />
                      </svg>
                      Dictate
                    </>
                  )}
                </button>
                <button
                  onClick={handleTranslate}
                  disabled={isLoading || !inputText}
                  className="rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700 disabled:opacity-50 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-300"
                >
                  {isLoading ? "Translating..." : "Translate"}
                </button>
                </div>
                <span className="text-xs text-slate-400">{inputText.length}/2000</span>
              </div>
            </div>

            {/* Target Output */}
            <div className="relative flex flex-col bg-slate-50/30 p-6 dark:bg-slate-900/30">
              <div className="flex-1 text-lg text-slate-500 dark:text-slate-400 italic">
                {isLoading ? (
                  <span className="animate-pulse">Translating...</span>
                ) : (
                  translatedText || "Translation will appear here..."
                )}
              </div>
              <div className="mt-4 flex items-center justify-end gap-2">
                <button className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-300 transition-colors" title="Copy">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 0 1-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 0 1 1.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 0 0-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 0 1-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 0 0-3.375-3.375h-1.5" />
                  </svg>
                </button>
                <button 
                  onClick={handleSpeak}
                  disabled={!translatedText}
                  className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-300 transition-colors disabled:opacity-50" 
                  title="Listen"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.114 5.636a9 9 0 0 1 0 12.728M16.463 8.288a5.25 5.25 0 0 1 0 7.424M6.75 8.25l4.72-4.72a.75.75 0 0 1 1.28.53v15.88a.75.75 0 0 1-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 0 1 2.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75Z" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="mt-8 max-w-2xl text-center">
          <div className="rounded-lg bg-amber-50 p-3 text-xs text-amber-800 dark:bg-amber-900/20 dark:text-amber-400 border border-amber-200 dark:border-amber-900/50">
            <span className="font-semibold">Privacy Notice:</span> This is a prototype. Audio is processed via browser APIs and OpenAI. Do not input real Personally Identifiable Information (PII).
          </div>
        </div>

      </main>
    </div>
  );
}
