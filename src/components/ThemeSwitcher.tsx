"use client";

import { Sun, Moon, Monitor } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useEffect, useState } from 'react';

type Theme = 'light' | 'dark' | 'system';

export const ThemeSwitcher = () => {
  const [theme, setTheme] = useState<Theme>('system');

  useEffect(() => {
    const storedTheme = localStorage.getItem('theme') as Theme | null;
    if (storedTheme) {
      setTheme(storedTheme);
    }
  }, []);

  const applyTheme = (selectedTheme: Theme) => {
    setTheme(selectedTheme);
    localStorage.setItem('theme', selectedTheme);

    if (selectedTheme === 'system') {
      const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      document.documentElement.classList.toggle('dark', systemPrefersDark);
    } else {
      document.documentElement.classList.toggle('dark', selectedTheme === 'dark');
    }
  };

  return (
    <div className="grid grid-cols-3 gap-2 rounded-lg bg-muted p-1">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => applyTheme('light')}
        className={cn('flex items-center gap-2', theme === 'light' ? 'bg-background text-foreground' : 'hover:bg-background/50')}
      >
        <Sun size={16} /> Light
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => applyTheme('dark')}
        className={cn('flex items-center gap-2', theme === 'dark' ? 'bg-background text-foreground' : 'hover:bg-background/50')}
      >
        <Moon size={16} /> Dark
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => applyTheme('system')}
        className={cn('flex items-center gap-2', theme === 'system' ? 'bg-background text-foreground' : 'hover:bg-background/50')}
      >
        <Monitor size={16} /> System
      </Button>
    </div>
  );
};