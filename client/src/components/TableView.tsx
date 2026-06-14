import React, { useState } from 'react';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Pagination, Box } from '@mui/material';
import type { SongRecord } from '../lib/api';
import { ExpandableRow } from './ExpandableRow';

interface TableViewProps {
  songs: SongRecord[];
  page: number;
  setPage: (p: number) => void;
}

export const TableView: React.FC<TableViewProps> = ({ songs, page, setPage }) => {
  const [playingIndex, setPlayingIndex] = useState<number | null>(null);

  const handlePlayToggle = (index: number) => {
    if (playingIndex === index) {
      setPlayingIndex(null);
    } else {
      setPlayingIndex(index);
    }
  };

  return (
    <Box sx={{ width: '100%', mb: 4 }}>
      <TableContainer component={Paper}>
        <Table aria-label="collapsible table">
          <TableHead>
            <TableRow>
              <TableCell />
              <TableCell>#</TableCell>
              <TableCell>Title</TableCell>
              <TableCell>Artist</TableCell>
              <TableCell>Album</TableCell>
              <TableCell>Genre</TableCell>
              <TableCell>Likes</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {songs.map((song) => (
              <ExpandableRow
                key={song.index}
                song={song}
                isPlaying={playingIndex === song.index}
                onPlayToggle={() => handlePlayToggle(song.index)}
              />
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
        <Pagination
          count={1000} // Large arbitrary number to allow forward pagination
          page={page}
          onChange={(_, p) => setPage(p)}
          color="primary"
          siblingCount={2}
          boundaryCount={1}
        />
      </Box>
    </Box>
  );
};
