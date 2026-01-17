<script lang="ts">
    import { onMount } from "svelte";
    import { Star, Play, TrendingUp, Clock } from "lucide-svelte";
    import DramaCard from "$lib/components/DramaCard.svelte";
    import { getFlickReelsHome } from "$lib/services/api";
    import { fixUrl } from "$lib/utils/helpers";
    import type { Drama } from "$lib/types";

    let isLoading = $state(true);
    let error = $state<string | null>(null);

    // Content sections
    let forYouReels = $state<Drama[]>([]);
    let latestReels = $state<Drama[]>([]);
    let hotReels = $state<Drama[]>([]);

    onMount(async () => {
        try {
            const [foryou, latest, hot] = await Promise.all([
                getFlickReelsHome("home", 1),
                getFlickReelsHome("latest", 1),
                getFlickReelsHome("trending", 1),
            ]);

            forYouReels = foryou;
            latestReels = latest;
            hotReels = hot;

            isLoading = false;
        } catch (err) {
            console.error("Failed to load FlickReels:", err);
            error = "Gagal memuat FlickReels. Silakan coba lagi.";
            isLoading = false;
        }
    });

    function handleReelClick(item: Drama) {
        // We'll use our new detail page
    }
</script>

<svelte:head>
    <title>FlickReels - Drama Pendek Seru</title>
    <meta
        name="description"
        content="Tonton drama pendek terbaik di FlickReels"
    />
</svelte:head>

<div class="space-y-8 md:space-y-12 pt-4">
    <div class="max-w-7xl mx-auto px-4 sm:px-6">
        <div class="flex items-center gap-3 mb-2">
            <Play class="w-8 h-8 text-brand-orange fill-brand-orange" />
            <h1 class="text-3xl font-bold tracking-tight">FlickReels</h1>
        </div>
        <p class="text-gray-400">
            Nikmati drama pendek berkualitas setiap hari
        </p>
    </div>

    {#if isLoading}
        <div class="max-w-7xl mx-auto px-4 sm:px-6 space-y-12">
            {#each Array(3) as _}
                <section>
                    <div class="h-8 w-48 shimmer rounded mb-6"></div>
                    <div
                        class="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-4"
                    >
                        {#each Array(6) as _}
                            <div class="aspect-[2/3] shimmer rounded-xl"></div>
                        {/each}
                    </div>
                </section>
            {/each}
        </div>
    {:else if error}
        <div class="max-w-7xl mx-auto px-4 sm:px-6 py-20 text-center">
            <p class="text-xl text-red-400 mb-4">{error}</p>
            <button
                onclick={() => location.reload()}
                class="px-6 py-3 bg-brand-orange rounded-full font-semibold"
            >
                Coba Lagi
            </button>
        </div>
    {:else}
        <!-- For You Section -->
        <section class="max-w-7xl mx-auto px-4 sm:px-6">
            <div class="flex items-center gap-2 mb-6">
                <Star class="w-6 h-6 text-yellow-500 fill-yellow-500" />
                <h2 class="text-xl md:text-2xl font-bold">Untuk Kamu</h2>
            </div>
            <div
                class="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-3 md:gap-4"
            >
                {#each forYouReels as reel}
                    <DramaCard
                        drama={{ ...reel, bookId: `fr-${reel.bookId}` }}
                        compact
                    />
                {/each}
            </div>
        </section>

        <!-- Hot Rank Section -->
        <section class="max-w-7xl mx-auto px-4 sm:px-6">
            <div class="flex items-center gap-2 mb-6">
                <TrendingUp class="w-6 h-6 text-red-500" />
                <h2 class="text-xl md:text-2xl font-bold">Populer</h2>
            </div>
            <div
                class="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-3 md:gap-4"
            >
                {#each hotReels as reel}
                    <DramaCard
                        drama={{ ...reel, bookId: `fr-${reel.bookId}` }}
                        compact
                    />
                {/each}
            </div>
        </section>

        <!-- Latest Section -->
        <section class="max-w-7xl mx-auto px-4 sm:px-6 pb-12">
            <div class="flex items-center gap-2 mb-6">
                <Clock class="w-6 h-6 text-blue-500" />
                <h2 class="text-xl md:text-2xl font-bold">Terbaru</h2>
            </div>
            <div
                class="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-3 md:gap-4"
            >
                {#each latestReels as reel}
                    <DramaCard
                        drama={{ ...reel, bookId: `fr-${reel.bookId}` }}
                        compact
                    />
                {/each}
            </div>
        </section>
    {/if}
</div>

<style>
    :global(.glass) {
        background: rgba(255, 255, 255, 0.05);
        backdrop-filter: blur(12px);
        border: 1px solid rgba(255, 255, 255, 0.1);
    }
</style>
