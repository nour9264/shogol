'use client';

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
  isDark: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};

// Apply theme to DOM - FORCE remove and add classes
const applyTheme = (theme: Theme) => {
  if (typeof window === 'undefined') return;
  
  const root = document.documentElement;
  
  // Force remove BOTH classes first
  root.classList.remove('light');
  root.classList.remove('dark');
  
  // Force add the new theme class
  if (theme === 'dark') {
    root.classList.add('dark');
  } else {
    root.classList.add('light');
  }
  
  // Set data attribute
  root.setAttribute('data-theme', theme);
  
  // Log for debugging
  console.log('[Theme] Applied theme:', theme, 'Classes:', root.classList.toString());
  
  // Update meta theme-color for mobile browsers
  const metaThemeColor = document.querySelector('meta[name="theme-color"]');
  if (metaThemeColor) {
    metaThemeColor.setAttribute('content', theme === 'dark' ? '#111827' : '#ffffff');
  }
};

// Get stored theme from localStorage
const getStoredTheme = (): Theme | null => {
  if (typeof window === 'undefined') return null;
  
  try {
    const stored = localStorage.getItem('shogol-theme');
    if (stored === 'light' || stored === 'dark') {
      return stored;
    }
  } catch (e) {
    // localStorage not available
  }
  return null;
};

// Store theme in localStorage
const storeTheme = (theme: Theme) => {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem('shogol-theme', theme);
    console.log('[Theme] Stored theme:', theme);
  } catch (e) {
    // localStorage not available
  }
};

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider = ({ children }: ThemeProviderProps) => {
  // Default to light mode
  const [theme, setThemeState] = useState<Theme>('light');
  const [mounted, setMounted] = useState(false);

  // Initialize theme on mount
  useEffect(() => {
    // Check localStorage first
    const storedTheme = getStoredTheme();
    
    let initialTheme: Theme;
    
    if (storedTheme) {
      // Use stored preference
      initialTheme = storedTheme;
    } else {
      // Default to light mode (don't check system preference)
      initialTheme = 'light';
    }
    
    console.log('[Theme] Initial theme:', initialTheme);
    setThemeState(initialTheme);
    applyTheme(initialTheme);
    setMounted(true);
  }, []);

  const setTheme = useCallback((newTheme: Theme) => {
    console.log('[Theme] Setting theme to:', newTheme);
    setThemeState(newTheme);
    applyTheme(newTheme);
    storeTheme(newTheme);
  }, []);

  const toggleTheme = useCallback(() => {
    setThemeState((currentTheme) => {
      const newTheme = currentTheme === 'light' ? 'dark' : 'light';
      console.log('[Theme] Toggling from', currentTheme, 'to', newTheme);
      applyTheme(newTheme);
      storeTheme(newTheme);
      return newTheme;
    });
  }, []);

  const value: ThemeContextType = {
    theme,
    toggleTheme,
    setTheme,
    isDark: theme === 'dark',
  };

  // Show content immediately - no visibility wrapper
  // The initial theme script handles flash prevention
  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};
