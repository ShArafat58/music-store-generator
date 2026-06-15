import { SeedManager } from './seedManager';
import { SongDataGenerator } from './songDataGenerator';
import { MusicGenerator } from './musicGenerator';
import { CoverGenerator } from './coverGenerator';
import type { SongRecord } from './types';

export * from './types';

export function generateSong(
  seed: string,
  localeCode: string,
  index: number,
  averageLikes: number
): SongRecord {
  const seeds = new SeedManager(seed, index);

  const metadata = new SongDataGenerator(
    localeCode,
    seeds.numericSeed(),
    seeds.content()
  ).generate();

  const likes = computeLikes(seeds.stream('likes'), averageLikes);

  const coverSVG = new CoverGenerator(`${seed}_${index}`).generate(
    metadata.songTitle,
    metadata.artist
  );

  const music = new MusicGenerator(seeds.stream('music')).generate();

  return {
    index,
    songTitle: metadata.songTitle,
    artist: metadata.artist,
    album: metadata.album,
    genre: metadata.genre,
    likes,
    coverSVG,
    music,
    review: metadata.review,
  };
}

function computeLikes(rng: () => number, averageLikes: number): number {
  const base = Math.floor(averageLikes);
  const fractional = averageLikes - base;
  return base + (rng() < fractional ? 1 : 0);
}