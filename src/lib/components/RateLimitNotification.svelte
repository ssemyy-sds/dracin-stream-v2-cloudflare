<script lang="ts">
    import {
        rateLimitStore,
        countdownSeconds,
        countdownMessage,
    } from "$lib/stores/rateLimitStore";
    import { fade, fly } from "svelte/transition";
    import { onDestroy } from "svelte";

    // Auto-dismiss after some time if no countdown
    let autoDismissTimeout: ReturnType<typeof setTimeout> | null = null;

    $: if ($rateLimitStore.isRateLimited && !$rateLimitStore.retryAfterMs) {
        // Auto dismiss after 8 seconds if no specific retry time
        if (autoDismissTimeout) clearTimeout(autoDismissTimeout);
        autoDismissTimeout = setTimeout(() => {
            rateLimitStore.dismiss();
        }, 8000);
    }

    onDestroy(() => {
        if (autoDismissTimeout) {
            clearTimeout(autoDismissTimeout);
        }
    });

    function handleDismiss() {
        rateLimitStore.dismiss();
    }
</script>

{#if $rateLimitStore.isRateLimited}
    <div
        class="rate-limit-notification"
        in:fly={{ y: -50, duration: 300 }}
        out:fade={{ duration: 200 }}
        role="alert"
        aria-live="polite"
    >
        <div class="notification-content">
            <div class="notification-icon">
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                >
                    <circle cx="12" cy="12" r="10"></circle>
                    <polyline points="12 6 12 12 16 14"></polyline>
                </svg>
            </div>
            <div class="notification-text">
                <p class="notification-message">{$rateLimitStore.message}</p>
                {#if $countdownMessage}
                    <p class="notification-countdown">{$countdownMessage}</p>
                {/if}
            </div>
            <button
                class="notification-close"
                on:click={handleDismiss}
                aria-label="Tutup notifikasi"
            >
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                >
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
            </button>
        </div>

        {#if $countdownSeconds !== null && $rateLimitStore.retryAfterMs}
            <div class="countdown-bar">
                <div
                    class="countdown-progress"
                    style="width: {Math.max(
                        0,
                        ($countdownSeconds /
                            ($rateLimitStore.retryAfterMs / 1000)) *
                            100,
                    )}%"
                ></div>
            </div>
        {/if}
    </div>
{/if}

<style>
    .rate-limit-notification {
        position: fixed;
        top: 16px;
        left: 50%;
        transform: translateX(-50%);
        z-index: 9999;
        max-width: 90vw;
        width: 420px;
        background: linear-gradient(
            135deg,
            rgba(239, 68, 68, 0.95) 0%,
            rgba(185, 28, 28, 0.95) 100%
        );
        backdrop-filter: blur(10px);
        border-radius: 12px;
        box-shadow:
            0 10px 40px rgba(239, 68, 68, 0.3),
            0 4px 12px rgba(0, 0, 0, 0.15);
        overflow: hidden;
    }

    .notification-content {
        display: flex;
        align-items: flex-start;
        gap: 12px;
        padding: 16px;
        color: white;
    }

    .notification-icon {
        flex-shrink: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        width: 36px;
        height: 36px;
        background: rgba(255, 255, 255, 0.2);
        border-radius: 50%;
    }

    .notification-text {
        flex: 1;
        min-width: 0;
    }

    .notification-message {
        margin: 0;
        font-size: 14px;
        font-weight: 500;
        line-height: 1.4;
    }

    .notification-countdown {
        margin: 4px 0 0 0;
        font-size: 12px;
        opacity: 0.9;
    }

    .notification-close {
        flex-shrink: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        width: 28px;
        height: 28px;
        background: rgba(255, 255, 255, 0.1);
        border: none;
        border-radius: 6px;
        color: white;
        cursor: pointer;
        transition: background 0.2s ease;
    }

    .notification-close:hover {
        background: rgba(255, 255, 255, 0.2);
    }

    .countdown-bar {
        height: 4px;
        background: rgba(0, 0, 0, 0.2);
    }

    .countdown-progress {
        height: 100%;
        background: rgba(255, 255, 255, 0.6);
        transition: width 1s linear;
    }

    /* Dark mode adjustments */
    @media (prefers-color-scheme: dark) {
        .rate-limit-notification {
            background: linear-gradient(
                135deg,
                rgba(185, 28, 28, 0.95) 0%,
                rgba(127, 29, 29, 0.95) 100%
            );
        }
    }

    /* Mobile responsiveness */
    @media (max-width: 480px) {
        .rate-limit-notification {
            top: 8px;
            width: calc(100vw - 16px);
            border-radius: 10px;
        }

        .notification-content {
            padding: 12px;
            gap: 10px;
        }

        .notification-icon {
            width: 32px;
            height: 32px;
        }

        .notification-message {
            font-size: 13px;
        }
    }
</style>
