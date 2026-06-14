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

export async function fetchSongs(
  locale: string,
  seed: string,
  page: number,
  likes: number,
  pageSize: number = 20
): Promise<SongRecord[]> {
  const params = new URLSearchParams();
  params.append('locale', locale);
  params.append('seed', seed);
  params.append('page', page.toString());
  params.append('likes', likes.toString());
  params.append('pageSize', pageSize.toString());

  const response = await fetch(`/api/songs?${params.toString()}`);
  if (!response.ok) {
    throw new Error('Failed to fetch songs');
  }
  return response.json();
}
