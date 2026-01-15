<script lang="ts">
    import { page } from "$app/stores";
    import { goto } from "$app/navigation";
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
    } from "lucide-svelte";
    import {
        getDramaDetail,
        getAllEpisodes,
        getStreamUrl,
    } from "$lib/services/api";
    import { favorites } from "$lib/stores/favorites";
    import { cachedEpisodes } from "$lib/stores/episodeStore";
    import { selectedDrama } from "$lib/stores/drama";
    import { fixUrl } from "$lib/utils/helpers";
    import type { Drama, Episode, QualityOption } from "$lib/types";

    let bookId = $derived($page.params.id as string);
    let episodeParam = $derived($page.url.searchParams.get("ep"));
    let currentEpisode = $state(1);

    // Initialize from store ONLY if it matches the current bookId
    let drama = $state<Drama | null>(
        $selectedDrama?.bookId === bookId || $selectedDrama?.id === bookId
            ? $selectedDrama
            : null,
    );
    let episodes = $state<Episode[]>([]);
    let videoSrc = $state("");
    let qualityOptions = $state<QualityOption[]>([]);
    let isLoading = $state(true);
    let isVideoLoading = $state(false);
    let showEpisodeList = $state(false);
    let showInfo = $state(false);
    let showQualityMenu = $state(false);
    let currentQuality = $state(540);
    let error = $state<string | null>(null);
    let loadingPromise: Promise<Episode[]> | null = null;

    // Auto-play next episode setting
    let autoPlayNext = $state(true);
    let showNextEpisodePrompt = $state(false);
    let nextEpisodeCountdown = $state(5);

    // Video player state
    let videoElement: HTMLVideoElement;
    let isPlaying = $state(false);
    let progress = $state(0);
    let currentTime = $state(0);
    let duration = $state(0);

    // Controls visibility - show on tap, hide during playback
    let showControls = $state(true);
    let controlsTimeout: ReturnType<typeof setTimeout>;

    // Right panel visibility - auto-hide after 5 seconds
    let showPanel = $state(true);
    let panelTimeout: ReturnType<typeof setTimeout>;

    // Track if we need to load video once element is ready
    let pendingVideoSrc = $state<string | null>(null);

    let isFavorited = $derived(
        drama ? $favorites.some((f) => f.bookId === drama!.bookId) : false,
    );

    $effect(() => {
        if (episodeParam) {
            currentEpisode = parseInt(episodeParam) || 1;
        }
    });

    $effect(() => {
        if (bookId) {
            loadDramaData();
        }
    });

    // Watch for videoElement to be bound and load pending video
    $effect(() => {
        if (videoElement && pendingVideoSrc) {
            const srcToLoad = pendingVideoSrc;
            pendingVideoSrc = null;
            videoElement.src = srcToLoad;
            videoElement.load();
            videoElement.oncanplay = () => {
                videoElement.play().catch(() => {
                    console.log("Autoplay blocked");
                });
            };
        }
    });

    function mergeDramaData(newData: Drama) {
        if (
            drama &&
            (newData.bookName.startsWith("Drama ") || !newData.cover)
        ) {
            // Keep the better metadata we already have
            drama = {
                ...newData,
                bookName: drama.bookName,
                cover: drama.cover || newData.cover,
                introduction: drama.introduction || newData.introduction,
                rating: drama.rating || newData.rating,
            };
        } else {
            drama = newData;
        }
    }

    async function loadDramaData() {
        isLoading = true;
        error = null;

        try {
            // Check cache for episodes
            const cached = cachedEpisodes.get(bookId);

            // If cache exists, use it immediately
            let episodesData: Episode[] = [];

            if (cached) {
                // If we have cached episodes, we can skip fetching them
                episodes = cached.episodes;

                // Fetch only drama details
                const dramaData = await getDramaDetail(bookId);
                mergeDramaData(dramaData);
                episodes = episodesData;
            } else {
                // No cache, fetch drama detail first for fast UI
                const dramaData = await getDramaDetail(bookId);
                mergeDramaData(dramaData);

                // If we have chapter count, we can generate placeholders
                // This makes the UI feel instant while the heavy download happens
                if (drama && drama.chapterCount && episodes.length === 0) {
                    episodes = Array(drama.chapterCount)
                        .fill(0)
                        .map((_, i) => ({
                            bookId,
                            chapterId: `virtual-${i + 1}`,
                            chapterName: `Episode ${i + 1}`,
                            videoUrl: "",
                            qualityOptions: [],
                            chapterIndex: i + 1,
                        }));
                }

                // Unblock UI immediately
                isLoading = false;

                // Then fetch the episode list (NOW LIGHTWEIGHT!)
                // This should be fast (< 1s)
                try {
                    loadingPromise = getAllEpisodes(bookId);
                    const fetchedEpisodes = await loadingPromise;

                    // Update episodes with real data (IDs, names)
                    // We merge with placeholders if needed, but usually just replace
                    if (fetchedEpisodes.length > 0) {
                        episodes = fetchedEpisodes;
                        cachedEpisodes.set(bookId, fetchedEpisodes);
                    }

                    // Now that we have real chapterIds, we can load the video
                    await loadEpisode(currentEpisode);
                } catch (e) {
                    console.error("Episode fetch failed:", e);
                    error = "Failed to load episodes";
                }
            }

            if (episodeParam) {
                currentEpisode = parseInt(episodeParam) || 1;
            }

            // Load the video immediately if we already had cached episodes
            // If not, the 'await loadingPromise' block above handles it
            if (cached && episodes.length > 0) {
                await loadEpisode(currentEpisode);
            }
        } catch (err) {
            console.error("Failed to load drama:", err);
            error = "Failed to load drama";
        } finally {
            isLoading = false;
        }
    }

    async function loadEpisode(epNum: number) {
        isVideoLoading = true;

        try {
            const epIndex = Math.max(0, epNum - 1);
            const currentEpData = episodes[epIndex];

            let options: QualityOption[] = [];

            // 1. Check if we already have quality options in memory (e.g. from previous view)
            if (
                currentEpData &&
                currentEpData.qualityOptions &&
                currentEpData.qualityOptions.length > 0
            ) {
                options = currentEpData.qualityOptions;
            }
            // 2. Check if we have a direct videoUrl
            else if (currentEpData && currentEpData.videoUrl) {
                options = [
                    {
                        quality: 720,
                        videoUrl: currentEpData.videoUrl,
                        isDefault: true,
                    },
                ];
            }
            // 3. Needs fetch. Use chapterId if available (Optimized Path)
            else if (
                currentEpData &&
                currentEpData.chapterId &&
                !currentEpData.chapterId.startsWith("virtual")
            ) {
                console.log(
                    `Loading stream for episode ${epNum} (ID: ${currentEpData.chapterId})`,
                );
                options = await getStreamUrl(
                    bookId,
                    epNum,
                    currentEpData.chapterId,
                );

                // Cache result in the episode object to avoid refetching
                if (options.length > 0) {
                    episodes[epIndex].qualityOptions = options;
                    episodes[epIndex].videoUrl = options[0].videoUrl;
                }
            }
            // 4. If we are still waiting for the filtered list...
            else if (loadingPromise) {
                try {
                    const allEpisodes = await loadingPromise;
                    const cachedEp = allEpisodes[epIndex];

                    if (cachedEp && cachedEp.chapterId) {
                        options = await getStreamUrl(
                            bookId,
                            epNum,
                            cachedEp.chapterId,
                        );
                        // Cache
                        if (options.length > 0) {
                            // Update the main episodes list if it hasn't been replaced yet?
                            // Actually loadingPromise sets 'episodes', so we just need to update that reference
                            // if it matches?
                            // Better: loadingPromise handler above already set 'episodes' global.
                            // So we might just read from global 'episodes' again?
                            if (episodes[epIndex]) {
                                episodes[epIndex].qualityOptions = options;
                            }
                        }
                    } else {
                        // Fallback (unlikely)
                        options = await getStreamUrl(bookId, epNum);
                    }
                } catch (e) {
                    options = await getStreamUrl(bookId, epNum);
                }
            } else {
                // Fallback to fetching stream URL individually (legacy)
                options = await getStreamUrl(bookId, epNum);
            }

            qualityOptions = options;

            const defaultOption =
                options.find((o) => o.quality === 540) ||
                options.find((o) => o.isDefault) ||
                options.find((o) => o.quality === 720) ||
                options[0];
            if (defaultOption) {
                // Prevent reloading if URL is same (e.g. background update)
                if (videoSrc === defaultOption.videoUrl) {
                    isVideoLoading = false;
                    return;
                }

                videoSrc = defaultOption.videoUrl;
                currentQuality = defaultOption.quality;

                // If videoElement is bound, load directly; otherwise set pending
                if (videoElement) {
                    videoElement.src = defaultOption.videoUrl;
                    videoElement.load();
                    videoElement.oncanplay = () => {
                        videoElement.play().catch(() => {
                            console.log("Autoplay blocked");
                        });
                    };
                } else {
                    // Video element not ready yet, store for later
                    pendingVideoSrc = defaultOption.videoUrl;
                }
            } else {
                error = "No video source available";
            }
        } catch (err) {
            console.error("Failed to load episode:", err);
            error = "Failed to load episode";
        } finally {
            isVideoLoading = false;
        }
    }

    function goToEpisode(epNum: number) {
        currentEpisode = epNum;
        goto(`/watch/${bookId}?ep=${epNum}`, { replaceState: true });
        loadEpisode(epNum);
        showEpisodeList = false;
    }

    function prevEpisode() {
        if (currentEpisode > 1) {
            goToEpisode(currentEpisode - 1);
        }
    }

    function nextEpisode() {
        if (currentEpisode < episodes.length) {
            goToEpisode(currentEpisode + 1);
        }
    }

    function handleFavorite() {
        if (drama) {
            favorites.toggle(drama);
        }
    }

    function selectQuality(quality: number) {
        const option = qualityOptions.find((o) => o.quality === quality);
        if (option && videoElement) {
            const currentTimeSaved = videoElement.currentTime;
            videoElement.src = option.videoUrl;
            videoElement.currentTime = currentTimeSaved;
            currentQuality = quality;
            showQualityMenu = false;
            if (isPlaying) {
                videoElement.play();
            }
        }
    }

    function togglePlay() {
        if (videoElement) {
            if (videoElement.paused) {
                videoElement.play();
            } else {
                videoElement.pause();
            }
        }
    }

    function handleVideoTap() {
        // Always toggle play/pause on tap
        togglePlay();

        // Also show controls and panel temporarily
        showControls = true;
        showPanel = true;
        clearTimeout(controlsTimeout);
        clearTimeout(panelTimeout);
        controlsTimeout = setTimeout(() => {
            if (isPlaying) showControls = false;
        }, 3000);
        panelTimeout = setTimeout(() => {
            if (isPlaying) showPanel = false;
        }, 5000);
    }

    function handleTimeUpdate() {
        if (videoElement) {
            currentTime = videoElement.currentTime;
            duration = videoElement.duration || 0;
            progress = duration ? (currentTime / duration) * 100 : 0;
        }
    }

    function handleSeek(e: MouseEvent) {
        if (videoElement) {
            const rect = (
                e.currentTarget as HTMLElement
            ).getBoundingClientRect();
            const pos = (e.clientX - rect.left) / rect.width;
            videoElement.currentTime = pos * duration;
        }
    }

    function formatTime(seconds: number): string {
        if (!seconds || isNaN(seconds)) return "0:00";
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, "0")}`;
    }

    function handlePlay() {
        isPlaying = true;
        showControls = false; // Hide controls when playing
        clearTimeout(controlsTimeout);
        // Auto-hide panel after 5 seconds
        clearTimeout(panelTimeout);
        panelTimeout = setTimeout(() => {
            showPanel = false;
        }, 5000);
    }

    function handlePause() {
        isPlaying = false;
        showControls = true; // Show controls when paused
        showPanel = true; // Show panel when paused
        clearTimeout(controlsTimeout);
        clearTimeout(panelTimeout);
    }

    // Auto-play next episode handling
    let countdownInterval: ReturnType<typeof setInterval> | undefined;

    function handleVideoEnded() {
        if (currentEpisode >= episodes.length) {
            // Last episode, show completion message
            showControls = true;
            return;
        }

        if (autoPlayNext) {
            // Start countdown
            nextEpisodeCountdown = 5;
            showNextEpisodePrompt = true;

            if (countdownInterval) clearInterval(countdownInterval);

            countdownInterval = setInterval(() => {
                nextEpisodeCountdown--;
                if (nextEpisodeCountdown <= 0) {
                    if (countdownInterval) clearInterval(countdownInterval);
                    playNextNow();
                }
            }, 1000);
        } else {
            // Show prompt to manually go to next episode
            showNextEpisodePrompt = true;
        }
    }

    function cancelAutoPlay() {
        if (countdownInterval) clearInterval(countdownInterval);
        showNextEpisodePrompt = false;
    }

    function playNextNow() {
        if (countdownInterval) clearInterval(countdownInterval);
        showNextEpisodePrompt = false;
        nextEpisode();
    }
</script>

<svelte:head>
    <title
        >{drama
            ? `${drama.bookName} - Episode ${currentEpisode}`
            : "Loading..."} - DRACIN</title
    >
</svelte:head>

<div class="fixed inset-0 bg-black flex items-center justify-center">
    {#if isLoading}
        <div class="flex items-center justify-center">
            <Loader2 class="w-12 h-12 text-brand-orange animate-spin" />
        </div>
    {:else if error && !drama}
        <div class="flex flex-col items-center justify-center text-center px-4">
            <h2 class="text-2xl font-bold mb-2">Error</h2>
            <p class="text-gray-400 mb-6">{error}</p>
            <a
                href="/"
                class="px-6 py-3 bg-brand-orange rounded-full font-semibold"
            >
                Kembali ke Home
            </a>
        </div>
    {:else if drama}
        <!-- Fullscreen Player Container -->
        <div class="relative w-full h-full">
            <!-- Video -->
            <video
                bind:this={videoElement}
                class="w-full h-full object-contain bg-black"
                poster={fixUrl(drama.cover)}
                playsinline
                referrerpolicy="no-referrer"
                onclick={handleVideoTap}
                onplay={handlePlay}
                onpause={handlePause}
                ontimeupdate={handleTimeUpdate}
                onended={handleVideoEnded}
                onerror={() => {
                    error = "Failed to load video";
                }}
            ></video>

            <!-- Loading Overlay -->
            {#if isVideoLoading}
                <div
                    class="absolute inset-0 flex items-center justify-center bg-black/50"
                >
                    <Loader2 class="w-12 h-12 text-brand-orange animate-spin" />
                </div>
            {/if}

            <!-- Play Button Center (only when paused or controls visible) -->
            {#if !isPlaying && !isVideoLoading}
                <button
                    onclick={togglePlay}
                    class="absolute inset-0 flex items-center justify-center"
                >
                    <div
                        class="w-20 h-20 rounded-full bg-brand-orange/80 flex items-center justify-center backdrop-blur-sm"
                    >
                        <Play class="w-10 h-10 text-white fill-white ml-1" />
                    </div>
                </button>
            {/if}

            <!-- Top Bar - Title (only shows on tap or when paused) -->
            {#if showControls || !isPlaying}
                <div
                    class="absolute top-0 left-0 right-0 flex items-center justify-center p-4 pt-20 bg-gradient-to-b from-black/80 to-transparent z-10 transition-opacity duration-300"
                >
                    <div class="text-center">
                        <p class="text-sm font-semibold line-clamp-1">
                            {drama.bookName}
                        </p>
                        <p class="text-xs text-gray-400">
                            Episode {currentEpisode} / {episodes.length}
                        </p>
                    </div>
                </div>
            {/if}

            <!-- Right Side Action Buttons (auto-hide after 5s) -->
            {#if showPanel || !isPlaying}
                <div
                    class="absolute right-4 bottom-32 flex flex-col items-center gap-5 z-20 transition-opacity duration-300"
                >
                    <!-- Previous Episode -->
                    <button
                        onclick={prevEpisode}
                        disabled={currentEpisode <= 1}
                        class="flex flex-col items-center gap-1 disabled:opacity-30"
                    >
                        <div
                            class="w-12 h-12 rounded-full glass flex items-center justify-center"
                        >
                            <ChevronUp class="w-6 h-6" />
                        </div>
                        <span class="text-xs">Prev</span>
                    </button>

                    <!-- Episodes List -->
                    <button
                        onclick={() => {
                            showEpisodeList = !showEpisodeList;
                            showInfo = false;
                            showQualityMenu = false;
                        }}
                        class="flex flex-col items-center gap-1"
                    >
                        <div
                            class="w-12 h-12 rounded-full glass flex items-center justify-center {showEpisodeList
                                ? 'bg-brand-orange'
                                : ''}"
                        >
                            <List class="w-6 h-6" />
                        </div>
                        <span class="text-xs">{episodes.length} Ep</span>
                    </button>

                    <!-- Favorite -->
                    <button
                        onclick={handleFavorite}
                        class="flex flex-col items-center gap-1"
                    >
                        <div
                            class="w-12 h-12 rounded-full glass flex items-center justify-center {isFavorited
                                ? 'bg-red-500'
                                : ''}"
                        >
                            <Heart
                                class="w-6 h-6 {isFavorited
                                    ? 'fill-white'
                                    : ''}"
                            />
                        </div>
                        <span class="text-xs"
                            >{isFavorited ? "Saved" : "Save"}</span
                        >
                    </button>

                    <!-- Info -->
                    <button
                        onclick={() => {
                            showInfo = !showInfo;
                            showEpisodeList = false;
                            showQualityMenu = false;
                        }}
                        class="flex flex-col items-center gap-1"
                    >
                        <div
                            class="w-12 h-12 rounded-full glass flex items-center justify-center {showInfo
                                ? 'bg-brand-orange'
                                : ''}"
                        >
                            <Info class="w-6 h-6" />
                        </div>
                        <span class="text-xs">Info</span>
                    </button>

                    <!-- Quality Selector -->
                    {#if qualityOptions.length > 1}
                        <button
                            onclick={() => {
                                showQualityMenu = !showQualityMenu;
                                showInfo = false;
                                showEpisodeList = false;
                            }}
                            class="flex flex-col items-center gap-1"
                        >
                            <div
                                class="w-12 h-12 rounded-full glass flex items-center justify-center {showQualityMenu
                                    ? 'bg-brand-orange'
                                    : ''}"
                            >
                                <span class="text-xs font-bold"
                                    >{currentQuality}p</span
                                >
                            </div>
                            <span class="text-xs">Quality</span>
                        </button>
                    {/if}

                    <!-- Next Episode -->
                    <button
                        onclick={nextEpisode}
                        disabled={currentEpisode >= episodes.length}
                        class="flex flex-col items-center gap-1 disabled:opacity-30"
                    >
                        <div
                            class="w-12 h-12 rounded-full glass flex items-center justify-center"
                        >
                            <ChevronDown class="w-6 h-6" />
                        </div>
                        <span class="text-xs">Next</span>
                    </button>

                    <!-- Auto-play Toggle -->
                    <button
                        onclick={() => (autoPlayNext = !autoPlayNext)}
                        class="flex flex-col items-center gap-1"
                        title={autoPlayNext ? "Auto-play ON" : "Auto-play OFF"}
                    >
                        <div
                            class="w-12 h-12 rounded-full glass flex items-center justify-center {autoPlayNext
                                ? 'bg-green-500'
                                : ''}"
                        >
                            <span class="text-xs font-bold">AUTO</span>
                        </div>
                        <span class="text-xs"
                            >{autoPlayNext ? "On" : "Off"}</span
                        >
                    </button>
                </div>
            {/if}

            <!-- Bottom Progress Bar & Time (only shows on tap or when paused) -->
            {#if showControls || !isPlaying}
                <div
                    class="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent z-10 transition-opacity duration-300"
                >
                    <!-- Progress Bar -->
                    <div
                        class="relative h-1 bg-white/30 rounded-full mb-3 cursor-pointer"
                        onclick={handleSeek}
                    >
                        <div
                            class="absolute top-0 left-0 h-full bg-brand-orange rounded-full transition-all"
                            style="width: {progress}%"
                        ></div>
                    </div>
                    <div
                        class="flex items-center justify-between text-xs text-gray-300"
                    >
                        <span>{formatTime(currentTime)}</span>
                        <span>{formatTime(duration)}</span>
                    </div>
                </div>
            {/if}

            <!-- Next Episode Prompt -->
            {#if showNextEpisodePrompt && currentEpisode < episodes.length}
                <div
                    class="absolute inset-0 flex items-center justify-center bg-black/80 backdrop-blur-sm z-40"
                >
                    <div class="text-center p-6">
                        <h3 class="text-lg font-semibold mb-2">
                            Episode selesai!
                        </h3>
                        {#if autoPlayNext}
                            <p class="text-gray-400 mb-4">
                                Lanjut ke Episode {currentEpisode + 1} dalam {nextEpisodeCountdown}
                                detik...
                            </p>
                            <div class="flex gap-3 justify-center">
                                <button
                                    onclick={cancelAutoPlay}
                                    class="px-6 py-3 glass rounded-full font-semibold hover:bg-white/20 transition-colors"
                                >
                                    Batal
                                </button>
                                <button
                                    onclick={playNextNow}
                                    class="px-6 py-3 bg-brand-orange rounded-full font-semibold hover:bg-brand-orange/80 transition-colors"
                                >
                                    Putar Sekarang
                                </button>
                            </div>
                        {:else}
                            <p class="text-gray-400 mb-4">
                                Lanjutkan ke Episode {currentEpisode + 1}?
                            </p>
                            <div class="flex gap-3 justify-center">
                                <button
                                    onclick={() =>
                                        (showNextEpisodePrompt = false)}
                                    class="px-6 py-3 glass rounded-full font-semibold hover:bg-white/20 transition-colors"
                                >
                                    Tutup
                                </button>
                                <button
                                    onclick={playNextNow}
                                    class="px-6 py-3 bg-brand-orange rounded-full font-semibold hover:bg-brand-orange/80 transition-colors"
                                >
                                    Episode Selanjutnya
                                </button>
                            </div>
                        {/if}
                    </div>
                </div>
            {/if}

            <!-- Episode List Panel -->
            {#if showEpisodeList}
                <div
                    class="absolute inset-0 pt-16 bg-black/90 backdrop-blur-sm flex flex-col z-30"
                >
                    <div
                        class="flex items-center justify-between p-4 border-b border-white/10"
                    >
                        <h3 class="font-semibold">Daftar Episode</h3>
                        <button
                            onclick={() => (showEpisodeList = false)}
                            class="p-2"
                        >
                            <X class="w-5 h-5" />
                        </button>
                    </div>
                    <div class="flex-1 overflow-y-auto p-4">
                        <div class="grid grid-cols-5 gap-2">
                            {#each episodes as _, index}
                                {@const epNum = index + 1}
                                <button
                                    onclick={() => goToEpisode(epNum)}
                                    class="p-3 rounded-lg text-sm font-medium transition-colors {currentEpisode ===
                                    epNum
                                        ? 'bg-brand-orange'
                                        : 'glass hover:bg-white/20'}"
                                >
                                    {epNum}
                                </button>
                            {/each}
                        </div>
                    </div>
                </div>
            {/if}

            <!-- Info Panel -->
            {#if showInfo}
                <div
                    class="absolute inset-0 pt-16 bg-black/90 backdrop-blur-sm flex flex-col z-30"
                >
                    <div
                        class="flex items-center justify-between p-4 border-b border-white/10"
                    >
                        <h3 class="font-semibold">Detail Drama</h3>
                        <button onclick={() => (showInfo = false)} class="p-2">
                            <X class="w-5 h-5" />
                        </button>
                    </div>
                    <div class="flex-1 overflow-y-auto p-4">
                        <div class="flex gap-4 mb-4">
                            <img
                                src={fixUrl(drama.cover)}
                                alt={drama.bookName}
                                class="w-24 h-36 object-cover rounded-lg"
                            />
                            <div class="flex-1">
                                <h2 class="text-lg font-bold mb-2">
                                    {drama.bookName}
                                </h2>
                                <p class="text-sm text-gray-400 mb-1">
                                    {drama.status} • {drama.year}
                                </p>
                                <p class="text-sm text-gray-400">
                                    {episodes.length} Episodes
                                </p>
                            </div>
                        </div>
                        <p class="text-sm text-gray-300 leading-relaxed">
                            {drama.introduction || "No description available."}
                        </p>
                        <a
                            href="/detail/{drama.bookId}"
                            class="inline-block mt-4 px-4 py-2 bg-brand-orange rounded-lg text-sm font-medium"
                        >
                            Lihat Detail Lengkap
                        </a>
                    </div>
                </div>
            {/if}

            <!-- Quality Selection Panel -->
            {#if showQualityMenu}
                <div
                    class="absolute inset-0 pt-16 bg-black/90 backdrop-blur-sm flex flex-col z-30"
                >
                    <div
                        class="flex items-center justify-between p-4 border-b border-white/10"
                    >
                        <h3 class="font-semibold">Pilih Kualitas Video</h3>
                        <button
                            onclick={() => (showQualityMenu = false)}
                            class="p-2"
                        >
                            <X class="w-5 h-5" />
                        </button>
                    </div>
                    <div
                        class="flex-1 flex flex-col items-center justify-center p-4 gap-3"
                    >
                        {#each qualityOptions as option}
                            <button
                                onclick={() => selectQuality(option.quality)}
                                class="w-full max-w-xs px-6 py-4 rounded-xl text-center font-semibold transition-colors {currentQuality ===
                                option.quality
                                    ? 'bg-brand-orange'
                                    : 'glass hover:bg-white/20'}"
                            >
                                {option.quality}p {option.quality >= 1080
                                    ? "(HD)"
                                    : option.quality >= 720
                                      ? "(SD)"
                                      : ""}
                            </button>
                        {/each}
                    </div>
                </div>
            {/if}
        </div>
    {/if}
</div>
