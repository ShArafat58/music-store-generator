export interface MusicComposition {
  tempo: number;
  scale: string;
  notes: { note: string; duration: string; time: number }[];
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

const API_BASE_URL = 'http://localhost:3001';

export async function fetchSongs(
  locale: string,
  seed: string,
  page: number,
  likes: number,
  pageSize: number = 20
): Promise<SongRecord[]> {
  const url = new URL('/api/songs', API_BASE_URL);
  url.searchParams.append('locale', locale);
  url.searchParams.append('seed', seed);
  url.searchParams.append('page', page.toString());
  url.searchParams.append('likes', likes.toString());
  url.searchParams.append('pageSize', pageSize.toString());

  const response = await fetch(url.toString());
  if (!response.ok) {
    throw new Error('Failed to fetch songs');
  }
  return response.json();
}
