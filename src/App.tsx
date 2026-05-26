import React, { useState, useEffect, useRef } from "react";
import {
  Heart,
  Wind,
  Sparkles,
  BookOpen,
  MessageSquare,
  Volume2,
  VolumeX,
  Send,
  RefreshCw,
  Feather,
  Info,
  Wifi,
  WifiOff
} from "lucide-react";
import SootheCanvas from "./components/SootheCanvas";
import { FREY_QUOTES, OFFLINE_LETTERS, OFFLINE_POEM } from "./quotes";

type TokenTab = "breathe" | "strength" | "patience" | "release";

export default function App() {
  const [activeTab, setActiveTab] = useState<TokenTab>("strength");

  // Online / Offline state tracking
  const [isOnline, setIsOnline] = useState(typeof navigator !== "undefined" ? navigator.onLine : true);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);
  
  // Splash Screen States
  const [showPreSplash, setShowPreSplash] = useState(true);
  const [showSplash, setShowSplash] = useState(true);
  const [splashTimer, setSplashTimer] = useState(10);
  const [isFadingSplash, setIsFadingSplash] = useState(false);

  useEffect(() => {
    if (showPreSplash || !showSplash) return;
    
    const interval = setInterval(() => {
      setSplashTimer((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [showPreSplash, showSplash]);

  const handleEnter = () => {
    setIsFadingSplash(true);
    // Auto-trigger soft ambient drone cord Hum when entering
    try {
      toggleAmbientSound();
    } catch (e) {
      console.warn("Audio autoplay blocked by system permissions.", e);
    }
    setTimeout(() => {
      setShowSplash(false);
    }, 1200);
  };

  // Custom states for quotes
  const [currentQuoteIndex, setCurrentQuoteIndex] = useState(0);
  const [quoteFade, setQuoteFade] = useState(true);

  // Custom states for letters
  const [letterType, setLetterType] = useState<"gentle-reminder" | "warm-embrace" | "midnight-whisper">("gentle-reminder");
  const [generatedLetter, setGeneratedLetter] = useState<string>("");
  const [isGeneratingLetter, setIsGeneratingLetter] = useState(false);

  // Custom states for poem
  const [generatedPoem, setGeneratedPoem] = useState<string>("");
  const [isGeneratingPoem, setIsGeneratingPoem] = useState(false);

  // User message and listener interaction
  const [currentFeeling, setCurrentFeeling] = useState<string>("heavy & broken");
  const [userThought, setUserThought] = useState<string>("");
  const [receivedComfortMessage, setReceivedComfortMessage] = useState<string>("");
  const [isGeneratingComfort, setIsGeneratingComfort] = useState(false);
  const [listenerResponseError, setListenerResponseError] = useState(false);

  // Web Audio ambient hum state
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const oscillatorsRef = useRef<any[]>([]);
  const gainNodeRef = useRef<GainNode | null>(null);

  // Guided breathing state for the 'Breathe' tab
  const [breathPhase, setBreathPhase] = useState<"inhale" | "hold" | "exhale">("inhale");
  const [breathCount, setBreathCount] = useState(4);

  // Initialize offline content as defaults
  useEffect(() => {
    // Populate letters initially
    const offlineText = OFFLINE_LETTERS["gentle-reminder"].paragraphs.join("\n\n");
    setGeneratedLetter(offlineText);
    setGeneratedPoem(OFFLINE_POEM);
  }, []);

  // Guided Breathing Timer logic
  useEffect(() => {
    if (activeTab !== "breathe") return;

    let timer: any;
    const tick = () => {
      setBreathCount((prev) => {
        if (prev <= 1) {
          if (breathPhase === "inhale") {
            setBreathPhase("hold");
            return 4; // hold for 4s
          } else if (breathPhase === "hold") {
            setBreathPhase("exhale");
            return 6; // exhale for 6s
          } else {
            setBreathPhase("inhale");
            return 4; // inhale for 4s
          }
        }
        return prev - 1;
      });
    };

    timer = setInterval(tick, 1000);
    return () => clearInterval(timer);
  }, [activeTab, breathPhase]);

  // Audio Synthesizer: generating soft chord pads using Web Audio API
  const toggleAmbientSound = () => {
    if (isAudioPlaying) {
      // Fade out and stop
      if (gainNodeRef.current && audioContextRef.current) {
        const ctx = audioContextRef.current;
        gainNodeRef.current.gain.setValueAtTime(gainNodeRef.current.gain.value, ctx.currentTime);
        gainNodeRef.current.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 1.5);
        setTimeout(() => {
          oscillatorsRef.current.forEach((osc) => {
            try { osc.stop(); } catch (e) {}
          });
          oscillatorsRef.current = [];
          setIsAudioPlaying(false);
        }, 1600);
      }
    } else {
      try {
        // Create audio context
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        const ctx = new AudioContextClass();
        audioContextRef.current = ctx;

        // Master gain
        const masterGain = ctx.createGain();
        masterGain.gain.setValueAtTime(0, ctx.currentTime);
        masterGain.connect(ctx.destination);
        gainNodeRef.current = masterGain;

        // Create warm lush chord notes (Fm9 or similar tender chords: F3, C4, G4, Ab4, C5)
        const frequencies = [87.31, 130.81, 196.00, 207.65, 261.63, 311.13]; // Warm dark pink minor harmony
        
        frequencies.forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const panner = ctx.createStereoPanner ? ctx.createStereoPanner() : null;
          const filter = ctx.createBiquadFilter();
          const oscGain = ctx.createGain();

          osc.type = "sine";
          osc.frequency.setValueAtTime(freq, ctx.currentTime);

          // Rich detuning for natural warmth
          osc.detune.setValueAtTime((Math.random() - 0.5) * 8, ctx.currentTime);

          // Slow LFO drift on frequencies
          const lfo = ctx.createOscillator();
          const lfoGain = ctx.createGain();
          lfo.frequency.setValueAtTime(0.08 + idx * 0.02, ctx.currentTime);
          lfoGain.gain.setValueAtTime(2.5, ctx.currentTime);
          lfo.connect(lfoGain);
          lfoGain.connect(osc.frequency);
          lfo.start();

          // Lowpass filter to keep it exceptionally soft and deep
          filter.type = "lowpass";
          filter.frequency.setValueAtTime(320 - idx * 25, ctx.currentTime);
          filter.Q.setValueAtTime(1, ctx.currentTime);

          // Low volume per voice to prevent clipping
          oscGain.gain.setValueAtTime(0.035, ctx.currentTime);

          // Connect nodes
          if (panner) {
            panner.pan.setValueAtTime((idx % 2 === 0 ? -0.4 : 0.4) * (0.3 + Math.random() * 0.5), ctx.currentTime);
            osc.connect(filter).connect(panner).connect(oscGain).connect(masterGain);
          } else {
            osc.connect(filter).connect(oscGain).connect(masterGain);
          }

          osc.start();
          oscillatorsRef.current.push(osc);
          oscillatorsRef.current.push(lfo); // store LFO to stop later
        });

        // Fade in
        masterGain.gain.setValueAtTime(0, ctx.currentTime);
        masterGain.gain.linearRampToValueAtTime(0.18, ctx.currentTime + 3.0); // 3 seconds fade in

        setIsAudioPlaying(true);
      } catch (err) {
        console.error("Failed to start Web Audio:", err);
      }
    }
  };

  // Clean play on unmount
  useEffect(() => {
    return () => {
      oscillatorsRef.current.forEach((osc) => {
        try { osc.stop(); } catch (e) {}
      });
    };
  }, []);

  // Fetch comforting comment from Gemini
  const handleSeekComfort = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsGeneratingComfort(true);
    setReceivedComfortMessage("");
    setListenerResponseError(false);

    try {
      const response = await fetch("/api/comfort-response", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mood: currentFeeling, userThought })
      });
      const data = await response.json();
      if (data.success && data.text) {
        setReceivedComfortMessage(data.text);
      } else {
        // Fallback elegant offline comforting sentence if API fails
        setListenerResponseError(true);
        const fallbackMessage = `Frey, hearing that you are feeling "${currentFeeling}" makes me want to wrap you in infinite care. Please know that whatever you are carrying in your heart right now, you don't have to face it all today. Your feelings are real, they are heard, and you are cherished beyond words. REST here with me.`;
        setReceivedComfortMessage(fallbackMessage);
      }
    } catch (err) {
      console.error(err);
      setListenerResponseError(true);
      const fallbackMessage = `Frey, I am right here with you. Your thoughts and pain are safe with me. Take a soft breath. You don't have to solve anything right now. Let's just sit in this quiet, starry light together.`;
      setReceivedComfortMessage(fallbackMessage);
    } finally {
      setIsGeneratingComfort(false);
    }
  };

  // Fetch comforting Letter from Gemini
  const generateNewLetter = async (type: typeof letterType) => {
    setIsGeneratingLetter(true);
    setLetterType(type);
    
    try {
      const response = await fetch("/api/write-letter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ letterType: type })
      });
      const data = await response.json();
      if (data.success && data.text) {
        setGeneratedLetter(data.text);
      } else {
        // Offline fallback
        const paragraphs = OFFLINE_LETTERS[type].paragraphs.join("\n\n");
        setGeneratedLetter(paragraphs);
      }
    } catch (err) {
      console.error(err);
      const paragraphs = OFFLINE_LETTERS[type].paragraphs.join("\n\n");
      setGeneratedLetter(paragraphs);
    } finally {
      setIsGeneratingLetter(false);
    }
  };

  // Fetch custom poem dedicated to Frey
  const generateNewPoem = async () => {
    setIsGeneratingPoem(true);
    try {
      const response = await fetch("/api/generate-poem", {
        method: "POST"
      });
      const data = await response.json();
      if (data.success && data.text) {
        setGeneratedPoem(data.text);
      } else {
        setGeneratedPoem(OFFLINE_POEM);
      }
    } catch (err) {
      console.error(err);
      setGeneratedPoem(OFFLINE_POEM);
    } finally {
      setIsGeneratingPoem(false);
    }
  };

  // Handle local randomized quote transition
  const handleRandomQuote = () => {
    setQuoteFade(false);
    setTimeout(() => {
      let nextIndex = Math.floor(Math.random() * FREY_QUOTES.length);
      // Ensure we don't pick the exact same index twice in a row if there's multiple
      if (nextIndex === currentQuoteIndex) {
        nextIndex = (nextIndex + 1) % FREY_QUOTES.length;
      }
      setCurrentQuoteIndex(nextIndex);
      setQuoteFade(true);
    }, 300);
  };

  const activeQuote = FREY_QUOTES[currentQuoteIndex];

  return (
    <div className="relative min-h-screen bg-[#0d0a0d] text-white font-sans overflow-x-hidden flex flex-col selection:bg-rose-500/35 selection:text-pink-100">
      
      {/* Dynamic Animated Soothing Canvas in background with interactive sparkles / cherry blossoms / fireflies */}
      <SootheCanvas />

      {/* Opening Splash Screen */}
      {showSplash && showPreSplash && (
        <div 
          className="fixed inset-0 z-55 flex flex-col items-center justify-center bg-[#070507] px-6 text-center"
          id="pre-splash-overlay"
        >
          {/* Subtle Pink Glowing aura behind content */}
          <div className="absolute w-[450px] h-[450px] bg-pink-600/10 rounded-full blur-[110px] pointer-events-none" />

          <div className="relative z-10 max-w-md mx-auto flex flex-col items-center text-center animate-fade-in">
            <Heart className="w-10 h-10 text-rose-500/60 animate-bounce mb-6" style={{ animationDuration: "3s" }} />
            
            <p className="font-mono text-[9px] text-pink-400/50 tracking-[0.35em] uppercase mb-4">
              Before you enter...
            </p>
            
            <h2 className="font-serif italic font-light text-rose-200 tracking-widest text-3xl mb-6">
              A Quiet Message
            </h2>
            
            <div className="bg-black/40 border border-pink-500/15 p-6 rounded-2xl mb-8 leading-relaxed text-left text-xs sm:text-sm text-pink-100/80 space-y-4">
              <p>
                <strong>Frey</strong>, before the lights soften and the space is ready, please take a moment to relax and rest. 
              </p>
              <p>
                Every button, every letter, and every line of poetry here was made for you by <strong>Camz</strong> to serve as your quiet safe place when you feel tired or sad.
              </p>
              <p className="text-[11px] text-pink-300/60 font-mono italic">
                * This safe space works entirely offline, meaning you can carry this comfort anywhere in the world, with or without wifi.
              </p>
            </div>

            <button
              onClick={() => setShowPreSplash(false)}
              className="flex items-center gap-2 px-8 py-3 rounded-full text-xs font-mono tracking-widest uppercase border border-pink-400/30 text-pink-100 bg-rose-950/20 hover:bg-rose-500/15 transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer shadow-[0_0_15px_rgba(244,63,94,0.1)]"
            >
              <span>Read & Prepare</span>
              <Sparkles className="w-3 h-3 text-rose-400" />
            </button>
          </div>
        </div>
      )}

      {showSplash && !showPreSplash && (
        <div 
          className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#090709]/98 px-6 text-center transition-all duration-[1200ms] ease-in-out ${
            isFadingSplash ? "opacity-0 scale-105 pointer-events-none" : "opacity-100 scale-100"
          }`}
          id="opening-splash-overlay"
        >
          {/* Subtle Pink Glowing aura behind content */}
          <div className="absolute w-[450px] h-[450px] bg-pink-600/10 rounded-full blur-[110px] pointer-events-none" />

          <div className="relative z-10 max-w-lg mx-auto flex flex-col items-center text-center animate-fade-in">
            <Heart className="w-12 h-12 text-rose-500/50 animate-pulse mb-6" />
            
            <p className="font-mono text-[10px] text-pink-400/40 tracking-[0.35em] uppercase mb-2">
              Our minds are noisy, let's take a breath
            </p>
            
            <h1 className="font-serif italic font-light text-rose-200 tracking-widest text-4xl mb-4">
              For You, Frey
            </h1>
            
            <p className="font-sans text-xs sm:text-sm text-pink-200/70 leading-relaxed max-w-md mb-8">
              Frey, Camz made this soft space just for you to help you feel better. 
              Here, you do not have to do anything. Just rest, read sweet letters, 
              follow breathing guides, and see kind words.
            </p>

            {/* 10-second glowing progress bar and prompt */}
            <div className="w-full max-w-xs mb-8 text-left">
              <div className="flex justify-between font-mono text-[10px] tracking-wider text-rose-300/60 mb-2">
                <span>
                  {splashTimer > 8 && "Relax your shoulders..."}
                  {splashTimer <= 8 && splashTimer > 5 && "Relax your body..."}
                  {splashTimer <= 5 && splashTimer > 2 && "Breathe in warm pink light..."}
                  {splashTimer <= 2 && splashTimer > 0 && "Let go of heavy thoughts..."}
                  {splashTimer === 0 && "Welcome home, Frey."}
                </span>
                <span>{splashTimer > 0 ? `${splashTimer}s` : "Go!"}</span>
              </div>
              <div className="h-1.5 w-full bg-pink-950/40 border border-pink-500/10 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-rose-600 to-pink-400 transition-all duration-1000 ease-linear rounded-full shadow-[0_0_8px_#f43f5e]"
                  style={{ width: `${((10 - splashTimer) / 10) * 100}%` }}
                />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 w-full">
              <button
                onClick={handleEnter}
                disabled={splashTimer > 0}
                className={`flex items-center justify-center gap-2.5 px-8 py-3.5 rounded-full text-xs font-mono tracking-widest uppercase border transition-all duration-500 active:scale-95 cursor-pointer ${
                  splashTimer > 0 
                  ? "border-pink-500/10 text-pink-100/30 bg-black/40 cursor-not-allowed" 
                  : "border-pink-400/40 text-pink-100 bg-rose-950/20 hover:bg-rose-500/15 hover:scale-105 hover:border-pink-300 shadow-[0_0_25px_rgba(244,63,94,0.15)]"
                }`}
              >
                <Sparkles className={`w-3.5 h-3.5 text-rose-400 ${splashTimer === 0 ? "animate-pulse" : "opacity-30"}`} />
                <span>Enter Safe Space</span>
              </button>
              
              {splashTimer > 0 && (
                <button
                  onClick={handleEnter}
                  className="px-4 py-2 text-[10px] font-mono tracking-widest uppercase text-rose-300/50 hover:text-rose-300 transition-colors"
                >
                  Skip & Enter
                </button>
              )}
            </div>

            <div className="mt-12 flex flex-col items-center gap-1">
              <span className="font-mono text-[9px] text-rose-300/40 tracking-wider">
                thoughtfully crafted with care & devotion by camz
              </span>
              <span className="font-mono text-[8px] text-rose-300/25 tracking-normal">
                (Clicking enter softens the air with a celestial drone hum)
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Decorative Warm Ambient Glow spots in margins (Artistic Flair theme background glows) */}
      <div className="absolute top-[-100px] left-[-150px] w-[500px] h-[500px] bg-pink-600/10 rounded-full blur-[120px] pointer-events-none z-0" />
      <div className="absolute bottom-[-100px] right-[-150px] w-[450px] h-[450px] bg-[#be185d]/10 rounded-full blur-[110px] pointer-events-none z-0" />

      {/* Custom Audio & Connection controller on Top-Right Corner */}
      <div className="relative z-20 self-end px-6 pt-4 flex items-center gap-3">
        {/* Offline / Online Status Badge */}
        <div 
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-mono border transition-all duration-500 ${
            isOnline 
              ? "bg-emerald-950/20 text-emerald-300 border-emerald-500/20" 
              : "bg-amber-950/20 text-amber-300 border-amber-500/20 shadow-[0_0_12px_rgba(245,158,11,0.15)] animate-pulse"
          }`}
          style={{ animationDuration: "4s" }}
          title={isOnline ? "Connected online with stardust servers" : "Running offline in self-contained serenity"}
        >
          {isOnline ? (
            <>
              <Wifi className="w-3 h-3 text-emerald-400" />
              <span>Connected</span>
            </>
          ) : (
            <>
              <WifiOff className="w-3 h-3 text-amber-400" />
              <span>Offline Serenity Mode</span>
            </>
          )}
        </div>

        <button
          onClick={toggleAmbientSound}
          id="ambient-hum-toggle"
          className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-mono border transition-all duration-500 hover:scale-105 active:scale-95 ${
            isAudioPlaying
              ? "bg-rose-500/20 text-pink-300 border-pink-500/40 shadow-[0_0_15px_rgba(244,63,94,0.3)]"
              : "bg-black/40 text-rose-300/60 border-rose-500/20"
          }`}
          title="Play gentle celestial drone hum"
        >
          {isAudioPlaying ? (
            <>
              <Volume2 className="w-3.5 h-3.5 text-pink-400 animate-pulse" />
              <span>Hum Active</span>
            </>
          ) : (
            <>
              <VolumeX className="w-3.5 h-3.5 text-rose-300/50" />
              <span>Enable Quiet Hum</span>
            </>
          )}
        </button>
      </div>

      {/* Root Layout Container */}
      <div className="relative min-h-screen flex flex-col justify-between items-center px-4 py-8 md:px-8 z-10 w-full max-w-5xl mx-auto">
        
        {/* Header from 'Artistic Flair' Design */}
        <header className="text-center mt-4 mb-4 select-none animate-fade-in">
          <h1 className="font-serif italic font-light text-rose-400 tracking-[0.45em] text-sm md:text-base uppercase flex items-center justify-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shadow-[0_0_8px_#f43f5e]" />
            For You, Frey
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shadow-[0_0_8px_#f43f5e]" />
          </h1>
          <p className="text-[10px] md:text-xs font-mono text-pink-300/50 tracking-[0.25em] uppercase mt-2">
            A quiet place made of soft light & kindness
          </p>
        </header>

        {/* Dynamic Display Panel for Active Token */}
        <main className="w-full flex-1 flex flex-col items-center justify-center py-6 min-h-[380px]" id="quote-display-container">
          
          {/* Strength - Randomized Uplifting Quotes with Fade Transitions */}
          {activeTab === "strength" && (
            <div className={`w-full max-w-xl text-center px-4 transition-all duration-300 ${quoteFade ? "opacity-100 scale-100" : "opacity-0 scale-95"}`}>
              
              <div className="relative inline-block mb-3">
                <Heart className="w-8 h-8 text-rose-500/40 mx-auto" />
                <span className="absolute -top-1 -right-1 flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
                </span>
              </div>

              <blockquote className="font-serif text-2xl md:text-3.5xl lg:text-4xl italic text-rose-50/95 leading-relaxed font-light tracking-wide text-center">
                “{activeQuote.text}”
              </blockquote>
              
              <p className="mt-6 text-xs md:text-sm font-mono text-rose-400/90 tracking-widest uppercase">
                &mdash; {activeQuote.subtext}
              </p>

              <div className="mt-12 flex justify-center">
                <button
                  onClick={handleRandomQuote}
                  id="random-quote-btn"
                  className="group flex items-center p-3 px-6 rounded-full bg-rose-950/20 hover:bg-rose-500/10 border border-pink-500/30 text-rose-100 font-mono text-[11px] tracking-widest uppercase transition-all duration-300 hover:scale-105 hover:border-pink-400 shadow-[0_0_15px_rgba(244,63,94,0.1)] active:scale-95"
                >
                  <RefreshCw className="w-3 h-3 mr-2 text-rose-400 group-hover:rotate-180 transition-transform duration-500" />
                  Request Another Whisper
                </button>
              </div>

            </div>
          )}

          {/* Breathe - Guided Breath Controller with glowing physical simulation circles */}
          {activeTab === "breathe" && (
            <div className="flex flex-col items-center select-none text-center max-w-md w-full px-4 animate-fade-in">
              <span className="font-mono text-pink-300/40 text-[10px] tracking-widest uppercase mb-1">
                Mindful Respiration Guide
              </span>
              <h2 className="font-serif italic text-2xl text-rose-100 font-light mb-8">
                Let your shoulders drop down, Frey.
              </h2>
              
              {/* Rhythmic Breathing Circle */}
              <div className="relative w-64 h-64 flex items-center justify-center my-6">
                
                {/* Outer Breathing Aura (Pulsing via custom dynamic classes corresponding to CSS keyframes) */}
                <div 
                  className={`absolute inset-0 rounded-full bg-rose-500/5 border border-pink-500/25 transition-all duration-[6000ms] ease-in-out ${
                    breathPhase === "inhale" ? "scale-110 opacity-70 bg-rose-500/10" :
                    breathPhase === "hold" ? "scale-115 opacity-100 bg-rose-600/15" : "scale-90 opacity-40 bg-pink-900/5"
                  }`} 
                  style={{
                    boxShadow: breathPhase === "inhale" ? "0 0 40px rgba(244,63,94,0.3)" : 
                               breathPhase === "hold" ? "0 0 60px rgba(244,63,94,0.5)" : "0 0 15px rgba(244,63,94,0.05)"
                  }}
                />

                {/* Inner Breathing Core */}
                <div className={`relative w-40 h-40 rounded-full flex flex-col items-center justify-center transition-all duration-[4000ms] bg-gradient-to-tr from-[#25101a] to-[#45132d]/45 border border-pink-400/30 ${
                  breathPhase === "inhale" ? "scale-105" :
                  breathPhase === "hold" ? "scale-110 shadow-[0_0_25px_rgba(244,63,94,0.3)]" : "scale-95"
                }`}>
                  <Wind className={`w-6 h-6 text-rose-400 mb-2 transition-transform duration-1000 ${breathPhase === "inhale" ? "rotate-45" : breathPhase === "exhale" ? "-rotate-45" : "rotate-0"}`} />
                  
                  <span className="text-xl font-serif italic text-pink-100 font-medium capitalize tracking-wide">
                    {breathPhase}
                  </span>
                  
                  <span className="text-2xl font-mono font-light text-rose-300/80 mt-1">
                    {breathCount}
                  </span>
                </div>
              </div>

              {/* Informative Step instructions */}
              <p className="text-sm font-light text-pink-200/70 max-w-sm mt-8 leading-relaxed h-12">
                {breathPhase === "inhale" && "Slowly fill your lungs with fresh pink light. Let it clear the heavy feelings."}
                {breathPhase === "hold" && "Give yourself space. Hold the tranquility inside. Let it comfort your heart."}
                {breathPhase === "exhale" && "Gently release the thoughts. Blow out the burden. Let it sail away."}
              </p>

              {/* Micro instructions button */}
              <div className="mt-4 flex items-center justify-center gap-1.5 text-rose-300/40 text-[10px] font-mono tracking-wider">
                <Info className="w-3 h-3" />
                <span>Rhythm: 4s Inhale • 4s Hold • 6s Exhale</span>
              </div>
            </div>
          )}

          {/* Patience - Heartfelt Support Letters written dynamically */}
          {activeTab === "patience" && (
            <div className="w-full max-w-2xl px-4 animate-fade-in flex flex-col">
              
              {/* Type Category selectors */}
              <div className="flex flex-wrap justify-center gap-2 mb-6">
                {[
                  { id: "gentle-reminder", label: "Gentle Reminder", icon: Feather },
                  { id: "warm-embrace", label: "A Warm Embrace", icon: Heart },
                  { id: "midnight-whisper", label: "Midnight Whisper", icon: Sparkles }
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => generateNewLetter(item.id as any)}
                    className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-[10px] font-mono tracking-wider uppercase border transition-all duration-300 ${
                      letterType === item.id 
                        ? "bg-rose-500/15 text-pink-200 border-pink-400/50 shadow-[0_0_10px_rgba(244,63,94,0.15)]"
                        : "bg-black/30 text-rose-300/60 border-rose-500/10 hover:border-pink-500/30"
                    }`}
                  >
                    <item.icon className="w-3 h-3" />
                    {item.label}
                  </button>
                ))}
              </div>

              {/* Elegant scrollable glass letter box */}
              <div className="relative rounded-2xl bg-black/45 backdrop-blur-md border border-pink-500/15 p-6 md:p-8 max-h-[380px] overflow-y-auto shadow-[0_15px_30px_rgba(0,0,0,0.4)]">
                
                {isGeneratingLetter ? (
                  <div className="flex flex-col items-center justify-center py-16 text-center">
                    <div className="relative w-10 h-10 flex items-center justify-center">
                      <span className="absolute animate-ping inline-flex h-full w-full rounded-full bg-pink-400 opacity-30"></span>
                      <Feather className="w-6 h-6 text-rose-400 animate-pulse" />
                    </div>
                    <p className="mt-4 font-mono text-[10px] text-pink-300/60 tracking-widest uppercase">
                      Whispering a message from the cosmos...
                    </p>
                  </div>
                ) : (
                  <div className="text-left font-sans text-rose-100/90 leading-relaxed text-sm md:text-base space-y-4">
                    {generatedLetter.split("\n\n").map((para, idx) => (
                      <p key={idx} className="whitespace-pre-line tracking-wide">
                        {para}
                      </p>
                    ))}
                  </div>
                )}
              </div>

              {/* Generate/Refresh indicator */}
              <div className="mt-4 flex justify-between items-center px-2">
                <span className="text-[9px] font-mono text-rose-400/40 tracking-wider">
                  * Dynamic responses empowered by our supportive server structure.
                </span>
                
                <button
                  onClick={() => generateNewLetter(letterType)}
                  disabled={isGeneratingLetter}
                  title="Ask Gemini to dynamically rewrite a unique warm comfort letter to Frey"
                  className="flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-wider text-rose-300 hover:text-pink-400 transition-colors disabled:opacity-40"
                >
                  <RefreshCw className={`w-3 h-3 ${isGeneratingLetter ? "animate-spin" : ""}`} />
                  Re-author
                </button>
              </div>

            </div>
          )}

          {/* Release - Custom dedicated Comfort Poetry */}
          {activeTab === "release" && (
            <div className="w-full max-w-xl px-4 animate-fade-in">
              <div className="relative rounded-2xl bg-gradient-to-b from-[#1b1017]/80 to-[#0e0a0d]/95 border border-pink-500/20 p-8 text-center shadow-[0_20px_40px_rgba(0,0,0,0.5)]">
                
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#0d0a0d] px-4 py-1 border border-pink-500/20 rounded-full">
                  <span className="text-[9px] font-mono text-pink-300/70 uppercase tracking-[0.2em]">
                    Canto For Frey
                  </span>
                </div>

                {isGeneratingPoem ? (
                  <div className="flex flex-col items-center justify-center py-16 text-center">
                    <div className="w-8 h-8 rounded-full border-2 border-dashed border-rose-500 animate-spin mb-4" />
                    <p className="font-mono text-[10px] text-pink-300/60 uppercase tracking-widest">
                      Weaving starlight and rose petals into prose...
                    </p>
                  </div>
                ) : (
                  <div className="font-serif italic font-light text-rose-100 text-base md:text-lg leading-loose space-y-6 max-h-[300px] overflow-y-auto py-2">
                    {generatedPoem.split("\n\n").map((stanza, idx) => (
                      <p key={idx} className="whitespace-pre-line tracking-wide">
                        {stanza}
                      </p>
                    ))}
                  </div>
                )}
                
              </div>

              <div className="mt-6 flex justify-center">
                <button
                  onClick={generateNewPoem}
                  disabled={isGeneratingPoem}
                  className="group flex items-center p-3 px-6 rounded-full bg-[#1b1017]/50 hover:bg-rose-500/10 border border-pink-500/30 text-rose-100 font-mono text-[10px] tracking-widest uppercase transition-all duration-300 hover:scale-105 hover:border-pink-400 active:scale-95 disabled:opacity-40"
                >
                  <RefreshCw className={`w-3 h-3 mr-2 text-rose-400 group-hover:rotate-180 transition-transform duration-500 ${isGeneratingPoem ? "animate-spin" : ""}`} />
                  Dream Up a Different Poem
                </button>
              </div>
            </div>
          )}

        </main>

        {/* Guided Interaction Grid (Token bar matching the 'Artistic Flair' Design HTML) */}
        <div className="interaction-grid grid grid-cols-4 gap-3 sm:gap-6 w-full max-w-xl z-20 my-4" id="interaction-navigation">
          
          {/* Breathe Token */}
          <button
            onClick={() => setActiveTab("breathe")}
            className={`token aspect-square border rounded-full flex flex-col bg-white/[0.02] backdrop-blur-md items-center justify-center p-2 cursor-pointer transition-all duration-300 ${
              activeTab === "breathe"
                ? "border-pink-500 bg-rose-500/15 shadow-[0_0_20px_rgba(244,63,94,0.25)] scale-105"
                : "border-pink-500/30 hover:border-pink-500/60 hover:bg-rose-500/5 hover:-translate-y-0.5"
            }`}
          >
            <div className={`token-icon w-2.5 h-2.5 rounded-full bg-rose-400 mb-3 shadow-[0_0_8px_#f43f5e] transition-opacity duration-300 ${activeTab === "breathe" ? "opacity-100 animate-ping" : "opacity-50"}`} />
            <span className="token-label font-mono tracking-widest uppercase text-[9px] sm:text-[10px] text-pink-100 font-light">
              Breathe
            </span>
          </button>

          {/* Strength (Quotes) Token */}
          <button
            onClick={() => {
              setActiveTab("strength");
              handleRandomQuote();
            }}
            className={`token aspect-square border rounded-full flex flex-col bg-white/[0.02] backdrop-blur-md items-center justify-center p-2 cursor-pointer transition-all duration-300 ${
              activeTab === "strength"
                ? "border-pink-500 bg-rose-500/15 shadow-[0_0_20px_rgba(244,63,94,0.25)] scale-105"
                : "border-pink-500/30 hover:border-pink-500/60 hover:bg-rose-500/5 hover:-translate-y-0.5"
            }`}
          >
            <div className={`token-icon w-2.5 h-2.5 rounded-full bg-rose-400 mb-3 shadow-[0_0_8px_#f43f5e] transition-opacity duration-300 ${activeTab === "strength" ? "opacity-100" : "opacity-30"}`} />
            <span className="token-label font-mono tracking-widest uppercase text-[9px] sm:text-[10px] text-pink-100 font-light">
              Strength
            </span>
          </button>

          {/* Patience (Letters) Token */}
          <button
            onClick={() => {
              setActiveTab("patience");
              if (!generatedLetter) {
                generateNewLetter("gentle-reminder");
              }
            }}
            className={`token aspect-square border rounded-full flex flex-col bg-white/[0.02] backdrop-blur-md items-center justify-center p-2 cursor-pointer transition-all duration-300 ${
              activeTab === "patience"
                ? "border-pink-500 bg-rose-500/15 shadow-[0_0_20px_rgba(244,63,94,0.25)] scale-105"
                : "border-pink-500/30 hover:border-pink-500/60 hover:bg-rose-500/5 hover:-translate-y-0.5"
            }`}
          >
            <div className={`token-icon w-2.5 h-2.5 rounded-full bg-rose-400 mb-3 shadow-[0_0_8px_#f43f5e] transition-opacity duration-300 ${activeTab === "patience" ? "opacity-100" : "opacity-30"}`} />
            <span className="token-label font-mono tracking-widest uppercase text-[9px] sm:text-[10px] text-pink-100 font-light">
              Letters
            </span>
          </button>

          {/* Release (Poem) Token */}
          <button
            onClick={() => {
              setActiveTab("release");
              if (!generatedPoem || generatedPoem === OFFLINE_POEM) {
                generateNewPoem();
              }
            }}
            className={`token aspect-square border rounded-full flex flex-col bg-white/[0.02] backdrop-blur-md items-center justify-center p-2 cursor-pointer transition-all duration-300 ${
              activeTab === "release"
                ? "border-pink-500 bg-rose-500/15 shadow-[0_0_20px_rgba(244,63,94,0.25)] scale-105"
                : "border-pink-500/30 hover:border-pink-500/60 hover:bg-rose-500/5 hover:-translate-y-0.5"
            }`}
          >
            <div className={`token-icon w-2.5 h-2.5 rounded-full bg-rose-400 mb-3 shadow-[0_0_8px_#f43f5e] transition-opacity duration-300 ${activeTab === "release" ? "opacity-100" : "opacity-30"}`} />
            <span className="token-label font-mono tracking-widest uppercase text-[9px] sm:text-[10px] text-pink-100 font-light">
              Poem
            </span>
          </button>

        </div>

        {/* Private Listener & Empathetic Comfort Response Unit inside unified screen boundary */}
        <div className="w-full max-w-xl bg-[#1b1017]/40 backdrop-blur-md border border-pink-500/10 rounded-2xl p-5 my-6 relative z-20 shadow-[0_10px_25px_rgba(0,0,0,0.3)]">
          <div className="flex items-center gap-2 mb-3">
            <MessageSquare className="w-4 h-4 text-pink-400" />
            <h3 className="text-xs font-mono font-medium text-pink-200 tracking-wider uppercase">
              Confide in This Silent Listener
            </h3>
          </div>

          <form onSubmit={handleSeekComfort} className="space-y-3">
            <div>
              <label className="block text-[10px] font-mono text-pink-300/60 uppercase tracking-widest mb-1.5">
                How is your heart feeling right now, Frey?
              </label>
              <div className="flex flex-wrap gap-2">
                {[
                  "broken & heavy",
                  "exhausted",
                  "lost in thought",
                  "misunderstood",
                  "seeking comfort"
                ].map((moodOption) => (
                  <button
                    key={moodOption}
                    type="button"
                    onClick={() => setCurrentFeeling(moodOption)}
                    className={`px-3 py-1 text-[10px] font-mono rounded-md border transition-all duration-300 ${
                      currentFeeling === moodOption
                        ? "bg-rose-500/20 border-pink-400 text-pink-200 shadow-[0_0_8px_rgba(244,63,94,0.2)]"
                        : "bg-black/20 border-pink-500/10 text-rose-300/50 hover:border-pink-500/30"
                    }`}
                  >
                    {moodOption}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label htmlFor="user-confession-input" className="block text-[10px] font-mono text-pink-300/60 uppercase tracking-widest mb-1.5">
                Share a quiet thought if you wish (Strictly Confidential)
              </label>
              <div className="relative">
                <input
                  id="user-confession-input"
                  type="text"
                  value={userThought}
                  onChange={(e) => setUserThought(e.target.value)}
                  placeholder="Type anything heavy or quiet on your mind..."
                  className="w-full bg-black/50 border border-pink-500/20 rounded-xl px-4 py-2 text-xs text-rose-100 placeholder-rose-300/30 focus:outline-none focus:border-pink-400/50 focus:ring-1 focus:ring-pink-400/20 font-sans tracking-wide pr-10 transition-all duration-300"
                />
                <button
                  type="submit"
                  disabled={isGeneratingComfort || (!userThought.trim() && !currentFeeling)}
                  id="seek-comfort-submit"
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-rose-400 hover:text-pink-300 transition-colors disabled:opacity-30"
                  title="Receive personal comfort"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </form>

          {/* Empathetic response box */}
          {(isGeneratingComfort || receivedComfortMessage) && (
            <div className="mt-4 pt-4 border-t border-pink-500/10 transition-all duration-500">
              {isGeneratingComfort ? (
                <div className="flex items-center gap-3 py-2">
                  <div className="flex gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-pink-400 animate-bounce" style={{ animationDelay: "0ms" }} />
                    <span className="w-1.5 h-1.5 rounded-full bg-pink-400 animate-bounce" style={{ animationDelay: "150ms" }} />
                    <span className="w-1.5 h-1.5 rounded-full bg-pink-400 animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                  <span className="text-[10px] font-mono text-pink-300/60 tracking-wider">
                    Listening carefully, crafting soft words...
                  </span>
                </div>
              ) : (
                <div className="bg-black/35 rounded-xl p-3 border border-pink-500/10 text-left animate-fade-in relative overflow-hidden">
                  <p className="font-serif text-xs md:text-sm italic text-pink-100/90 leading-relaxed">
                    {receivedComfortMessage}
                  </p>
                  
                  {listenerResponseError && (
                    <div className="mt-2 text-[8px] font-mono text-rose-400/50 italic float-right">
                      * Starry backup offline guide activated
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <footer className="footer select-none text-[10px] font-mono text-rose-300/40 uppercase tracking-[0.18em] mb-4 text-center flex flex-col items-center gap-1">
          <span>Click any token above to seek alternative warmth • Tap canvas to release star sparkles</span>
          <span className="text-rose-400/60 font-serif italic tracking-widest lowercase normal-case text-xs mt-1.5 p-1 px-3 rounded-full bg-pink-950/10 border border-pink-500/5">
            crafted with gentle care by camz for frey
          </span>
        </footer>

      </div>
    </div>
  );
}
