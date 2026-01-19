// Provider logos and icons mapping for popular subscription services

export interface ProviderInfo {
    name: string;
    icon: string; // FontAwesome class
    color: string; // Tailwind color class or hex
    type: 'streaming' | 'utility' | 'telecom' | 'software' | 'other';
}

export const providerLogos: Record<string, ProviderInfo> = {
    // Streaming Services
    netflix: {
        name: 'Netflix',
        icon: 'fa-solid fa-film',
        color: '#E50914',
        type: 'streaming',
    },
    spotify: {
        name: 'Spotify',
        icon: 'fa-brands fa-spotify',
        color: '#1DB954',
        type: 'streaming',
    },
    'amazon-prime': {
        name: 'Amazon Prime',
        icon: 'fa-brands fa-amazon',
        color: '#00A8E1',
        type: 'streaming',
    },
    'disney-plus': {
        name: 'Disney+',
        icon: 'fa-solid fa-star',
        color: '#113CCF',
        type: 'streaming',
    },
    'hbo-max': {
        name: 'HBO Max',
        icon: 'fa-solid fa-play-circle',
        color: '#B100FB',
        type: 'streaming',
    },
    youtube: {
        name: 'YouTube Premium',
        icon: 'fa-brands fa-youtube',
        color: '#FF0000',
        type: 'streaming',
    },

    // Utilities
    energia: {
        name: 'Energia Elétrica',
        icon: 'fa-solid fa-bolt',
        color: '#FFA500',
        type: 'utility',
    },
    agua: {
        name: 'Água',
        icon: 'fa-solid fa-tint',
        color: '#0080FF',
        type: 'utility',
    },
    gas: {
        name: 'Gás',
        icon: 'fa-solid fa-fire',
        color: '#FF6347',
        type: 'utility',
    },

    // Telecom
    internet: {
        name: 'Internet',
        icon: 'fa-solid fa-wifi',
        color: '#4169E1',
        type: 'telecom',
    },
    celular: {
        name: 'Celular',
        icon: 'fa-solid fa-mobile-alt',
        color: '#32CD32',
        type: 'telecom',
    },
    'tv-cabo': {
        name: 'TV a Cabo',
        icon: 'fa-solid fa-tv',
        color: '#8A2BE2',
        type: 'telecom',
    },

    // Software & Services
    github: {
        name: 'GitHub',
        icon: 'fa-brands fa-github',
        color: '#24292e',
        type: 'software',
    },
    dropbox: {
        name: 'Dropbox',
        icon: 'fa-brands fa-dropbox',
        color: '#0061FF',
        type: 'software',
    },
    'google-one': {
        name: 'Google One',
        icon: 'fa-brands fa-google',
        color: '#4285F4',
        type: 'software',
    },
    office365: {
        name: 'Office 365',
        icon: 'fa-brands fa-microsoft',
        color: '#D83B01',
        type: 'software',
    },

    // Other
    aluguel: {
        name: 'Aluguel',
        icon: 'fa-solid fa-home',
        color: '#8B4513',
        type: 'other',
    },
    condominio: {
        name: 'Condomínio',
        icon: 'fa-solid fa-building',
        color: '#696969',
        type: 'other',
    },
    seguro: {
        name: 'Seguro',
        icon: 'fa-solid fa-shield-alt',
        color: '#2F4F4F',
        type: 'other',
    },
    academia: {
        name: 'Academia',
        icon: 'fa-solid fa-dumbbell',
        color: '#FF4500',
        type: 'other',
    },
};

// Fallback for unknown providers
export const defaultProvider: ProviderInfo = {
    name: 'Outro',
    icon: 'fa-solid fa-receipt',
    color: '#6B7280',
    type: 'other',
};

/**
 * Get provider info by identifier
 */
export function getProviderInfo(identifier?: string): ProviderInfo {
    if (!identifier) return defaultProvider;

    const normalized = identifier.toLowerCase().trim();
    return providerLogos[normalized] || defaultProvider;
}

/**
 * Get all provider identifiers for dropdown selection
 */
export function getProviderOptions(): Array<{ value: string; label: string; icon: string; color: string }> {
    return Object.entries(providerLogos).map(([key, info]) => ({
        value: key,
        label: info.name,
        icon: info.icon,
        color: info.color,
    }));
}
