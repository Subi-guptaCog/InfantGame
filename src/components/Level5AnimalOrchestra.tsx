import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Music, Sun, Sparkles } from 'lucide-react';
import { synth } from '../utils/audioSynth';

interface Level5Props {
  onLevelComplete: () => void;
  lullabyPlaying: boolean;
  onLullabyChange: (playing: boolean) => void;
}

interface OrchestraMember {
  id: string;
  emoji: string;
  name: string;
  instrument: string;
  color: string;
  borderColor: string;
  soundFn: () => void;
  primaryToneFreq: number;
}

export default function Level5AnimalOrchestra({ onLevelComplete, lullabyPlaying, onLullabyChange }: Level5Props) {
  const [activeAnimateMemberId, setActiveAnimateMemberId] = useState<string | null>(null);
  const [sparks, setSparks] = useState<Array<{ id: string; x: number; y: number; emoji: string }>>([]);

  // Orchestral members containing custom actions
  const members: OrchestraMember[] = [
    {
      id: 'dog',
      emoji: '🐶',
      name: 'Pup',
      instrument: 'Drums 🥁',
      color: 'bg-amber-100 hover:bg-amber-200 text-amber-900',
      borderColor: 'border-amber-400',
      soundFn: () => synth.playDogBark(),
      primaryToneFreq: 220
    },
    {
      id: 'cat',
      emoji: '🐱',
      name: 'Kitten',
      instrument: 'Harp 🪕',
      color: 'bg-rose-100 hover:bg-rose-200 text-rose-900',
      borderColor: 'border-rose-400',
      soundFn: () => synth.playCatMeow(),
      primaryToneFreq: 440
    },
    {
      id: 'duck',
      emoji: '🦆',
      name: 'Ducky',
      instrument: 'Trumpet 🎺',
      color: 'bg-yellow-100 hover:bg-yellow-200 text-yellow-900',
      borderColor: 'border-yellow-400',
      soundFn: () => synth.playDuckQuack(),
      primaryToneFreq: 330
    },
    {
      id: 'cow',
      emoji: '🐮',
      name: 'Calf',
      instrument: 'Bass 🎸',
      color: 'bg-emerald-100 hover:bg-emerald-200 text-emerald-900',
      borderColor: 'border-emerald-400',
      soundFn: () => synth.playCowMoo(),
      primaryToneFreq: 110
    },
    {
      id: 'bird',
      emoji: '🐦',
      name: 'Chirpy',
      instrument: 'Flute 🪈',
      color: 'bg-sky-100 hover:bg-sky-200 text-sky-900',
      borderColor: 'border-sky-400',
      soundFn: () => synth.playBirdChirp(),
      primaryToneFreq: 880
    },
    {
      id: 'elephant',
      emoji: '🐘',
      name: 'Ellie',
      instrument: 'Tuba 📯',
      color: 'bg-indigo-100 hover:bg-indigo-200 text-indigo-900',
      borderColor: 'border-indigo-400',
      soundFn: () => synth.playElephantTrumpet(),
      primaryToneFreq: 165
    }
  ];

  const handleMemberTap = (member: OrchestraMember) => {
    setActiveAnimateMemberId(member.id);

    // Play signature vocalization
    member.soundFn();

    // Spawn floating musical sparks
    const newSpark = {
      id: Math.random().toString(),
      x: 10 + Math.random() * 80,
      y: 20 + Math.random() * 50,
      emoji: ['🎵', '🎶', '🌟', '❤️', '🎈', '✨'][Math.floor(Math.random() * 6)]
    };
    setSparks((prev) => [...prev, newSpark]);
    setTimeout(() => {
      setSparks((prev) => prev.filter((s) => s.id !== newSpark.id));
    }, 1500);

    // Reset bounce
    setTimeout(() => {
      setActiveAnimateMemberId(null);
    }, 450);
  };

  // Keyboard support: baby hits keys, trigger different animals in sequence!
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'Tab' || e.key === 'Escape') return;

      const randomIdx = Math.floor(Math.random() * members.length);
      const randomMember = members[randomIdx];
      handleMemberTap(randomMember);
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

  const toggleLullaby = () => {
    const nextState = !lullabyPlaying;
    if (nextState) {
      synth.startLullaby();
    } else {
      synth.stopLullaby();
    }
    onLullabyChange(nextState);
  };

  return (
    <div
      className="relative w-full h-full min-h-[500px] flex-1 rounded-3xl bg-pink-50/60 border-8 border-white p-6 shadow-2xl overflow-hidden flex flex-col items-center justify-between select-none"
      id="level-5-orchestra"
    >
      {/* Top title bar */}
      <div className="z-10 bg-white px-8 py-3 rounded-3xl shadow-xl border-8 border-rose-400 text-center flex flex-col sm:flex-row items-center justify-between gap-4 w-full max-w-xl stop-propagation">
        <div className="text-left">
          <span className="font-display font-black text-xl md:text-3xl text-rose-500 block uppercase tracking-wider">
            ANIMAL ORCHESTRA!
          </span>
          <span className="text-xs text-slate-500 font-bold block mt-0.5">
            Tap the animals to hear them sing and play!
          </span>
        </div>

        {/* Dynamic Lullaby Shortcut in Level 5 */}
        <button
          onClick={toggleLullaby}
          className={`px-3 py-1.5 rounded-full text-xs font-display font-black border flex items-center gap-1 transition-all ${
            lullabyPlaying
              ? 'bg-purple-500 border-purple-600 text-white animate-pulse'
              : 'bg-purple-50 border-purple-200 text-purple-600'
          }`}
          id="btn-l5-lullaby"
        >
          <Music className={`w-3.5 h-3.5 ${lullabyPlaying ? 'animate-spin' : ''}`} />
          {lullabyPlaying ? 'Melody ON' : 'Melody OFF'}
        </button>
      </div>

      {/* Floating Sparkles/Notes Layer */}
      <div className="absolute inset-x-0 bottom-0 top-[80px] pointer-events-none z-10">
        <AnimatePresence>
          {sparks.map((spark) => (
            <motion.div
              key={spark.id}
              initial={{ scale: 0.2, opacity: 1, y: 50, rotate: 0 }}
              animate={{ scale: 2.8, opacity: 0, y: -200, rotate: 45 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.4, ease: 'easeOut' }}
              className="absolute text-center text-4xl filter drop-shadow-md"
              style={{
                left: `${spark.x}%`,
                top: `${spark.y}%`,
              }}
            >
              {spark.emoji}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Orchestral Grid of Buttons */}
      <div className="flex-1 w-full max-w-2xl flex items-center justify-center py-4 z-20">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 md:gap-6 w-full">
          {members.map((member) => {
            const isActive = activeAnimateMemberId === member.id;
            
            return (
              <motion.button
                key={member.id}
                onClick={() => handleMemberTap(member)}
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.95 }}
                animate={
                  isActive
                    ? {
                        scale: [1, 1.25, 1],
                        rotate: [0, -15, 15, -10, 0],
                        y: [0, -15, 0]
                      }
                    : {}
                }
                transition={{ duration: 0.45, ease: 'easeInOut' }}
                className={`${member.color} ${member.borderColor} p-4 md:p-6 rounded-[2.5rem] border-8 shadow-xl flex flex-col items-center justify-center gap-2 cursor-pointer transition-colors stop-propagation`}
                id={`btn-orchestra-${member.id}`}
              >
                {/* Animal face and dancing effect */}
                <span className="text-6xl md:text-7xl filter drop-shadow hover:rotate-12 transition-transform">
                  {member.emoji}
                </span>
                
                <div className="text-center">
                  <h4 className="font-display font-black text-sm md:text-base tracking-wide leading-tight">
                    {member.name}
                  </h4>
                  <span className="text-[10px] md:text-xs font-sans font-black bg-white/60 px-2 py-0.5 rounded-full border border-black/5 text-slate-600 block mt-1 uppercase tracking-wider">
                    {member.instrument}
                  </span>
                </div>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Sandbox Celebration trigger card */}
      <div className="z-10 bg-white/80 p-4 rounded-2xl w-full max-w-sm shadow-md border-2 border-rose-105 stop-propagation text-center flex flex-col gap-2">
        <div className="flex items-center justify-center gap-1">
          <Sun className="w-4 h-4 text-amber-500 animate-spin" />
          <span className="text-xs font-display font-black text-rose-500 uppercase tracking-widest">
            Toddler Playground Sandbox
          </span>
          <Sparkles className="w-3.5 h-3.5 text-rose-400" />
        </div>
        <p className="text-[11px] font-sans font-bold text-slate-500">
          This level runs endlessly! Clapping hands makes everyone sing.
        </p>
        
        <button
          onClick={onLevelComplete}
          className="w-full py-1.5 bg-rose-500 hover:bg-rose-600 border-b-2 border-rose-700 text-white rounded-xl font-display font-black text-xs transition-transform active:scale-95"
          id="btn-l5-reset"
        >
          Restart Sensory Journey 🎪
        </button>
      </div>
    </div>
  );
}
