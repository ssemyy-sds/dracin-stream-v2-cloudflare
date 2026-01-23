/**
 * Rate Limit Store
 * Svelte store for managing rate limit UI state
 */

import { writable, derived } from 'svelte/store';
import { getLocalizedMessage, type SupportedLocale } from '$lib/config/rateLimitConfig';

interface RateLimitState {
    isRateLimited: boolean;
    retryAfterMs: number | null;
    rateLimitedAt: number | null;
    message: string;
}

function createRateLimitStore() {
    const { subscribe, set, update } = writable<RateLimitState>({
        isRateLimited: false,
        retryAfterMs: null,
        rateLimitedAt: null,
        message: ''
    });

    let countdownInterval: ReturnType<typeof setInterval> | null = null;

    return {
        subscribe,

        setRateLimited(isLimited: boolean, retryAfterMs?: number) {
            if (countdownInterval) {
                clearInterval(countdownInterval);
                countdownInterval = null;
            }

            if (isLimited) {
                const message = getLocalizedMessage('rateLimited');

                set({
                    isRateLimited: true,
                    retryAfterMs: retryAfterMs || null,
                    rateLimitedAt: Date.now(),
                    message
                });

                // Auto-clear after retry period
                if (retryAfterMs && retryAfterMs > 0) {
                    setTimeout(() => {
                        update(state => ({
                            ...state,
                            isRateLimited: false,
                            retryAfterMs: null,
                            rateLimitedAt: null,
                            message: ''
                        }));
                    }, retryAfterMs);
                }
            } else {
                set({
                    isRateLimited: false,
                    retryAfterMs: null,
                    rateLimitedAt: null,
                    message: ''
                });
            }
        },

        setQueueFull() {
            const message = getLocalizedMessage('queueFull');

            set({
                isRateLimited: true,
                retryAfterMs: null,
                rateLimitedAt: Date.now(),
                message
            });

            // Auto-clear after 5 seconds
            setTimeout(() => {
                update(state => {
                    if (state.message === message) {
                        return {
                            ...state,
                            isRateLimited: false,
                            message: ''
                        };
                    }
                    return state;
                });
            }, 5000);
        },

        dismiss() {
            if (countdownInterval) {
                clearInterval(countdownInterval);
                countdownInterval = null;
            }

            set({
                isRateLimited: false,
                retryAfterMs: null,
                rateLimitedAt: null,
                message: ''
            });
        },

        reset() {
            this.dismiss();
        }
    };
}

export const rateLimitStore = createRateLimitStore();

/**
 * Derived store for countdown seconds
 */
export const countdownSeconds = derived(
    rateLimitStore,
    ($state, set) => {
        if (!$state.isRateLimited || !$state.retryAfterMs || !$state.rateLimitedAt) {
            set(null);
            return;
        }

        const updateCountdown = () => {
            const elapsed = Date.now() - $state.rateLimitedAt!;
            const remaining = Math.max(0, Math.ceil(($state.retryAfterMs! - elapsed) / 1000));

            if (remaining <= 0) {
                set(null);
            } else {
                set(remaining);
            }
        };

        updateCountdown();
        const interval = setInterval(updateCountdown, 1000);

        return () => clearInterval(interval);
    },
    null as number | null
);

/**
 * Derived store for formatted countdown message
 */
export const countdownMessage = derived(
    countdownSeconds,
    ($seconds) => {
        if ($seconds === null || $seconds <= 0) {
            return null;
        }
        return getLocalizedMessage('countdown', 'id', { seconds: $seconds });
    }
);
