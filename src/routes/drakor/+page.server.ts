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

    console.log('Fetching Drakor home from:', `${api}/api/drakor/home`);

    try {
        const res = await fetch(`${api}/api/drakor/home`, {
            headers: { 'Accept': 'application/json' }
        });

        if (!res.ok) {
            console.error('Drakor API Failed:', res.status, await res.text());
            throw new Error('Failed to load Drakor home');
        }

        const json = await res.json();

        // Filter content logic
        const filterByCountry = (items: any[]) => {
            if (!Array.isArray(items)) return [];
            return items.filter(item => item.negara === 'Korea Selatan');
        };

        if (json.data) {
            if (json.data.trending) {
                json.data.trending = filterByCountry(json.data.trending);
            }
            if (json.data.newReleases) {
                json.data.newReleases = filterByCountry(json.data.newReleases);
            }
        }

        return { data: json.data };
    } catch (err) {
        console.error('Drakor API Error:', err);
        return { error: 'Failed to load content' };
    }
};
