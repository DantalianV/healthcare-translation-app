import { useState, useEffect, useCallback } from "react";

export function useSpeechSynthesis() {
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);

  useEffect(() => {
    const handleVoicesChanged = () => {
      const availableVoices = window.speechSynthesis.getVoices();
      setVoices(availableVoices);
    };

    // The 'voiceschanged' event is fired when the list of voices is ready.
    window.speechSynthesis.addEventListener("voiceschanged", handleVoicesChanged);
    // Also call it directly in case the event has already fired.
    handleVoicesChanged();

    return () => {
      window.speechSynthesis.removeEventListener("voiceschanged", handleVoicesChanged);
    };
  }, []);

  const speak = useCallback((text: string, lang: string) => {
    if (!text || typeof window === "undefined") return;

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    const voice = voices.find((v) => v.lang === lang);
    
    utterance.voice = voice || null; // Assign the specific voice
    window.speechSynthesis.speak(utterance);
  }, [voices]);

  return { speak, voices };
}