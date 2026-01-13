import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { API_CONFIGS, DEFAULT_API_ID } from '$lib/config/apis.config';

export const GET: RequestHandler = async ({ platform }) => {
    try {
        let activeApiId = DEFAULT_API_ID;
        let kvStatus = 'Not Connected';
        let kvError = null;

        if (platform?.env?.API_CONFIG) {
            try {
                const config: any = await platform.env.API_CONFIG.get('config', 'json');
                if (config && config.activeApiId) {
                    activeApiId = config.activeApiId;
                }
                kvStatus = 'Connected';
            } catch (e: any) {
                kvStatus = 'Error';
                kvError = e.message;
            }
        } else {
            kvStatus = 'Missing Platform Env';
        }

        const activeConfig = API_CONFIGS.find(api => api.id === activeApiId);

        return json({
            success: true,
            timestamp: new Date().toISOString(),
            kvStatus,
            kvError,
            activeApi: {
                id: activeApiId,
                name: activeConfig?.name || 'Unknown',
                baseUrl: activeConfig?.baseUrl || 'Unknown',
                queryFormat: activeConfig?.queryFormat
            },
            availableApis: API_CONFIGS.map(a => a.id)
        });
    } catch (error: any) {
        return json({
            success: false,
            error: error.message,
            timestamp: new Date().toISOString()
        }, { status: 500 });
    }
};
