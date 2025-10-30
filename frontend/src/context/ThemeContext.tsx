import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ThemeProvider, createTheme, Theme } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';

type ThemeMode = 'light' | 'dark';

interface ThemeContextType {
  mode: ThemeMode;
  toggleTheme: () => void;
  setTheme: (mode: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useThemeMode = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useThemeMode must be used within a CustomThemeProvider');
  }
  return context;
};

interface CustomThemeProviderProps {
  children: ReactNode;
}

export const CustomThemeProvider: React.FC<CustomThemeProviderProps> = ({ children }) => {
  const [mode, setMode] = useState<ThemeMode>('dark');

  // Load theme preference from localStorage on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem('social_commerce_theme') as ThemeMode;
    if (savedTheme && (savedTheme === 'light' || savedTheme === 'dark')) {
      setMode(savedTheme);
    } else {
      // Set default to dark if no preference saved
      setMode('dark');
    }
  }, []);

  // Save theme preference to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('social_commerce_theme', mode);
  }, [mode]);

  const toggleTheme = () => {
    setMode(prevMode => prevMode === 'light' ? 'dark' : 'light');
  };

  const setTheme = (newMode: ThemeMode) => {
    setMode(newMode);
  };

  const theme = createTheme({
    palette: {
      mode,
      primary: {
        main: '#1976d2', // Professional blue
        dark: '#115293',
        light: '#42a5f5',
      },
      secondary: {
        main: '#424242', // Neutral gray
        dark: '#212121',
        light: '#616161',
      },
      background: {
        default: mode === 'light' ? '#f8fafc' : '#0f0f0f',
        paper: mode === 'light' ? '#ffffff' : '#1a1a1a',
      },
      text: {
        primary: mode === 'light' ? '#1a202c' : '#ffffff',
        secondary: mode === 'light' ? '#718096' : '#a0aec0',
      },
      divider: mode === 'light' ? 'rgba(0, 0, 0, 0.08)' : 'rgba(255, 255, 255, 0.08)',
      action: {
        hover: mode === 'light' ? 'rgba(0, 0, 0, 0.04)' : 'rgba(255, 255, 255, 0.04)',
        selected: mode === 'light' ? 'rgba(102, 126, 234, 0.1)' : 'rgba(102, 126, 234, 0.2)',
      },
    },
    shape: {
      borderRadius: 16,
    },
    typography: {
      fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
      h1: { fontWeight: 800 },
      h2: { fontWeight: 700 },
      h3: { fontWeight: 700 },
      h4: { fontWeight: 700 },
      h5: { fontWeight: 600 },
      h6: { fontWeight: 600 },
    },
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 12,
            textTransform: 'none',
            fontWeight: 600,
            boxShadow: 'none',
            '&:hover': {
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            },
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: 20,
            boxShadow: mode === 'light' 
              ? '0 4px 20px rgba(0, 0, 0, 0.08)' 
              : '0 4px 20px rgba(0, 0, 0, 0.3)',
            backdropFilter: 'blur(20px)',
            border: mode === 'light' 
              ? '1px solid rgba(255, 255, 255, 0.2)' 
              : '1px solid rgba(255, 255, 255, 0.1)',
            background: mode === 'light' 
              ? 'rgba(255, 255, 255, 0.98)' 
              : 'rgba(26, 26, 26, 0.98)',
          },
        },
      },
      MuiFab: {
        styleOverrides: {
          root: {
            boxShadow: '0 8px 25px rgba(0, 0, 0, 0.15)',
          },
        },
      },
      MuiAppBar: {
        styleOverrides: {
          root: {
            backgroundColor: mode === 'light' 
              ? 'rgba(255, 255, 255, 0.95)' 
              : 'rgba(15, 15, 15, 0.95)',
            backdropFilter: 'blur(20px)',
            borderBottom: mode === 'light' 
              ? '1px solid rgba(0, 0, 0, 0.08)' 
              : '1px solid rgba(255, 255, 255, 0.08)',
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundImage: 'none',
          },
        },
      },
    },
  });

  const value: ThemeContextType = {
    mode,
    toggleTheme,
    setTheme,
  };

  return (
    <ThemeContext.Provider value={value}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </ThemeContext.Provider>
  );
};

export default ThemeContext;