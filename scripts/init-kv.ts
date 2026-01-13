// Script to initialize KV with default API configuration
import { API_CONFIGS, DEFAULT_API_ID } from '../src/lib/config/apis.config';

interface KVConfig {
    activeApiId: string;
    lastSwitchTime: string;
    switchHistory: Array<{
        from: string;
        to: string;
        timestamp: string;
        reason: string;
        triggeredBy: 'user' | 'admin' | 'auto';
    }>;
    apiStats: Record<string, {
        successCount: number;
        errorCount: number;
        lastHealthCheck: string;
        lastHealthStatus: 'healthy' | 'unhealthy' | 'unknown';
        avgResponseTime: number;
    }>;
}

const defaultConfig: KVConfig = {
    activeApiId: DEFAULT_API_ID,
    lastSwitchTime: new Date().toISOString(),
    switchHistory: [],
    apiStats: {}
};

// Initialize stats for each API
API_CONFIGS.forEach(api => {
    defaultConfig.apiStats[api.id] = {
        successCount: 0,
        errorCount: 0,
        lastHealthCheck: new Date().toISOString(),
        lastHealthStatus: 'unknown',
        avgResponseTime: 0
    };
});

async function initializeKV() {
    const accountId = process.env.CF_ACCOUNT_ID;
    const kvNamespaceId = process.env.KV_NAMESPACE_ID;
    const apiToken = process.env.CF_API_TOKEN;

    if (!accountId || !kvNamespaceId || !apiToken) {
        console.error('❌ Missing environment variables: CF_ACCOUNT_ID, KV_NAMESPACE_ID, CF_API_TOKEN');
        process.exit(1);
    }

    console.log(`Using Account ID: ${accountId}`);
    console.log(`Using KV Namespace ID: ${kvNamespaceId}`);

    try {
        const url = `https://api.cloudflare.com/client/v4/accounts/${accountId}/storage/kv/namespaces/${kvNamespaceId}/values/config`;
        console.log(`PUT ${url}`);

        const response = await fetch(url, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${apiToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(defaultConfig)
        });

        if (response.ok) {
            const data = await response.json();
            console.log('✅ KV initialized successfully:', data);
        } else {
            const errorText = await response.text();
            console.error('❌ Failed to initialize KV:', response.status, errorText);
        }
    } catch (error) {
        console.error('❌ Error initializing KV:', error);
    }
}

initializeKV();
