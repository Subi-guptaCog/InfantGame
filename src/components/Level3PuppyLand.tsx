import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Trash2 } from 'lucide-react';
import { synth } from '../utils/audioSynth';
import { SpawnedDog } from '../types';

interface Level3Props {
  onLevelComplete: () => void;
}

const PUPPY_TEMPLATES = [
  { breed: 'German Shepherd', emoji: '🐕', bgColor: 'bg-amber-100 border-amber-300 text-amber-900' },
  { breed: 'Labrador', emoji: '🐶', bgColor: 'bg-yellow-50 border-yellow-200 text-yellow-900' },
  { breed: 'Bulldog', emoji: '🦮', bgColor: 'bg-stone-100 border-stone-300 text-stone-900' },
  { breed: 'Rottweiler', emoji: '🐕‍🦺', bgColor: 'bg-neutral-200 border-neutral-400 text-neutral-900' },
  { breed: 'Golden Retriever', emoji: '🐩', bgColor: 'bg-orange-50 border-orange-200 text-orange-900' }
];

export default function Level3PuppyLand({ onLevelComplete }: Level3Props) {
  const [dogs, setDogs] = useState<SpawnedDog[]>([]);
  const [dogCount, setDogCount] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const playgroundRef = useRef<HTMLDivElement | null>(null);

  const autoAdvanceTimerRef = React.useRef<NodeJS.Timeout|null>(null);

  useEffect(() => {
    return () => {
      if (autoAdvanceTimerRef.current) {
        clearTimeout(autoAdvanceTimerRef.current);
      }
    };
  }, []);

  // Clear spawned dogs
  const clearDogs = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setDogs([]);
    synth.playInteractiveDing(330.0);
  };

  // Click on playground to spawn puppy at coords
  const handlePlaygroundClick = (e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => {
    if (isCompleted) return;

    // Reject propagation if clicking level controllers or clears
    if ((e.target as HTMLElement).closest('.stop-propagation')) {
      return;
    }

    const rect = playgroundRef.current?.getBoundingClientRect();
    if (!rect) return;

    let clientX: number;
    let clientY: number;

    if ('touches' in e && e.touches.length > 0) {
      e.preventDefault();
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else if ('clientX' in e) {
      clientX = e.clientX;
      clientY = e.clientY;
    } else {
      return;
    }

    // Find custom relative coordinates as percentage of playground container
    const x = ((clientX - rect.left) / rect.width) * 100;
    const y = ((clientY - rect.top) / rect.height) * 100;

    // Pick a random puppy template
    const randomPuppy = PUPPY_TEMPLATES[Math.floor(Math.random() * PUPPY_TEMPLATES.length)];

    const newDog: SpawnedDog = {
      id: Math.random().toString() + Date.now(),
      x,
      y,
      photoUrl: '', // blank to satisfy standard types.ts
      rotation: Math.random() * 30 - 15, // random sweet tilt -15 to +15 deg
      scale: 1,
      breedName: randomPuppy.breed,
      emoji: randomPuppy.emoji,
      bgColor: randomPuppy.bgColor
    };

    // Play breed specific custom bark sound
    synth.playBreedBark(randomPuppy.breed);

    setDogs((prev) => [...prev, newDog]);
    
    // Track total spawned to complete level
    setDogCount((prev) => {
      const nextCount = prev + 1;
      if (nextCount >= 10) {
        setIsCompleted(true);
        synth.playLevelUpChime();
        autoAdvanceTimerRef.current = setTimeout(() => {
          onLevelComplete();
        }, 5000); // Auto advances after 5s
      }
      return nextCount;
    });
  };

  // Re-barking existing dog click
  const handleDogTap = (e: React.MouseEvent, dogId: string, breedName: string) => {
    e.stopPropagation();
    synth.playBreedBark(breedName);

    // Scale up slightly for visceral visual feedback on tap
    setDogs((prev) =>
      prev.map((d) => (d.id === dogId ? { ...d, scale: 1.3, rotation: d.rotation + (Math.random() * 40 - 20) } : d))
    );

    // Bounce back to normal scale
    setTimeout(() => {
      setDogs((prev) =>
        prev.map((d) => (d.id === dogId ? { ...d, scale: 1.0 } : d))
      );
    }, 250);
  };

  // Keyboard support: baby hits a key, plays breed-specific bark
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (isCompleted) return;
      if (e.key === 'Tab' || e.key === 'Escape') return;

      // Spawn a random puppy on screen with random coordinate
      const randomPuppy = PUPPY_TEMPLATES[Math.floor(Math.random() * PUPPY_TEMPLATES.length)];
      
      synth.playBreedBark(randomPuppy.breed);

      const newDog: SpawnedDog = {
        id: Math.random().toString() + Date.now(),
        x: 15 + Math.random() * 70,
        y: 20 + Math.random() * 60,
        photoUrl: '',
        rotation: Math.random() * 36 - 18,
        scale: 1,
        breedName: randomPuppy.breed,
        emoji: randomPuppy.emoji,
        bgColor: randomPuppy.bgColor
      };

      setDogs((prev) => [...prev, newDog]);
      setDogCount((prev) => {
        const next = prev + 1;
        if (next >= 10) {
          setIsCompleted(true);
          synth.playLevelUpChime();
          autoAdvanceTimerRef.current = setTimeout(() => {
            onLevelComplete();
          }, 5000);
        }
        return next;
      });
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [isCompleted]);

  return (
    <div
      ref={playgroundRef}
      onClick={handlePlaygroundClick}
      onTouchStart={handlePlaygroundClick}
      className="relative w-full h-full min-h-[500px] flex-1 rounded-3xl bg-amber-50 border-8 border-white shadow-2xl overflow-hidden cursor-crosshair flex flex-col items-center justify-between p-6 select-none"
      id="level-3-dogs"
    >
      {/* Top dashboard block */}
      <div className="z-10 bg-white px-8 py-3 rounded-3xl shadow-xl border-8 border-amber-400 text-center flex flex-col sm:flex-row items-center justify-between gap-4 stop-propagation">
        <div>
          <span className="font-display font-black text-xl md:text-3xl text-amber-600 block uppercase tracking-wider">
            PUPPY PLAYLAND!
          </span>
          <span className="text-xs text-slate-500 font-bold block mt-0.5">
            Click anywhere (or tap keys) to spawn laughing puppies!
          </span>
        </div>

        {dogs.length > 0 && (
          <button
            onClick={clearDogs}
            className="flex items-center gap-1.5 px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-500 border-2 border-rose-200 rounded-full font-display font-black text-xs transition-colors shadow-sm"
            id="btn-clear-dogs"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Clear
          </button>
        )}
      </div>

      {/* Spawning canvas frame */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        {dogs.length === 0 && (
          <div className="w-full h-full flex flex-col justify-center items-center gap-2 opacity-60">
            <span className="text-8xl animate-bounce">🐶🐾🐕</span>
            <span className="font-display font-black text-2xl text-amber-700/60 mt-4 tracking-wide">
              TAP OR SQUISH THE SCREEN!
            </span>
          </div>
        )}

        <AnimatePresence>
          {dogs.map((dog) => (
            <motion.div
              key={dog.id}
              initial={{ scale: 0, rotate: -45 }}
              animate={{ scale: dog.scale, rotate: dog.rotation }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 350, damping: 15 }}
              className="absolute pointer-events-auto cursor-pointer stop-propagation"
              style={{
                left: `calc(${dog.x}% - 48px)`,
                top: `calc(${dog.y}% - 48px)`,
              }}
              onClick={(e) => handleDogTap(e, dog.id, dog.breedName)}
            >
              <div className="relative group">
                {/* Dog Card Emoji Bubble */}
                <div
                  className={`w-24 h-24 rounded-full border-4 border-yellow-400 shadow-xl flex items-center justify-center text-5xl hover:border-amber-500 transition-all cursor-pointer ${dog.bgColor || 'bg-white'}`}
                >
                  {dog.emoji || '🐶'}
                </div>
                
                {/* Visual Bark Ripple Halo */}
                <motion.div
                  initial={{ scale: 0.8, opacity: 1 }}
                  animate={{ scale: 1.4, opacity: 0 }}
                  transition={{ repeat: Infinity, duration: 1.2, ease: 'easeOut' }}
                  className="absolute inset-0 -m-1 rounded-full border-4 border-yellow-300 pointer-events-none"
                />

                <span className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 bg-amber-400 border border-amber-500 text-[10px] font-display font-black text-amber-950 px-2.5 py-0.5 rounded-full whitespace-nowrap shadow-md uppercase">
                  🐶 {dog.breedName}: {
                    dog.breedName === 'German Shepherd' ? 'BOOF BOOF!' :
                    dog.breedName === 'Labrador' ? 'WOOF WOOF!' :
                    dog.breedName === 'Bulldog' ? 'RUFF RUFF!' :
                    dog.breedName === 'Rottweiler' ? 'BUH RUF!' : 'ARF ARF!'
                  }
                </span>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Progress tracking badge row */}
      <div className="z-10 bg-white/80 p-4 rounded-2xl w-full max-w-lg shadow-md border-2 border-amber-100 stop-propagation">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-display font-black text-amber-600 uppercase tracking-wider">
            Puppies Spawned
          </span>
          <span className="text-xs font-display font-black text-amber-600 bg-amber-50 px-2.5 py-0.5 rounded-full">
            {dogCount} / 10 puppies
          </span>
        </div>

        {/* Level indicators */}
        <div className="flex justify-between gap-1.5 animate-soft-bounce">
          {Array.from({ length: 10 }).map((_, idx) => (
            <motion.div
              key={idx}
              animate={idx < dogCount ? { scale: [1, 1.3, 1], rotate: [0, 15, 0] } : {}}
              transition={{ type: 'tween', duration: 0.3 }}
              className={`flex-1 h-6 rounded-full border-2 flex items-center justify-center text-xs ${
                idx < dogCount
                  ? 'bg-amber-400 border-amber-500 text-yellow-900 shadow-sm'
                  : 'bg-slate-100 border-slate-200 text-slate-300'
              }`}
            >
              🐕
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
            className="absolute inset-0 bg-yellow-400/95 flex flex-col items-center justify-center text-center p-6 z-30"
          >
            <motion.div
              initial={{ scale: 0.5, rotate: -15 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', damping: 10 }}
              className="bg-white rounded-[4rem] p-8 max-w-sm shadow-2xl border-8 border-amber-500 flex flex-col items-center gap-5 stop-propagation"
            >
              <div className="text-7xl animate-bounce">🦖🐾🎉</div>
              <h3 className="font-display font-black text-3xl text-amber-600 leading-tight">
                Super Puppy Trainer!
              </h3>
              <p className="font-sans font-bold text-slate-600 text-sm">
                Wow, look at all the cute barking dogs! Get ready for Level 4: Bubble Popper!
              </p>

              <button
                onClick={onLevelComplete}
                className="w-full py-4 bg-amber-500 hover:bg-amber-600 active:scale-95 text-white rounded-2xl font-display font-black text-lg shadow-xl tracking-wide border-b-4 border-amber-700 transition-all flex items-center justify-center gap-2"
                id="btn-goto-l4"
              >
                Go to Bubbles 🫧
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
