import seedrandom from 'seedrandom';

// একটা নির্দিষ্ট seed থেকে সুন্দর, varied album cover SVG বানায়
export class CoverGenerator {
    private rng: seedrandom.PRNG;

    constructor(seed: string) {
        this.rng = seedrandom(`${seed}_cover`);
    }

    private rand(): number {
        return this.rng();
    }

    private int(min: number, max: number): number {
        return Math.floor(this.rand() * (max - min + 1)) + min;
    }

    private pick<T>(arr: T[]): T {
        return arr[Math.floor(this.rand() * arr.length)];
    }

    private buildPalette() {
        const baseHue = this.int(0, 360);
        const scheme = this.pick(['analogous', 'complementary', 'triadic']);
        let hues: number[];
        if (scheme === 'complementary') {
            hues = [baseHue, (baseHue + 180) % 360];
        } else if (scheme === 'triadic') {
            hues = [baseHue, (baseHue + 120) % 360, (baseHue + 240) % 360];
        } else {
            hues = [baseHue, (baseHue + 30) % 360, (baseHue + 330) % 360];
        }
        const sat = this.int(55, 85);
        const isDark = this.rand() > 0.5;
        const bgLight = isDark ? this.int(12, 22) : this.int(78, 90);

        return {
            bg: `hsl(${hues[0]}, ${sat}%, ${bgLight}%)`,
            colors: hues.map((h, i) => `hsl(${h}, ${sat}%, ${isDark ? 45 + i * 8 : 50 - i * 6}%)`),
            accent: `hsl(${hues[hues.length - 1]}, ${sat}%, ${isDark ? 65 : 40}%)`,
            text: `hsl(0, 0%, ${isDark ? 98 : 8}%)`,
            textShadow: isDark ? 'rgba(0,0,0,0.55)' : 'rgba(255,255,255,0.55)',
        };
    }

    private drawConcentricRings(colors: string[]): string {
        let s = '';
        const cx = this.int(60, 240);
        const cy = this.int(60, 240);
        const rings = this.int(5, 9);
        for (let i = rings; i > 0; i--) {
            const r = (300 / rings) * i * 0.7;
            s += `<circle cx="${cx}" cy="${cy}" r="${r.toFixed(1)}" fill="${this.pick(colors)}" opacity="${(0.5 + this.rand() * 0.5).toFixed(2)}"/>`;
        }
        return s;
    }

    private drawGrid(colors: string[]): string {
        let s = '';
        const cells = this.pick([3, 4, 5, 6]);
        const size = 300 / cells;
        for (let y = 0; y < cells; y++) {
            for (let x = 0; x < cells; x++) {
                if (this.rand() > 0.25) {
                    const shape = this.rand();
                    const color = this.pick(colors);
                    if (shape < 0.5) {
                        s += `<rect x="${x * size}" y="${y * size}" width="${size}" height="${size}" fill="${color}" opacity="${(0.6 + this.rand() * 0.4).toFixed(2)}"/>`;
                    } else {
                        s += `<circle cx="${x * size + size / 2}" cy="${y * size + size / 2}" r="${size / 2}" fill="${color}" opacity="${(0.6 + this.rand() * 0.4).toFixed(2)}"/>`;
                    }
                }
            }
        }
        return s;
    }

    private drawStripes(colors: string[]): string {
        let s = '';
        const count = this.int(5, 10);
        const w = 300 / count;
        const angle = this.pick([0, 45, -45, 90]);
        s += `<g transform="rotate(${angle} 150 150)">`;
        for (let i = -2; i < count + 2; i++) {
            s += `<rect x="${i * w}" y="-100" width="${w * 0.7}" height="500" fill="${this.pick(colors)}" opacity="${(0.55 + this.rand() * 0.4).toFixed(2)}"/>`;
        }
        s += `</g>`;
        return s;
    }

    private drawWaves(colors: string[]): string {
        let s = '';
        const layers = this.int(3, 5);
        for (let i = 0; i < layers; i++) {
            const y = 80 + i * 50 + this.int(-15, 15);
            const amp = this.int(20, 50);
            const cp1 = this.int(0, 150);
            const cp2 = this.int(150, 300);
            s += `<path d="M0 ${y} C ${cp1} ${y - amp}, ${cp2} ${y + amp}, 300 ${y} L300 300 L0 300 Z" fill="${this.pick(colors)}" opacity="${(0.6 + this.rand() * 0.35).toFixed(2)}"/>`;
        }
        return s;
    }

    private drawBauhaus(colors: string[]): string {
        let s = '';
        const shapes = this.int(4, 7);
        for (let i = 0; i < shapes; i++) {
            const t = this.rand();
            const color = this.pick(colors);
            const op = (0.65 + this.rand() * 0.35).toFixed(2);
            if (t < 0.33) {
                const x = this.int(0, 250), y = this.int(0, 250), w = this.int(60, 150);
                s += `<rect x="${x}" y="${y}" width="${w}" height="${w}" fill="${color}" opacity="${op}"/>`;
            } else if (t < 0.66) {
                const cx = this.int(40, 260), cy = this.int(40, 260), r = this.int(30, 90);
                s += `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${color}" opacity="${op}"/>`;
            } else {
                const x = this.int(0, 250), y = this.int(0, 250), sz = this.int(60, 140);
                s += `<polygon points="${x},${y + sz} ${x + sz / 2},${y} ${x + sz},${y + sz}" fill="${color}" opacity="${op}"/>`;
            }
        }
        return s;
    }

    generate(title: string, artist: string): string {
        const p = this.buildPalette();
        const style = this.pick(['rings', 'grid', 'stripes', 'waves', 'bauhaus']);

        let art = '';
        if (style === 'rings') art = this.drawConcentricRings(p.colors);
        else if (style === 'grid') art = this.drawGrid(p.colors);
        else if (style === 'stripes') art = this.drawStripes(p.colors);
        else if (style === 'waves') art = this.drawWaves(p.colors);
        else art = this.drawBauhaus(p.colors);

        const safeTitle = this.truncate(title, 22);
        const safeArtist = this.truncate(artist, 26);

        const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 300" width="100%" height="100%">
  <rect width="300" height="300" fill="${p.bg}"/>
  ${art}
  <rect width="300" height="110" y="190" fill="${p.bg}" opacity="0.55"/>
  <text x="20" y="240" fill="${p.text}" font-family="Georgia, 'Times New Roman', serif" font-size="26" font-weight="bold" style="paint-order:stroke;stroke:${p.textShadow};stroke-width:3px;">${this.esc(safeTitle)}</text>
  <text x="20" y="270" fill="${p.text}" font-family="Arial, sans-serif" font-size="15" letter-spacing="1" style="paint-order:stroke;stroke:${p.textShadow};stroke-width:2px;">${this.esc(safeArtist)}</text>
</svg>`;

        return Buffer.from(svg, 'utf-8').toString('base64');
    }

    private truncate(str: string, max: number): string {
        return str.length > max ? str.slice(0, max - 1) + '…' : str;
    }

    private esc(str: string): string {
        return str
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&apos;');
    }
}