import express from 'express';
import cors from 'cors';
import path from 'path';
import { generateSong } from './generator';

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// API Endpoint
app.get('/api/songs', (req, res) => {
  try {
    const locale = (req.query.locale as string) || 'en';
    const seed = (req.query.seed as string) || 'default-seed';
    const page = parseInt(req.query.page as string) || 1;
    const pageSize = parseInt(req.query.pageSize as string) || 20;
    const likes = parseFloat(req.query.likes as string) || 0;

    const songs = [];
    const startIndex = (page - 1) * pageSize + 1; // 1-indexed globally

    for (let i = 0; i < pageSize; i++) {
      const globalIndex = startIndex + i;
      const song = generateSong(seed, locale as any, globalIndex, likes);
      songs.push(song);
    }

    res.json(songs);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Serve static frontend in production
const isCompiled = __dirname.endsWith('dist') || __dirname.endsWith('dist\\');
const clientBuildPath = isCompiled 
  ? path.join(__dirname, '../../client/dist')
  : path.join(__dirname, '../client/dist');

app.use(express.static(clientBuildPath));

app.use((req, res, next) => {
  if (req.path.startsWith('/api') || req.path.match(/\.(js|css|png|jpg|jpeg|gif|ico|svg)$/)) {
    return next();
  }
  res.sendFile(path.join(clientBuildPath, 'index.html'));
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
