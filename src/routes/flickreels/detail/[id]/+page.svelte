<script lang="ts">
    import { page } from "$app/stores";
    import { onMount } from "svelte";
    import { Star, Heart, Play, Clock, Calendar, Loader2 } from "lucide-svelte";
    import { getFlickReelsDetail } from "$lib/services/api";
    import { favorites } from "$lib/stores/favorites";
    import { selectedDrama } from "$lib/stores/drama";
    import { fixUrl } from "$lib/utils/helpers";
    import type { Drama, Episode } from "$lib/types";

    let id = $derived($page.params.id);

    let drama = $state<Drama | null>(null);
    let episodes = $state<Episode[]>([]);
    let isLoading = $state(true);
    let error = $state<string | null>(null);

    let isFavorited = $derived(
        drama ? $favorites.some((f) => f.bookId === drama?.bookId) : false,
    );

    $effect(() => {
        if (id) {
            loadData();
        }
    });

    async function loadData() {
        isLoading = true;
        error = null;

        try {
            const data = await getFlickReelsDetail(id);
            drama = data.drama;
            episodes = data.episodes;

            if (drama) {
                selectedDrama.setSelected(drama);
            }
        } catch (err) {
            console.error("Failed to load FlickReels detail:", err);
            error = "Gagal memuat detail FlickReels";
        } finally {
            isLoading = false;
        }
    }

    function handleFavorite() {
        if (drama) {
            favorites.toggle(drama);
        }
    }
</script>

<svelte:head>
    <title>{drama?.bookName || "Loading..."} - FlickReels Detail</title>
</svelte:head>

<div class="min-h-screen">
    {#if isLoading}
        <div class="flex items-center justify-center min-h-[60vh]">
            <Loader2 class="w-10 h-10 text-brand-orange animate-spin" />
        </div>
    {:else if error || !drama}
        <div
            class="flex flex-col items-center justify-center min-h-[60vh] text-center px-4"
        >
            <h2 class="text-2xl font-bold mb-2">Error</h2>
            <p class="text-gray-400 mb-6">
                {error || "Konten tidak ditemukan"}
            </p>
            <a
                href="/flickreels"
                class="px-6 py-3 bg-brand-orange rounded-full font-semibold"
            >
                Kembali ke FlickReels
            </a>
        </div>
    {:else}
        <!-- Hero Section -->
        <section class="relative min-h-[50vh] -mt-16 pt-16">
            <div class="absolute inset-0">
                <img
                    src={fixUrl(drama.cover)}
                    alt={drama.bookName}
                    class="w-full h-full object-cover blur-md scale-110 opacity-30"
                />
                <div
                    class="absolute inset-0 bg-gradient-to-t from-brand-black via-brand-black/80 to-transparent"
                ></div>
            </div>

            <div class="relative max-w-7xl mx-auto px-4 sm:px-6 py-8 md:py-16">
                <div class="flex flex-col md:flex-row gap-6 md:gap-10">
                    <div class="shrink-0 mx-auto md:mx-0">
                        <img
                            src={fixUrl(drama.cover)}
                            alt={drama.bookName}
                            class="w-48 md:w-64 rounded-xl shadow-2xl"
                        />
                    </div>

                    <div class="flex-1 text-center md:text-left">
                        <h1 class="text-3xl md:text-4xl font-bold mb-4">
                            {drama.bookName}
                        </h1>

                        <div
                            class="flex flex-wrap items-center justify-center md:justify-start gap-4 mb-6 text-sm text-gray-300"
                        >
                            {#if drama.rating}
                                <span class="flex items-center gap-1">
                                    <Star
                                        class="w-4 h-4 text-yellow-500 fill-yellow-500"
                                    />
                                    {drama.rating.toFixed(1)}
                                </span>
                            {/if}
                            {#if drama.year}
                                <span class="flex items-center gap-1">
                                    <Calendar class="w-4 h-4" />
                                    {drama.year}
                                </span>
                            {/if}
                            <span class="flex items-center gap-1">
                                <Clock class="w-4 h-4" />
                                {episodes.length} Episode
                            </span>
                        </div>

                        <p
                            class="text-gray-300 leading-relaxed mb-8 max-w-2xl mx-auto md:mx-0"
                        >
                            {drama.introduction ||
                                "Tidak ada deskripsi tersedia."}
                        </p>

                        <div
                            class="flex flex-wrap items-center justify-center md:justify-start gap-3"
                        >
                            <a
                                href="/flickreels/watch/{id}?ep=1"
                                class="inline-flex items-center gap-2 px-8 py-3 bg-brand-orange hover:bg-orange-600 rounded-full font-semibold transition-colors shadow-lg shadow-brand-orange/30"
                            >
                                <Play class="w-5 h-5 fill-white" />
                                Tonton Sekarang
                            </a>
                            <button
                                onclick={handleFavorite}
                                class="inline-flex items-center gap-2 px-6 py-3 glass hover:bg-white/20 rounded-full font-semibold transition-colors {isFavorited
                                    ? 'text-red-500'
                                    : ''}"
                            >
                                <Heart
                                    class="w-5 h-5 {isFavorited
                                        ? 'fill-current'
                                        : ''}"
                                />
                                {isFavorited ? "Saved" : "Simpan"}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        <!-- Episodes Section -->
        <section class="max-w-7xl mx-auto px-4 sm:px-6 py-8">
            <h2 class="text-xl md:text-2xl font-bold mb-6">Daftar Episode</h2>

            {#if episodes.length > 0}
                <div
                    class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4"
                >
                    {#each episodes as episode, index}
                        {@const epNum = index + 1}
                        <a
                            href="/flickreels/watch/{id}?ep={epNum}"
                            class="group relative aspect-video glass rounded-xl overflow-hidden hover:ring-2 hover:ring-brand-orange transition-all"
                        >
                            {#if episode.cover}
                                <img
                                    src={fixUrl(episode.cover)}
                                    alt={episode.chapterName}
                                    class="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity"
                                />
                            {/if}
                            <div
                                class="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex items-end p-3"
                            >
                                <span class="text-sm font-medium"
                                    >Episode {epNum}</span
                                >
                            </div>
                        </a>
                    {/each}
                </div>
            {:else}
                <div class="text-center py-12 text-gray-400">
                    <p>Memuat episode...</p>
                </div>
            {/if}
        </section>
    {/if}
</div>
