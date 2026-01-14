import { writable } from 'svelte/store';
import type { Drama } from '$lib/types';

/**
 * Store to hold the drama that was recently clicked/selected.
 * This allows passing data from the home page (or search results) 
 * to the detail page for an immediate, zero-loading-state experience.
 */
function createDramaStore() {
    const { subscribe, set } = writable<Drama | null>(null);

    return {
        subscribe,
        setSelected: (drama: Drama) => set(drama),
        clear: () => set(null)
    };
}

export const selectedDrama = createDramaStore();
