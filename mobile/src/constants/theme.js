export const COLORS = {
    // Premium Mint Palette
    primary: '#00A87E',        // Slightly darker Mint
    primaryLight: 'rgba(0, 168, 126, 0.1)',   // Soft mint glow
    primaryDark: '#008F6B',    // Darker mint

    // Core Neutrals
    secondary: '#0B0E11',      // Deepest background
    text: '#FFFFFF',           // Primary text
    textSecondary: '#94A3B8',  // Muted slate text

    // Utilities
    background: '#0B0E11',     // Main background
    white: '#161B22',          // Surface / Card background (renamed conceptually)
    danger: '#D9534F',         // Less vibrant red
    success: '#00A87E',
    warning: '#F59E0B',
    gray: '#21262D',

    // Glassmorphism
    glass: 'rgba(13, 17, 23, 0.8)',
    glassBorder: 'rgba(255, 255, 255, 0.08)',
};


export const SPACING = {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 40,
};

export const TYPOGRAPHY = {
    h1: { fontSize: 32, fontWeight: 'bold', letterSpacing: -0.5 },
    h2: { fontSize: 24, fontWeight: 'bold', letterSpacing: -0.5 },
    h3: { fontSize: 20, fontWeight: '600' },
    body: { fontSize: 16, fontWeight: '400' },
    caption: { fontSize: 12 },
};

export const SHADOWS = {
    small: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    medium: {
        shadowColor: '#051937',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.1,
        shadowRadius: 20,
        elevation: 5,
    },
    premium: { // Multi-layered feel
        shadowColor: '#00D09C',
        shadowOffset: { width: 0, height: 15 },
        shadowOpacity: 0.15,
        shadowRadius: 30,
        elevation: 10,
    }
};
