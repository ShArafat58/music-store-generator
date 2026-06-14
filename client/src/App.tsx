import React, { useState, useEffect, useCallback } from 'react';
import { Container, Typography, Box, ToggleButton, ToggleButtonGroup, CssBaseline } from '@mui/material';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import ViewListIcon from '@mui/icons-material/ViewList';
import ViewModuleIcon from '@mui/icons-material/ViewModule';
import { Toolbar } from './components/Toolbar';
import { TableView } from './components/TableView';
import { GalleryView } from './components/GalleryView';
import { fetchSongs } from './lib/api';
import type { SongRecord } from './lib/api';
import { stopMusic } from './lib/audio';

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#90caf9',
    },
    background: {
      default: '#121212',
      paper: '#1e1e1e',
    },
  },
});

function App() {
  const [locale, setLocale] = useState('en');
  const [seed, setSeed] = useState(Math.random().toString(36).substring(2, 15));
  const [likes, setLikes] = useState(0);
  const [viewMode, setViewMode] = useState<'table' | 'gallery'>('table');
  
  const [tablePage, setTablePage] = useState(1);
  const [tableSongs, setTableSongs] = useState<SongRecord[]>([]);
  
  const [galleryPage, setGalleryPage] = useState(1);
  const [gallerySongs, setGallerySongs] = useState<SongRecord[]>([]);
  const [loading, setLoading] = useState(false);

  // Load Table Data
  useEffect(() => {
    if (viewMode === 'table') {
      fetchSongs(locale, seed, tablePage, likes, 20).then(setTableSongs);
      stopMusic();
    }
  }, [locale, seed, likes, tablePage, viewMode]);

  // Load Gallery Data (Infinite Scroll)
  useEffect(() => {
    if (viewMode === 'gallery') {
      if (galleryPage === 1) {
        setGallerySongs([]);
      }
      setLoading(true);
      fetchSongs(locale, seed, galleryPage, likes, 20).then((newSongs) => {
        setGallerySongs((prev) => {
          // If we reset to page 1, replace. Else append.
          if (galleryPage === 1) return newSongs;
          return [...prev, ...newSongs];
        });
        setLoading(false);
      });
    }
  }, [locale, seed, likes, galleryPage, viewMode]);

  // Reset pagination when params change
  useEffect(() => {
    setTablePage(1);
    setGalleryPage(1);
    stopMusic();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [locale, seed, likes]);

  const handleViewChange = (
    _event: React.MouseEvent<HTMLElement>,
    newView: 'table' | 'gallery' | null,
  ) => {
    if (newView !== null) {
      setViewMode(newView);
      stopMusic();
    }
  };

  const loadMoreGallery = useCallback(() => {
    setGalleryPage((prev) => prev + 1);
  }, []);

  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <Box sx={{ flexGrow: 1, height: '100vh', display: 'flex', flexDirection: 'column' }}>
        <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', bgcolor: 'background.paper' }}>
          <Typography variant="h5" component="div" sx={{ fontWeight: 'bold' }}>
            Determinant Music Store
          </Typography>
          <ToggleButtonGroup
            value={viewMode}
            exclusive
            onChange={handleViewChange}
            aria-label="view mode"
            size="small"
          >
            <ToggleButton value="table" aria-label="table view">
              <ViewListIcon />
            </ToggleButton>
            <ToggleButton value="gallery" aria-label="gallery view">
              <ViewModuleIcon />
            </ToggleButton>
          </ToggleButtonGroup>
        </Box>

        <Toolbar
          locale={locale}
          setLocale={setLocale}
          seed={seed}
          setSeed={setSeed}
          likes={likes}
          setLikes={setLikes}
        />

        <Box sx={{ flexGrow: 1, overflow: 'auto', p: 2 }}>
          <Container maxWidth="xl">
            {viewMode === 'table' ? (
              <TableView songs={tableSongs} page={tablePage} setPage={setTablePage} />
            ) : (
              <GalleryView 
                songs={gallerySongs} 
                fetchMore={loadMoreGallery} 
                hasMore={true} 
                loading={loading} 
              />
            )}
          </Container>
        </Box>
      </Box>
    </ThemeProvider>
  );
}

export default App;
