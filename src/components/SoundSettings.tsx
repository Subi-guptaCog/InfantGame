import React, { useState, useEffect } from 'react';
import { Volume2, VolumeX, Music, HelpCircle } from 'lucide-react';
import { synth } from '../utils/audioSynth';

interface SoundSettingsProps {
  onLullabyChange?: (playing: boolean) => void;
  lullabyPlaying?: boolean;
}

export default function SoundSettings({ onLullabyChange, lullabyPlaying = false }: SoundSettingsProps) {
  const [volume, setVolume] = useState(0.15);
  const [isMuted, setIsMuted] = useState(false);
  const [showParentTip, setShowParentTip] = useState(false);

  useEffect(() => {
    // Sync initial volume
    synth.setVolume(isMuted ? 0 : volume);
  }, [volume, isMuted]);

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    if (val > 0) {
      setIsMuted(false);
    }
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
    if (isMuted) {
      synth.setVolume(volume);
      synth.playInteractiveDing(587.33);
    } else {
      synth.setVolume(0);
    }
  };

  const toggleLullaby = () => {
    const nextState = !lullabyPlaying;
    if (nextState) {
      synth.startLullaby();
    } else {
      synth.stopLullaby();
    }
    if (onLullabyChange) {
      onLullabyChange(nextState);
    }
  };

  return (
    <div className="bg-white rounded-3xl p-5 shadow-xl border-8 border-yellow-400 flex flex-wrap items-center justify-between gap-4 max-w-2xl mx-auto w-full" id="sound-control-panel">
      {/* Volume Sliders */}
      <div className="flex items-center gap-3">
        <button
          onClick={toggleMute}
          className="p-3 bg-rose-105 hover:bg-rose-100 text-rose-500 border-4 border-rose-300 rounded-2xl transition-transform active:scale-95"
          title={isMuted ? "Unmute" : "Mute"}
          id="btn-volume-mute"
        >
          {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
        </button>
        <div className="flex flex-col">
          <span className="text-xs font-display font-black text-slate-500 uppercase tracking-wider mb-1">
            Infant Safe Volume
          </span>
          <div className="flex items-center gap-2">
            <span className="text-xs">🔈</span>
            <input
              type="range"
              min="0"
              max="0.3"
              step="0.02"
              value={isMuted ? 0 : volume}
              onChange={handleVolumeChange}
              className="accent-rose-500 cursor-pointer w-24 sm:w-32 h-2 bg-slate-100 rounded-lg appearance-none"
              id="volume-slider"
            />
            <span className="text-xs">🔊</span>
          </div>
        </div>
      </div>

      {/* Soothing Lullaby Channel */}
      <div className="flex items-center gap-2">
        <button
          onClick={toggleLullaby}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-3xl font-display font-black text-sm transition-all active:scale-95 border-4 ${
            lullabyPlaying
              ? 'bg-purple-500 border-purple-600 text-white shadow-md animate-pulse'
              : 'bg-purple-50 hover:bg-purple-100 border-purple-300 text-purple-600'
          }`}
          id="btn-lullaby"
        >
          <Music className={`w-4 h-4 ${lullabyPlaying ? 'animate-spin' : ''}`} />
          {lullabyPlaying ? 'Lullaby ON' : 'Soothing Lullaby'}
        </button>

        {/* Parent Tip Button */}
        <div className="relative">
          <button
            onClick={() => setShowParentTip(!showParentTip)}
            className="p-2.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-505 rounded-2xl border-4 border-indigo-200"
            id="btn-parent-info"
          >
            <HelpCircle className="w-4 h-4" />
          </button>
          
          {showParentTip && (
            <div className="absolute right-0 bottom-12 z-50 w-72 p-5 bg-slate-900 text-white text-xs rounded-3xl shadow-2xl border-4 border-slate-700 animate-fadeIn">
              <h4 className="font-display font-black text-yellow-300 text-sm mb-2">🎈 Parent Tip: Keyboard Masher Mode</h4>
              <p className="leading-relaxed mb-2 text-slate-300 font-bold">
                This app is optimized for 1-year-olds! At any level, your baby can tap <strong>any key on the keyboard</strong> or tap the touchpad to generate a beautiful color dash and cute giggles instantly!
              </p>
              <p className="leading-relaxed text-slate-300 font-bold">
                You can toggle the soft lullaby background melody on or off above to suit their mood.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
