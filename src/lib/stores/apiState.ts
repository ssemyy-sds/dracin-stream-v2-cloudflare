import { writable } from 'svelte/store';

export const activeProvider = writable<string>('Unknown');
