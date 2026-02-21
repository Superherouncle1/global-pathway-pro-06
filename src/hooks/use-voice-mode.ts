import { useState, useCallback, useRef, useEffect } from "react";

type SttMode = "browser" | "gemini";

type VoiceModeOptions = {
  onTranscript?: (text: string) => void;
  autoSpeak?: boolean;
  sttMode?: SttMode;
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

const TRANSCRIBE_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/transcribe-audio`;

export function useVoiceMode({
  onTranscript,
  autoSpeak = true,
  sttMode = "browser",
}: VoiceModeOptions = {}) {
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [sttSupported] = useState(() =>
    sttMode === "gemini" ? !!navigator.mediaDevices : !!getSpeechRecognition()
  );
  const [ttsSupported] = useState(() => hasTTS());

  const recognitionRef = useRef<any>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      recognitionRef.current?.abort();
      mediaRecorderRef.current?.stop();
      streamRef.current?.getTracks().forEach((t) => t.stop());
      window.speechSynthesis?.cancel();
    };
  }, []);

  // --- Gemini STT via MediaRecorder ---
  const startGeminiListening = useCallback(async () => {
    try {
      window.speechSynthesis?.cancel();
      setIsSpeaking(false);

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const mimeType = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
        ? "audio/webm;codecs=opus"
        : "audio/webm";

      const recorder = new MediaRecorder(stream, { mimeType });
      audioChunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      recorder.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop());
        const blob = new Blob(audioChunksRef.current, { type: mimeType });

        if (blob.size < 1000) {
          setIsListening(false);
          return;
        }

        // Convert to base64
        const reader = new FileReader();
        reader.onloadend = async () => {
          const base64 = (reader.result as string).split(",")[1];
          try {
            const resp = await fetch(TRANSCRIBE_URL, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
              },
              body: JSON.stringify({ audio: base64, mimeType }),
            });
            const data = await resp.json();
            if (data.transcript?.trim()) {
              onTranscript?.(data.transcript.trim());
            }
          } catch (err) {
            console.error("Gemini transcription error:", err);
          }
          setIsListening(false);
        };
        reader.readAsDataURL(blob);
      };

      mediaRecorderRef.current = recorder;
      recorder.start();
      setIsListening(true);
    } catch (err) {
      console.error("Microphone access error:", err);
      setIsListening(false);
    }
  }, [onTranscript]);

  const stopGeminiListening = useCallback(() => {
    mediaRecorderRef.current?.stop();
  }, []);

  // --- Browser STT ---
  const startBrowserListening = useCallback(() => {
    const SpeechRec = getSpeechRecognition();
    if (!SpeechRec) return;

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
    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);
    recognitionRef.current = recognition;
    recognition.start();
  }, [onTranscript]);

  const stopBrowserListening = useCallback(() => {
    recognitionRef.current?.stop();
    setIsListening(false);
  }, []);

  // --- Unified start/stop ---
  const startListening = sttMode === "gemini" ? startGeminiListening : startBrowserListening;
  const stopListening = sttMode === "gemini" ? stopGeminiListening : stopBrowserListening;

  const speak = useCallback(
    (text: string) => {
      if (!hasTTS() || !voiceEnabled || !autoSpeak) return;
      window.speechSynthesis.cancel();
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
        recognitionRef.current?.abort();
        mediaRecorderRef.current?.stop();
        streamRef.current?.getTracks().forEach((t) => t.stop());
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
