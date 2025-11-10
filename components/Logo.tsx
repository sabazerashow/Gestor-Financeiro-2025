import React from 'react';

interface LogoProps {
  size?: number;
}

// SVG estilizado inspirado no logo fornecido (capacete dentro de círculo)
const Logo: React.FC<LogoProps> = ({ size = 32 }) => {
  const s = size;
  return (
    <svg
      width={s}
      height={s}
      viewBox="0 0 100 100"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Logo Finance Pilot"
    >
      <circle cx="50" cy="50" r="47" fill="none" stroke="currentColor" strokeWidth="6" />
      {/* Capacete estilizado */}
      <path
        d="M25 58c0-18 12-28 25-28s25 10 25 28"
        stroke="currentColor"
        strokeWidth="6"
        fill="none"
        strokeLinecap="round"
      />
      {/* Visor */}
      <rect x="32" y="42" width="36" height="12" rx="6" fill="currentColor" />
      {/* Máscara */}
      <path
        d="M42 60c0 6 4 12 8 12s8-6 8-12"
        stroke="currentColor"
        strokeWidth="6"
        fill="none"
        strokeLinecap="round"
      />
      {/* Tubo central */}
      <path d="M50 72v14" stroke="currentColor" strokeWidth="6" strokeLinecap="round" />
      {/* Detalhes do tubo */}
      <path d="M50 74v0M50 78v0M50 82v0" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
    </svg>
  );
};

export default Logo;

