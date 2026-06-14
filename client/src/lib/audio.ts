import * as Tone from 'tone';
import type { MusicComposition } from './api';

let synth: Tone.PolySynth | null = null;
let currentPart: Tone.Part | null = null;

export async function playMusic(composition: MusicComposition) {
  await Tone.start();

  if (!synth) {
    synth = new Tone.PolySynth(Tone.Synth).toDestination();
    synth.volume.value = -12; // Lower volume a bit
  }

  // Stop any existing playing track
  stopMusic();

  Tone.Transport.bpm.value = composition.tempo;

  const notesArray = composition.notes.map((n) => ({
    time: `+${n.time}`,
    note: n.note,
    duration: n.duration,
  }));

  currentPart = new Tone.Part((time, value) => {
    synth?.triggerAttackRelease(value.note, value.duration, time);
  }, notesArray).start(0);

  Tone.Transport.start();
}

export function stopMusic() {
  if (currentPart) {
    currentPart.stop();
    currentPart.dispose();
    currentPart = null;
  }
  Tone.Transport.stop();
  Tone.Transport.position = 0;
}
