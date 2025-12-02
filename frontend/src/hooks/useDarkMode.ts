import { useState, useEffect, useCallback } from 'react';

type Theme = 'light' | 'dark' | 'system';

/**
 * Hook para Dark Mode com suporte a preferência do sistema
 *
 * @example
 * const { theme, setTheme, isDark } = useDarkMode();
 *
 * <button onClick={() => setTheme(isDark ? 'light' : 'dark')}>
 *   Toggle Dark Mode
 * </button>
 */
export function useDarkMode() {
  const [theme, setThemeState] = useState<Theme>(() => {
    // Ler tema salvo do localStorage
    const saved = localStorage.getItem('theme') as Theme | null;
    return saved || 'system';
  });

  const [isDark, setIsDark] = useState(false);

  /**
   * Detectar preferência do sistema
   */
  const getSystemPreference = useCallback((): boolean => {
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  }, []);

  /**
   * Aplicar tema no DOM
   */
  const applyTheme = useCallback((theme: Theme) => {
    const root = document.documentElement;

    let shouldBeDark: boolean;

    if (theme === 'system') {
      shouldBeDark = getSystemPreference();
    } else {
      shouldBeDark = theme === 'dark';
    }

    if (shouldBeDark) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }

    setIsDark(shouldBeDark);
  }, [getSystemPreference]);

  /**
   * Alterar tema
   */
  const setTheme = useCallback(
    (newTheme: Theme) => {
      setThemeState(newTheme);
      localStorage.setItem('theme', newTheme);
      applyTheme(newTheme);
    },
    [applyTheme]
  );

  /**
   * Toggle dark/light
   */
  const toggle = useCallback(() => {
    setTheme(isDark ? 'light' : 'dark');
  }, [isDark, setTheme]);

  /**
   * Aplicar tema inicial
   */
  useEffect(() => {
    applyTheme(theme);
  }, [theme, applyTheme]);

  /**
   * Ouvir mudanças na preferência do sistema
   */
  useEffect(() => {
    if (theme !== 'system') return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const handler = (e: MediaQueryListEvent) => {
      setIsDark(e.matches);
      const root = document.documentElement;
      if (e.matches) {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
    };

    mediaQuery.addEventListener('change', handler);

    return () => mediaQuery.removeEventListener('change', handler);
  }, [theme]);

  return {
    theme,
    setTheme,
    toggle,
    isDark,
    isLight: !isDark,
    isSystem: theme === 'system',
  };
}
