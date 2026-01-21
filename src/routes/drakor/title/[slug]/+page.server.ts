import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params, fetch, platform }) => {
    const { slug } = params;
    const api = platform?.env?.API_BASE_URL;

    if (!api) {
        return { error: 'Configuration Error: API_BASE_URL missing' };
    }

    try {
        const res = await fetch(`${api}/api/drakor/detail/${slug}`, {
            headers: { 'Accept': 'application/json' }
        });

        if (!res.ok) throw new Error('Failed to load drama details');

        const json = await res.json();
        return {
            drama: json.data,
            slug
        };
    } catch (err) {
        console.error('Drakor Detail API Error:', err);
        return { error: 'Gagal memuat detail drama.' };
    }
};
