import type { PageServerLoad } from './$types';
import { dev } from '$app/environment';

export const load: PageServerLoad = async ({ params, fetch, platform }) => {
    const { slug } = params;
    const api = platform?.env?.API_BASE_URL || (dev ? 'https://dramabos.asia' : '');

    if (!api) {
        return { error: 'Configuration Error: API_BASE_URL missing' };
    }

    console.log('Fetching Drakor detail:', `${api}/api/dramaid/detail/${slug}`);

    try {
        const res = await fetch(`${api}/api/dramaid/detail/${slug}`, {
            headers: { 'Accept': 'application/json' }
        });

        if (!res.ok) {
            console.error('Drakor Detail Failed:', res.status);
            throw new Error('Failed to load drama details');
        }

        const json = await res.json();
        return {
            drama: json.data || json, // Handle both wrapped and unwrapped responses
            slug
        };
    } catch (err) {
        console.error('Drakor Detail API Error:', err);
        return { error: 'Gagal memuat detail drama.' };
    }
};
