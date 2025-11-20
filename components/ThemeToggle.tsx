import React from 'react';
import { Button } from './ui/button';

type Theme = 'light' | 'dark' | 'auto';

interface ThemeToggleProps {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

const ThemeToggle: React.FC<ThemeToggleProps> = ({ theme, setTheme }) => {
  const cycleTheme = () => {
    const next = theme === 'light' ? 'dark' : theme === 'dark' ? 'auto' : 'light';
    setTheme(next);
  };

  const icon = theme === 'light' ? 'fa-sun' : theme === 'dark' ? 'fa-moon' : 'fa-desktop';
  const label = theme === 'light' ? 'Claro' : theme === 'dark' ? 'Escuro' : 'Automático';

  return (
    <Button
      onClick={cycleTheme}
      variant="outline"
      size="icon"
      title={`Tema: ${label} (clique para alternar)`}
      aria-label="Alternar tema"
    >
      <i className={`fas ${icon}`}></i>
    </Button>
  );
};

export default ThemeToggle;
