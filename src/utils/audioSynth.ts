/**
 * Web Audio API Sound Synthesizer for Baby Sensory Game
 * Procedurally generates gentle, high-quality, zero-latency sounds.
 */

class AudioSynth {
  private ctx: AudioContext | null = null;
  private masterVolume = 0.15; // Capped for gentle infant volume

  constructor() {
    // Context is initialized lazily upon first interaction
  }

  private initContext() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  setVolume(vol: number) {
    this.masterVolume = Math.max(0, Math.min(0.4, vol)); // Max safe cap is 0.4
  }

  getVolume() {
    return this.masterVolume;
  }

  private createGainNode(ctx: AudioContext, duration: number, peakVolume = 1.0): GainNode {
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0, ctx.currentTime);
    // Smooth attack and decay
    gain.gain.linearRampToValueAtTime(this.masterVolume * peakVolume, ctx.currentTime + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
    return gain;
  }

  /**
   * Synthesizes a gentle baby giggling laugh (multiple rising/falling soft pitch sweeps)
   */
  playBabyGiggle() {
    try {
      const ctx = this.initContext();
      const now = ctx.currentTime;
      const numGiggles = 4 + Math.floor(Math.random() * 3); // 4 to 6 giggle chuckles
      
      let startTime = now;
      for (let i = 0; i < numGiggles; i++) {
        // Each giggle is a fast, soft pulse
        const osc = ctx.createOscillator();
        const gainNode = ctx.createGain();
        
        // Use a clean sine wave for a soft, sweet sound
        osc.type = 'sine';
        
        // Pitch details for giggle: starts mid, sweeps up and decays
        const baseFreq = 480 + (i * 25) + (Math.random() * 30);
        osc.frequency.setValueAtTime(baseFreq, startTime);
        osc.frequency.exponentialRampToValueAtTime(baseFreq + 140, startTime + 0.06);
        osc.frequency.exponentialRampToValueAtTime(baseFreq - 20, startTime + 0.15);
        
        // Gain envelope for this short chuckle
        gainNode.gain.setValueAtTime(0, startTime);
        gainNode.gain.linearRampToValueAtTime(this.masterVolume * 0.9, startTime + 0.03);
        gainNode.gain.exponentialRampToValueAtTime(0.001, startTime + 0.15);
        
        osc.connect(gainNode);
        gainNode.connect(ctx.destination);
        
        osc.start(startTime);
        osc.stop(startTime + 0.16);
        
        // Delay before the next cuddle pulse starts
        startTime += 0.14 + (Math.random() * 0.04);
      }
    } catch (e) {
      console.warn("Audio failure:", e);
    }
  }

  /**
   * Synthesizes a friendly dog bark ("Woof! Woof!")
   */
  playDogBark() {
    try {
      const ctx = this.initContext();
      const playSingleWoof = (delay: number) => {
        const now = ctx.currentTime + delay;
        const osc = ctx.createOscillator();
        const oscHarmonic = ctx.createOscillator();
        const gainNode = ctx.createGain();
        const filter = ctx.createBiquadFilter();
        
        // We use triangle and sine mixed for a warm, organic barking timbre
        osc.type = 'triangle';
        oscHarmonic.type = 'sine';
        
        const baseFreq = 160 + Math.random() * 20;
        
        // Woof starts with a punchy higher frequency and descends
        osc.frequency.setValueAtTime(baseFreq * 1.5, now);
        osc.frequency.exponentialRampToValueAtTime(baseFreq, now + 0.04);
        osc.frequency.exponentialRampToValueAtTime(baseFreq * 0.6, now + 0.15);
        
        oscHarmonic.frequency.setValueAtTime(baseFreq * 3.0, now);
        oscHarmonic.frequency.exponentialRampToValueAtTime(baseFreq * 2.0, now + 0.05);
        oscHarmonic.frequency.exponentialRampToValueAtTime(baseFreq * 1.2, now + 0.15);
        
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(400, now);
        filter.Q.setValueAtTime(1.5, now);
        
        gainNode.gain.setValueAtTime(0, now);
        gainNode.gain.linearRampToValueAtTime(this.masterVolume * 1.1, now + 0.015);
        gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
        
        osc.connect(filter);
        oscHarmonic.connect(filter);
        filter.connect(gainNode);
        gainNode.connect(ctx.destination);
        
        osc.start(now);
        osc.stop(now + 0.2);
        oscHarmonic.start(now);
        oscHarmonic.stop(now + 0.2);
      };

      // Play double-bark "Woof woof!"
      playSingleWoof(0);
      playSingleWoof(0.22);
    } catch (e) {
      console.warn("Dog bark failure:", e);
    }
  }

