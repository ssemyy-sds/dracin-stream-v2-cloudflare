/**
 * API Adapters Module
 * Export all adapters and factory functions
 */

// Interfaces
export type { APIAdapter, PaginatedResponse, PaginationInfo } from './adapter.interface';
export { BaseAdapter } from './adapter.interface';

// Factory
export { createAdapter, getDefaultAdapter, getAllAdapters, clearAdapterCache } from './adapter.factory';

// Individual Adapters
export { SansekaiAdapter } from './sansekai.adapter';
export { GimitaAdapter } from './gimita.adapter';
export { DramabosAdapter } from './dramabos.adapter';
export { PaxsenixAdapter } from './paxsenix.adapter';
