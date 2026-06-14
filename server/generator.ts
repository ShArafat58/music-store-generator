import seedrandom from 'seedrandom';
import { fakerEN_US, fakerDE, fakerUK } from '@faker-js/faker';
import { Scale, Chord } from 'tonal';

// Locales mapping
const locales = {
  en: fakerEN_US,
  de: fakerDE,
  uk: fakerUK,
};

// Types
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

export interface MusicComposition {
  tempo: number;
  scale: string;
  notes: { note: string; duration: string; time: number }[];
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

  // Deterministic RNG for local choices (so we don't advance faker's state unpredictably)
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

  // 3. Cover Art (SVG)
  const coverSVG = generateSVG(contentSeedStr, songTitle, artist, rng);

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
    hash = hash & hash; // Convert to 32bit integer
  }
  return hash >>> 0; // Unsigned
}

function generateSVG(seedStr: string, title: string, artist: string, rng: seedrandom.PRNG): string {
  const r1 = Math.floor(rng() * 255);
  const g1 = Math.floor(rng() * 255);
  const b1 = Math.floor(rng() * 255);

  const r2 = Math.floor(rng() * 255);
  const g2 = Math.floor(rng() * 255);
  const b2 = Math.floor(rng() * 255);

  const numShapes = Math.floor(rng() * 5) + 2;
  let shapes = '';
  for (let i = 0; i < numShapes; i++) {
    const cx = Math.floor(rng() * 200);
    const cy = Math.floor(rng() * 200);
    const r = Math.floor(rng() * 100) + 20;
    const opacity = (rng() * 0.5 + 0.1).toFixed(2);
    shapes += `<circle cx="${cx}" cy="${cy}" r="${r}" fill="rgb(${Math.floor(rng() * 255)}, ${Math.floor(
      rng() * 255
    )}, ${Math.floor(rng() * 255)})" opacity="${opacity}" />`;
  }

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="100%" height="100%">
    <defs>
      <linearGradient id="grad_${seedStr}" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style="stop-color:rgb(${r1},${g1},${b1});stop-opacity:1" />
        <stop offset="100%" style="stop-color:rgb(${r2},${g2},${b2});stop-opacity:1" />
      </linearGradient>
    </defs>
    <rect width="200" height="200" fill="url(#grad_${seedStr})" />
    ${shapes}
    <rect width="200" height="200" fill="rgba(0,0,0,0.3)" />
    <text x="100" y="90" fill="white" font-family="sans-serif" font-size="16" font-weight="bold" text-anchor="middle" alignment-baseline="middle">${escapeXML(
      title
    )}</text>
    <text x="100" y="120" fill="white" font-family="sans-serif" font-size="12" text-anchor="middle" alignment-baseline="middle">${escapeXML(
      artist
    )}</text>
  </svg>`;
  return btoa(unescape(encodeURIComponent(svg))); // Return as base64 for easy inline img src
}

function escapeXML(str: string): string {
  return str.replace(/[<>&'"]/g, function (c) {
    switch (c) {
      case '<':
        return '&lt;';
      case '>':
        return '&gt;';
      case '&':
        return '&amp;';
      case "'":
        return '&apos;';
      case '"':
        return '&quot;';
    }
    return c;
  });
}

function generateMusic(rng: seedrandom.PRNG): MusicComposition {
  // Simple deterministic music generator
  const keys = ['C', 'G', 'D', 'A', 'E', 'F', 'Bb', 'Eb'];
  const scales = ['major', 'minor'];
  const key = keys[Math.floor(rng() * keys.length)];
  const scaleType = scales[Math.floor(rng() * scales.length)];
  const scale = Scale.get(`${key} ${scaleType}`);

  const tempo = Math.floor(rng() * 60) + 80; // 80 - 140 BPM

  const notes: { note: string; duration: string; time: number }[] = [];
  const rootNote = `${key}4`;
  const scaleNotes = scale.notes.map((n) => `${n}4`);

  // Generate a simple 4-bar melody
  let time = 0;
  for (let i = 0; i < 16; i++) {
    if (rng() > 0.2) {
      const note = scaleNotes[Math.floor(rng() * scaleNotes.length)];
      const duration = rng() > 0.5 ? '8n' : '4n';
      notes.push({ note, duration, time });
    }
    time += 0.5; // Eighth note step
  }

  return {
    tempo,
    scale: `${key} ${scaleType}`,
    notes,
  };
}
