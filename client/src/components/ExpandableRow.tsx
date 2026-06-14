import React, { useState } from 'react';
import { TableRow, TableCell, Collapse, Box, Typography, IconButton, Paper } from '@mui/material';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import PlayCircleFilledWhiteIcon from '@mui/icons-material/PlayCircleFilledWhite';
import StopCircleIcon from '@mui/icons-material/StopCircle';
import type { SongRecord } from '../lib/api';
import { playMusic, stopMusic } from '../lib/audio';

interface ExpandableRowProps {
  song: SongRecord;
  isPlaying: boolean;
  onPlayToggle: () => void;
}

export const ExpandableRow: React.FC<ExpandableRowProps> = ({ song, isPlaying, onPlayToggle }) => {
  const [open, setOpen] = useState(false);

  const handlePlayClick = () => {
    if (isPlaying) {
      stopMusic();
    } else {
      playMusic(song.music);
    }
    onPlayToggle();
  };

  return (
    <React.Fragment>
      <TableRow sx={{ '& > *': { borderBottom: 'unset' } }}>
        <TableCell>
          <IconButton
            aria-label="expand row"
            size="small"
            onClick={() => setOpen(!open)}
          >
            {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
          </IconButton>
        </TableCell>
        <TableCell>{song.index}</TableCell>
        <TableCell>{song.songTitle}</TableCell>
        <TableCell>{song.artist}</TableCell>
        <TableCell>{song.album}</TableCell>
        <TableCell>{song.genre}</TableCell>
        <TableCell>{song.likes}</TableCell>
      </TableRow>
      <TableRow>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={7}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Box sx={{ margin: 2 }}>
              <Paper sx={{ p: 2, display: 'flex', gap: 3, alignItems: 'flex-start' }}>
                <Box>
                  <img
                    src={`data:image/svg+xml;base64,${song.coverSVG}`}
                    alt="Album Cover"
                    width={150}
                    height={150}
                    style={{ borderRadius: 8, display: 'block' }}
                  />
                  <Box sx={{ mt: 1, display: 'flex', justifyContent: 'center' }}>
                    <IconButton color="primary" onClick={handlePlayClick} size="large">
                      {isPlaying ? <StopCircleIcon fontSize="large" /> : <PlayCircleFilledWhiteIcon fontSize="large" />}
                    </IconButton>
                  </Box>
                </Box>
                <Box>
                  <Typography variant="h6" gutterBottom>
                    Review
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {song.review}
                  </Typography>
                  <Typography variant="caption" sx={{ display: 'block', mt: 2 }}>
                    Tempo: {song.music.tempo} BPM | Scale: {song.music.scale}
                  </Typography>
                </Box>
              </Paper>
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </React.Fragment>
  );
};
