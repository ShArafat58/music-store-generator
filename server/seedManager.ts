import seedrandom from 'seedrandom';

// একটা গান এর জন্য সব deterministic random stream এক জায়গায় তৈরি করে
export class SeedManager {
    private readonly baseKey: string;

    constructor(seed: string, index: number) {
        this.baseKey = `${seed}_${index}`;
    }

    // content (title, artist, album...) এর main RNG
    content(): seedrandom.PRNG {
        return seedrandom(this.baseKey);
    }

    // আলাদা নামের RNG stream (যেমন "likes", "music") — একে অপরের থেকে স্বাধীন
    stream(name: string): seedrandom.PRNG {
        return seedrandom(`${this.baseKey}_${name}`);
    }

    // faker এর জন্য deterministic সংখ্যা (custom hash এর বদলে seedrandom নিজেই দেয়)
    numericSeed(): number {
        return Math.abs(seedrandom(this.baseKey).int32());
    }
}