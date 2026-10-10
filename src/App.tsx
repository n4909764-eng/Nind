/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { AnimatePresence, motion } from 'motion/react';
import {
  ArrowUp,
  ExternalLink,
  Globe,
  Loader2,
  Mic,
  PenLine,
  Sparkles,
  TrendingUp,
  X,
} from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';

interface GroundingSource {
  title: string;
  uri: string;
}

interface CandleData {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  isBullish: boolean;
}

interface CryptoPriceInfo {
  name: string;
  symbol: string;
  priceUsd: number;
  bidPrice: number;
  askPrice: number;
  spreadUsd: number;
  spreadPercent: number;
  change24h: number;
  change24hUsd: number;
  high24h: number;
  low24h: number;
  volume24h: number;
  quoteVolumeUsd: number;
  vwap: number;
  tradesCount: number;
  timestamp: string;
  recentCandles: CandleData[];
  immediateSupport: number;
  immediateResistance: number;
  localPeak30d: number;
  localLow30d: number;
  rsi14: number;
  rsiInterpretation: string;
  ema9: number;
  ema20: number;
  ema50: number;
  ema100: number;
  sma20: number;
  trendStructure: string;
  macdLine: number;
  macdSignal: number;
  macdHistogram: number;
  bbUpper: number;
  bbMiddle: number;
  bbLower: number;
  bbPercentB: number;
  bbBandWidth: number;
  atr: number;
  atrPercent: number;
  max30d: number;
  min30d: number;
  swingRange: number;
  fib382: number;
  fib500: number;
  fib618: number;
  fib1272: number;
  fib1618: number;
  fib2000: number;
  fib2618: number;
  openInterestContracts: number;
  openInterestUsd: number;
  fundingRate: string | null;
  fearAndGreed: string | null;
  shortSqueezeCluster: string;
  longFlushCluster: string;
  smc?: {
    fvg: string;
    liquiditySweep: string;
    marketStructure: string;
    wyckoffPhase: string;
    orderBlock: string;
  };
  rsiDivergence?: string;
  vwapDeviationBands?: {
    upperBand1Sigma: number;
    lowerBand1Sigma: number;
    status: string;
  };
  volumeTrend?: string;
  forecast: {
    targetHorizonForecast?: {
      timeframeLabel: string;
      targetPrice: number;
      corridorMin: number;
      corridorMax: number;
      bias: 'bullish' | 'bearish' | 'neutral';
      probability: number;
      expectedChangePercent: number;
      bullTrigger: number;
      bearInvalidation: number;
    };
    realistic24hRange: string;
    tacticalWeeklyCorridor: string;
    bullTargetFib: string;
    bearSupportRisk: string;
    target2027: string;
    formulaBasis: string;
  };
}

interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

