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

    console.log('Fetching Drakor home from:', `${api}/api/dramaid/home?page=1`);

    try {
        const res = await fetch(`${api}/api/dramaid/home?page=1`, {
            headers: { 'Accept': 'application/json' }
        });

        if (!res.ok) {
            console.error('Drakor API Failed:', res.status, await res.text());
            throw new Error('Failed to load Drakor home');
        }

        const json = await res.json();
        let rawData: any[] = [];

        // Normalize response data
        if (Array.isArray(json)) {
            rawData = json;
        } else if (Array.isArray(json?.data)) {
            rawData = json.data;
        }

        // Filter for Korea Selatan
        const koreanDramas = rawData.filter((item: any) =>
            item.negara === 'Korea Selatan' || item.country === 'Korea Selatan'
        );

        // Split into sections for UI
        const trending = koreanDramas.slice(0, 5);
        const newReleases = koreanDramas.slice(5);

        return {
            data: {
                trending,
                newReleases
            }
        };
    } catch (err) {
        // Fallback or empty data
        console.error('Drakor API Error:', err);
        return { error: 'Failed to load content' };
    }
};
