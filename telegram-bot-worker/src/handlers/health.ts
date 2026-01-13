import { Env } from '../index';
import { API_CONFIGS } from '../config';
import { updateAPIStats } from '../services/kv';

export interface HealthCheckResult {
    apiId: string;
    healthy: boolean;
    status: string;
    responseTime: number;
    timestamp: string;
}

export async function checkAPIHealth(apiId: string, env: Env): Promise<HealthCheckResult> {
    const apiConfig = API_CONFIGS.find(api => api.id === apiId);
    if (!apiConfig) {
        return {
            apiId,
            healthy: false,
            status: 'API not found',
            responseTime: 0,
            timestamp: new Date().toISOString()
        };
    }

    const startTime = Date.now();
    // Construct health URL correctly (some might use ?action param)
    let healthUrl: string;
    if (apiConfig.healthCheck.endpoint.startsWith('http')) {
        healthUrl = apiConfig.healthCheck.endpoint;
    } else {
        healthUrl = `${apiConfig.baseUrl}${apiConfig.healthCheck.endpoint}`;
    }

    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), apiConfig.healthCheck.timeout);

        const response = await fetch(healthUrl, {
            method: 'GET',
            headers: apiConfig.headers || {},
            signal: controller.signal
        });

        clearTimeout(timeoutId);
        const responseTime = Date.now() - startTime;

        const healthy = response.status === apiConfig.healthCheck.expectedStatus;

        // Update stats in KV
        await updateAPIStats(env, apiId, healthy, responseTime);

        return {
            apiId,
            healthy,
            status: `HTTP ${response.status}`,
            responseTime,
            timestamp: new Date().toISOString()
        };
    } catch (error: any) {
        const responseTime = Date.now() - startTime;
        await updateAPIStats(env, apiId, false, responseTime);

        return {
            apiId,
            healthy: false,
            status: error.name === 'AbortError' ? 'Timeout' : 'Connection failed',
            responseTime,
            timestamp: new Date().toISOString()
        };
    }
}

export async function checkAllAPIs(env: Env): Promise<HealthCheckResult[]> {
    const checks = API_CONFIGS.map(api => checkAPIHealth(api.id, env));
    return await Promise.all(checks);
}
