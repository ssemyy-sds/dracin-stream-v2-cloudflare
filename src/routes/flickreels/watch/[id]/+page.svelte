<script lang="ts">
    import { page } from "$app/stores";
    import { onMount } from "svelte";
    import {
        ChevronUp,
        ChevronDown,
        Heart,
        List,
        Info,
        Loader2,
        Play,
        X,
        ArrowLeft,
    } from "lucide-svelte";
    import { getFlickReelsDetail } from "$lib/services/api";
    import { favorites } from "$lib/stores/favorites";
    import { fixUrl } from "$lib/utils/helpers";
    import type { Drama, Episode, QualityOption } from "$lib/types";

    let id = $derived($page.params.id);
    let epParam = $derived($page.url.searchParams.get("ep"));
    let currentEpisode = $state(1);

    let drama = $state<Drama | null>(null);
    let episodes = $state<Episode[]>([]);
    let currentEpData = $derived(episodes[currentEpisode - 1]);

    let isLoading = $state(true);
    let isVideoLoading = $state(false);
    let error = $state<string | null>(null);
    let showEpisodeList = $state(false);

    // Video State
    let videoElement: HTMLVideoElement;
    let isPlaying = $state(false);
    let progress = $state(0);
    let currentTime = $state(0);
    let duration = $state(0);

    $effect(() => {
        if (epParam) {
            currentEpisode = parseInt(epParam) || 1;
        }
    });

    $effect(() => {
        if (id) {
            loadData();
        }
    });

    async function loadData() {
        isLoading = true;
        try {
            const data = await getFlickReelsDetail(id);
            drama = data.drama;
            episodes = data.episodes;
            isLoading = false;
        } catch (err) {
            error = "Gagal memuat data video";
            isLoading = false;
        }
    }

    function togglePlay() {
        if (videoElement.paused) videoElement.play();
        else videoElement.pause();
    }

    function handleTimeUpdate() {
        currentTime = videoElement.currentTime;
        duration = videoElement.duration || 0;
        progress = (currentTime / duration) * 100;
    }

    function nextEpisode() {
        if (currentEpisode < episodes.length) {
            currentEpisode++;
            updateUrl();
        }
    }

    function prevEpisode() {
        if (currentEpisode > 1) {
            currentEpisode--;
            updateUrl();
        }
    }

    function updateUrl() {
        const url = new URL(window.location.href);
        url.searchParams.set("ep", currentEpisode.toString());
        window.history.replaceState({}, "", url.toString());
    }

    function handleFavorite() {
        if (drama) favorites.toggle(drama);
    }

    let isFavorited = $derived(
        drama ? $favorites.some((f) => f.bookId === drama?.bookId) : false,
    );
</script>

<svelte:head>
    <title
        >{drama
            ? `${drama.bookName} - Ep ${currentEpisode}`
            : "Watching FlickReels"}</title
    >
</svelte:head>

