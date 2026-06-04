import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { synth } from '../utils/audioSynth';
import { GameShape, QuizQuestion } from '../types';

interface Level2Props {
  onLevelComplete: () => void;
}

// 5 core baby-friendly shapes
const STATIC_SHAPES: GameShape[] = [
  { id: '1', type: 'circle', color: 'bg-rose-500 hover:bg-rose-600 border-rose-600', label: 'Circle', icon: '🔴' },
  { id: '2', type: 'square', color: 'bg-amber-500 hover:bg-amber-600 border-amber-600', label: 'Square', icon: '🟧' },
  { id: '3', type: 'triangle', color: 'bg-emerald-500 hover:bg-emerald-600 border-emerald-600', label: 'Triangle', icon: '🔺' },
  { id: '4', type: 'star', color: 'bg-yellow-400 hover:bg-yellow-500 border-yellow-500', label: 'Star', icon: '⭐' },
  { id: '5', type: 'heart', color: 'bg-pink-500 hover:bg-pink-600 border-pink-600', label: 'Heart', icon: '❤️' }
];

export default function Level2ShapeQuiz({ onLevelComplete }: Level2Props) {
  const [score, setScore] = useState(0);
  const [currentQuestion, setCurrentQuestion] = useState<QuizQuestion | null>(null);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [clickedId, setClickedId] = useState<string | null>(null);
  const [isCompleted, setIsCompleted] = useState(false);

  const autoAdvanceTimerRef = React.useRef<NodeJS.Timeout | null>(null);
  const newQuestionTimerRef = React.useRef<NodeJS.Timeout | null>(null);
  const resetFeedbackTimerRef = React.useRef<NodeJS.Timeout | null>(null);

  // Clean up all timers on unmount
  useEffect(() => {
    return () => {
      if (autoAdvanceTimerRef.current) clearTimeout(autoAdvanceTimerRef.current);
      if (newQuestionTimerRef.current) clearTimeout(newQuestionTimerRef.current);
      if (resetFeedbackTimerRef.current) clearTimeout(resetFeedbackTimerRef.current);
    };
  }, []);

  // Generate a random question
  const generateNewQuestion = () => {
    setFeedback(null);
    setClickedId(null);

    // Pick random target shape, ensuring it doesn't duplicate consecutive shapes
    const availablePool = currentQuestion
      ? STATIC_SHAPES.filter(s => s.type !== currentQuestion.targetShapeType)
      : STATIC_SHAPES;

    const targetIdx = Math.floor(Math.random() * availablePool.length);
    const targetShape = availablePool[targetIdx];

    // Pick 2 other shapes to mix in
    const pool = STATIC_SHAPES.filter(s => s.type !== targetShape.type);
    const shuffledPool = [...pool].sort(() => 0.5 - Math.random());
    const distractors = shuffledPool.slice(0, 2);

    // Mix them up (3 options total)
    const options = [targetShape, ...distractors].sort(() => 0.5 - Math.random());

    setCurrentQuestion({
      targetShapeType: targetShape.type,
      promptText: `Which is the ${targetShape.label}? ${targetShape.icon}`,
      options
    });
  };

  useEffect(() => {
    generateNewQuestion();
  }, []);

  const handleShapeClick = (shape: GameShape) => {
    if (feedback === 'correct' || isCompleted) return;

    setClickedId(shape.id);

    if (shape.type === currentQuestion?.targetShapeType) {
      // CORRECT!
      setFeedback('correct');
      synth.playInteractiveDing(659.25); // high happy beep
      
      const newScore = score + 1;
      setScore(newScore);

      if (newScore >= 5) {
        setIsCompleted(true);
        synth.playLevelUpChime();
        autoAdvanceTimerRef.current = setTimeout(() => {
          onLevelComplete();
        }, 5000); // 5 sec auto complete
      } else {
        // Generate new question after brief sweet delay
        newQuestionTimerRef.current = setTimeout(() => {
          generateNewQuestion();
        }, 1500);
      }
    } else {
      // TRY AGAIN (infant safe feedback)
      setFeedback('wrong');
      synth.playInteractiveDing(330.0); // soft low beep

      // Reset wrong state after 1.2s to try again
      resetFeedbackTimerRef.current = setTimeout(() => {
        setFeedback(null);
        setClickedId(null);
      }, 1200);
    }
  };

  // Keyboard support: baby hits a key, flash colors
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (isCompleted) return;
      if (e.key === 'Tab' || e.key === 'Escape') return;
      // Keypresses on shapes can select or just play nice ambient notes
      synth.playInteractiveDing(440 + Math.random() * 200);
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [isCompleted]);

  // Theme helper for the Vibrant Palette
  const getThemeClasses = (type: string) => {
    switch (type) {
      case 'circle':
        return { border: 'border-blue-400', hoverBorder: 'hover:border-blue-500', text: 'text-blue-600', iconBg: 'bg-blue-500', innerBorder: 'border-blue-200' };
      case 'square':
        return { border: 'border-orange-400', hoverBorder: 'hover:border-orange-500', text: 'text-orange-600', iconBg: 'bg-orange-500', innerBorder: 'border-orange-200' };
      case 'triangle':
        return { border: 'border-emerald-400', hoverBorder: 'hover:border-emerald-500', text: 'text-emerald-600', iconBg: 'bg-emerald-500', innerBorder: 'border-emerald-200' };
      case 'star':
        return { border: 'border-yellow-400', hoverBorder: 'hover:border-yellow-500', text: 'text-yellow-600', iconBg: 'bg-yellow-500', innerBorder: 'border-yellow-250' };
      case 'heart':
        return { border: 'border-pink-400', hoverBorder: 'hover:border-pink-500', text: 'text-pink-600', iconBg: 'bg-pink-500', innerBorder: 'border-pink-200' };
      default:
        return { border: 'border-purple-400', hoverBorder: 'hover:border-purple-500', text: 'text-purple-600', iconBg: 'bg-purple-500', innerBorder: 'border-purple-200' };
    }
  };

  // SVG customized for beautiful high contrast infant shapes
  const renderSVGShape = (type: string) => {
    switch (type) {
      case 'circle':
        return (
          <svg viewBox="0 0 100 100" className="w-16 h-16 sm:w-20 sm:h-20 drop-shadow-lg text-white fill-current">
            <circle cx="50" cy="50" r="40" />
          </svg>
        );
      case 'square':
        return (
          <svg viewBox="0 0 100 100" className="w-16 h-16 sm:w-20 sm:h-20 drop-shadow-lg text-white fill-current">
            <rect x="15" y="15" width="70" height="70" rx="10" />
          </svg>
        );
      case 'triangle':
        return (
          <svg viewBox="0 0 100 100" className="w-16 h-16 sm:w-20 sm:h-20 drop-shadow-lg text-white fill-current">
            <polygon points="50,15 90,85 10,85" />
          </svg>
        );
      case 'star':
        return (
          <svg viewBox="0 0 100 100" className="w-16 h-16 sm:w-20 sm:h-20 drop-shadow-lg text-white fill-current">
            <polygon points="50,5 64,36 98,36 70,57 81,91 50,70 19,91 30,57 2,36 36,36" />
          </svg>
        );
      case 'heart':
        return (
          <svg viewBox="0 0 100 100" className="w-16 h-16 sm:w-20 sm:h-20 drop-shadow-lg text-white fill-current">
            <path d="M12,30 C3,3 27,-3 50,22 C73,-3 97,3 88,30 C76,57 50,85 50,85 C50,85 24,57 12,30 Z" />
          </svg>
        );
      default:
        return null;
    }
  };

  return (
    <div
      className="relative w-full h-full min-h-[500px] rounded-[3rem] bg-sky-50 border-4 border-dashed border-sky-200 p-4 sm:p-6 flex flex-col items-center justify-between select-none overflow-hidden"
      id="level-2-shapes"
    >
      {/* Level Header Title */}
      <div className="z-10 bg-white px-8 py-3 rounded-3xl shadow-xl border-8 border-purple-400 text-center">
        <span className="font-display font-black text-xl md:text-3xl text-purple-600 block uppercase tracking-wider">
          FIND THE SHAPE!
        </span>
      </div>

      {/* Main Question Display */}
      {currentQuestion && (
        <div className="flex-1 flex flex-col justify-center items-center gap-4 my-2 w-full text-center">
          <motion.div
            key={currentQuestion.promptText}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="px-6 py-3 bg-white rounded-2xl shadow-md border-4 border-yellow-300 max-w-md"
          >
            <h2 className="font-display font-black text-xl md:text-2xl text-indigo-950">
              {currentQuestion.promptText}
            </h2>
          </motion.div>

          {/* Core Shape Row Option buttons */}
          <div className="grid grid-cols-3 gap-3 sm:gap-6 w-full max-w-2xl px-2">
            {currentQuestion.options.map((shape) => {
              const isTargetClicked = clickedId === shape.id;
              const theme = getThemeClasses(shape.type);
              
              return (
                <motion.button
                  key={`${currentQuestion.targetShapeType}-${shape.type}`}
                  onClick={() => handleShapeClick(shape)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  animate={
                    isTargetClicked && feedback === 'correct'
                      ? { scale: [1, 1.15, 1.05], rotate: [0, 10, -10, 0] }
                      : isTargetClicked && feedback === 'wrong'
                      ? { x: [-10, 10, -10, 10, 0] }
                      : {}
                  }
                  transition={{
                    default: { type: 'spring', stiffness: 300, damping: 15 },
                    scale: { type: 'tween', duration: 0.4 },
                    rotate: { type: 'tween', duration: 0.4 },
                    x: { type: 'tween', duration: 0.4 }
                  }}
                  className={`bg-white p-3 sm:p-5 rounded-[2rem] sm:rounded-[3rem] border-8 ${theme.border} ${theme.hoverBorder} flex flex-col items-center justify-center gap-2 sm:gap-3 shadow-xl cursor-pointer stop-propagation transition-colors`}
                  id={`btn-shape-${shape.type}`}
                >
                  <div className={`p-3 rounded-[1.5rem] ${theme.iconBg} border-4 ${theme.innerBorder} shadow-md flex items-center justify-center`}>
                    {renderSVGShape(shape.type)}
                  </div>
                  <span className={`font-display font-black text-sm sm:text-lg ${theme.text} tracking-tight uppercase`}>
                    {shape.label}
                  </span>
                </motion.button>
              );
            })}
          </div>
        </div>
      )}

      {/* Feedback Overlay Notifications */}
      <AnimatePresence>
        {feedback === 'correct' && currentQuestion && (
          <motion.div
            key={`correct-${currentQuestion.targetShapeType}`}
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1.2, opacity: 1 }}
            exit={{ scale: 0.5, opacity: 0 }}
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-emerald-500 text-white px-8 py-4 rounded-3xl font-display font-black text-2xl text-center shadow-2xl z-20"
          >
            ✨ Found the {STATIC_SHAPES.find(s => s.type === currentQuestion.targetShapeType)?.label || 'Shape'}! ✨
          </motion.div>
        )}
        {feedback === 'wrong' && currentQuestion && (
          <motion.div
            key={`wrong-${currentQuestion.targetShapeType}`}
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1.2, opacity: 1 }}
            exit={{ scale: 0.5, opacity: 0 }}
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-amber-400 text-slate-800 px-8 py-4 rounded-3xl font-display font-black text-2xl text-center shadow-2xl z-20"
          >
            💫 Find the {STATIC_SHAPES.find(s => s.type === currentQuestion.targetShapeType)?.label || 'Shape'}! 💫
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bottom Progress Block */}
      <div className="z-10 bg-white/80 p-4 rounded-2xl w-full max-w-lg shadow-md border-2 border-indigo-100">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-display font-black text-purple-500 uppercase tracking-wider">
            Shapes Matched
          </span>
          <span className="text-xs font-display font-black text-purple-600 bg-purple-50 px-2.5 py-0.5 rounded-full">
            {score} / 5 Goals
          </span>
        </div>

        {/* Level indicators */}
        <div className="flex justify-between gap-1.5">
          {Array.from({ length: 5 }).map((_, idx) => (
            <motion.div
              key={idx}
              animate={idx < score ? { scale: [1, 1.3, 1], rotate: [0, 15, 0] } : {}}
              transition={{ type: 'tween', duration: 0.3 }}
              className={`flex-1 h-6 rounded-full border-2 flex items-center justify-center text-xs ${
                idx < score
                  ? 'bg-purple-500 border-purple-600 text-white shadow-sm'
                  : 'bg-slate-150 border-slate-200 text-slate-300'
              }`}
            >
              🎉
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
            className="absolute inset-0 bg-purple-500/95 flex flex-col items-center justify-center text-center p-6 z-30"
          >
            <motion.div
              initial={{ scale: 0.5, rotate: -15 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', damping: 10 }}
              className="bg-white rounded-3xl p-8 max-w-sm shadow-2xl border-8 border-yellow-400 flex flex-col items-center gap-5 stop-propagation"
            >
              <div className="text-7xl animate-bounce">🦄🎖️✨</div>
              <h3 className="font-display font-black text-3xl text-purple-600 leading-tight">
                Brilliant! Shape Master!
              </h3>
              <p className="font-sans font-bold text-slate-600 text-sm">
                You know your shapes! Get ready for Level 3: Puppy Playland!
              </p>

              <button
                onClick={onLevelComplete}
                className="w-full py-4 bg-purple-600 hover:bg-purple-700 active:scale-95 text-white rounded-2xl font-display font-black text-lg shadow-xl tracking-wide border-b-4 border-purple-800 transition-all flex items-center justify-center gap-2"
                id="btn-goto-l3"
              >
                Go to Puppies 🐶
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
