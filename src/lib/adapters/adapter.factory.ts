/**
 * API Adapter Factory
 * Creates the appropriate adapter based on provider ID
 */

import type { APIAdapter } from './adapter.interface';
import { SansekaiAdapter } from './sansekai.adapter';
import { GimitaAdapter } from './gimita.adapter';
import { DramabosAdapter } from './dramabos.adapter';
import { PaxsenixAdapter } from './paxsenix.adapter';
import { API_CONFIGS, DEFAULT_API_ID } from '$lib/config/apis.config';

// Adapter instances cache
const adapterCache = new Map<string, APIAdapter>();

/**
 * Create or get cached adapter instance by provider ID
 */
export function createAdapter(providerId: string): APIAdapter {
    // Check cache first
    if (adapterCache.has(providerId)) {
        return adapterCache.get(providerId)!;
    }

    // Find config
    const config = API_CONFIGS.find(c => c.id === providerId);
    if (!config) {
        console.warn(`Unknown provider: ${providerId}, falling back to default`);
        return createAdapter(DEFAULT_API_ID);
    }

    let adapter: APIAdapter;

    switch (providerId) {
        case 'api_primary':
            adapter = new SansekaiAdapter(config.baseUrl, config.headers);
            break;
        case 'api_secondary':
            adapter = new GimitaAdapter(config.baseUrl, config.headers);
            break;
        case 'api_backup1':
            adapter = new DramabosAdapter(config.baseUrl, config.headers);
            break;
        case 'api_backup2':
            adapter = new PaxsenixAdapter(config.baseUrl, config.headers);
            break;
        default:
            throw new Error(`No adapter for provider: ${providerId}`);
    }

    // Cache it
    adapterCache.set(providerId, adapter);
    return adapter;
}

/**
 * Get the default adapter
 */
export function getDefaultAdapter(): APIAdapter {
    return createAdapter(DEFAULT_API_ID);
}

/**
 * Get all available adapters
 */
export function getAllAdapters(): APIAdapter[] {
    return API_CONFIGS.map(config => createAdapter(config.id));
}

/**
 * Clear adapter cache (useful for testing or config changes)
 */
export function clearAdapterCache(): void {
    adapterCache.clear();
}
