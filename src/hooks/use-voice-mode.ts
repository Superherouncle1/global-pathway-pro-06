import { useState, useCallback, useRef, useEffect } from "react";

type VoiceModeOptions = {
  onTranscript?: (text: string) => void;
  autoSpeak?: boolean;
};

// Check for SpeechRecognition support
const getSpeechRecognition = (): any | null => {
  if (typeof window === "undefined") return null;
  return (
    (window as any).SpeechRecognition ||
    (window as any).webkitSpeechRecognition ||
    null
  );
};

const hasTTS = () =>
  typeof window !== "undefined" && "speechSynthesis" in window;

export function useVoiceMode({ onTranscript, autoSpeak = true }: VoiceModeOptions = {}) {
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [sttSupported] = useState(() => !!getSpeechRecognition());
  const [ttsSupported] = useState(() => hasTTS());

  const recognitionRef = useRef<any>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      recognitionRef.current?.abort();
      window.speechSynthesis?.cancel();
    };
  }, []);

  const startListening = useCallback(() => {
    const SpeechRec = getSpeechRecognition();
    if (!SpeechRec) return;

    // Stop any ongoing speech first
    window.speechSynthesis?.cancel();
    setIsSpeaking(false);

    const recognition = new SpeechRec();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = "en-US";

    recognition.onstart = () => setIsListening(true);

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      const transcript = event.results[0]?.[0]?.transcript;
      if (transcript) onTranscript?.(transcript);
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      console.warn("Speech recognition error:", event.error);
      setIsListening(false);
    };

    recognition.onend = () => setIsListening(false);

    recognitionRef.current = recognition;
    recognition.start();
  }, [onTranscript]);

  const stopListening = useCallback(() => {
    recognitionRef.current?.stop();
    setIsListening(false);
  }, []);

  const speak = useCallback(
    (text: string) => {
      if (!hasTTS() || !voiceEnabled || !autoSpeak) return;

      // Cancel previous
      window.speechSynthesis.cancel();

      // Strip markdown for cleaner speech
      const clean = text
        .replace(/[#*_~`>\-|[\]()!]/g, "")
        .replace(/\n{2,}/g, ". ")
        .replace(/\n/g, " ")
        .trim();

      if (!clean) return;

      const utterance = new SpeechSynthesisUtterance(clean);
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      utteranceRef.current = utterance;
      window.speechSynthesis.speak(utterance);
    },
    [voiceEnabled, autoSpeak]
  );

  const stopSpeaking = useCallback(() => {
    window.speechSynthesis?.cancel();
    setIsSpeaking(false);
  }, []);

  const toggleVoice = useCallback(() => {
    setVoiceEnabled((prev) => {
      if (prev) {
        // Turning off — stop everything
        recognitionRef.current?.abort();
        window.speechSynthesis?.cancel();
        setIsListening(false);
        setIsSpeaking(false);
      }
      return !prev;
    });
  }, []);

  return {
    voiceEnabled,
    toggleVoice,
    isListening,
    isSpeaking,
    startListening,
    stopListening,
    speak,
    stopSpeaking,
    sttSupported,
    ttsSupported,
    supported: sttSupported || ttsSupported,
  };
}
