import { fakerEN_US, fakerDE, fakerUK } from '@faker-js/faker';
import seedrandom from 'seedrandom';

type FakerInstance = typeof fakerEN_US;

const LOCALES: Record<string, FakerInstance> = {
    en: fakerEN_US,
    de: fakerDE,
    uk: fakerUK,
};

export interface SongMetadata {
    songTitle: string;
    artist: string;
    album: string;
    genre: string;
    review: string;
}

// faker দিয়ে locale অনুযায়ী গানের text data তৈরি করে
export class SongDataGenerator {
    private readonly faker: FakerInstance;
    private readonly rng: seedrandom.PRNG;

    constructor(localeCode: string, numericSeed: number, rng: seedrandom.PRNG) {
        this.faker = LOCALES[localeCode] || LOCALES.en;
        this.faker.seed(numericSeed);
        this.rng = rng;
    }

    generate(): SongMetadata {
        return {
            artist: this.makeArtist(),
            album: this.makeAlbum(),
            songTitle: this.faker.music.songName(),
            genre: this.faker.music.genre(),
            review: this.faker.lorem.sentences(2),
        };
    }

    private titleCase(text: string): string {
        return text.replace(/\b\w/g, (l) => l.toUpperCase());
    }

    private makeArtist(): string {
        const isBand = this.rng() > 0.5;
        return isBand
            ? this.titleCase(`${this.faker.word.adjective()} ${this.faker.word.noun()}`)
            : this.faker.person.fullName();
    }

    private makeAlbum(): string {
        const isSingle = this.rng() > 0.7;
        if (isSingle) return 'Single';
        const wordCount = Math.floor(this.rng() * 3) + 1;
        return this.titleCase(this.faker.word.words(wordCount));
    }
}