<div class="fixed inset-0 bg-black flex flex-col md:flex-row">
    <!-- Back Button (Mobile) -->
    <a
        href="/flickreels/detail/{id}"
        class="absolute top-4 left-4 z-50 p-2 glass rounded-full md:hidden"
    >
        <ArrowLeft class="w-6 h-6" />
    </a>

    <!-- Player area -->
    <div
        class="relative flex-1 bg-black flex items-center justify-center overflow-hidden"
    >
        {#if isLoading}
            <Loader2 class="w-12 h-12 text-brand-orange animate-spin" />
        {:else if error}
            <div class="text-center p-6">
                <p class="text-red-400 mb-4">{error}</p>
                <a
                    href="/flickreels"
                    class="px-6 py-2 bg-brand-orange rounded-full">Kembali</a
                >
            </div>
        {:else if currentEpData}
            <!-- The vertical video player for Reels -->
            <video
                bind:this={videoElement}
                src={fixUrl(
                    currentEpData.videoUrl || currentEpData.videoPath || "",
                )}
                class="h-full w-full object-contain md:object-cover md:max-w-md mx-auto"
                autoplay
                playsinline
                onplay={() => (isPlaying = true)}
                onpause={() => (isPlaying = false)}
                ontimeupdate={handleTimeUpdate}
                onended={nextEpisode}
                onclick={togglePlay}
            ></video>

            <!-- Overlay Controls -->
            <div
                class="absolute inset-x-0 bottom-0 p-6 bg-gradient-to-t from-black/80 to-transparent flex flex-col gap-4"
            >
                <!-- Progress -->
                <div
                    class="w-full h-1 bg-white/20 rounded-full overflow-hidden"
                >
                    <div
                        class="h-full bg-brand-orange transition-all duration-300"
                        style="width: {progress}%"
                    ></div>
                </div>

                <div class="flex items-end justify-between">
                    <div class="flex-1">
                        <h2 class="font-bold text-lg">{drama?.bookName}</h2>
                        <p class="text-sm text-gray-300">
                            Episode {currentEpisode} - {currentEpData.chapterName}
                        </p>
                    </div>

                    <!-- Vertical Action Bar (Inside Player for Reel feel) -->
                    <div class="flex flex-col gap-6 items-center">
                        <button
                            onclick={handleFavorite}
                            class="flex flex-col items-center gap-1"
                        >
                            <div
                                class="p-3 glass rounded-full {isFavorited
                                    ? 'text-red-500'
                                    : ''}"
                            >
                                <Heart
                                    class="w-6 h-6 {isFavorited
                                        ? 'fill-current'
                                        : ''}"
                                />
                            </div>
                            <span class="text-[10px] uppercase font-bold"
                                >Save</span
                            >
                        </button>

                        <button
                            onclick={() => (showEpisodeList = true)}
                            class="flex flex-col items-center gap-1"
                        >
                            <div class="p-3 glass rounded-full">
                                <List class="w-6 h-6" />
                            </div>
                            <span class="text-[10px] uppercase font-bold"
                                >List</span
                            >
                        </button>
                    </div>
                </div>
            </div>

            <!-- Desktop Nav Buttons -->
            <div
                class="hidden md:flex absolute right-10 top-1/2 -translate-y-1/2 flex-col gap-4"
            >
                <button
                    onclick={prevEpisode}
                    disabled={currentEpisode === 1}
                    class="p-4 glass rounded-full disabled:opacity-30"
                >
                    <ChevronUp class="w-8 h-8" />
                </button>
                <button
                    onclick={nextEpisode}
                    disabled={currentEpisode === episodes.length}
                    class="p-4 glass rounded-full disabled:opacity-30"
                >
                    <ChevronDown class="w-8 h-8" />
                </button>
            </div>
        {/if}
    </div>

    <!-- Episode List Overlay -->
    {#if showEpisodeList}
        <div
            class="absolute inset-0 z-[60] bg-black/95 backdrop-blur-md flex flex-col"
        >
            <div
                class="p-4 flex items-center justify-between border-b border-white/10"
            >
                <h3 class="font-bold">Daftar Episode</h3>
                <button onclick={() => (showEpisodeList = false)} class="p-2"
                    ><X class="w-6 h-6" /></button
                >
            </div>
            <div
                class="flex-1 overflow-y-auto p-4 grid grid-cols-2 sm:grid-cols-4 gap-4"
            >
                {#each episodes as _, i}
                    <button
                        onclick={() => {
                            currentEpisode = i + 1;
                            updateUrl();
                            showEpisodeList = false;
                        }}
                        class="p-4 rounded-xl text-center font-bold transition-all {currentEpisode ===
                        i + 1
                            ? 'bg-brand-orange scale-95'
                            : 'glass hover:bg-white/10'}"
                    >
                        EP {i + 1}
                    </button>
                {/each}
            </div>
        </div>
    {/if}
</div>

<style>
    video::-webkit-media-controls {
        display: none !important;
    }
</style>
