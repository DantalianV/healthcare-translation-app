import { useState, useEffect, useRef, useCallback } from "react";

/**
 * Hook for browser-native speech recognition.
 *
 * NOTE: This implementation relies on the Web Speech API.
 * It is highly recommended to use Chromium-based browsers (Chrome, Edge) for the best experience.
 * In non-Chromium browsers, this feature may fail or behave inconsistently.
 *
 * TODO: Find a more resilient way to create a transcript (e.g. OpenAI Whisper API) for better cross-browser support.
 */
export function useSpeechRecognition() {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState("");
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      // Support for different browser implementations
      const SpeechRecognition =
        (window as any).SpeechRecognition ||
        (window as any).webkitSpeechRecognition;

      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = true; // Keep recording even if user pauses
        recognition.interimResults = true; // Show results while speaking
        recognition.lang = "en-US";
        recognitionRef.current = recognition;
      }
    }
  }, []);

  const startRecording = useCallback((lang: string = "en-US") => {
    if (recognitionRef.current) {
      setTranscript(""); // Reset transcript for new session
      recognitionRef.current.lang = lang; // Set the desired language
      try {
        recognitionRef.current.start();
        setIsRecording(true);
      } catch (error) {
        console.error("Error starting speech recognition:", error);
      }

      recognitionRef.current.onresult = (event: any) => {
        let currentTranscript = "";
        for (let i = 0; i < event.results.length; i++) {
          currentTranscript += event.results[i][0].transcript;
        }
        setTranscript(currentTranscript);
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error("Speech recognition error", event.error);
        setIsRecording(false);
      };

      recognitionRef.current.onend = () => {
        setIsRecording(false);
      };
    }
  }, []);

  const stopRecording = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsRecording(false);
    }
  }, []);

  return { isRecording, startRecording, stopRecording, transcript };
}