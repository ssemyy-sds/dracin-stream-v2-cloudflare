<script lang="ts">
    import { onMount } from "svelte";
    import { getClientMode, setClientMode } from "$lib/modePreference";
    import { goto, preloadData } from "$app/navigation";
    import { page } from "$app/stores";
    import { get } from "svelte/store";

    export let enabled = true;
    let open = false;

    onMount(() => {
        if (!enabled) return;
        const pref = getClientMode();
        // Show only on root path if no preference is set
        // Using get(page) to ensure we check current route
        if (!pref && get(page).url.pathname === "/") {
            open = true;
            // Warm up drakor route for faster first switch if they choose it
            preloadData("/drakor").catch(() => {});
        }
    });

    function select(mode: "dracin" | "drakor") {
        setClientMode(mode);
        open = false;
        if (mode === "drakor") {
            goto("/drakor");
        }
    }

    function onKeydown(e: KeyboardEvent) {
        if (e.key === "Escape") open = false;
    }
</script>

{#if open}
    <div
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
        role="dialog"
        aria-modal="true"
        aria-labelledby="mode-title"
        on:keydown={onKeydown}
    >
        <div
            class="w-full max-w-lg rounded-2xl bg-brand-gray border border-white/10 p-6 shadow-2xl outline-none"
            tabindex="-1"
        >
            <h2
                id="mode-title"
                class="mb-6 text-2xl font-bold text-center text-white"
            >
                Pilih Mode Konten
            </h2>

            <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <!-- Dracin Option -->
                <button
                    class="group relative flex flex-col items-center justify-center p-6 rounded-xl border border-white/10 bg-black/20 hover:bg-white/5 hover:border-brand-orange/50 focus:outline-none focus:ring-2 focus:ring-brand-orange transition-all duration-300"
                    on:click={() => select("dracin")}
                >
                    <div
                        class="mb-3 p-3 rounded-full bg-brand-orange/10 group-hover:bg-brand-orange/20 transition-colors"
                    >
                        <span class="text-3xl">🇨🇳</span>
                    </div>
                    <div class="text-lg font-bold text-white mb-1">Dracin</div>
                    <div class="text-sm text-gray-400 text-center">
                        Drama China Viral
                    </div>
                </button>

                <!-- Drakor Option -->
                <button
                    class="group relative flex flex-col items-center justify-center p-6 rounded-xl border border-white/10 bg-black/20 hover:bg-white/5 hover:border-blue-500/50 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300"
                    on:click={() => select("drakor")}
                >
                    <div
                        class="mb-3 p-3 rounded-full bg-blue-500/10 group-hover:bg-blue-500/20 transition-colors"
                    >
                        <span class="text-3xl">🇰🇷</span>
                    </div>
                    <div class="text-lg font-bold text-white mb-1">Drakor</div>
                    <div class="text-sm text-gray-400 text-center">
                        Drama Korea Terbaru
                    </div>
                </button>
            </div>

            <button
                class="mt-6 w-full py-2 text-sm text-gray-500 hover:text-white transition-colors"
                on:click={() => (open = false)}
            >
                Tutup
            </button>
        </div>
    </div>
{/if}
