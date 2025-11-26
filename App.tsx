import React, { useState, useEffect, useCallback, useRef } from 'react';
import TimerFace from './components/TimerFace';
import MotivationalCoach from './components/MotivationalCoach';
import Confetti from './components/Confetti';
import { TimerStatus, TimerMode, THEMES } from './types';
import { formatTime } from './utils/timeUtils';
import { Play, Pause, Square, RotateCcw, Target, Download, Settings, ArrowUpCircle, ArrowDownCircle, CheckCircle, TrendingUp, Share2 } from 'lucide-react';

const App: React.FC = () => {
  // State
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [status, setStatus] = useState<TimerStatus>(TimerStatus.IDLE);
  
  // Settings State
  const [targetMinutes, setTargetMinutes] = useState<number>(15);
  const [mode, setMode] = useState<TimerMode>(TimerMode.GROWTH);
  const [themeKey, setThemeKey] = useState<string>('red');
  
  // UX State
  const [showSettings, setShowSettings] = useState(true);
  const [completedDuration, setCompletedDuration] = useState<number>(0);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  
  // New State for Goal Hit logic
  const [hasHitGoal, setHasHitGoal] = useState(false);
  const [showGoalOverlay, setShowGoalOverlay] = useState(false);

  // Timer Ref
  const timerIntervalRef = useRef<number | null>(null);

  // Current Theme Object
  const currentTheme = THEMES[themeKey] || THEMES['red'];

  // --- AUDIO & HAPTICS ---

  const triggerHaptic = (pattern: number | number[] = 10) => {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(pattern);
    }
  };

  const playSound = (freqStart: number, freqEnd: number, duration: number, type: 'sine' | 'triangle' = 'sine') => {
    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContext) {
        const ctx = new AudioContext();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        
        osc.type = type;
        osc.frequency.setValueAtTime(freqStart, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(freqEnd, ctx.currentTime + 0.1);
        
        // Envelope to prevent clicking
        gain.gain.setValueAtTime(0, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.3, ctx.currentTime + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);
        
        osc.start();
        osc.stop(ctx.currentTime + duration);
      }
    } catch (e) {
      console.error("Audio play failed", e);
    }
  };

  const playClickSound = () => playSound(400, 300, 0.1);
  const playStartSound = () => {
    playSound(300, 600, 0.3);
    setTimeout(() => playSound(400, 800, 0.4), 100);
  };
  const playPauseSound = () => playSound(400, 200, 0.2);
  const playGoalSound = () => {
    // Fanfare-ish
    playSound(523.25, 523.25, 0.2, 'triangle');
    setTimeout(() => playSound(659.25, 659.25, 0.2, 'triangle'), 150);
    setTimeout(() => playSound(783.99, 783.99, 0.4, 'triangle'), 300);
    setTimeout(() => playSound(1046.5, 1046.5, 0.8, 'triangle'), 450);
  };

  // PWA Install Prompt Listener
  useEffect(() => {
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  }, []);

  const handleInstallClick = async () => {
    triggerHaptic();
    playClickSound();
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') setDeferredPrompt(null);
  };

  const handleShareClick = async () => {
    triggerHaptic();
    playClickSound();
    const shareData = {
      title: 'FocusUp',
      text: 'Check out this visual focus timer!',
      url: window.location.href
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(window.location.href);
        alert('Link copied to clipboard!');
      }
    } catch (err) {
      console.error('Error sharing:', err);
    }
  };

  // Timer Logic
  const startTimer = useCallback(() => {
    triggerHaptic(50);
    playStartSound();
    setStatus(TimerStatus.RUNNING);
    setShowSettings(false);
    
    // Resume interval
    if (!timerIntervalRef.current) {
        timerIntervalRef.current = window.setInterval(() => {
            setElapsedSeconds(prev => prev + 1);
        }, 1000);
    }
  }, []);

  const pauseTimer = useCallback(() => {
    triggerHaptic(50);
    playPauseSound();
    setStatus(TimerStatus.PAUSED);
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
  }, []);

  const stopTimer = useCallback(() => {
    triggerHaptic([50, 50, 50]);
    playPauseSound();
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
    setStatus(TimerStatus.COMPLETED);
    setCompletedDuration(elapsedSeconds);
    setShowGoalOverlay(false); // Hide intermediate overlay
  }, [elapsedSeconds]);

  // Goal Check Logic
  useEffect(() => {
    if (status === TimerStatus.RUNNING) {
        const targetSeconds = targetMinutes * 60;
        
        // Check if we JUST hit the target
        if (elapsedSeconds === targetSeconds && !hasHitGoal) {
            // GOAL HIT!
            setHasHitGoal(true);
            playGoalSound();
            triggerHaptic([100, 50, 100, 50, 200]); // Victory vibe
            pauseTimer(); // Auto-stop/pause
            setShowGoalOverlay(true);
        }
    }
  }, [elapsedSeconds, targetMinutes, status, hasHitGoal, pauseTimer]);

  const handleKeepGoing = () => {
      triggerHaptic();
      playClickSound();
      setShowGoalOverlay(false);
      startTimer();
  };

  const resetTimer = useCallback(() => {
    triggerHaptic();
    playClickSound();
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
    setStatus(TimerStatus.IDLE);
    setElapsedSeconds(0);
    setCompletedDuration(0);
    setHasHitGoal(false);
    setShowGoalOverlay(false);
    setShowSettings(true);
  }, []);

  // Cleanup
  useEffect(() => {
    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, []);

  const handleTargetChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value);
    if (!isNaN(val)) {
      setTargetMinutes(Math.min(val, 60)); 
      
      // Enhanced Haptic Feedback for Slider
      if (val % 5 === 0) {
        triggerHaptic(20); // Stronger tick on 5-minute increments
      } else {
        triggerHaptic(5); // Very light tick on single minutes
      }
    }
  };

  const toggleSettings = () => {
      triggerHaptic();
      playClickSound();
      setShowSettings(!showSettings);
  };

  const handleThemeChange = (key: string) => {
      triggerHaptic();
      playClickSound();
      setThemeKey(key);
  };

  const handleModeChange = (m: TimerMode) => {
      triggerHaptic();
      playClickSound();
      setMode(m);
  }

  const getDisplayTime = () => {
    if (mode === TimerMode.COUNTDOWN) {
        const total = targetMinutes * 60;
        const remaining = Math.max(0, total - elapsedSeconds);
        return formatTime(remaining);
    }
    return formatTime(elapsedSeconds);
  };

  return (
    <div className={`min-h-screen ${currentTheme.bg} flex flex-col items-center py-6 px-4 font-sans select-none touch-manipulation transition-colors duration-500 overflow-hidden`}>
      
      {/* Confetti Celebration (Fires on Goal Hit OR Complete) */}
      {(showGoalOverlay || status === TimerStatus.COMPLETED) && <Confetti />}

      {/* Header */}
      <header className="mb-4 text-center relative w-full max-w-md flex items-center justify-between">
         <div className="flex flex-col items-start">
            <h1 className="text-3xl font-black text-slate-800 tracking-tight">FocusUp</h1>
         </div>

         <div className="flex gap-2">
            {/* Share Button */}
            <button 
                onClick={handleShareClick}
                className="p-2 bg-white text-slate-500 rounded-full hover:bg-slate-100 shadow-sm transition-colors"
                title="Share App"
            >
                <Share2 className="w-6 h-6" />
            </button>

            {/* Settings Toggle */}
            {status === TimerStatus.IDLE && (
                <button 
                    onClick={toggleSettings}
                    className="p-2 bg-white text-slate-500 rounded-full hover:bg-slate-100 shadow-sm transition-colors"
                >
                    <Settings className="w-6 h-6" />
                </button>
            )}

            {deferredPrompt && (
            <button 
                onClick={handleInstallClick}
                className="p-2 bg-indigo-100 text-indigo-600 rounded-full hover:bg-indigo-200 transition-colors"
            >
                <Download className="w-6 h-6" />
            </button>
            )}
         </div>
      </header>

      {/* Main Card */}
      <main className={`w-full max-w-md bg-white rounded-3xl shadow-xl p-6 border-b-8 ${currentTheme.border} relative flex flex-col items-center transition-all duration-300`}>
        
        {/* Settings Panel */}
        {status === TimerStatus.IDLE && showSettings && (
          <div className="mb-8 w-full space-y-6 bg-slate-50 p-5 rounded-2xl border border-slate-100 animate-in fade-in slide-in-from-top-4 duration-300">
            
            <div className="flex justify-between gap-4">
                <div className="flex-1">
                     <label className="text-xs font-bold text-slate-400 mb-2 block uppercase tracking-wider">Mode</label>
                     <div className="flex bg-white rounded-lg p-1 border border-slate-200 shadow-sm">
                        <button 
                            onClick={() => handleModeChange(TimerMode.GROWTH)}
                            className={`flex-1 py-2 rounded-md flex justify-center ${mode === TimerMode.GROWTH ? 'bg-slate-100 text-slate-800 font-bold' : 'text-slate-400'}`}
                        >
                            <ArrowUpCircle className="w-5 h-5" />
                        </button>
                        <button 
                            onClick={() => handleModeChange(TimerMode.COUNTDOWN)}
                            className={`flex-1 py-2 rounded-md flex justify-center ${mode === TimerMode.COUNTDOWN ? 'bg-slate-100 text-slate-800 font-bold' : 'text-slate-400'}`}
                        >
                            <ArrowDownCircle className="w-5 h-5" />
                        </button>
                     </div>
                </div>
            </div>

            <div>
                 <label className="text-xs font-bold text-slate-400 mb-2 block uppercase tracking-wider">Theme</label>
                 <div className="flex justify-between gap-2">
                    {Object.entries(THEMES).map(([key, theme]) => (
                        <button
                            key={key}
                            onClick={() => handleThemeChange(key)}
                            className={`w-10 h-10 rounded-full border-4 transition-transform active:scale-95 ${themeKey === key ? 'border-slate-800 scale-110' : 'border-transparent'}`}
                            style={{ backgroundColor: theme.primary }}
                            title={theme.name}
                        />
                    ))}
                 </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                 <label className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
                    <Target className="w-3 h-3" />
                    Goal Time
                  </label>
                 <span className={`font-black text-xl ${currentTheme.secondary}`}>{targetMinutes} min</span>
              </div>
              <input
                type="range"
                min="1"
                max="60"
                value={targetMinutes}
                onChange={handleTargetChange}
                className="w-full h-6 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-slate-800 touch-none"
              />
              <div className="flex justify-between text-xs text-slate-400 font-bold mt-1 px-1">
                <span>1m</span>
                <span>15m</span>
                <span>30m</span>
                <span>45m</span>
                <span>60m</span>
              </div>
            </div>
          </div>
        )}

        {/* --- VISUAL TIMER AREA (Container) --- */}
        <div className="relative w-full flex flex-col items-center mb-8">
            
            {/* The Timer Face */}
            <div className={`w-full max-w-[280px] aspect-square flex items-center justify-center transition-opacity duration-500 ${status === TimerStatus.COMPLETED || showGoalOverlay ? 'opacity-20 blur-sm' : 'opacity-100'}`}>
              <TimerFace 
                elapsedSeconds={elapsedSeconds} 
                targetMinutes={targetMinutes}
                mode={mode}
                color={currentTheme.primary}
              />
            </div>

            {/* OVERLAY: Goal Reached */}
            {showGoalOverlay && (
                <div className="absolute inset-0 z-20 flex flex-col items-center justify-center animate-in zoom-in-90 duration-300">
                    <h2 className="text-4xl font-black text-slate-800 mb-2 drop-shadow-md text-center">Goal Reached!</h2>
                    <p className="text-slate-500 font-bold mb-6 text-center max-w-[200px]">You hit {targetMinutes} minutes!</p>
                    
                    <div className="flex flex-col gap-3 w-3/4">
                        <button 
                            onClick={handleKeepGoing}
                            className="bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-6 rounded-xl shadow-lg flex items-center justify-center gap-2 transform active:scale-95 transition-all"
                        >
                            <TrendingUp className="w-5 h-5" />
                            Keep Growing
                        </button>
                        <button 
                            onClick={stopTimer}
                            className="bg-white border-2 border-slate-200 hover:bg-slate-50 text-slate-600 font-bold py-3 px-6 rounded-xl flex items-center justify-center gap-2 transform active:scale-95 transition-all"
                        >
                            <CheckCircle className="w-5 h-5" />
                            I'm Done
                        </button>
                    </div>
                </div>
            )}

            {/* OVERLAY: Completed (Badge) */}
            {status === TimerStatus.COMPLETED && (
                 <div className="absolute inset-0 z-30 flex items-center justify-center">
                    <MotivationalCoach durationSeconds={completedDuration} />
                 </div>
            )}
            
            {/* Digital Display (Hidden if completed/overlay to reduce clutter) */}
            {!showGoalOverlay && status !== TimerStatus.COMPLETED && (
                <>
                <div className={`mt-6 text-7xl font-black tracking-tighter tabular-nums ${currentTheme.secondary} transition-colors`}>
                {getDisplayTime()}
                </div>
                
                <p className="text-slate-400 font-medium mt-2 text-lg">
                    {status === TimerStatus.IDLE ? "Ready to focus?" : 
                    status === TimerStatus.RUNNING ? (mode === TimerMode.COUNTDOWN ? "Time remaining" : "Time focused") : 
                    status === TimerStatus.PAUSED ? "Paused" : "Well done!"}
                </p>
                </>
            )}
        </div>

        {/* Controls - Hide completely if showing overlays */}
        {!showGoalOverlay && status !== TimerStatus.COMPLETED && (
            <div className="flex justify-center gap-3 w-full mt-auto">
            {status === TimerStatus.IDLE && (
                <button
                onClick={startTimer}
                style={{ backgroundColor: currentTheme.primary }}
                className="flex items-center justify-center gap-3 hover:brightness-110 active:scale-95 text-white text-xl font-bold py-5 rounded-2xl shadow-xl w-full transition-all"
                >
                <Play fill="currentColor" /> START
                </button>
            )}

            {status === TimerStatus.RUNNING && (
                <div className="flex gap-3 w-full">
                    <button
                    onClick={pauseTimer}
                    className="flex-1 flex items-center justify-center gap-2 bg-amber-400 hover:bg-amber-500 text-white font-bold py-4 rounded-2xl shadow-lg transition-all active:scale-95"
                    >
                    <Pause fill="currentColor" /> PAUSE
                    </button>
                    <button
                    onClick={stopTimer}
                    className="flex-1 flex items-center justify-center gap-2 bg-slate-200 hover:bg-slate-300 text-slate-600 font-bold py-4 rounded-2xl shadow-lg transition-all active:scale-95"
                    >
                    <Square fill="currentColor" /> DONE
                    </button>
                </div>
            )}

            {status === TimerStatus.PAUSED && (
                <div className="flex gap-3 w-full">
                    <button
                    onClick={startTimer}
                    className="flex-1 flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white font-bold py-4 rounded-2xl shadow-lg transition-all active:scale-95"
                    >
                    <Play fill="currentColor" /> RESUME
                    </button>
                    <button
                    onClick={stopTimer}
                    className="flex-1 flex items-center justify-center gap-2 bg-slate-200 hover:bg-slate-300 text-slate-600 font-bold py-4 rounded-2xl shadow-lg transition-all active:scale-95"
                    >
                    <Square fill="currentColor" /> FINISH
                    </button>
                </div>
            )}
            </div>
        )}

        {/* New Session Button for Completed State */}
        {status === TimerStatus.COMPLETED && (
             <button
              onClick={resetTimer}
              className="mt-4 flex items-center justify-center gap-3 bg-slate-800 hover:bg-slate-900 text-white text-xl font-bold py-4 rounded-2xl w-full shadow-xl transition-all active:scale-95 z-40 relative"
            >
              <RotateCcw /> NEW SESSION
            </button>
        )}

      </main>
    </div>
  );
};

export default App;