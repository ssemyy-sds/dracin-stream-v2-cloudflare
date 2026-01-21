import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params, fetch, platform }) => {
    const { slug, episode } = params;
    const api = platform?.env?.API_BASE_URL;

    if (!api) {
        return { error: 'Configuration Error' };
    }

    try {
        const res = await fetch(`${api}/api/drakor/play/${slug}/${episode}`, {
            headers: { 'Accept': 'application/json' }
        });

        if (!res.ok) throw new Error('Failed to load video streams');

        const json = await res.json();
        return {
            streamData: json.data,
            slug,
            episode
        };
    } catch (err) {
        console.error('Drakor Play API Error:', err);
        return { error: 'Gagal memuat video.' };
    }
};
