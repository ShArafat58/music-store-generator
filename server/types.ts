export interface MusicNote {
    note: string;
    duration: string;
    time: number;
}

export interface DrumHit {
    type: 'kick' | 'snare' | 'hat';
    time: number;
}

export interface MusicComposition {
    tempo: number;
    scale: string;
    melody: MusicNote[];
    bass: MusicNote[];
    chords: MusicNote[];
    drums: DrumHit[];
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