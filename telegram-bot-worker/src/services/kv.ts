import { Env } from '../index';

export async function getConfig(env: Env): Promise<any> {
    const config = await env.API_CONFIG.get('config', 'json');
    return config || {
        activeApiId: 'api_secondary',
        lastSwitchTime: new Date().toISOString(),
        switchHistory: [],
        apiStats: {}
    };
}

export async function updateConfig(env: Env, config: any): Promise<void> {
    await env.API_CONFIG.put('config', JSON.stringify(config));
}

export async function addSwitchHistory(env: Env, entry: any): Promise<void> {
    const config = await getConfig(env);
    config.switchHistory = config.switchHistory || [];
    config.switchHistory.push(entry);

    // Keep only last 50 entries
    if (config.switchHistory.length > 50) {
        config.switchHistory = config.switchHistory.slice(-50);
    }

    await updateConfig(env, config);
}

export async function updateAPIStats(env: Env, apiId: string, success: boolean, responseTime: number): Promise<void> {
    const config = await getConfig(env);

    if (!config.apiStats) config.apiStats = {};
    if (!config.apiStats[apiId]) {
        config.apiStats[apiId] = {
            successCount: 0,
            errorCount: 0,
            lastHealthCheck: new Date().toISOString(),
            lastHealthStatus: 'unknown',
            avgResponseTime: 0
        };
    }

    const stats = config.apiStats[apiId];
    if (success) {
        stats.successCount++;
        stats.lastHealthStatus = 'healthy';
    } else {
        stats.errorCount++;
        stats.lastHealthStatus = 'unhealthy';
    }

    stats.lastHealthCheck = new Date().toISOString();

    // Exponential moving average for response time
    if (stats.avgResponseTime === 0) {
        stats.avgResponseTime = responseTime;
    } else {
        stats.avgResponseTime = Math.round((stats.avgResponseTime * 0.7) + (responseTime * 0.3));
    }

    await updateConfig(env, config);
}
