# Determinant Music Store

A single-page web application that generates **deterministic fake music-store data** from a seed. Enter a seed and the app produces an endless, reproducible catalog of songs — complete with titles, artists, albums, genres, generative album covers, and actual playable melodies. The same seed always produces the exact same data, on any device, any time.

**Live demo:** https://music-store-generator-sf89.onrender.com

## What is this app?

Imagine a fake online music store where none of the songs are real — they're all generated on the fly from a number (a "seed"). The twist: the generation is **deterministic**, so the same seed always recreates the same catalog. Change the seed and you get a completely different catalog; type the old seed back and the original catalog returns exactly.

All data is generated **on the server**, one page (batch) at a time, with nothing stored in a database.

## Features

- **Seeded, reproducible generation** — the same seed (combined with page number and record index) always yields identical songs, artists, albums, genres, covers, and music.
- **Random seed button** — generate a fresh random 64-bit seed instantly.
- **Multi-language / region support** — English (USA), German (Germany), and Ukrainian (Ukraine). Song data is localized per region (no hardcoded locale data — all text comes from a fake-data library).
- **Likes per song (probabilistic)** — set an average number of likes (0–10, fractional allowed, e.g. 3.7). Fractional averages are achieved probabilistically. Changing likes updates only the like counts — titles, artists, covers, and music stay the same.
- **Live updates** — any change to seed, region, or likes updates the data immediately, with no Enter or apply button.
- **Two view modes:**
  - **Table View** — with pagination and expandable rows.
  - **Gallery View** — with infinite scrolling.
- **Expandable rows** — click a song to reveal a generated album cover (with the correct title and artist rendered on it), a play button, and a review.
- **Real, playable music** — each song has an actual melody generated deterministically from the seed and played in the browser via Tone.js. The same seed always produces the same audio.

## Tech Stack

| Layer     | Technology                       |
|-----------|----------------------------------|
| Frontend  | React + Vite + TypeScript        |
| Backend   | Node.js + Express + TypeScript   |
| Fake data | @faker-js/faker (multi-locale)   |
| RNG       | seedrandom (deterministic)       |
| Music     | Tonal (theory) + Tone.js (playback) |
| Covers    | Procedurally generated SVG       |
| Hosting   | Render (single web service)      |

## How It Works

- The browser requests one page of data at a time from the server:
  `GET /api/songs?locale={locale}&seed={seed}&page={page}&likes={likes}&pageSize={pageSize}`
- For each record, the server derives separate seeds from the user seed + record index:
  - a **content seed** (titles, artists, albums, genres, cover),
  - a **likes seed** (probabilistic like count),
  - a **music seed** (the melody).
- This separation guarantees that changing the likes parameter never alters the generated content.
- No random data is stored; everything is generated in memory on demand.

## Project Structure
Task 5/

├── client/        # React + Vite frontend

├── server/        # Express + TypeScript backend (data generation + API)

└── package.json   # root build/start scripts for single-service deployment

## Running Locally

```bash
# Backend (terminal 1)
cd server
npm install
npm run dev      # runs on port 3001

# Frontend (terminal 2)
cd client
npm install
npm run dev      # runs on port 5173
```

Then open http://localhost:5173 in your browser.

## Deployment

Deployed to Render as a single web service:
- **Build Command:** `npm install && npm run build`
- **Start Command:** `npm start`

The Express server serves both the API and the built React app, and listens on `process.env.PORT`.
