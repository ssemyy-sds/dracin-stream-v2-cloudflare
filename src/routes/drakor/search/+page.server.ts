import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ url, fetch, platform }) => {
    const query = url.searchParams.get('q');
    const api = platform?.env?.API_BASE_URL;

    if (!api) return { error: 'Configuration Error' };
    if (!query) return { results: [] };

    try {
        const res = await fetch(`${api}/api/drakor/search?q=${encodeURIComponent(query)}`, {
            headers: { 'Accept': 'application/json' }
        });

        if (!res.ok) throw new Error('Failed to search');

        const json = await res.json();
        return {
            results: json.data || [],
            query
        };
    } catch (err) {
        console.error('Drakor Search API Error:', err);
        return { error: 'Gagal mencari drama.', query };
    }
};
