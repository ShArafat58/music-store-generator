import React, { useEffect, useState } from 'react';
import { Box, Card, CardContent, CardMedia, Typography, IconButton, Grid, CircularProgress } from '@mui/material';
import PlayCircleFilledWhiteIcon from '@mui/icons-material/PlayCircleFilledWhite';
import StopCircleIcon from '@mui/icons-material/StopCircle';
import { useInView } from 'react-intersection-observer';
import type { SongRecord } from '../lib/api';
import { playMusic, stopMusic } from '../lib/audio';

interface GalleryViewProps {
  songs: SongRecord[];
  fetchMore: () => void;
  hasMore: boolean;
  loading: boolean;
}

export const GalleryView: React.FC<GalleryViewProps> = ({ songs, fetchMore, hasMore, loading }) => {
  const { ref, inView } = useInView({
    threshold: 0,
    rootMargin: '100px',
  });

  const [playingIndex, setPlayingIndex] = useState<number | null>(null);

  useEffect(() => {
    if (inView && hasMore && !loading) {
      fetchMore();
    }
  }, [inView, hasMore, loading, fetchMore]);

  const handlePlayToggle = (index: number, music: any) => {
    if (playingIndex === index) {
      setPlayingIndex(null);
      stopMusic();
    } else {
      setPlayingIndex(index);
      playMusic(music);
    }
  };

  return (
    <Box sx={{ flexGrow: 1, p: 2 }}>
      <Grid container spacing={3}>
        {songs.map((song) => (
          <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={`gallery-${song.index}`}>
            <Card sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
              <Box sx={{ position: 'relative' }}>
                <CardMedia
                  component="img"
                  height="250"
                  image={`data:image/svg+xml;base64,${song.coverSVG}`}
                  alt="Album cover"
                />
                <IconButton
                  sx={{
                    position: 'absolute',
                    bottom: 8,
                    right: 8,
                    backgroundColor: 'rgba(0,0,0,0.5)',
                    color: 'white',
                    '&:hover': { backgroundColor: 'rgba(0,0,0,0.8)' },
                  }}
                  onClick={() => handlePlayToggle(song.index, song.music)}
                >
                  {playingIndex === song.index ? <StopCircleIcon /> : <PlayCircleFilledWhiteIcon />}
                </IconButton>
              </Box>
              <CardContent sx={{ flexGrow: 1 }}>
                <Typography gutterBottom variant="h6" component="div" noWrap>
                  {song.songTitle}
                </Typography>
                <Typography variant="body2" color="text.secondary" noWrap>
                  {song.artist}
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                  Album: {song.album}
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                  Genre: {song.genre} | Likes: {song.likes}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
      
      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <CircularProgress />
        </Box>
      )}
      
      <div ref={ref} style={{ height: '20px' }} />
    </Box>
  );
};
