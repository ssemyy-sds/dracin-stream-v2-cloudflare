import type { PageServerLoad } from './$types';
import { dev } from '$app/environment';

export const load: PageServerLoad = async ({ fetch, platform }) => {
    const enabled = platform?.env?.DRAKOR_ENABLED === 'true' || dev;
    if (!enabled) return { disabled: true };

    const api = platform?.env?.API_BASE_URL || (dev ? 'https://dramabos.asia' : '');
    if (!api) {
        console.warn('API_BASE_URL is not configured');
        return { error: 'Configuration Error' };
    }

    try {
        const res = await fetch(`${api}/api/drakor/home`, {
            headers: { 'Accept': 'application/json' }
        });

        if (!res.ok) throw new Error('Failed to load Drakor home');

        const data = await res.json();
        return { data };
    } catch (err) {
        console.error('Drakor API Error:', err);
        return { error: 'Failed to load content' };
    }
};
