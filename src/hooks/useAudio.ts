export type SoundEffect =
  | 'click'
  | 'swing'
  | 'combat'
  | 'win'
  | 'zip'
  | 'dash'
  | 'slam'
  | 'pickup'
  | 'shutter'
  | 'thunder'
  | 'cheer'
  | 'highfive'
  | 'wallrun'
  | 'vault'
  | 'ledgegrab'
  | 'climb'
  | 'whoosh'
  | 'rankup'
  | 'impact_heavy'
  | 'impact_light'
  | 'block'
  | 'dodge'
  | 'counter'
  | 'victory_fanfare';

export function useAudio() {
  const playSound = (soundName: SoundEffect) => {
    try {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioContextClass) return;
      const ctx = new AudioContextClass();

      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      const now = ctx.currentTime;

      if (soundName === 'click') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(800, now);
        osc.frequency.exponentialRampToValueAtTime(300, now + 0.06);
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.linearRampToValueAtTime(0.01, now + 0.06);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.06);
      } else if (soundName === 'swing') {
        // High-frequency "THWIP" web shot followed by wind whoosh
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(2400, now);
        osc.frequency.exponentialRampToValueAtTime(450, now + 0.25);
        gain.gain.setValueAtTime(0.25, now);
        gain.gain.linearRampToValueAtTime(0.01, now + 0.25);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.25);

        // Sub wind whoosh
        const noise = ctx.createOscillator();
        const noiseGain = ctx.createGain();
        noise.type = 'sine';
        noise.frequency.setValueAtTime(140, now);
        noise.frequency.exponentialRampToValueAtTime(280, now + 0.35);
        noiseGain.gain.setValueAtTime(0.15, now);
        noiseGain.gain.linearRampToValueAtTime(0.001, now + 0.35);
        noise.connect(noiseGain);
        noiseGain.connect(ctx.destination);
        noise.start(now);
        noise.stop(now + 0.35);
      } else if (soundName === 'zip' || soundName === 'dash') {
        // Rapid zip / supersonic air dash tension snap & wind burst
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(soundName === 'dash' ? 1800 : 1200, now);
        osc.frequency.exponentialRampToValueAtTime(3600, now + 0.14);
        gain.gain.setValueAtTime(0.22, now);
        gain.gain.linearRampToValueAtTime(0.01, now + 0.14);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.14);

        if (soundName === 'dash') {
          // Dynamic air rush burst
          const wind = ctx.createOscillator();
          const windGain = ctx.createGain();
          wind.type = 'triangle';
          wind.frequency.setValueAtTime(320, now);
          wind.frequency.exponentialRampToValueAtTime(90, now + 0.28);
          windGain.gain.setValueAtTime(0.2, now);
          windGain.gain.linearRampToValueAtTime(0.001, now + 0.28);
          wind.connect(windGain);
          windGain.connect(ctx.destination);
          wind.start(now);
          wind.stop(now + 0.28);
        }
      } else if (soundName === 'combat') {
        // Heavy punch impact crunch
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'square';
        osc.frequency.setValueAtTime(160, now);
        osc.frequency.exponentialRampToValueAtTime(40, now + 0.15);
        gain.gain.setValueAtTime(0.3, now);
        gain.gain.linearRampToValueAtTime(0.01, now + 0.15);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.15);
      } else if (soundName === 'slam') {
        // Massive bass ground impact
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(90, now);
        osc.frequency.exponentialRampToValueAtTime(20, now + 0.4);
        gain.gain.setValueAtTime(0.45, now);
        gain.gain.linearRampToValueAtTime(0.001, now + 0.4);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.4);
      } else if (soundName === 'pickup') {
        // Crisp two-tone chime
        const o1 = ctx.createOscillator();
        const g1 = ctx.createGain();
        o1.type = 'sine';
        o1.frequency.setValueAtTime(587.33, now); // D5
        o1.frequency.setValueAtTime(880, now + 0.08); // A5
        g1.gain.setValueAtTime(0.2, now);
        g1.gain.linearRampToValueAtTime(0.01, now + 0.22);
        o1.connect(g1);
        g1.connect(ctx.destination);
        o1.start(now);
        o1.stop(now + 0.22);
      } else if (soundName === 'win' || soundName === 'rankup') {
        const notes = soundName === 'rankup'
          ? [440, 554.37, 659.25, 880, 1108.73] // A Major celebratory triumph arpeggio
          : [523.25, 659.25, 783.99, 1046.5];
        notes.forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(freq, now + idx * 0.08);
          gain.gain.setValueAtTime(0.25, now + idx * 0.08);
          gain.gain.linearRampToValueAtTime(0.01, now + idx * 0.08 + 0.35);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now + idx * 0.08);
          osc.stop(now + idx * 0.08 + 0.35);
        });
      } else if (soundName === 'shutter') {
        // Camera mechanical click-clack shutter
        const o1 = ctx.createOscillator();
        const g1 = ctx.createGain();
        o1.type = 'triangle';
        o1.frequency.setValueAtTime(1400, now);
        o1.frequency.exponentialRampToValueAtTime(300, now + 0.04);
        g1.gain.setValueAtTime(0.35, now);
        g1.gain.linearRampToValueAtTime(0.01, now + 0.04);
        o1.connect(g1);
        g1.connect(ctx.destination);
        o1.start(now);
        o1.stop(now + 0.04);

        // Secondary mechanical mirror slap
        const o2 = ctx.createOscillator();
        const g2 = ctx.createGain();
        o2.type = 'square';
        o2.frequency.setValueAtTime(900, now + 0.06);
        o2.frequency.exponentialRampToValueAtTime(150, now + 0.11);
        g2.gain.setValueAtTime(0.25, now + 0.06);
        g2.gain.linearRampToValueAtTime(0.01, now + 0.11);
        o2.connect(g2);
        g2.connect(ctx.destination);
        o2.start(now + 0.06);
        o2.stop(now + 0.11);
      } else if (soundName === 'thunder') {
        // Low rumbling distant thunder
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(65, now);
        osc.frequency.linearRampToValueAtTime(35, now + 0.8);
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.linearRampToValueAtTime(0.001, now + 0.9);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.9);
      } else if (soundName === 'highfive') {
        // Crisp high-five slap followed by sparkling chime
        const noise = ctx.createOscillator();
        const noiseGain = ctx.createGain();
        noise.type = 'triangle';
        noise.frequency.setValueAtTime(750, now);
        noise.frequency.exponentialRampToValueAtTime(120, now + 0.08);
        noiseGain.gain.setValueAtTime(0.35, now);
        noiseGain.gain.linearRampToValueAtTime(0.01, now + 0.08);
        noise.connect(noiseGain);
        noiseGain.connect(ctx.destination);
        noise.start(now);
        noise.stop(now + 0.08);

        // Chime
        const chime = ctx.createOscillator();
        const chimeGain = ctx.createGain();
        chime.type = 'sine';
        chime.frequency.setValueAtTime(880, now + 0.04);
        chime.frequency.exponentialRampToValueAtTime(1318.5, now + 0.22);
        chimeGain.gain.setValueAtTime(0.22, now + 0.04);
        chimeGain.gain.linearRampToValueAtTime(0.01, now + 0.25);
        chime.connect(chimeGain);
        chimeGain.connect(ctx.destination);
        chime.start(now + 0.04);
        chime.stop(now + 0.25);
      } else if (soundName === 'cheer') {
        // Uplifting comic crowd cheer rising chord
        const freqs = [440, 554.37, 659.25, 880];
        freqs.forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, now + idx * 0.04);
          osc.frequency.exponentialRampToValueAtTime(freq * 1.15, now + 0.35);
          gain.gain.setValueAtTime(0.15, now + idx * 0.04);
          gain.gain.linearRampToValueAtTime(0.001, now + 0.45);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now + idx * 0.04);
          osc.stop(now + 0.45);
        });
      } else if (soundName === 'wallrun') {
        // Fast sneaker tread scuff on skyscraper glass/concrete
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(320, now);
        osc.frequency.exponentialRampToValueAtTime(140, now + 0.09);
        gain.gain.setValueAtTime(0.18, now);
        gain.gain.linearRampToValueAtTime(0.001, now + 0.09);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.09);
      } else if (soundName === 'vault') {
        // Acrobatic hand push-off + aerodynamic wind whoosh
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(280, now);
        osc.frequency.exponentialRampToValueAtTime(620, now + 0.18);
        gain.gain.setValueAtTime(0.25, now);
        gain.gain.linearRampToValueAtTime(0.01, now + 0.18);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.18);

        // Tap impact
        const tap = ctx.createOscillator();
        const tapGain = ctx.createGain();
        tap.type = 'square';
        tap.frequency.setValueAtTime(180, now);
        tap.frequency.exponentialRampToValueAtTime(60, now + 0.06);
        tapGain.gain.setValueAtTime(0.2, now);
        tapGain.gain.linearRampToValueAtTime(0.01, now + 0.06);
        tap.connect(tapGain);
        tapGain.connect(ctx.destination);
        tap.start(now);
        tap.stop(now + 0.06);
      } else if (soundName === 'ledgegrab') {
        // Solid double hand masonry contact slap
        const slap = ctx.createOscillator();
        const slapGain = ctx.createGain();
        slap.type = 'triangle';
        slap.frequency.setValueAtTime(220, now);
        slap.frequency.exponentialRampToValueAtTime(55, now + 0.12);
        slapGain.gain.setValueAtTime(0.3, now);
        slapGain.gain.linearRampToValueAtTime(0.005, now + 0.12);
        slap.connect(slapGain);
        slapGain.connect(ctx.destination);
        slap.start(now);
        slap.stop(now + 0.12);
      } else if (soundName === 'climb') {
        // Effortful upward muscle-up hoist sound
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(260, now);
        osc.frequency.exponentialRampToValueAtTime(520, now + 0.22);
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.linearRampToValueAtTime(0.01, now + 0.22);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.22);
      } else if (soundName === 'whoosh') {
        // Dynamic cinematic whoosh transition
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(450, now);
        osc.frequency.exponentialRampToValueAtTime(120, now + 0.28);
        gain.gain.setValueAtTime(0.25, now);
        gain.gain.exponentialRampToValueAtTime(0.005, now + 0.28);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.28);
      } else if (soundName === 'impact_heavy') {
        // Heavy Tekken-style bass punch crunch with sub-bass distortion
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(220, now);
        osc.frequency.exponentialRampToValueAtTime(32, now + 0.2);
        gain.gain.setValueAtTime(0.4, now);
        gain.gain.linearRampToValueAtTime(0.01, now + 0.2);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.2);

        // Sub bass thump
        const sub = ctx.createOscillator();
        const subGain = ctx.createGain();
        sub.type = 'sine';
        sub.frequency.setValueAtTime(95, now);
        sub.frequency.exponentialRampToValueAtTime(25, now + 0.3);
        subGain.gain.setValueAtTime(0.35, now);
        subGain.gain.linearRampToValueAtTime(0.001, now + 0.3);
        sub.connect(subGain);
        subGain.connect(ctx.destination);
        sub.start(now);
        sub.stop(now + 0.3);
      } else if (soundName === 'impact_light') {
        // Fast snap jab contact
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(480, now);
        osc.frequency.exponentialRampToValueAtTime(90, now + 0.08);
        gain.gain.setValueAtTime(0.25, now);
        gain.gain.linearRampToValueAtTime(0.01, now + 0.08);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.08);
      } else if (soundName === 'block') {
        // Solid metallic / shield deflection clink with guard resonance
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'square';
        osc.frequency.setValueAtTime(520, now);
        osc.frequency.exponentialRampToValueAtTime(840, now + 0.04);
        osc.frequency.exponentialRampToValueAtTime(260, now + 0.12);
        gain.gain.setValueAtTime(0.28, now);
        gain.gain.linearRampToValueAtTime(0.01, now + 0.14);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.14);

        // Clank ring
        const clank = ctx.createOscillator();
        const clankGain = ctx.createGain();
        clank.type = 'triangle';
        clank.frequency.setValueAtTime(1100, now);
        clank.frequency.exponentialRampToValueAtTime(400, now + 0.15);
        clankGain.gain.setValueAtTime(0.18, now);
        clankGain.gain.linearRampToValueAtTime(0.005, now + 0.15);
        clank.connect(clankGain);
        clankGain.connect(ctx.destination);
        clank.start(now);
        clank.stop(now + 0.15);
      } else if (soundName === 'dodge') {
        // Rapid evasion slip / aerodynamic sidestep whip
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(620, now);
        osc.frequency.exponentialRampToValueAtTime(180, now + 0.14);
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.linearRampToValueAtTime(0.005, now + 0.14);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.14);
      } else if (soundName === 'counter') {
        // Counter-hit spark strike (sharp high ping + punch crunch)
        const ping = ctx.createOscillator();
        const pingGain = ctx.createGain();
        ping.type = 'sine';
        ping.frequency.setValueAtTime(1400, now);
        ping.frequency.exponentialRampToValueAtTime(600, now + 0.1);
        pingGain.gain.setValueAtTime(0.3, now);
        pingGain.gain.linearRampToValueAtTime(0.01, now + 0.1);
        ping.connect(pingGain);
        pingGain.connect(ctx.destination);
        ping.start(now);
        ping.stop(now + 0.1);

        // Body crunch
        const body = ctx.createOscillator();
        const bodyGain = ctx.createGain();
        body.type = 'sawtooth';
        body.frequency.setValueAtTime(260, now);
        body.frequency.exponentialRampToValueAtTime(45, now + 0.2);
        bodyGain.gain.setValueAtTime(0.32, now);
        bodyGain.gain.linearRampToValueAtTime(0.01, now + 0.2);
        body.connect(bodyGain);
        bodyGain.connect(ctx.destination);
        body.start(now);
        body.stop(now + 0.2);
      } else if (soundName === 'victory_fanfare') {
        // Epic champion victory fanfare (G-C-E-G-C high arpeggio with celebratory sustain)
        const notes = [392.00, 523.25, 659.25, 783.99, 1046.50, 1318.51];
        notes.forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'triangle';
          const startTime = now + idx * 0.09;
          osc.frequency.setValueAtTime(freq, startTime);
          gain.gain.setValueAtTime(0.28, startTime);
          gain.gain.exponentialRampToValueAtTime(0.01, startTime + (idx === notes.length - 1 ? 0.9 : 0.45));
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(startTime);
          osc.stop(startTime + (idx === notes.length - 1 ? 0.9 : 0.45));
        });
      }
    } catch {
      // AudioContext might be blocked until user gesture or in sandbox
    }
  };

  return { playSound };
}

