import seedrandom from 'seedrandom';
import { Scale } from 'tonal';
import type { MusicComposition, MusicNote, DrumHit } from './types';

// music theory (scale + chord progression) দিয়ে সুসংগত সুর তৈরি করে
export class MusicGenerator {
    private readonly rng: seedrandom.PRNG;

    constructor(rng: seedrandom.PRNG) {
        this.rng = rng;
    }

    private pick<T>(arr: T[]): T {
        return arr[Math.floor(this.rng() * arr.length)];
    }

    generate(): MusicComposition {
        const keys = ['C', 'D', 'E', 'F', 'G', 'A', 'Bb', 'Eb'];
        const key = this.pick(keys);
        const isMinor = this.rng() > 0.5;
        const scaleType = isMinor ? 'minor' : 'major';
        const scaleName = `${key} ${scaleType}`;
        const scaleNotes = Scale.get(scaleName).notes;

        const majorProgs = [[0, 3, 4, 0], [0, 5, 3, 4], [0, 4, 5, 3], [0, 3, 0, 4]];
        const minorProgs = [[0, 5, 2, 6], [0, 3, 4, 0], [0, 6, 3, 4], [0, 2, 5, 4]];
        const progression = this.pick(isMinor ? minorProgs : majorProgs);

        const tempo = Math.floor(this.rng() * 50) + 85;

        const melody: MusicNote[] = [];
        const bass: MusicNote[] = [];
        const chords: MusicNote[] = [];
        const drums: DrumHit[] = [];

        const beatsPerBar = 4;
        let time = 0;

        for (let bar = 0; bar < progression.length; bar++) {
            const rootIdx = progression[bar] % scaleNotes.length;

            const chordNotes = [0, 2, 4].map(
                (step) => `${scaleNotes[(rootIdx + step) % scaleNotes.length]}4`
            );
            chordNotes.forEach((n) => chords.push({ note: n, duration: '1n', time }));

            bass.push({ note: `${scaleNotes[rootIdx]}2`, duration: '2n', time });
            bass.push({ note: `${scaleNotes[rootIdx]}2`, duration: '4n', time: time + 2 });

            for (let beat = 0; beat < beatsPerBar; beat++) {
                if (this.rng() > 0.25) {
                    const useChordTone = this.rng() > 0.4;
                    const noteName = useChordTone
                        ? scaleNotes[(rootIdx + this.pick([0, 2, 4])) % scaleNotes.length]
                        : this.pick(scaleNotes);
                    const octave = this.rng() > 0.3 ? 5 : 4;
                    const duration = this.pick(['4n', '8n', '8n', '4n']);
                    melody.push({ note: `${noteName}${octave}`, duration, time: time + beat });
                }
            }

            for (let beat = 0; beat < beatsPerBar; beat++) {
                if (beat === 0 || beat === 2) drums.push({ type: 'kick', time: time + beat });
                if (beat === 1 || beat === 3) drums.push({ type: 'snare', time: time + beat });
                drums.push({ type: 'hat', time: time + beat });
                if (this.rng() > 0.6) drums.push({ type: 'hat', time: time + beat + 0.5 });
            }

            time += beatsPerBar;
        }

        return { tempo, scale: scaleName, melody, bass, chords, drums };
    }
}