  /**
   * Helper for generating a short burst of filtered white noise
   */
  private playNoiseBurst(ctx: AudioContext, startTime: number, duration: number, volumeOriginal: number, filterFreq: number, q = 1.0) {
    try {
      const bufferSize = ctx.sampleRate * duration;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }
      const noise = ctx.createBufferSource();
      noise.buffer = buffer;
      
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(filterFreq, startTime);
      filter.Q.setValueAtTime(q, startTime);
      
      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0, startTime);
      gain.gain.linearRampToValueAtTime(this.masterVolume * volumeOriginal, startTime + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);
      
      noise.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);
      
      noise.start(startTime);
      noise.stop(startTime + duration);
    } catch (err) {
      // safe fallback
    }
  }

  /**
   * Synthesizes a loud, deep, authoritative German Shepherd bark ("Boof-Boof!")
   */
  playGermanShepherdBark() {
    try {
      const ctx = this.initContext();
      const playSingle = (delay: number) => {
        const now = ctx.currentTime + delay;
        const osc = ctx.createOscillator();
        const oscSaw = ctx.createOscillator();
        const gainNode = ctx.createGain();
        const filter = ctx.createBiquadFilter();

        osc.type = 'triangle';
        oscSaw.type = 'sawtooth';

        const base = 135; 
        
        osc.frequency.setValueAtTime(base * 2.2, now);
        osc.frequency.exponentialRampToValueAtTime(base * 1.1, now + 0.06);
        osc.frequency.exponentialRampToValueAtTime(base * 0.7, now + 0.22);

        oscSaw.frequency.setValueAtTime(base * 1.8, now);
        oscSaw.frequency.exponentialRampToValueAtTime(base, now + 0.06);
        oscSaw.frequency.exponentialRampToValueAtTime(base * 0.6, now + 0.22);

        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(320, now);
        filter.Q.setValueAtTime(1.8, now);

        gainNode.gain.setValueAtTime(0, now);
        gainNode.gain.linearRampToValueAtTime(this.masterVolume * 1.5, now + 0.02);
        gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.24);

        osc.connect(filter);
        oscSaw.connect(filter);
        filter.connect(gainNode);
        gainNode.connect(ctx.destination);

        osc.start(now);
        osc.stop(now + 0.25);
        oscSaw.start(now);
        oscSaw.stop(now + 0.25);

        this.playNoiseBurst(ctx, now, 0.15, 0.4, 250, 1.0);
      };

      playSingle(0);
      playSingle(0.28);
    } catch (e) {
      console.warn("German Shepherd bark failed:", e);
    }
  }

  /**
   * Synthesizes an energetic, radiant, highly resonant Labrador bark ("Woof-Woof!")
   */
  playLabradorBark() {
    try {
      const ctx = this.initContext();
      const playSingle = (delay: number) => {
        const now = ctx.currentTime + delay;
        const osc = ctx.createOscillator();
        const oscTri = ctx.createOscillator();
        const gainNode = ctx.createGain();
        const filter = ctx.createBiquadFilter();

        osc.type = 'triangle';
        oscTri.type = 'sine';

        const base = 190; 
        
        osc.frequency.setValueAtTime(base * 2.0, now);
        osc.frequency.exponentialRampToValueAtTime(base, now + 0.05);
        osc.frequency.exponentialRampToValueAtTime(base * 0.8, now + 0.18);

        oscTri.frequency.setValueAtTime(base * 3.0, now);
        oscTri.frequency.exponentialRampToValueAtTime(base * 2.0, now + 0.05);
        oscTri.frequency.exponentialRampToValueAtTime(base * 1.2, now + 0.18);

        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(450, now);
        filter.Q.setValueAtTime(1.2, now);

        gainNode.gain.setValueAtTime(0, now);
        gainNode.gain.linearRampToValueAtTime(this.masterVolume * 1.3, now + 0.015);
        gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.2);

        osc.connect(filter);
        oscTri.connect(filter);
        filter.connect(gainNode);
        gainNode.connect(ctx.destination);

        osc.start(now);
        osc.stop(now + 0.2);
        oscTri.start(now);
        oscTri.stop(now + 0.2);
      };

      playSingle(0);
      playSingle(0.24);
    } catch (e) {
      console.warn("Labrador bark failed:", e);
    }
  }

  /**
   * Synthesizes a husky, muffled, raspy Bulldog bark ("Ruff-Ruff!")
   */
  playBulldogBark() {
    try {
      const ctx = this.initContext();
      const playSingle = (delay: number) => {
        const now = ctx.currentTime + delay;
        const osc = ctx.createOscillator();
        const oscSaw = ctx.createOscillator();
        const gainNode = ctx.createGain();
        const filter = ctx.createBiquadFilter();

        osc.type = 'triangle';
        oscSaw.type = 'sawtooth';

        const base = 110; 
        
        osc.frequency.setValueAtTime(base * 1.6, now);
        osc.frequency.exponentialRampToValueAtTime(base, now + 0.04);
        osc.frequency.exponentialRampToValueAtTime(base * 0.7, now + 0.15);

        oscSaw.frequency.setValueAtTime(base * 2.2, now);
        oscSaw.frequency.exponentialRampToValueAtTime(base * 1.5, now + 0.04);
        oscSaw.frequency.exponentialRampToValueAtTime(base * 0.9, now + 0.15);

        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(240, now);
        filter.Q.setValueAtTime(2.0, now);

        gainNode.gain.setValueAtTime(0, now);
        gainNode.gain.linearRampToValueAtTime(this.masterVolume * 1.6, now + 0.01);
        gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.16);

        osc.connect(filter);
        oscSaw.connect(filter);
        filter.connect(gainNode);
        gainNode.connect(ctx.destination);

        osc.start(now);
        osc.stop(now + 0.18);
        oscSaw.start(now);
        oscSaw.stop(now + 0.18);

        this.playNoiseBurst(ctx, now, 0.12, 0.6, 180, 2.0);
      };

      playSingle(0);
      playSingle(0.24);
    } catch (e) {
      console.warn("Bulldog bark failed:", e);
    }
  }

  /**
   * Synthesizes a massive, deep, booming Rottweiler bark ("Buh-Ruf!")
   */
  playRottweilerBark() {
    try {
      const ctx = this.initContext();
      const playSingle = (delay: number) => {
        const now = ctx.currentTime + delay;
        const osc = ctx.createOscillator();
        const oscSaw = ctx.createOscillator();
        const gainNode = ctx.createGain();
        const filter = ctx.createBiquadFilter();

        osc.type = 'triangle';
        oscSaw.type = 'sawtooth';

        const base = 85; 
        
        osc.frequency.setValueAtTime(base * 2.0, now);
        osc.frequency.exponentialRampToValueAtTime(base, now + 0.07);
        osc.frequency.exponentialRampToValueAtTime(base * 0.7, now + 0.25);

        oscSaw.frequency.setValueAtTime(base * 1.5, now);
        oscSaw.frequency.exponentialRampToValueAtTime(base * 0.9, now + 0.07);
        oscSaw.frequency.exponentialRampToValueAtTime(base * 0.6, now + 0.25);

        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(180, now);
        filter.Q.setValueAtTime(2.2, now);

        gainNode.gain.setValueAtTime(0, now);
        gainNode.gain.linearRampToValueAtTime(this.masterVolume * 1.9, now + 0.02);
        gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.28);

        osc.connect(filter);
        oscSaw.connect(filter);
        filter.connect(gainNode);
        gainNode.connect(ctx.destination);

        osc.start(now);
        osc.stop(now + 0.3);
        oscSaw.start(now);
        oscSaw.stop(now + 0.3);

        this.playNoiseBurst(ctx, now, 0.22, 0.5, 120, 1.5);
      };

      playSingle(0);
      playSingle(0.32);
    } catch (e) {
      console.warn("Rottweiler bark failed:", e);
    }
  }

  /**
   * Synthesizes a joyful, pure, sweet Golden Retriever bark ("Arf-Arf!")
   */
  playGoldenRetrieverBark() {
    try {
      const ctx = this.initContext();
      const playSingle = (delay: number) => {
        const now = ctx.currentTime + delay;
        const osc = ctx.createOscillator();
        const oscHigh = ctx.createOscillator();
        const gainNode = ctx.createGain();
        const filter = ctx.createBiquadFilter();

        osc.type = 'triangle';
        oscHigh.type = 'sine';

        const base = 230; 
        
        osc.frequency.setValueAtTime(base * 1.8, now);
        osc.frequency.exponentialRampToValueAtTime(base, now + 0.04);
        osc.frequency.exponentialRampToValueAtTime(base * 0.75, now + 0.16);

        oscHigh.frequency.setValueAtTime(base * 3.5, now);
        oscHigh.frequency.exponentialRampToValueAtTime(base * 2.2, now + 0.04);
        oscHigh.frequency.exponentialRampToValueAtTime(base * 1.4, now + 0.16);

        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(550, now);
        filter.Q.setValueAtTime(1.0, now);

        gainNode.gain.setValueAtTime(0, now);
        gainNode.gain.linearRampToValueAtTime(this.masterVolume * 1.3, now + 0.015);
        gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.18);

        osc.connect(filter);
        oscHigh.connect(filter);
        filter.connect(gainNode);
        gainNode.connect(ctx.destination);

        osc.start(now);
        osc.stop(now + 0.18);
        oscHigh.start(now);
        oscHigh.stop(now + 0.18);
      };

      playSingle(0);
      playSingle(0.22);
    } catch (e) {
      console.warn("Golden Retriever bark failed:", e);
    }
  }

  /**
   * Router to play a specific dog breed's voice
   */
  playBreedBark(breedKey: string) {
    const key = breedKey.toLowerCase().replace(/[^a-z0-9]/g, '');
    if (key.includes('germanshepherd') || key.includes('germanshepard')) {
      this.playGermanShepherdBark();
    } else if (key.includes('labrador')) {
      this.playLabradorBark();
    } else if (key.includes('bulldog')) {
      this.playBulldogBark();
    } else if (key.includes('rottweiler')) {
      this.playRottweilerBark();
    } else if (key.includes('goldenretriever') || key.includes('retriever')) {
      this.playGoldenRetrieverBark();
    } else {
      this.playDogBark();
    }
  }

  /**
   * Synthesizes a cute cat meow ("Mew!")
   */
  playCatMeow() {
    try {
      const ctx = this.initContext();
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();
      const filter = ctx.createBiquadFilter();

      // Triangle wave has some nice harmonics
      osc.type = 'triangle';
      
      const startFreq = 440;
      const peakFreq = 700;
      const endFreq = 450;
      
      // sliding frequency envelope
      osc.frequency.setValueAtTime(startFreq, now);
      osc.frequency.exponentialRampToValueAtTime(peakFreq, now + 0.15);
      osc.frequency.exponentialRampToValueAtTime(endFreq, now + 0.45);
      
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(1000, now);
      filter.frequency.exponentialRampToValueAtTime(600, now + 0.4);

      gainNode.gain.setValueAtTime(0, now);
      gainNode.gain.linearRampToValueAtTime(this.masterVolume * 0.8, now + 0.08);
      gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.5);

      osc.connect(filter);
      filter.connect(gainNode);
      gainNode.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.5);
    } catch (e) {
      console.warn("Meow failure:", e);
    }
  }

  /**
   * Synthesizes a bird chirp ("Chirp-chirp!")
   */
  playBirdChirp() {
    try {
      const ctx = this.initContext();
      const now = ctx.currentTime;
      
      const playSingleChirp = (delay: number) => {
        const startTime = now + delay;
        const osc = ctx.createOscillator();
        const gainNode = ctx.createGain();
        
        osc.type = 'sine';
        osc.frequency.setValueAtTime(1200, startTime);
        osc.frequency.exponentialRampToValueAtTime(2600, startTime + 0.08);
        
        gainNode.gain.setValueAtTime(0, startTime);
        gainNode.gain.linearRampToValueAtTime(this.masterVolume * 0.6, startTime + 0.02);
        gainNode.gain.exponentialRampToValueAtTime(0.001, startTime + 0.09);
        
        osc.connect(gainNode);
        gainNode.connect(ctx.destination);
        
        osc.start(startTime);
        osc.stop(startTime + 0.1);
      };

      playSingleChirp(0);
      playSingleChirp(0.12);
    } catch (e) {
      console.warn("Chirp failure:", e);
    }
  }

  /**
   * Synthesizes a happy, funny cow moo ("Mooo")
   */
  playCowMoo() {
    try {
      const ctx = this.initContext();
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const vibrato = ctx.createOscillator();
      const vibratoGain = ctx.createGain();
      const gainNode = ctx.createGain();
      const filter = ctx.createBiquadFilter();

      osc.type = 'sawtooth';
      
      // Low mooing frequency
      const freq = 90 + Math.random() * 5;
      osc.frequency.setValueAtTime(freq, now);
      osc.frequency.linearRampToValueAtTime(freq + 15, now + 0.2);
      osc.frequency.linearRampToValueAtTime(freq - 5, now + 0.82);

      // Low vibrato to sound reedy/shaky
      vibrato.frequency.setValueAtTime(6, now); // 6 Hz vibrato
      vibratoGain.gain.setValueAtTime(10, now); // pitch width

      vibrato.connect(vibratoGain);
      vibratoGain.connect(osc.frequency);

      // A bandpass sweeps to emulate vocal tract resonance
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(220, now);
      filter.frequency.exponentialRampToValueAtTime(320, now + 0.25);
      filter.frequency.exponentialRampToValueAtTime(180, now + 0.82);
      filter.Q.setValueAtTime(4.0, now);

      gainNode.gain.setValueAtTime(0, now);
      gainNode.gain.linearRampToValueAtTime(this.masterVolume * 1.2, now + 0.15);
      gainNode.gain.linearRampToValueAtTime(this.masterVolume * 0.9, now + 0.6);
      gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.85);

      osc.connect(filter);
      filter.connect(gainNode);
      gainNode.connect(ctx.destination);

      vibrato.start(now);
      vibrato.stop(now + 0.9);
      osc.start(now);
      osc.stop(now + 0.9);
    } catch (e) {
      console.warn("Cow moo failure:", e);
    }
  }

  /**
   * Synthesizes a reedy, nasal duck quack ("Quack!")
   */
  playDuckQuack() {
    try {
      const ctx = this.initContext();
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();
      const filter = ctx.createBiquadFilter();

      // Triangle contains nice odd/even balance
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(310, now);
      osc.frequency.exponentialRampToValueAtTime(460, now + 0.05);
      osc.frequency.exponentialRampToValueAtTime(280, now + 0.2);

      // High resonance bandpass creates the "nasal" duck quality
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(450, now);
      filter.frequency.linearRampToValueAtTime(750, now + 0.05);
      filter.frequency.exponentialRampToValueAtTime(350, now + 0.2);
      filter.Q.setValueAtTime(3.5, now);

      gainNode.gain.setValueAtTime(0, now);
      gainNode.gain.linearRampToValueAtTime(this.masterVolume * 1.3, now + 0.02);
      gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.22);

      osc.connect(filter);
      filter.connect(gainNode);
      gainNode.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.22);
    } catch (e) {
      console.warn("Quack failure:", e);
    }
  }

  /**
   * Synthesizes a bubbly, watery bubble pop sound
   */
  playBubblePop() {
    try {
      const ctx = this.initContext();
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();

      osc.type = 'sine';
      
      // Quick pitch glide up and snap down
      osc.frequency.setValueAtTime(600, now);
      osc.frequency.exponentialRampToValueAtTime(1400, now + 0.04);
      
      gainNode.gain.setValueAtTime(0, now);
      gainNode.gain.linearRampToValueAtTime(this.masterVolume * 0.9, now + 0.015);
      gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.06);

      osc.connect(gainNode);
      gainNode.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.065);
    } catch (e) {
      console.warn("Bubble pop failure:", e);
    }
  }

  /**
   * Synthesizes an elephant/trumpet sound effect
   */
  playElephantTrumpet() {
    try {
      const ctx = this.initContext();
      const now = ctx.currentTime;
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gainNode = ctx.createGain();
      const filter = ctx.createBiquadFilter();

      // Dual detuned sawtooths make heavy brass sounds
      osc1.type = 'sawtooth';
      osc2.type = 'sawtooth';

      const base = 280;
      osc1.frequency.setValueAtTime(base, now);
      osc1.frequency.linearRampToValueAtTime(base + 80, now + 0.1);
      osc1.frequency.linearRampToValueAtTime(base - 10, now + 0.45);

      osc2.frequency.setValueAtTime(base + 6, now);
      osc2.frequency.linearRampToValueAtTime(base + 86, now + 0.1);
      osc2.frequency.linearRampToValueAtTime(base - 4, now + 0.45);

      // Tremolo/Vibrato fast fluctuation for trumpet
      const lfo = ctx.createOscillator();
      const lfoGain = ctx.createGain();
      lfo.frequency.setValueAtTime(35, now); // fast vibrato (35Hz) for "rasp"
      lfoGain.gain.setValueAtTime(12, now);
      lfo.connect(lfoGain);
      lfoGain.connect(osc1.frequency);
      lfoGain.connect(osc2.frequency);

      filter.type = 'highpass';
      filter.frequency.setValueAtTime(350, now);

      gainNode.gain.setValueAtTime(0, now);
      gainNode.gain.linearRampToValueAtTime(this.masterVolume * 0.9, now + 0.05);
      gainNode.gain.linearRampToValueAtTime(this.masterVolume * 0.7, now + 0.3);
      gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.48);

      osc1.connect(filter);
      osc2.connect(filter);
      filter.connect(gainNode);
      gainNode.connect(ctx.destination);

      lfo.start(now);
      lfo.stop(now + 0.48);
      osc1.start(now);
      osc1.stop(now + 0.48);
      osc2.start(now);
      osc2.stop(now + 0.48);
    } catch (e) {
      console.warn("Elephant trumpet failure:", e);
    }
  }

  /**
   * Synthesizes list of nice upbeat sound effects that can be randomly played
   */
  playRandomAnimalSound() {
    const list = [
      () => this.playDogBark(),
      () => this.playCatMeow(),
      () => this.playBirdChirp(),
      () => this.playCowMoo(),
      () => this.playDuckQuack(),
      () => this.playElephantTrumpet()
    ];
    const randomIndex = Math.floor(Math.random() * list.length);
    list[randomIndex]();
  }

  /**
   * Plays a success chime arpeggio
   */
  playLevelUpChime() {
    try {
      // Also play the baby giggle sound alongside the success chime
      this.playBabyGiggle();

      const ctx = this.initContext();
      const now = ctx.currentTime;
      const notes = [261.63, 329.63, 392.00, 523.25, 659.25, 783.99, 1046.50]; // C major triad arpeggio
      
      notes.forEach((freq, idx) => {
        const time = now + (idx * 0.07);
        const osc = ctx.createOscillator();
        const gainNode = ctx.createGain();
        
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, time);
        
        gainNode.gain.setValueAtTime(0, time);
        gainNode.gain.linearRampToValueAtTime(this.masterVolume * 1.0, time + 0.02);
        gainNode.gain.exponentialRampToValueAtTime(0.001, time + 0.4);
        
        osc.connect(gainNode);
        gainNode.connect(ctx.destination);
        
        osc.start(time);
        osc.stop(time + 0.45);
      });
    } catch (e) {
      console.warn("Success chime failure:", e);
    }
  }

  /**
   * Plays a quick sweet interactive click sound
   */
  playInteractiveDing(freq = 523.25) {
    try {
      const ctx = this.initContext();
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now);
      
      gainNode.gain.setValueAtTime(0, now);
      gainNode.gain.linearRampToValueAtTime(this.masterVolume * 0.8, now + 0.01);
      gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
      
      osc.connect(gainNode);
      gainNode.connect(ctx.destination);
      
      osc.start(now);
      osc.stop(now + 0.16);
    } catch (e) {
      console.warn("Interactive ding failure:", e);
    }
  }

  /**
   * Plays a peaceful, soft, sleeping-lullaby melody
   * A short looped cute acoustic lullaby sequence
   */
  private lullabyIntervalId: any = null;
  private lullabyNotes = [
    392.00, 392.00, 440.00, 392.00, 523.25, 493.88, // Twinkle twinkle style theme: C4 is 261, G3 is 196
    392.00, 392.00, 440.00, 392.00, 587.33, 523.25,
    392.00, 392.00, 783.99, 659.25, 523.25, 493.88, 440.00,
    698.46, 698.46, 659.25, 523.25, 587.33, 523.25
  ];
  private lullabyDurations = [
    0.5, 0.5, 0.5, 0.5, 0.5, 1.0,
    0.5, 0.5, 0.5, 0.5, 0.5, 1.0,
    0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 1.0,
    0.5, 0.5, 0.5, 0.5, 0.5, 1.0
  ];

  startLullaby() {
    this.stopLullaby();
    try {
      const ctx = this.initContext();
      let noteIndex = 0;
      let nextPlayTime = ctx.currentTime;

      const scheduleNextNotes = () => {
        // Schedule notes in advance
        while (nextPlayTime < ctx.currentTime + 0.4) {
          const osc = ctx.createOscillator();
          const gainNode = ctx.createGain();
          
          osc.type = 'triangle'; // Soft flute/guitar-like tone
          const originalFreq = this.lullabyNotes[noteIndex];
          // Transpose down one octave to make it warmer and softer for baby
          const freq = originalFreq / 2;
          
          osc.frequency.setValueAtTime(freq, nextPlayTime);
          
          gainNode.gain.setValueAtTime(0, nextPlayTime);
          gainNode.gain.linearRampToValueAtTime(this.masterVolume * 0.4, nextPlayTime + 0.05);
          gainNode.gain.exponentialRampToValueAtTime(0.001, nextPlayTime + (this.lullabyDurations[noteIndex] * 0.9));
          
          osc.connect(gainNode);
          gainNode.connect(ctx.destination);
          
          osc.start(nextPlayTime);
          osc.stop(nextPlayTime + this.lullabyDurations[noteIndex]);
          
          nextPlayTime += this.lullabyDurations[noteIndex] * 0.95;
          noteIndex = (noteIndex + 1) % this.lullabyNotes.length;
        }
      };

      // Loop scheduling every 200ms
      this.lullabyIntervalId = setInterval(scheduleNextNotes, 200);
    } catch (e) {
      console.warn("Lullaby failure:", e);
    }
  }

  stopLullaby() {
    if (this.lullabyIntervalId) {
      clearInterval(this.lullabyIntervalId);
      this.lullabyIntervalId = null;
    }
  }
}

export const synth = new AudioSynth();
