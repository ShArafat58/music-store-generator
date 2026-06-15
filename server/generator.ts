import seedrandom from 'seedrandom';
import { fakerEN_US, fakerDE, fakerUK } from '@faker-js/faker';
import { Scale } from 'tonal';
import { CoverGenerator } from './coverGenerator';

// Locales mapping
const locales = {
  en: fakerEN_US,
  de: fakerDE,
  uk: fakerUK,
};

// Types
export interface MusicNote {
  note: string;
  duration: string;
  time: number;
}

export interface MusicComposition {
  tempo: number;
  scale: string;
  melody: MusicNote[];
  bass: MusicNote[];
  chords: MusicNote[];
  drums: { type: 'kick' | 'snare' | 'hat'; time: number }[];
}

export interface SongRecord {
  index: number;
  songTitle: string;
  artist: string;
  album: string;
  genre: string;
  likes: number;
  coverSVG: string;
  music: MusicComposition;
  review: string;
}

export function generateSong(
  seed: string,
  localeCode: keyof typeof locales,
  index: number,
  averageLikes: number
): SongRecord {
  const faker = locales[localeCode] || locales.en;

  // 1. Core Metadata Seed
  const contentSeedStr = `${seed}_${index}`;
  const contentSeedNum = computeNumericSeed(contentSeedStr);
  faker.seed(contentSeedNum);

  const rng = seedrandom(contentSeedStr);

  const isBand = rng() > 0.5;
  const artist = isBand
    ? `${faker.word.adjective()} ${faker.word.noun()}`.replace(/\b\w/g, (l) => l.toUpperCase())
    : faker.person.fullName();

  const isSingle = rng() > 0.7;
  const album = isSingle
    ? 'Single'
    : `${faker.word.words(Math.floor(rng() * 3) + 1)}`.replace(/\b\w/g, (l) => l.toUpperCase());

  const songTitle = faker.music.songName();
  const genre = faker.music.genre();
  const review = faker.lorem.sentences(2);

  // 2. Likes Seed
  const likesSeedStr = `${seed}_${index}_likes`;
  const likesRng = seedrandom(likesSeedStr);
  const baseLikes = Math.floor(averageLikes);
  const fractional = averageLikes - baseLikes;
  const likes = baseLikes + (likesRng() < fractional ? 1 : 0);

  // 3. Cover Art
  const coverSVG = new CoverGenerator(contentSeedStr).generate(songTitle, artist);

  // 4. Music Generation
  const musicSeedStr = `${seed}_${index}_music`;
  const musicRng = seedrandom(musicSeedStr);
  const music = generateMusic(musicRng);

  return {
    index,
    songTitle,
    artist,
    album,
    genre,
    likes,
    coverSVG,
    music,
    review,
  };
}

function computeNumericSeed(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }
  return hash >>> 0;
}

function generateMusic(rng: seedrandom.PRNG): MusicComposition {
  const pick = <T>(arr: T[]): T => arr[Math.floor(rng() * arr.length)];

  // 1. Key + mode
  const keys = ['C', 'D', 'E', 'F', 'G', 'A', 'Bb', 'Eb'];
  const key = pick(keys);
  const isMinor = rng() > 0.5;
  const scaleType = isMinor ? 'minor' : 'major';
  const scaleName = `${key} ${scaleType}`;

  const scaleNotes = Scale.get(scaleName).notes; // e.g. ["C","D","E",...]

  // 2. Chord progression (scale degrees → coherent)
  const majorProgs = [[0, 3, 4, 0], [0, 5, 3, 4], [0, 4, 5, 3], [0, 3, 0, 4]];
  const minorProgs = [[0, 5, 2, 6], [0, 3, 4, 0], [0, 6, 3, 4], [0, 2, 5, 4]];
  const progression = pick(isMinor ? minorProgs : majorProgs);

  const tempo = Math.floor(rng() * 50) + 85; // 85–135 BPM

  const melody: MusicNote[] = [];
  const bass: MusicNote[] = [];
  const chords: MusicNote[] = [];
  const drums: { type: 'kick' | 'snare' | 'hat'; time: number }[] = [];

  const beatsPerBar = 4;
  let time = 0;

  for (let bar = 0; bar < progression.length; bar++) {
    const degree = progression[bar];
    const rootIdx = degree % scaleNotes.length;

    // chord notes (root, 3rd, 5th from the scale)
    const chordNotes = [0, 2, 4].map(
      (step) => `${scaleNotes[(rootIdx + step) % scaleNotes.length]}4`
    );

    // chord pad — full bar
    chordNotes.forEach((n) => chords.push({ note: n, duration: '1n', time }));

    // bass — root note (low octave)
    bass.push({ note: `${scaleNotes[rootIdx]}2`, duration: '2n', time });
    bass.push({ note: `${scaleNotes[rootIdx]}2`, duration: '4n', time: time + 2 });

    // melody — notes around the chord tones
    for (let beat = 0; beat < beatsPerBar; beat++) {
      if (rng() > 0.25) {
        const useChordTone = rng() > 0.4;
        let noteName: string;
        if (useChordTone) {
          const ct = pick([0, 2, 4]);
          noteName = scaleNotes[(rootIdx + ct) % scaleNotes.length];
        } else {
          noteName = pick(scaleNotes);
        }
        const octave = rng() > 0.3 ? 5 : 4;
        const duration = pick(['4n', '8n', '8n', '4n']);
        melody.push({ note: `${noteName}${octave}`, duration, time: time + beat });
      }
    }

    // drums — basic kick/snare beat + hats
    for (let beat = 0; beat < beatsPerBar; beat++) {
      if (beat === 0 || beat === 2) drums.push({ type: 'kick', time: time + beat });
      if (beat === 1 || beat === 3) drums.push({ type: 'snare', time: time + beat });
      drums.push({ type: 'hat', time: time + beat });
      if (rng() > 0.6) drums.push({ type: 'hat', time: time + beat + 0.5 });
    }

    time += beatsPerBar;
  }

  return { tempo, scale: scaleName, melody, bass, chords, drums };
}