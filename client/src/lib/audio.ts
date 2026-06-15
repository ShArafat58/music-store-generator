import * as Tone from 'tone';
import type { MusicComposition } from './api';

let melodySynth: Tone.PolySynth | null = null;
let bassSynth: Tone.Synth | null = null;
let chordSynth: Tone.PolySynth | null = null;
let kick: Tone.MembraneSynth | null = null;
let snare: Tone.NoiseSynth | null = null;
let hat: Tone.MetalSynth | null = null;

const parts: Tone.Part[] = [];

function initInstruments() {
  if (melodySynth) return;

  melodySynth = new Tone.PolySynth(Tone.Synth).toDestination();
  melodySynth.volume.value = -8;

  bassSynth = new Tone.Synth({ oscillator: { type: 'triangle' } }).toDestination();
  bassSynth.volume.value = -10;

  chordSynth = new Tone.PolySynth(Tone.Synth).toDestination();
  chordSynth.set({ oscillator: { type: 'sine' } });
  chordSynth.volume.value = -18; // soft pad

  kick = new Tone.MembraneSynth().toDestination();
  kick.volume.value = -6;

  snare = new Tone.NoiseSynth({ noise: { type: 'white' }, envelope: { attack: 0.001, decay: 0.15, sustain: 0 } }).toDestination();
  snare.volume.value = -14;

  hat = new Tone.MetalSynth().toDestination();
  hat.volume.value = -26;
}

export async function playMusic(composition: MusicComposition) {
  await Tone.start();
  initInstruments();
  stopMusic();

  Tone.Transport.bpm.value = composition.tempo;

  // chords (pad)
  parts.push(new Tone.Part((time, v: any) => {
    chordSynth?.triggerAttackRelease(v.note, v.duration, time);
  }, composition.chords.map((n) => ({ time: `+${n.time * 0.5}`, note: n.note, duration: n.duration }))).start(0));

  // bass
  parts.push(new Tone.Part((time, v: any) => {
    bassSynth?.triggerAttackRelease(v.note, v.duration, time);
  }, composition.bass.map((n) => ({ time: `+${n.time * 0.5}`, note: n.note, duration: n.duration }))).start(0));

  // melody
  parts.push(new Tone.Part((time, v: any) => {
    melodySynth?.triggerAttackRelease(v.note, v.duration, time);
  }, composition.melody.map((n) => ({ time: `+${n.time * 0.5}`, note: n.note, duration: n.duration }))).start(0));

  // drums
  parts.push(new Tone.Part((time, v: any) => {
    if (v.type === 'kick') kick?.triggerAttackRelease('C1', '8n', time);
    else if (v.type === 'snare') snare?.triggerAttackRelease('8n', time);
    else hat?.triggerAttackRelease('16n', time);
  }, composition.drums.map((d) => ({ time: `+${d.time * 0.5}`, type: d.type }))).start(0));

  Tone.Transport.start();
}

export function stopMusic() {
  parts.forEach((p) => { p.stop(); p.dispose(); });
  parts.length = 0;
  Tone.Transport.stop();
  Tone.Transport.position = 0;
}