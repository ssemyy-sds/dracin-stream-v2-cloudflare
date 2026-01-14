import { writable, get } from 'svelte/store';

export const activeProvider = writable<string>('api_backup2');
