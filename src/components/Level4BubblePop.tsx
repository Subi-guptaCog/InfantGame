import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { synth } from '../utils/audioSynth';
import { FloatingBubble } from '../types';

interface Level4Props {
  onLevelComplete: () => void;
}

const BUBBLE_COLORS = [
  'from-pink-300/80 to-rose-400/80',
  'from-cyan-300/80 to-blue-400/80',
  'from-green-300/80 to-emerald-400/80',
  'from-yellow-300/80 to-amber-400/80',
  'from-purple-300/80 to-indigo-400/80',
  'from-orange-300/80 to-peach-400/80'
];

const SURPRISE_EMOJIS = ['🐣', '🐱', '🐶', '🐰', '🐼', '🐨', '🦊', '🦄', '🦁', '🐸', '🦁', '🐥'];

export default function Level4BubblePop({ onLevelComplete }: Level4Props) {
  const [bubbles, setBubbles] = useState<FloatingBubble[]>([]);
  const [poppedCount, setPoppedCount] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [popSurprises, setPopSurprises] = useState<Array<{ id: string; x: number; y: number; emoji: string }>>([]);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const autoAdvanceTimerRef = React.useRef<NodeJS.Timeout|null>(null);

  useEffect(() => {
    return () => {
      if (autoAdvanceTimerRef.current) {
        clearTimeout(autoAdvanceTimerRef.current);
      }
    };
  }, []);

  // Spawn bubbles periodically
  useEffect(() => {
    if (isCompleted) return;

    const spawnInterval = setInterval(() => {
      const containerHeight = containerRef.current?.clientHeight || 450;
      const size = 65 + Math.random() * 45; // 65px to 110px
      const color = BUBBLE_COLORS[Math.floor(Math.random() * BUBBLE_COLORS.length)];
      const emoji = SURPRISE_EMOJIS[Math.floor(Math.random() * SURPRISE_EMOJIS.length)];

      const newBubble: FloatingBubble = {
        id: Math.random().toString(),
        x: 5 + Math.random() * 85, // 5% to 90% boundary
        y: -100, // start just below bottom line
        size,
        color,
        speed: 1.8 + Math.random() * 2.2, // speed of rising
        emoji
      };

      setBubbles((prev) => [...prev, newBubble].slice(-25)); // Cap max bubbles on screen
    }, 1100);

    return () => clearInterval(spawnInterval);
  }, [isCompleted]);

  // Handle continuous bubble rising loop
  useEffect(() => {
    let animationFrameId: number;
    const containerHeight = containerRef.current?.clientHeight || 450;

    const animateBubbles = () => {
      setBubbles((prev) =>
        prev
          .map((b) => ({ ...b, y: b.y + b.speed }))
          // Remove if floated fully past top boundary
          .filter((b) => b.y < containerHeight + 150)
      );
      animationFrameId = requestAnimationFrame(animateBubbles);
    };

    animationFrameId = requestAnimationFrame(animateBubbles);
    return () => cancelAnimationFrame(animationFrameId);
  }, []);

  const popBubble = (bubble: FloatingBubble) => {
    if (isCompleted) return;

    // Remove popped bubble
    setBubbles((prev) => prev.filter((b) => b.id !== bubble.id));

    // Sounds
    synth.playBubblePop();

    // Create a floating surprise emoji at its coordinate
    const containerHeight = containerRef.current?.clientHeight || 450;
    const newSurprise = {
      id: Math.random().toString(),
      x: bubble.x,
      // Express y as remaining pixels from container top
      y: containerHeight - (bubble.y + 50),
      emoji: bubble.emoji
    };

    setPopSurprises((prev) => [...prev, newSurprise]);
    
    // Cleanup pop surprise after animation ends
    setTimeout(() => {
      setPopSurprises((prev) => prev.filter((s) => s.id !== newSurprise.id));
    }, 1200);

    // Track total pops
    setPoppedCount((prev) => {
      const nextCount = prev + 1;
      if (nextCount >= 15) {
        setIsCompleted(true);
        synth.playLevelUpChime();
        autoAdvanceTimerRef.current = setTimeout(() => {
          onLevelComplete();
        }, 5000);
      }
      return nextCount;
    });
  };

  // Keyboard support: baby hits a key, pop 2 random bubbles or cause wind!
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (isCompleted) return;
      if (e.key === 'Tab' || e.key === 'Escape') return;

      synth.playBubblePop();

      // Keyboard smashing pop sound, select 2 random bubbles to pop automatically!
      setBubbles((prev) => {
        if (prev.length === 0) return prev;
        const toPopIndex = Math.floor(Math.random() * prev.length);
        const bubbleToPop = prev[toPopIndex];
        
        // Use timeout to preserve pure state return
        setTimeout(() => popBubble(bubbleToPop), 0);
        return prev;
      });
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [bubbles, isCompleted]);

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full min-h-[500px] flex-1 rounded-3xl bg-cyan-50/70 border-8 border-white p-6 shadow-2xl overflow-hidden flex flex-col items-center justify-between select-none"
      id="level-4-bubbles"
    >
      {/* Top instruction header */}
      <div className="z-10 bg-white px-8 py-3 rounded-3xl shadow-xl border-8 border-cyan-400 text-center stop-propagation">
        <span className="font-display font-black text-xl md:text-3xl text-cyan-500 block uppercase tracking-wider">
          BUBBLE POPPER!
        </span>
        <span className="text-xs text-slate-500 font-bold block mt-0.5">
          Tap or hover on bubbles to pop them! Keypress pops too!
        </span>
      </div>

      {/* Spawning bubble container (upward translation) */}
      <div className="absolute inset-x-0 bottom-0 top-[80px] pointer-events-none">
        {bubbles.map((bubble) => (
          <motion.button
            key={bubble.id}
            onClick={() => popBubble(bubble)}
            // Make responsive hover pop to satisfy baby hands waving over touchpad
            onMouseEnter={() => popBubble(bubble)}
            className={`absolute pointer-events-auto rounded-full bg-gradient-to-tr ${bubble.color} shadow-lg border-2 border-white/60 cursor-pointer flex items-center justify-center stop-propagation`}
            style={{
              left: `${bubble.x}%`,
              bottom: `${bubble.y}px`,
              width: `${bubble.size}px`,
              height: `${bubble.size}px`,
            }}
            whileHover={{ scale: 1.15 }}
            id={`btn-bubble-${bubble.id}`}
          >
            {/* Glossy glare bubble detail */}
            <div className="absolute top-2 left-3 w-4 h-2.5 bg-white/60 rounded-full rotate-[-30deg]" />
            <div className="absolute bottom-1 right-2 w-1.5 h-1.5 bg-white/40 rounded-full" />
            <span className="text-2xl filter blur-[0.5px] opacity-25">🎈</span>
          </motion.button>
        ))}

        {/* Surprise popped emojis layer */}
        <AnimatePresence>
          {popSurprises.map((surprise) => (
            <motion.div
              key={surprise.id}
              initial={{ scale: 0.3, opacity: 1, y: 0 }}
              animate={{ scale: 3.5, opacity: 0, y: -150, rotate: 25 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.1, ease: 'easeOut' }}
              className="absolute text-center drop-shadow-md font-sans text-xl"
              style={{
                left: `${surprise.x}%`,
                top: `${surprise.y}px`,
              }}
            >
              {surprise.emoji}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Progress tracking banner */}
      <div className="z-10 bg-white/80 p-4 rounded-2xl w-full max-w-lg shadow-md border-2 border-cyan-100 stop-propagation">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-display font-black text-cyan-600 uppercase tracking-wider">
            Bubbles Popped
          </span>
          <span className="text-xs font-display font-black text-cyan-600 bg-cyan-50 px-2.5 py-0.5 rounded-full">
            {poppedCount} / 15 Pops
          </span>
        </div>

        {/* Level indicator */}
        <div className="flex justify-between gap-1">
          {Array.from({ length: 15 }).map((_, idx) => (
            <motion.div
              key={idx}
              animate={idx < poppedCount ? { scale: [1, 1.4, 1], rotate: [0, 15, 0] } : {}}
              transition={{ type: 'tween', duration: 0.3 }}
              className={`flex-1 h-5 rounded-full border flex items-center justify-center text-[10px] ${
                idx < poppedCount
                  ? 'bg-cyan-400 border-cyan-500 text-cyan-900 shadow-sm'
                  : 'bg-slate-100 border-slate-200 text-slate-300'
              }`}
            >
              💧
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
            className="absolute inset-0 bg-yellow-300/95 flex flex-col items-center justify-center text-center p-6 z-30"
          >
            <motion.div
              initial={{ scale: 0.5, rotate: -15 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', damping: 10 }}
              className="bg-white rounded-[4rem] p-8 max-w-sm shadow-2xl border-8 border-cyan-500 flex flex-col items-center gap-5 stop-propagation"
            >
              <div className="text-7xl animate-bounce">🎈🦄🌟</div>
              <h3 className="font-display font-black text-3xl text-cyan-600 leading-tight">
                Splendid Bubble Popper!
              </h3>
              <p className="font-sans font-bold text-slate-600 text-sm">
                Pop pop pop! It is time for our final level: Baby Animal Orchestra!
              </p>

              <button
                onClick={onLevelComplete}
                className="w-full py-4 bg-cyan-500 hover:bg-cyan-600 active:scale-95 text-white rounded-2xl font-display font-black text-lg shadow-xl tracking-wide border-b-4 border-cyan-700 transition-all flex items-center justify-center gap-2"
                id="btn-goto-l5"
              >
                Assemble the Band 🎷
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
