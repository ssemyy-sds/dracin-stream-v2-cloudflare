import { writable } from 'svelte/store';
import type { Episode } from '$lib/types';

interface CachedEpisodes {
    bookId: string;
    episodes: Episode[];
    timestamp: number;
}

function createEpisodeCache() {
    const { subscribe, set, update } = writable<CachedEpisodes | null>(null);

    return {
        subscribe,
        set: (bookId: string, episodes: Episode[]) => {
            set({
                bookId,
                episodes,
                timestamp: Date.now()
            });
        },
        get: (bookId: string) => {
            let data: CachedEpisodes | null = null;
            subscribe(value => {
                if (value && value.bookId === bookId) {
                    data = value;
                }
            })();
            return data;
        },
        clear: () => set(null)
    };
}

export const cachedEpisodes = createEpisodeCache();
