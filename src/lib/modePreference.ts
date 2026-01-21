export type ContentMode = 'dracin' | 'drakor';
const KEY = 'contentMode';

export function getClientMode(): ContentMode | null {
    if (typeof window === 'undefined') return null;
    return (window.localStorage.getItem(KEY) as ContentMode) || null;
}

export function setClientMode(mode: ContentMode) {
    if (typeof document === 'undefined') return;

    // Save to localStorage
    window.localStorage.setItem(KEY, mode);

    // Save to cookie for server-side redirects
    // Path=/ ensures it works everywhere
    // Max-Age=31536000 (1 year)
    // SameSite=Lax is good default for navigation
    document.cookie = `${KEY}=${mode}; Path=/; Max-Age=31536000; SameSite=Lax`;
}
