/**
 * Design System - Constantes de Design Profissional
 * Paleta de cores, tipografia e espaçamentos consistentes
 */

export const colors = {
    // Core
    primary: '#1E40AF',      // Azul profissional
    secondary: '#7C3AED',    // Roxo destaque

    // Semânticas
    success: '#059669',      // Verde (receitas)
    danger: '#DC2626',       // Vermelho (despesas)
    warning: '#D97706',      // Laranja (avisos)
    info: '#0891B2',         // Ciano (informações)

    // Neutros
    gray: {
        50: '#F9FAFB',
        100: '#F3F4F6',
        200: '#E5E7EB',
        300: '#D1D5DB',
        400: '#9CA3AF',
        500: '#6B7280',
        600: '#4B5563',
        700: '#374151',
        800: '#1F2937',
        900: '#111827',
    },

    // Backgrounds
    background: {
        primary: '#FFFFFF',
        secondary: '#F9FAFB',
        tertiary: '#F3F4F6',
    }
} as const;

export const typography = {
    display: {
        size: '40px',
        weight: '700',
        lineHeight: '1.2',
        letterSpacing: '-0.02em',
    },
    h1: {
        size: '28px',
        weight: '600',
        lineHeight: '1.3',
        letterSpacing: '-0.01em',
    },
    h2: {
        size: '24px',
        weight: '600',
        lineHeight: '1.4',
    },
    h3: {
        size: '20px',
        weight: '600',
        lineHeight: '1.4',
    },
    bodyLarge: {
        size: '18px',
        weight: '400',
        lineHeight: '1.6',
    },
    body: {
        size: '16px',
        weight: '400',
        lineHeight: '1.6',
    },
    caption: {
        size: '14px',
        weight: '400',
        lineHeight: '1.5',
    },
    small: {
        size: '12px',
        weight: '500',
        lineHeight: '1.4',
        letterSpacing: '0.02em',
    }
} as const;

export const spacing = {
    card: '24px',           // Padding interno de cards
    gap: '20px',            // Gap entre elementos
    gapSmall: '12px',       // Gap pequeno
    section: '32px',        // Gap entre seções
    marginDesktop: '32px',  // Margem da tela
    marginMobile: '16px',   // Margem mobile
} as const;

export const shadows = {
    sm: '0 1px 2px 0 rgba(30, 64, 175, 0.05)',
    md: '0 4px 6px -1px rgba(30, 64, 175, 0.08), 0 2px 4px -1px rgba(30, 64, 175, 0.04)',
    lg: '0 10px 15px -3px rgba(30, 64, 175, 0.1), 0 4px 6px -2px rgba(30, 64, 175, 0.05)',
    xl: '0 20px 25px -5px rgba(30, 64, 175, 0.12), 0 10px 10px -5px rgba(30, 64, 175, 0.06)',
} as const;

export const borderRadius = {
    sm: '8px',
    md: '12px',
    lg: '16px',
    xl: '20px',
    full: '9999px',
} as const;

export const transitions = {
    fast: '150ms ease-out',
    normal: '250ms ease-out',
    slow: '350ms ease-out',
} as const;