// Visual 7-day candlestick chart component
function CandlestickChart({
  candles,
  immediateSupport,
  immediateResistance,
}: {
  candles?: CandleData[];
  price: number;
  immediateSupport: number;
  immediateResistance: number;
}) {
  if (!candles || candles.length === 0) return null;

  const allLows = candles.map((c) => c.low).filter((n) => n > 0);
  const allHighs = candles.map((c) => c.high).filter((n) => n > 0);
  if (allLows.length === 0 || allHighs.length === 0) return null;

  const validSupport = immediateSupport > 0 ? immediateSupport : (allLows[0] || 1);
  const validResistance = immediateResistance > 0 ? immediateResistance : (allHighs[0] || 1);
  const minPrice = Math.min(...allLows, validSupport * 0.996);
  const maxPrice = Math.max(...allHighs, validResistance * 1.004);
  const range = maxPrice - minPrice || 1;

  const height = 90;
  const paddingY = 8;
  const plotHeight = height - paddingY * 2;

  const getY = (val: number) => {
    return paddingY + plotHeight - ((val - minPrice) / range) * plotHeight;
  };

  return (
    <div className="p-2.5 rounded-lg bg-neutral-950/90 border border-neutral-800/80 mb-3 font-mono">
      <div className="flex items-center justify-between text-[11px] text-neutral-400 mb-1.5 pb-1 border-b border-neutral-800/60">
        <span className="flex items-center gap-1.5 text-neutral-300 font-medium">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          Фактический свечной график (Binance 7D)
        </span>
        <div className="flex items-center gap-2 text-[10px]">
          <span className="text-emerald-400">Поддержка: ${Math.round(immediateSupport).toLocaleString()}</span>
          <span className="text-neutral-600">•</span>
          <span className="text-rose-400">Сопротивление: ${Math.round(immediateResistance).toLocaleString()}</span>
        </div>
      </div>

      <div className="relative w-full h-[105px] flex items-end justify-between gap-1 pt-1 select-none">
        {candles.map((c, i) => {
          const yHigh = getY(c.high);
          const yLow = getY(c.low);
          const yOpen = getY(c.open);
          const yClose = getY(c.close);
          const topBody = Math.min(yOpen, yClose);
          const bodyHeight = Math.max(3, Math.abs(yClose - yOpen));
          const isCurrent = i === candles.length - 1;

          return (
            <div key={i} className="flex-1 flex flex-col items-center h-full relative group cursor-pointer">
              <svg className="w-full h-[82px] overflow-visible">
                {/* High-Low Wick */}
                <line
                  x1="50%"
                  x2="50%"
                  y1={yHigh}
                  y2={yLow}
                  stroke={c.isBullish ? '#34d399' : '#f43f5e'}
                  strokeWidth={1.5}
                />
                {/* Open-Close Body */}
                <rect
                  x="20%"
                  width="60%"
                  y={topBody}
                  height={bodyHeight}
                  fill={c.isBullish ? '#10b981' : '#ef4444'}
                  rx={1}
                />
              </svg>
              <span className={`text-[9px] mt-1 ${isCurrent ? 'text-emerald-300 font-bold' : 'text-neutral-500'}`}>
                {isCurrent ? 'Сегодня' : c.date.split(' ')[0]}
              </span>

              {/* Tooltip on hover */}
              <div className="absolute bottom-full mb-1 hidden group-hover:flex flex-col bg-neutral-900 border border-neutral-700 text-[10px] text-neutral-200 px-2.5 py-1.5 rounded shadow-2xl whitespace-nowrap z-30 pointer-events-none font-mono">
                <span className="font-bold text-white border-b border-neutral-800 pb-0.5 mb-1">{c.date}</span>
                <span className="text-neutral-400">Открытие: <strong className="text-white">${c.open.toLocaleString()}</strong></span>
                <span className="text-emerald-400">High: <strong>${c.high.toLocaleString()}</strong></span>
                <span className="text-rose-400">Low: <strong>${c.low.toLocaleString()}</strong></span>
                <span className="text-neutral-300">Закрытие: <strong className="text-white">${c.close.toLocaleString()}</strong></span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function App() {
  const [isEyes, setIsEyes] = useState(false);
  const [isBlinking, setIsBlinking] = useState(false);
  const [showWelcome, setShowWelcome] = useState(false);
  const [welcomeFinished, setWelcomeFinished] = useState(false);
  const [isMicActive, setIsMicActive] = useState(false);
  const [audioVolume, setAudioVolume] = useState(0);
  const [micError, setMicError] = useState<string | null>(null);
  const [isInputOpen, setIsInputOpen] = useState(false);
  const [messageText, setMessageText] = useState('');
  const [isMobile, setIsMobile] = useState(false);

  // AI & Conversation State
  const [aiState, setAiState] = useState<'idle' | 'listening' | 'thinking' | 'speaking'>('idle');
  const [history, setHistory] = useState<ChatMessage[]>([]);
  const [aiResponse, setAiResponse] = useState<{
    text: string;
    sources: GroundingSource[];
    searchQueries: string[];
    cryptoData?: CryptoPriceInfo[];
  } | null>(null);
  const [userQueryDisplay, setUserQueryDisplay] = useState<string | null>(null);

  const welcomeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioContextRef = useRef<AudioContext | null>(null);
  const recognitionRef = useRef<any>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Responsive dimensions
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 640);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Web Speech API fallback setup
  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      try {
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'ru-RU';

        recognition.onresult = (event: any) => {
          let transcript = '';
          for (let i = event.resultIndex; i < event.results.length; ++i) {
            transcript += event.results[i][0].transcript;
          }
          if (transcript.trim()) {
            setMessageText(transcript);
          }
        };

        recognition.onerror = () => {
          // Fallback to audio recorder
        };

        recognitionRef.current = recognition;
      } catch {
        // Restricted environment
      }
    }
  }, []);

  // Natural blink loop when in eyes mode
  useEffect(() => {
    if (!isEyes || aiState === 'thinking') {
      setIsBlinking(false);
      return;
    }

    let timeoutId: ReturnType<typeof setTimeout>;
    const interval = setInterval(() => {
      setIsBlinking(true);
      timeoutId = setTimeout(() => {
        setIsBlinking(false);
      }, 480);
    }, 8000);

    return () => {
      clearInterval(interval);
      clearTimeout(timeoutId);
    };
  }, [isEyes, aiState]);

  // Morph toggle
  const toggle = () => {
    const nextIsEyes = !isEyes;
    setIsEyes(nextIsEyes);
    setIsBlinking(false);

    if (welcomeTimerRef.current) {
      clearTimeout(welcomeTimerRef.current);
      welcomeTimerRef.current = null;
    }

    if (nextIsEyes) {
      setWelcomeFinished(false);
      setShowWelcome(true);
      welcomeTimerRef.current = setTimeout(() => {
        setShowWelcome(false);
      }, 3800);
    } else {
      setShowWelcome(false);
      setWelcomeFinished(false);
      setIsInputOpen(false);
      setAiResponse(null);
      setUserQueryDisplay(null);
      setAiState('idle');
      stopAudioRecording();
    }
  };

  const stopAudioRecording = () => {
    setIsMicActive(false);
    setAudioVolume(0);

    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }

    if (audioContextRef.current) {
      audioContextRef.current.close().catch(() => {});
      audioContextRef.current = null;
    }

    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {}
    }
  };

  // Trigger expressive double-blink on AI answer
  const triggerEyesReaction = () => {
    setIsBlinking(true);
    setTimeout(() => {
      setIsBlinking(false);
      setTimeout(() => {
        setIsBlinking(true);
        setTimeout(() => setIsBlinking(false), 160);
      }, 140);
    }, 160);
  };

  // Send message to Gemini with search grounding
  const sendToAi = async (prompt: string, audioData?: string, mimeType?: string) => {
    setAiState('thinking');
    setUserQueryDisplay(prompt || '🎙️ Голосовой запрос');
    setAiResponse(null);

    const userMessageText = prompt || 'Голосовое сообщение';
    const newHistory: ChatMessage[] = [...history, { role: 'user', text: userMessageText }];
    setHistory(newHistory);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          audioData,
          mimeType,
          history: newHistory,
        }),
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        throw new Error(data.details || data.error || 'Ошибка связи с ИИ');
      }

      setAiResponse({
        text: data.text,
        sources: data.sources || [],
        searchQueries: data.searchQueries || [],
        cryptoData: data.cryptoData || [],
      });

      setHistory((prev) => [...prev, { role: 'model', text: data.text }]);
      setAiState('speaking');
      triggerEyesReaction();
    } catch (err: any) {
      console.warn('AI chat error:', err?.message || err);
      let userFriendlyMessage = 'Не удалось получить ответ. Пожалуйста, попробуйте снова через минуту.';
      const msg = err?.message || String(err);

      if (msg.includes('429') || msg.includes('quota') || msg.includes('RESOURCE_EXHAUSTED')) {
        userFriendlyMessage = 'Лимит запросов к Gemini API временно исчерпан. Пожалуйста, подождите 1 минуту и повторите запрос.';
      } else if (!msg.startsWith('{')) {
        userFriendlyMessage = `Не удалось получить ответ: ${msg}`;
      }

      setAiResponse({
        text: userFriendlyMessage,
        sources: [],
        searchQueries: [],
      });
      setAiState('idle');
    }
  };

  // Handle Microphone toggle with robust getUserMedia & audio streaming
  const handleToggleMic = async () => {
    if (isMicActive) {
      // Stop recording and process
      setIsMicActive(false);

      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.onstop = () => {
          const audioBlob = new Blob(audioChunksRef.current, {
            type: mediaRecorderRef.current?.mimeType || 'audio/webm',
          });

          stopAudioRecording();

          if (messageText.trim()) {
            sendToAi(messageText.trim());
            setMessageText('');
          } else if (audioBlob.size > 200) {
            const reader = new FileReader();
            reader.onloadend = () => {
              const base64 = (reader.result as string).split(',')[1];
              sendToAi('', base64, audioBlob.type || 'audio/webm');
            };
            reader.readAsDataURL(audioBlob);
          }
        };

        mediaRecorderRef.current.stop();
      } else {
        stopAudioRecording();
        if (messageText.trim()) {
          sendToAi(messageText.trim());
          setMessageText('');
        }
      }
      return;
    }

    setMicError(null);

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setIsMicActive(false);
      setAiState('idle');
      setMicError('Микрофон недоступен в этом контексте. Введите сообщение текстом:');
      setIsInputOpen(true);
      setTimeout(() => inputRef.current?.focus(), 150);
      setTimeout(() => setMicError(null), 5000);
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
        },
      });

      mediaStreamRef.current = stream;

      // Setup audio analyzer for volume reactivity
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        try {
          const audioCtx = new AudioCtx();
          audioContextRef.current = audioCtx;
          const source = audioCtx.createMediaStreamSource(stream);
          const analyser = audioCtx.createAnalyser();
          analyser.fftSize = 64;
          source.connect(analyser);

          const dataArray = new Uint8Array(analyser.frequencyBinCount);
          const checkVolume = () => {
            if (!mediaStreamRef.current) return;
            analyser.getByteFrequencyData(dataArray);
            let sum = 0;
            for (let i = 0; i < dataArray.length; i++) {
              sum += dataArray[i];
            }
            const avg = sum / dataArray.length;
            setAudioVolume(Math.min(1, avg / 45));
            requestAnimationFrame(checkVolume);
          };
          checkVolume();
        } catch {
          // ignore visualizer error
        }
      }

      // MediaRecorder initialization
      audioChunksRef.current = [];
      const mimeTypes = ['audio/webm;codecs=opus', 'audio/webm', 'audio/ogg;codecs=opus', 'audio/mp4'];
      let selectedMime = '';
      for (const m of mimeTypes) {
        if (MediaRecorder.isTypeSupported(m)) {
          selectedMime = m;
          break;
        }
      }

      const recorder = selectedMime ? new MediaRecorder(stream, { mimeType: selectedMime }) : new MediaRecorder(stream);
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };
      mediaRecorderRef.current = recorder;
      recorder.start(200);

      // Start speech recognition in parallel if supported
      if (recognitionRef.current) {
        try {
          recognitionRef.current.start();
        } catch {
          // ignore
        }
      }

      setIsMicActive(true);
      setAiState('listening');
      setMessageText('');
    } catch (err: any) {
      console.warn('Microphone permission not granted in current context:', err?.message || err);
      setIsMicActive(false);
      setAiState('idle');
      setMicError('Доступ к микрофону не предоставлен. Напишите ваш вопрос:');
      setIsInputOpen(true);
      setTimeout(() => inputRef.current?.focus(), 150);
      setTimeout(() => setMicError(null), 5000);
    }
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim()) return;

    const query = messageText.trim();
    setMessageText('');
    setIsInputOpen(false);
    sendToAi(query);
  };

  useEffect(() => {
    return () => {
      stopAudioRecording();
      if (welcomeTimerRef.current) {
        clearTimeout(welcomeTimerRef.current);
      }
    };
  }, []);

  const circleSize = isMobile ? 240 : 320;
  const eyeWidth = isMobile ? 86 : 104;
  const eyeHeight = isMobile ? 150 : 180;
  const currentEyeHeight = isBlinking ? Math.round(eyeHeight * 0.82) : eyeHeight;
  const eyeOffset = isMobile ? 49 : 59;
  const currentRadius = isEyes ? eyeWidth / 2 : circleSize / 2;

  // Reactivity of eyes based on AI state
  const thinkingOffset = aiState === 'thinking' ? 6 : 0;
  const listeningScale = isMicActive ? 1 + audioVolume * 0.12 : 1;

  return (
    <main
      className="relative flex min-h-screen w-full flex-col items-center justify-center overflow-hidden bg-black select-none font-sf"
      tabIndex={0}
      aria-label="Интерактивный белый круг и глаза ИИ на черном фоне"
    >
      {/* Clickable AI Presence / Shape */}
      <button
        type="button"
        onClick={toggle}
        aria-label={
          isEyes
            ? 'Глаза искусственного интеллекта. Нажмите для возврата к кругу'
            : 'Белый круг. Нажмите для пробуждения искусственного интеллекта'
        }
        className="group relative cursor-pointer p-8 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/40 rounded-full"
      >
        <div className="grid place-items-center">
          {/* Left Eye */}
          <motion.div
            className="col-start-1 row-start-1 bg-white select-none pointer-events-none"
            initial={false}
            animate={{
              width: isEyes ? eyeWidth * listeningScale : circleSize,
              height: isEyes ? currentEyeHeight * listeningScale : circleSize,
              borderRadius: currentRadius,
              x: isEyes
                ? -eyeOffset + (aiState === 'thinking' ? Math.sin(Date.now() / 200) * thinkingOffset : 0)
                : 0,
              y: 0,
              opacity: aiState === 'thinking' ? [1, 0.75, 1] : 1,
            }}
            transition={{
              opacity: aiState === 'thinking' ? { repeat: Infinity, duration: 1.4 } : { duration: 0.3 },
              default: {
                type: 'spring',
                stiffness: 190,
                damping: 22,
                mass: 0.85,
              },
            }}
          />

          {/* Right Eye */}
          <motion.div
            className="col-start-1 row-start-1 bg-white select-none pointer-events-none"
            initial={false}
            animate={{
              width: isEyes ? eyeWidth * listeningScale : circleSize,
              height: isEyes ? currentEyeHeight * listeningScale : circleSize,
              borderRadius: currentRadius,
              x: isEyes
                ? eyeOffset + (aiState === 'thinking' ? Math.sin(Date.now() / 200) * thinkingOffset : 0)
                : 0,
              y: 0,
              opacity: aiState === 'thinking' ? [1, 0.75, 1] : 1,
            }}
            transition={{
              opacity: aiState === 'thinking' ? { repeat: Infinity, duration: 1.4 } : { duration: 0.3 },
              default: {
                type: 'spring',
                stiffness: 190,
                damping: 22,
                mass: 0.85,
              },
            }}
          />
        </div>
      </button>

      {/* Shimmer Welcome Text */}
      <AnimatePresence
        onExitComplete={() => {
          if (isEyes) {
            setWelcomeFinished(true);
          }
        }}
      >
        {showWelcome && (
          <motion.div
            key="welcome-text"
            initial={{ opacity: 0, y: 14, filter: 'blur(6px)' }}
            animate={{
              opacity: 1,
              y: 0,
              filter: 'blur(0px)',
              transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] },
            }}
            exit={{
              opacity: 0,
              y: -8,
              filter: 'blur(8px)',
              transition: { duration: 1.4, ease: [0.25, 0.1, 0.25, 1] },
            }}
            className="pointer-events-none absolute top-[calc(50%+105px)] sm:top-[calc(50%+122px)] left-1/2 -translate-x-1/2 whitespace-nowrap z-10"
          >
            <span className="font-sf animate-shimmer text-xl sm:text-2xl font-normal tracking-[-0.02em]">
              Welcome, innorks!
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* AI Response Display Card with Google Search Grounding */}
      <AnimatePresence>
        {isEyes && aiResponse && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.96 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="absolute top-[calc(50%+100px)] sm:top-[calc(50%+115px)] left-1/2 -translate-x-1/2 w-[92vw] max-w-xl max-h-[46vh] sm:max-h-[50vh] overflow-y-auto z-30 p-5 rounded-2xl bg-neutral-950/90 border border-neutral-800/90 backdrop-blur-2xl shadow-2xl text-white"
          >
            {/* Header with status and close button */}
            <div className="flex items-center justify-between pb-3 border-b border-neutral-800/80 mb-3">
              <div className="flex items-center gap-2 text-xs font-medium text-neutral-400 flex-wrap">
                <Sparkles className="w-4 h-4 text-white" />
                <span className="text-white font-medium">Оракул Будущего</span>
                {aiResponse.sources.length > 0 && (
                  <span className="flex items-center gap-1.5 text-[11px] text-emerald-400 bg-emerald-950/70 border border-emerald-800/60 px-2.5 py-0.5 rounded-full">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    <Globe className="w-3 h-3" />
                    Поиск в сети ({aiResponse.sources.length})
                  </span>
                )}
              </div>
              <button
                type="button"
                onClick={() => setAiResponse(null)}
                className="w-7 h-7 rounded-full text-neutral-400 hover:text-white hover:bg-neutral-800 flex items-center justify-center transition-colors"
                aria-label="Закрыть ответ"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* User query quote */}
            {userQueryDisplay && (
              <p className="text-xs text-neutral-500 mb-2 italic">
                &ldquo;{userQueryDisplay}&rdquo;
              </p>
            )}

            {/* Live Crypto & Quantitative Predictive Terminal Card */}
            {aiResponse.cryptoData && aiResponse.cryptoData.length > 0 && (
              <div className="mb-4 space-y-3">
                {aiResponse.cryptoData.map((item, idx) => {
                  const isPositive = item.change24h >= 0;
                  return (
                    <div
                      key={idx}
                      className="rounded-xl border border-neutral-800 bg-neutral-900/90 p-3.5 backdrop-blur-md shadow-xl"
                    >
                      {/* Top row: Symbol, Name, Live dot, Time */}
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-white tracking-wide">{item.name}</span>
                          <span className="text-[11px] text-neutral-400 font-mono bg-neutral-800/80 px-2 py-0.5 rounded">
                            {item.symbol}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 text-[11px] text-emerald-400 font-mono">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                          <span>{item.timestamp}</span>
                        </div>
                      </div>

                      {/* Big Spot Price & 24h Change */}
                      <div className="flex items-baseline justify-between mb-3">
                        <div className="text-2xl sm:text-3xl font-bold tracking-tight text-white font-mono">
                          ${item.priceUsd < 1
                            ? item.priceUsd.toFixed(4)
                            : item.priceUsd.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </div>
                        <div
                          className={`text-xs font-semibold px-2 py-0.5 rounded-full font-mono flex items-center gap-1 ${
                            isPositive
                              ? 'text-emerald-300 bg-emerald-950/80 border border-emerald-800/60'
                              : 'text-rose-300 bg-rose-950/80 border border-rose-800/60'
                          }`}
                        >
                          <span>{isPositive ? '▲ +' : '▼ '}{item.change24h.toFixed(2)}%</span>
                          <span className="opacity-80">
                            ({isPositive ? '+$' : '-$'}{Math.abs(item.change24hUsd).toFixed(item.priceUsd < 1 ? 4 : 2)})
                          </span>
                        </div>
                      </div>

                      {/* Real Candlestick Chart (7 Days) */}
                      <CandlestickChart
                        candles={item.recentCandles}
                        price={item.priceUsd}
                        immediateSupport={item.immediateSupport}
                        immediateResistance={item.immediateResistance}
                      />

                      {/* Technical Indicators & Order Book Grid */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] mb-3 p-2.5 rounded-lg bg-neutral-950/70 border border-neutral-800/60 font-mono">
                        <div>
                          <span className="text-neutral-500 block">RSI (14) & MACD</span>
                          <span className={`font-semibold ${item.rsi14 >= 70 ? 'text-rose-400' : item.rsi14 <= 30 ? 'text-emerald-400' : 'text-neutral-200'}`}>
                            {item.rsi14} <span className="text-[10px] font-normal text-neutral-400">({item.macdHistogram >= 0 ? '+' : ''}{item.macdHistogram.toFixed(1)})</span>
                          </span>
                        </div>
                        <div>
                          <span className="text-neutral-500 block">EMA 9 / 20 / 50</span>
                          <span className="text-neutral-200 font-medium text-[10px]">
                            ${Math.round(item.ema9).toLocaleString()} / ${Math.round(item.ema20).toLocaleString()}
                          </span>
                        </div>
                        <div>
                          <span className="text-neutral-500 block">Боллинджер (%B {item.bbPercentB}%)</span>
                          <span className="text-neutral-200 font-medium text-[10px]">
                            ${Math.round(item.bbLower).toLocaleString()} – ${Math.round(item.bbUpper).toLocaleString()}
                          </span>
                        </div>
                        <div>
                          <span className="text-neutral-500 block">ОИ Деривативов / F&G</span>
                          <span className="text-neutral-200 font-medium text-[10px]">
                            ${(item.openInterestUsd / 1e9).toFixed(2)}B • {item.fearAndGreed?.split('/')[0] || '65'}
                          </span>
                        </div>
                      </div>

                      {/* Laser-Focused Target Horizon Forecast Hero Card */}
                      {item.forecast?.targetHorizonForecast && (
                        <div className="mb-3 p-3 rounded-lg bg-gradient-to-br from-indigo-950/70 via-neutral-900/90 to-purple-950/50 border border-indigo-500/50 shadow-xl">
                          <div className="flex items-center justify-between text-xs font-semibold text-indigo-300 mb-2">
                            <div className="flex items-center gap-1.5">
                              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                              <span className="tracking-wide">
                                ТОЧНЫЙ ПРОГНОЗ: {item.forecast.targetHorizonForecast.timeframeLabel.toUpperCase()}
                              </span>
                            </div>
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-200 border border-indigo-400/30">
                              Вероятность {item.forecast.targetHorizonForecast.probability}%
                            </span>
                          </div>

                          <div className="flex items-baseline justify-between mb-2.5">
                            <div>
                              <span className="text-[10px] text-neutral-400 block font-mono">РАСЧЕТНАЯ ЦЕЛЕВАЯ ЦЕНА (TARGET):</span>
                              <div className="text-2xl sm:text-3xl font-bold font-mono text-white tracking-tight">
                                ${item.forecast.targetHorizonForecast.targetPrice < 1
                                  ? item.forecast.targetHorizonForecast.targetPrice.toFixed(4)
                                  : item.forecast.targetHorizonForecast.targetPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                              </div>
                            </div>
                            <div
                              className={`text-xs font-bold px-2.5 py-1 rounded-md font-mono ${
                                item.forecast.targetHorizonForecast.expectedChangePercent >= 0
                                  ? 'text-emerald-300 bg-emerald-950/90 border border-emerald-700/60'
                                  : 'text-rose-300 bg-rose-950/90 border border-rose-700/60'
                              }`}
                            >
                              {item.forecast.targetHorizonForecast.expectedChangePercent >= 0 ? '▲ +' : '▼ '}
                              {item.forecast.targetHorizonForecast.expectedChangePercent}%
                            </div>
                          </div>

                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 text-[11px] font-mono bg-neutral-950/80 p-2 rounded border border-neutral-800/70">
                            <div>
                              <span className="text-neutral-500 block text-[10px]">Коридор волатильности:</span>
                              <span className="text-neutral-200 font-semibold text-[10px]">
                                ${Math.round(item.forecast.targetHorizonForecast.corridorMin).toLocaleString()} – ${Math.round(item.forecast.targetHorizonForecast.corridorMax).toLocaleString()}
                              </span>
                            </div>
                            <div>
                              <span className="text-neutral-500 block text-[10px]">Триггер пробоя вверх:</span>
                              <span className="text-emerald-400 font-semibold text-[10px]">
                                ${Math.round(item.forecast.targetHorizonForecast.bullTrigger).toLocaleString()}
                              </span>
                            </div>
                            <div>
                              <span className="text-neutral-500 block text-[10px]">Отмена сценария (стоп):</span>
                              <span className="text-rose-400 font-semibold text-[10px]">
                                ${Math.round(item.forecast.targetHorizonForecast.bearInvalidation).toLocaleString()}
                              </span>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Institutional Smart Money Concepts (SMC), Wyckoff & Divergences Block */}
                      {item.smc && (
                        <div className="mb-3 p-3 rounded-lg bg-neutral-950/90 border border-neutral-800 text-[11px] font-mono shadow-md">
                          <div className="flex items-center justify-between pb-2 mb-2 border-b border-neutral-800/80">
                            <div className="flex items-center gap-1.5 text-xs font-semibold text-purple-300">
                              <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-ping" />
                              <span>ИНСТИТУЦИОНАЛЬНЫЙ АНАЛИЗ (SMC & ВАЙКОФФ & ДИВЕРГЕНЦИИ)</span>
                            </div>
                            <span className="text-[10px] px-2 py-0.5 rounded bg-purple-950/80 text-purple-300 border border-purple-800/60 font-sans">
                              Thinking Level: HIGH
                            </span>
                          </div>

                          <div className="space-y-1.5 text-[11px] text-neutral-300">
                            <div className="flex items-start gap-1.5">
                              <span className="text-neutral-500 shrink-0">Цикл Вайкоффа:</span>
                              <span className="text-purple-200 font-medium">{item.smc.wyckoffPhase}</span>
                            </div>
                            <div className="flex items-start gap-1.5">
                              <span className="text-neutral-500 shrink-0">SMC Дисбаланс:</span>
                              <span className="text-emerald-300">{item.smc.fvg}</span>
                            </div>
                            <div className="flex items-start gap-1.5">
                              <span className="text-neutral-500 shrink-0">Ликвидность:</span>
                              <span className="text-indigo-300">{item.smc.liquiditySweep}</span>
                            </div>
                            <div className="flex items-start gap-1.5">
                              <span className="text-neutral-500 shrink-0">Дивергенции:</span>
                              <span className="text-amber-300">{item.rsiDivergence}</span>
                            </div>
                            {item.vwapDeviationBands && (
                              <div className="flex items-start gap-1.5">
                                <span className="text-neutral-500 shrink-0">VWAP Коридор (±1σ):</span>
                                <span className="text-neutral-200 font-medium">
                                  ${item.vwapDeviationBands.lowerBand1Sigma.toLocaleString()} – ${item.vwapDeviationBands.upperBand1Sigma.toLocaleString()}{' '}
                                  <span className="text-neutral-400">({item.vwapDeviationBands.status})</span>
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Mathematical Fibonacci & Volatility Forecast Box */}
                      {item.forecast && (
                        <div className="pt-2.5 border-t border-neutral-800/70">
                          <div className="flex items-center justify-between text-xs font-medium text-neutral-300 mb-2">
                            <div className="flex items-center gap-1.5">
                              <TrendingUp className="w-3.5 h-3.5 text-indigo-400" />
                              <span>Глубокая математическая модель и прогноз (Фибоначчи + Ончейн):</span>
                            </div>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-1.5 text-[11px] font-mono mb-2">
                            <div className="bg-neutral-950/60 p-2 rounded border border-neutral-800/60">
                              <span className="text-neutral-500 block text-[10px]">Суточный (24–48ч):</span>
                              <span className="text-neutral-200 font-semibold">{item.forecast.realistic24hRange?.split('(')[0] || 'В расчете'}</span>
                            </div>
                            <div className="bg-emerald-950/30 p-2 rounded border border-emerald-900/50">
                              <span className="text-emerald-400/90 block text-[10px]">Тактический (1–2 нед.):</span>
                              <span className="text-emerald-300 font-semibold">{item.forecast.tacticalWeeklyCorridor?.split('(')[0] || 'В расчете'}</span>
                            </div>
                            <div className="bg-indigo-950/30 p-2 rounded border border-indigo-900/50">
                              <span className="text-indigo-400/90 block text-[10px]">Бычий таргет (1–3 мес.):</span>
                              <span className="text-indigo-300 font-semibold">{item.forecast.bullTargetFib || 'В расчете'}</span>
                            </div>
                          </div>
                          <div className="flex flex-col gap-1 text-[10px] text-neutral-400 font-mono bg-neutral-950/40 p-2 rounded border border-neutral-800/40">
                            <div><span className="text-neutral-500 font-sans">Свечные экстремумы (30д):</span> Мин ${Math.round(item.localLow30d || 0).toLocaleString()} — Макс ${Math.round(item.localPeak30d || 0).toLocaleString()}</div>
                            <div><span className="text-neutral-500 font-sans">Кластер ликвидаций:</span> Шорт-сквиз: {item.shortSqueezeCluster || '—'} | Стопы: {item.longFlushCluster || '—'}</div>
                            <div><span className="text-neutral-500 font-sans">База расчета:</span> {item.forecast.formulaBasis || 'Свечной график (7д)'}</div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* AI Text Content */}
            <div className="text-sm sm:text-base leading-relaxed text-neutral-200 whitespace-pre-wrap select-text">
              {aiResponse.text}
            </div>

            {/* Grounding Sources (Search Results) */}
            {aiResponse.sources.length > 0 && (
              <div className="mt-4 pt-3 border-t border-neutral-800/80">
                <p className="text-xs text-neutral-400 mb-2 font-medium flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5 text-emerald-400" />
                  Актуальные первоисточники из интернета:
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {aiResponse.sources.slice(0, 6).map((source, idx) => (
                    <a
                      key={idx}
                      href={source.uri}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs text-neutral-300 hover:text-white bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 px-2.5 py-1 rounded-lg transition-colors max-w-xs truncate group"
                    >
                      <span className="truncate">{source.title || 'Источник'}</span>
                      <ExternalLink className="w-3 h-3 shrink-0 opacity-60 group-hover:opacity-100" />
                    </a>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Thinking / Searching Indicator */}
      <AnimatePresence>
        {isEyes && aiState === 'thinking' && !aiResponse && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute top-[calc(50%+115px)] left-1/2 -translate-x-1/2 z-20 flex items-center gap-2.5 px-4 py-2 rounded-full bg-neutral-900/95 border border-neutral-800 text-neutral-200 text-xs sm:text-sm backdrop-blur-md shadow-2xl"
          >
            <Loader2 className="w-4 h-4 animate-spin text-white" />
            <span className="flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
              Сканирую сеть в реальном времени и моделирую будущее...
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mic Error Notification */}
      <AnimatePresence>
        {micError && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute bottom-28 left-1/2 -translate-x-1/2 z-30 px-4 py-2 rounded-full bg-red-950/90 border border-red-800/80 text-red-200 text-xs shadow-xl"
          >
            {micError}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bottom Controls: Mic and Write Buttons / Input Field */}
      <AnimatePresence>
        {isEyes && welcomeFinished && (
          <motion.div
            initial={{ opacity: 0, y: 24, filter: 'blur(4px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            exit={{ opacity: 0, y: 24, filter: 'blur(4px)' }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20 flex items-center justify-center w-full px-4"
          >
            <AnimatePresence mode="wait">
              {!isInputOpen ? (
                /* Two circular buttons: Microphone & Write */
                <motion.div
                  key="action-buttons"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.3 }}
                  className="flex items-center gap-5"
                >
                  {/* Microphone Button */}
                  <div className="relative flex flex-col items-center">
                    <button
                      type="button"
                      onClick={handleToggleMic}
                      aria-label={isMicActive ? 'Остановить запись и отправить' : 'Включить микрофон'}
                      className={`relative flex items-center justify-center w-14 h-14 rounded-full transition-all duration-300 ${
                        isMicActive
                          ? 'bg-red-500 text-white shadow-[0_0_35px_rgba(239,68,68,0.7)] scale-110'
                          : 'bg-neutral-900 text-neutral-200 border border-neutral-700/70 hover:bg-neutral-800 hover:text-white hover:border-neutral-500 hover:scale-105 active:scale-95'
                      }`}
                    >
                      {isMicActive ? (
                        <>
                          <Mic className="w-6 h-6 animate-pulse" />
                          <span
                            className="absolute -inset-2 rounded-full border border-red-400/60 pointer-events-none transition-transform"
                            style={{
                              transform: `scale(${1 + audioVolume * 0.4})`,
                              opacity: 0.5 + audioVolume * 0.5,
                            }}
                          />
                        </>
                      ) : (
                        <Mic className="w-6 h-6" />
                      )}
                    </button>
                    {isMicActive && (
                      <span className="absolute -top-7 text-xs font-medium text-red-400 whitespace-nowrap animate-pulse">
                        {messageText ? messageText.slice(-25) : 'Говорите...'}
                      </span>
                    )}
                  </div>

                  {/* Write ("Написать") Button */}
                  <button
                    type="button"
                    onClick={() => {
                      setIsInputOpen(true);
                      setTimeout(() => inputRef.current?.focus(), 100);
                    }}
                    aria-label="Написать сообщение"
                    className="flex items-center justify-center w-14 h-14 rounded-full bg-neutral-900 text-neutral-200 border border-neutral-700/70 hover:bg-neutral-800 hover:text-white hover:border-neutral-500 hover:scale-105 active:scale-95 transition-all duration-300"
                  >
                    <PenLine className="w-6 h-6" />
                  </button>
                </motion.div>
              ) : (
                /* Input field that expands upon clicking "Написать" */
                <motion.form
                  key="input-form"
                  initial={{ opacity: 0, scale: 0.94, width: '120px' }}
                  animate={{ opacity: 1, scale: 1, width: '100%' }}
                  exit={{ opacity: 0, scale: 0.94, width: '120px' }}
                  transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                  onSubmit={handleSendMessage}
                  className="flex items-center gap-2.5 bg-neutral-900/95 border border-neutral-700/80 backdrop-blur-xl px-4 py-2.5 rounded-full w-full max-w-md shadow-2xl"
                >
                  <input
                    ref={inputRef}
                    type="text"
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    placeholder="Спросите о будущем, технологиях, событиях или трендах..."
                    className="flex-1 bg-transparent text-white text-sm sm:text-base placeholder-neutral-500 outline-none font-sf"
                    autoFocus
                  />

                  {/* Send Button */}
                  <button
                    type="submit"
                    disabled={!messageText.trim()}
                    aria-label="Отправить запрос"
                    className="w-9 h-9 rounded-full bg-white text-black disabled:opacity-25 disabled:cursor-not-allowed flex items-center justify-center hover:scale-105 active:scale-95 transition-all"
                  >
                    <ArrowUp className="w-4 h-4 stroke-[2.5]" />
                  </button>

                  {/* Close Button */}
                  <button
                    type="button"
                    onClick={() => {
                      setIsInputOpen(false);
                      setMessageText('');
                    }}
                    aria-label="Закрыть ввод"
                    className="w-8 h-8 rounded-full text-neutral-400 hover:text-white flex items-center justify-center hover:bg-neutral-800 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </motion.form>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
