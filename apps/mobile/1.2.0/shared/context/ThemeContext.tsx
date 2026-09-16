import React, { createContext, useContext, ReactNode } from 'react';
import { useTheme as useThemeHook, ThemeType, THEME_TYPES } from '@/shared/hooks/useTheme';
import { useLanguage } from './LanguageContext';

type ThemeContextType = {
  theme: ThemeType;
  setTheme: (theme: ThemeType) => Promise<void>;
  setThemeAnimated: (theme: ThemeType, animationCallback?: () => void) => Promise<void>;
  isLoading: boolean;
  isAnimating: boolean;
  THEME_TYPES: typeof THEME_TYPES;
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const themeData = useThemeHook();

  return (
    <ThemeContext.Provider value={themeData}>
      {children}
    </ThemeContext.Provider>
  );
};

export const getThemeInfo = (themeType: string) => {
  const { t } = useLanguage();
  switch (themeType) {
    case THEME_TYPES.DEVICE:
      return { icon: 'cellphone', name: t('users.theme.device') };
    case THEME_TYPES.LIGHT:
      return { icon: 'white-balance-sunny', name: t('users.theme.light') };
    case THEME_TYPES.DARK:
      return { icon: 'moon-waning-crescent', name: t('users.theme.dark') };
    default:
      return { icon: 'palette', name: 'Theme' };
  }
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};