import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Heart, Baby, Star } from 'lucide-react';
import { synth } from './utils/audioSynth';
import { GameLevel } from './types';
import SoundSettings from './components/SoundSettings';
import Confetti from './components/Confetti';

// Import level components
import Level1ColorFlash from './components/Level1ColorFlash';
import Level2ShapeQuiz from './components/Level2ShapeQuiz';
import Level3PuppyLand from './components/Level3PuppyLand';
import Level4BubblePop from './components/Level4BubblePop';
import Level5AnimalOrchestra from './components/Level5AnimalOrchestra';

export default function App() {
  const [level, setLevel] = useState<GameLevel>(1);
  const [confettiActive, setConfettiActive] = useState(false);
  const [lullabyPlaying, setLullabyPlaying] = useState(false);
  const [bgPulse, setBgPulse] = useState(false);

  // Global keypress trigger for the keyboard-masher response
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      // Prevent browser default actions for keys babies might slam
      if (e.key === ' ' || e.key === 'ArrowUp' || e.key === 'ArrowDown') {
        e.preventDefault();
      }
      
      // Flash application outer frame
      setBgPulse(true);
      setTimeout(() => setBgPulse(false), 300);
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, []);

  const triggerConfettiSuccess = () => {
    setConfettiActive(true);
    setTimeout(() => {
      setConfettiActive(false);
    }, 4000);
  };

  const handleLevelComplete = () => {
    triggerConfettiSuccess();
    
    // Play giggle sound specifically when finishing the Endless Level 5
    if (level === 5) {
      synth.playBabyGiggle();
    }
    
    // Increment level or reset
    setLevel((prev) => {
      if (prev === 5) {
        return 1;
      }
      return (prev + 1) as GameLevel;
    });
  };

  const selectLevelDirectly = (lvl: GameLevel) => {
    synth.playInteractiveDing(523.25 + lvl * 60);
    setLevel(lvl);
    triggerConfettiSuccess();
  };

  return (
    <div
      className={`min-h-screen bg-sky-100 text-slate-800 font-sans flex flex-col justify-between p-3 sm:p-6 transition-all duration-305 overflow-x-hidden ${
        bgPulse ? 'ring-12 ring-pink-400' : ''
      }`}
      style={{
        backgroundColor: '#E0F2FE'
      }}
      id="baby-game-root"
    >
      {/* Light-weight celebratory particles */}
      <Confetti active={confettiActive} durationMs={4000} />

      {/* Main Arcade Frame Wrapper */}
      <div className="w-full max-w-4xl mx-auto flex-1 flex flex-col justify-between gap-5">
        
        {/* Header Branding Banner */}
        <header className="flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left bg-white p-5 rounded-[2rem] shadow-xl border-8 border-purple-400" id="game-banner">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white border-4 border-yellow-400 rounded-2xl flex items-center justify-center text-2xl shadow-inner animate-soft-bounce">
              👶
            </div>
            <div>
              <h1 className="font-display font-black text-2xl md:text-3xl text-purple-600 tracking-wide flex items-center justify-center sm:justify-start gap-1">
                BABY SENSORY PLAY!
                <Sparkles className="w-5 h-5 text-yellow-400 animate-pulse fill-yellow-400" />
              </h1>
              <p className="text-slate-600 text-xs font-bold tracking-wide">
                Giggles & Sounds Arcade for 1-Year-Olds
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 bg-purple-100 px-4 py-2 rounded-full border-2 border-purple-300">
            <Star className="w-4 h-4 text-purple-500 fill-purple-500 animate-spin" />
            <span className="text-purple-700 text-xs font-display font-black uppercase tracking-wider">
               Kid Safe • Offline Synthesized
            </span>
          </div>
        </header>

        {/* Level Candy Bar Selector */}
        <section className="bg-white/95 rounded-3xl p-4 shadow-lg border-4 border-yellow-200 flex flex-col md:flex-row items-center justify-between gap-4" id="level-selector-candybar">
          <div className="flex items-center gap-2">
            <Baby className="w-5 h-5 text-rose-500 animate-bounce" />
            <span className="font-display font-black text-sm md:text-base text-slate-700 tracking-wide">
              Tap any level balloon:
            </span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2.5 sm:gap-4">
            {([
              { num: 1, label: 'Color Flash 🎨', emoji: '🐱' },
              { num: 2, label: 'Shapes 🔺', emoji: '🟡' },
              { num: 3, label: 'Puppies 🐶', emoji: '🐕' },
              { num: 4, label: 'Bubbles 🫧', emoji: '🎈' },
              { num: 5, label: 'Band 🎷', emoji: '🦁' }
            ] as const).map((lvl) => {
              const isActive = level === lvl.num;
              return (
                <button
                  key={lvl.num}
                  onClick={() => selectLevelDirectly(lvl.num)}
                  className={`relative flex items-center gap-1.5 px-3 py-2 sm:px-4 sm:py-2.5 rounded-full font-display font-black text-xs sm:text-sm border-2 cursor-pointer transition-all active:scale-90 shadow-md ${
                    isActive
                      ? 'bg-rose-500 text-white border-rose-600 ring-4 ring-rose-300 ring-offset-2 scale-105'
                      : 'bg-indigo-50 hover:bg-indigo-100 border-indigo-250 text-indigo-700'
                  }`}
                  id={`btn-select-level-${lvl.num}`}
                >
                  <span className="text-sm">{lvl.emoji}</span>
                  <span>{lvl.label}</span>
                </button>
              );
            })}
          </div>
        </section>

        {/* Level Screen Sandbox with transition */}
        <main className="relative flex-1 bg-white rounded-[3rem] p-3 sm:p-6 shadow-2xl border-8 border-yellow-400 flex flex-col justify-center min-h-[480px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={level}
              initial={{ x: 50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -50, opacity: 0 }}
              transition={{ duration: 0.35, ease: 'easeInOut' }}
              className="w-full h-full"
            >
              {level === 1 && (
                <Level1ColorFlash onLevelComplete={handleLevelComplete} />
              )}
              {level === 2 && (
                <Level2ShapeQuiz onLevelComplete={handleLevelComplete} />
              )}
              {level === 3 && (
                <Level3PuppyLand onLevelComplete={handleLevelComplete} />
              )}
              {level === 4 && (
                <Level4BubblePop onLevelComplete={handleLevelComplete} />
              )}
              {level === 5 && (
                <Level5AnimalOrchestra
                  onLevelComplete={handleLevelComplete}
                  lullabyPlaying={lullabyPlaying}
                  onLullabyChange={(playing) => setLullabyPlaying(playing)}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </main>

        {/* Bottom Volume, Parents tips, and Lullaby Controllers */}
        <footer className="w-full">
          <SoundSettings
            lullabyPlaying={lullabyPlaying}
            onLullabyChange={(playing) => setLullabyPlaying(playing)}
          />
          
          {/* Subtle safety disclaimer */}
          <div className="text-center text-[10px] text-slate-500 font-sans mt-3 tracking-wide flex items-center justify-center gap-1">
            <Heart className="w-3 h-3 text-rose-500 fill-rose-500" />
            Designed safely with friendly volume and baby laughter logic. Fits all laptops, tablets, and mobile screens.
          </div>
        </footer>

      </div>
    </div>
  );
}
