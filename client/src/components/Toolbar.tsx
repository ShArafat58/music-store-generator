import React from 'react';
import { Box, Select, MenuItem, TextField, Button, Slider, Typography, FormControl, InputLabel } from '@mui/material';

interface ToolbarProps {
  locale: string;
  setLocale: (val: string) => void;
  seed: string;
  setSeed: (val: string) => void;
  likes: number;
  setLikes: (val: number) => void;
}

export const Toolbar: React.FC<ToolbarProps> = ({ locale, setLocale, seed, setSeed, likes, setLikes }) => {
  const handleRandomSeed = () => {
    setSeed(Math.random().toString(36).substring(2, 15));
  };

  return (
    <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', p: 2, borderBottom: 1, borderColor: 'divider', flexWrap: 'wrap' }}>
      <FormControl size="small" sx={{ minWidth: 200 }}>
        <InputLabel id="locale-label">Region/Locale</InputLabel>
        <Select
          labelId="locale-label"
          value={locale}
          label="Region/Locale"
          onChange={(e) => setLocale(e.target.value)}
        >
          <MenuItem value="en">English (USA)</MenuItem>
          <MenuItem value="de">German (Germany)</MenuItem>
          <MenuItem value="uk">Ukrainian (Ukraine)</MenuItem>
        </Select>
      </FormControl>

      <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
        <TextField
          label="Seed"
          size="small"
          value={seed}
          onChange={(e) => setSeed(e.target.value)}
        />
        <Button variant="outlined" onClick={handleRandomSeed}>
          Random
        </Button>
      </Box>

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: 300, ml: 2 }}>
        <Typography variant="body2" sx={{ whiteSpace: 'nowrap' }}>
          Likes ({likes}):
        </Typography>
        <Slider
          value={likes}
          onChange={(_, val) => setLikes(val as number)}
          min={0}
          max={10}
          step={0.1}
          valueLabelDisplay="auto"
        />
      </Box>
    </Box>
  );
};
