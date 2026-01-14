<script lang="ts">
  import { page } from "$app/stores";
  import { onMount } from "svelte";
  import {
    Star,
    Heart,
    Play,
    Clock,
    Calendar,
    Tag,
    Loader2,
  } from "lucide-svelte";
  import { getDramaDetail, getAllEpisodes } from "$lib/services/api";
  import { favorites } from "$lib/stores/favorites";
  import { selectedDrama } from "$lib/stores/drama";
  import { fixUrl, truncateText } from "$lib/utils/helpers";
  import type { Drama, Episode } from "$lib/types";

  let bookId = $derived($page.params.id);

  // Initialize from store ONLY if it matches the current bookId
  let drama = $state<Drama | null>(
    $selectedDrama?.bookId === bookId || $selectedDrama?.id === bookId
      ? $selectedDrama
      : null,
  );
  let episodes = $state<Array<Omit<Episode, "videoUrl" | "qualityOptions">>>(
    [],
  );
  // We use $derived for loading state based on drama presence
  let isFetching = $state(true);
  let isLoading = $derived(!drama && isFetching);
  let error = $state<string | null>(null);

  let isFavorited = $derived(
    drama ? $favorites.some((f) => f.bookId === drama?.bookId) : false,
  );

  $effect(() => {
    if (bookId) {
      loadDramaData();
    }
  });

  async function loadDramaData() {
    if (!bookId) return;

    // Only set loading if we don't already have drama data in state
    if (!drama || (drama.bookId !== bookId && drama.id !== bookId)) {
      isFetching = true;
    }
    error = null;

    try {
      const [dramaData, episodesData] = await Promise.all([
        getDramaDetail(bookId),
        getAllEpisodes(bookId),
      ]);

      // Smart merge: Preserve good metadata if the API returned a fallback
      if (drama) {
        const isFallback =
          dramaData.introduction === "Description not available" ||
          !dramaData.cover ||
          dramaData.bookName.startsWith("Drama ");

        if (isFallback) {
          // Keep our existing drama info but update episodes related info
          drama = {
            ...drama,
            latestEpisode: dramaData.latestEpisode || drama.latestEpisode,
            chapterCount: dramaData.chapterCount || drama.chapterCount,
            status: dramaData.status || drama.status,
          };
        } else {
          drama = dramaData;
        }
      } else {
        drama = dramaData;
      }

      episodes = episodesData;

      // Update global store so next page (Watch) has the data
      if (drama) {
        selectedDrama.setSelected(drama);
      }
    } catch (err) {
      console.error("Failed to load drama:", err);
      // If we don't have ANY drama data, then show error
      if (!drama) {
        error = "Failed to load drama details";
      }
    } finally {
      isFetching = false;
    }
  }

  function handleFavorite() {
    if (drama) {
      favorites.toggle(drama);
    }
  }

  function handleWatchClick() {
    if (drama) {
      selectedDrama.setSelected(drama);
    }
  }
</script>

<svelte:head>
  <title>{drama?.name || drama?.bookName || "Loading..."} - DRACIN</title>
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
      <p class="text-gray-400 mb-6">{error || "Drama not found"}</p>
      <a href="/" class="px-6 py-3 bg-brand-orange rounded-full font-semibold">
        Kembali ke Home
      </a>
    </div>
  {:else}
    <!-- Hero Section -->
    <section class="relative min-h-[50vh] -mt-16 pt-16">
      <!-- Background -->
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

      <!-- Content -->
      <div class="relative max-w-7xl mx-auto px-4 sm:px-6 py-8 md:py-16">
        <div class="flex flex-col md:flex-row gap-6 md:gap-10">
          <!-- Cover -->
          <div class="shrink-0 mx-auto md:mx-0">
            <img
              src={fixUrl(drama.cover)}
              alt={drama.bookName}
              class="w-48 md:w-64 rounded-xl shadow-2xl"
            />
          </div>

          <!-- Info -->
          <div class="flex-1 text-center md:text-left">
            <h1 class="text-3xl md:text-4xl font-bold mb-4">
              {drama.name || drama.bookName}
            </h1>

            <!-- Meta -->
            <div
              class="flex flex-wrap items-center justify-center md:justify-start gap-4 mb-6 text-sm text-gray-300"
            >
              {#if drama.rating}
                <span class="flex items-center gap-1">
                  <Star class="w-4 h-4 text-yellow-500 fill-yellow-500" />
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
                {drama.chapterCount || episodes.length} Episode
              </span>
              <span
                class="px-2 py-1 rounded-md {drama.status === 'Completed' ||
                drama.status === 'TAMAT'
                  ? 'bg-green-500/20 text-green-400'
                  : 'bg-brand-orange/20 text-brand-orange'}"
              >
                {drama.status}
              </span>
            </div>

            <!-- Tags (Genres) -->
            {#if (drama.tags && drama.tags.length > 0) || (drama.genres && drama.genres.length > 0)}
              <div
                class="flex flex-wrap items-center justify-center md:justify-start gap-2 mb-6"
              >
                {#each (drama.tags || drama.genres || []).slice(0, 8) as tag}
                  <span class="px-3 py-1 glass rounded-full text-xs">{tag}</span
                  >
                {/each}
              </div>
            {/if}

            <!-- Synopsis -->
            <p
              class="text-gray-300 leading-relaxed mb-8 max-w-2xl mx-auto md:mx-0"
            >
              {drama.introduction || "No description available."}
            </p>

            <!-- Actions -->
            <div
              class="flex flex-wrap items-center justify-center md:justify-start gap-3"
            >
              <a
                href="/watch/{drama.bookId}"
                onclick={handleWatchClick}
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
                <Heart class="w-5 h-5 {isFavorited ? 'fill-current' : ''}" />
                {isFavorited ? "Di Watchlist" : "Tambah ke Watchlist"}
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
          class="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-8 lg:grid-cols-10 gap-2"
        >
          {#each episodes as _, index}
            {@const epNum = index + 1}
            <a
              href="/watch/{drama.bookId}?ep={epNum}"
              onclick={handleWatchClick}
              class="flex items-center justify-center p-3 glass rounded-lg hover:bg-brand-orange/20 hover:border-brand-orange/50 transition-all text-sm font-medium"
            >
              {epNum}
            </a>
          {/each}
        </div>
      {:else if drama.chapterCount && drama.chapterCount > 0}
        <div
          class="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-8 lg:grid-cols-10 gap-2"
        >
          {#each Array(drama.chapterCount) as _, index}
            {@const epNum = index + 1}
            <div
              class="flex items-center justify-center p-3 glass rounded-lg opacity-50 text-sm font-medium animate-pulse"
            >
              {epNum}
            </div>
          {/each}
        </div>
      {:else if isLoading}
        <div class="flex justify-center py-12">
          <Loader2 class="w-8 h-8 text-brand-orange animate-spin" />
        </div>
      {:else}
        <div class="text-center py-12 text-gray-400">
          <p>Tidak ada episode tersedia</p>
        </div>
      {/if}
    </section>
  {/if}
</div>
