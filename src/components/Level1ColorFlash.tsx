import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { synth } from '../utils/audioSynth';
import { RippleEffect } from '../types';

interface Level1Props {
  onLevelComplete: () => void;
}

const PASTEL_COLORS = [
  'bg-emerald-300',
  'bg-amber-300',
  'bg-sky-300',
  'bg-rose-300',
  'bg-purple-300',
  'bg-orange-300',
  'bg-indigo-300',
  'bg-teal-300',
  'bg-fuchsia-300',
  'bg-yellow-300'
];

export default function Level1ColorFlash({ onLevelComplete }: Level1Props) {
  const [clickCount, setClickCount] = useState(0);
  const [colorIndex, setColorIndex] = useState(0);
  const [ripples, setRipples] = useState<RippleEffect[]>([]);
  const [isCompleted, setIsCompleted] = useState(false);
  const autoAdvanceTimerRef = React.useRef<NodeJS.Timeout | null>(null);

  // Clear timeout on unmount
  useEffect(() => {
    return () => {
      if (autoAdvanceTimerRef.current) {
        clearTimeout(autoAdvanceTimerRef.current);
      }
    };
  }, []);

  // Trigger interaction (both clicks, touches, and keypresses)
  const triggerInteraction = (clientX?: number, clientY?: number) => {
    if (isCompleted) return;

    // Pick a new color
    setColorIndex((prev) => (prev + 1) % PASTEL_COLORS.length);

    // Play sounds
    synth.playRandomAnimalSound();

    // Create ripple effect
    const x = clientX ?? window.innerWidth / 2;
    const y = clientY ?? window.innerHeight / 2;
    const newRipple: RippleEffect = {
      id: Math.random().toString() + Date.now(),
      x,
      y,
      color: [
        'rgba(244, 63, 94, 0.4)', // Rose
        'rgba(59, 130, 246, 0.4)', // Blue
        'rgba(16, 185, 129, 0.4)', // Green
        'rgba(245, 158, 11, 0.4)', // Amber
        'rgba(139, 92, 246, 0.4)'  // Purple
      ][Math.floor(Math.random() * 5)]
    };

    setRipples((prev) => [...prev, newRipple].slice(-5)); // Keep last 5 ripples

    // Increment count
    setClickCount((prev) => {
      const nextCount = prev + 1;
      if (nextCount >= 10) {
        setIsCompleted(true);
        synth.playLevelUpChime();
        // Give a slight delay before triggering callback or let them click-through
        autoAdvanceTimerRef.current = setTimeout(() => {
          onLevelComplete();
        }, 5000); // 5 sec auto-completion
      }
      return nextCount;
    });
  };

  // Click or touch on background
  const handleBgClick = (e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => {
    // Avoid triggering when tapping navigation or buttons
    if ((e.target as HTMLElement).closest('.stop-propagation')) {
      return;
    }

    let clientX: number | undefined;
    let clientY: number | undefined;

    if ('touches' in e && e.touches.length > 0) {
      // Prevents ghost clicks on touch devices/touchpads
      e.preventDefault();
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else if ('clientX' in e) {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    triggerInteraction(clientX, clientY);
  };

  // Listen to keyboard presses
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Ignore systematic buttons
      if (e.key === 'Tab' || e.key === 'Escape') return;
      triggerInteraction();
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [isCompleted]);

  return (
    <div
      onClick={handleBgClick}
      onTouchStart={handleBgClick}
      className={`relative w-full h-full min-h-[500px] flex-1 rounded-3xl cursor-pointer overflow-hidden transition-colors duration-500 shadow-2xl border-8 border-white ${PASTEL_COLORS[colorIndex]} flex flex-col items-center justify-between p-6 select-none`}
      id="level-1-playground"
    >
      {/* Ripples layer */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <AnimatePresence>
          {ripples.map((ripple) => (
            <motion.div
              key={ripple.id}
              initial={{ transform: 'translate(-50%, -50%) scale(0)', opacity: 1 }}
              animate={{ transform: 'translate(-50%, -50%) scale(8)', opacity: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              style={{
                position: 'absolute',
                left: ripple.x - 30, // adjust relative to container if needed (absolute is safe)
                top: ripple.y - 120, // offset roughly to match click
                width: '60px',
                height: '60px',
                borderRadius: '50%',
                backgroundColor: ripple.color,
              }}
            />
          ))}
        </AnimatePresence>
      </div>

      {/* Top instruction card */}
      <div className="z-10 bg-white px-8 py-3 rounded-3xl shadow-xl border-4 border-rose-400 text-center stop-propagation">
        <span className="font-display font-black text-xl md:text-2xl text-rose-600 block">
          🎈 Level 1: Color Fun!
        </span>
        <span className="text-xs md:text-sm text-slate-700 font-black block">
          Tap anywhere or press ANY key on your laptop!
        </span>
      </div>

      {/* Main interactive center character */}
      <div className="flex-1 flex flex-col justify-center items-center gap-4 text-center z-10 pointer-events-none">
        <motion.div
          animate={{
            scale: [1, 1.1, 1],
            rotate: [0, 5, -5, 0],
          }}
          transition={{
            repeat: Infinity,
            duration: 1.5,
            ease: 'easeInOut'
          }}
          className="text-8xl md:text-9xl filter drop-shadow-md select-none"
        >
          {clickCount % 3 === 0 ? '🐶' : clickCount % 3 === 1 ? '🐱' : '🐥'}
        </motion.div>
        
        <p className="font-display text-2xl md:text-3xl font-black text-slate-800 tracking-wide">
          {clickCount === 0 ? 'TAP ME! 👇' : 'BOING! 🎉'}
        </p>
      </div>

      {/* Progress tracker as stars */}
      <div className="z-10 bg-white/80 p-4 rounded-2xl w-full max-w-lg shadow-md border-2 border-white stop-propagation">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-display font-black text-rose-500 uppercase tracking-wider">
            Baby Progress
          </span>
          <span className="text-xs font-display font-black text-rose-600 bg-rose-50 px-2.5 py-0.5 rounded-full">
            {clickCount} / 10 Taps
          </span>
        </div>
        
        <div className="flex justify-between gap-1.5">
          {Array.from({ length: 10 }).map((_, idx) => (
            <motion.div
              key={idx}
              animate={idx < clickCount ? { scale: [1, 1.3, 1], rotate: [0, 15, 0] } : {}}
              transition={{ type: 'tween', duration: 0.3 }}
              className={`flex-1 h-8 rounded-full border-2 flex items-center justify-center text-sm md:text-base ${
                idx < clickCount
                  ? 'bg-yellow-400 border-yellow-500 text-yellow-900 shadow-sm'
                  : 'bg-slate-100 border-slate-200 text-slate-300'
              }`}
            >
              ⭐
            </motion.div>
          ))}
        </div>
      </div>

      {/* Success Modal Overlay */}
      <AnimatePresence>
        {isCompleted && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 bg-yellow-400/95 flex flex-col items-center justify-center text-center p-6 z-20 stop-propagation"
            id="l1-success-splash"
          >
            <motion.div
              initial={{ scale: 0.5, rotate: -15 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', damping: 10 }}
              className="bg-white rounded-[4rem] p-8 max-w-sm shadow-2xl border-8 border-rose-500 flex flex-col items-center gap-5"
            >
              <div className="text-7xl animate-bounce">🌟🏆🌟</div>
              <h3 className="font-display font-black text-3xl text-rose-600 leading-tight">
                Hooray! Baby Did It!
              </h3>
              <p className="font-sans font-bold text-slate-600 text-sm">
                Amazing clapping! Get ready for Level 2: Fun Shapes!
              </p>
              
              <button
                onClick={onLevelComplete}
                className="w-full py-4 bg-rose-500 hover:bg-rose-600 active:scale-95 text-white rounded-2xl font-display font-black text-lg shadow-xl tracking-wide border-b-4 border-rose-700 transition-all flex items-center justify-center gap-2"
                id="btn-goto-l2"
              >
                Go to Shapes 🎪
              </button>
              
              <span className="text-[10px] text-slate-400 font-sans italic">
                Auto-starting next level soon...
              </span>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
