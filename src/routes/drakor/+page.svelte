<script lang="ts">
    import { fade } from "svelte/transition";
    import { onMount } from "svelte";

    export let data: { disabled?: boolean; error?: string; data?: any };

    // Simple intersection observer for fade-in effect
    let visible = false;
    onMount(() => (visible = true));
</script>

<svelte:head>
    <title>Drakor — Drama Korea Terbaru</title>
    <meta
        name="description"
        content="Nonton Drama Korea terbaru dan terpopuler dengan subtitle Indonesia."
    />
    <meta property="og:title" content="Drakor — Drama Korea Terbaru" />
    <meta
        property="og:description"
        content="Streaming Drama Korea subtitle Indonesia gratis."
    />
    <meta property="og:type" content="website" />
</svelte:head>

<div class="min-h-screen pb-20 pt-8" in:fade={{ duration: 300 }}>
    {#if data?.disabled}
        <div
            class="flex h-[50vh] flex-col items-center justify-center text-center"
        >
            <h1 class="text-3xl font-bold text-gray-500">Coming Soon</h1>
            <p class="mt-4 text-gray-400">
                Mode Drakor belum tersedia saat ini.
            </p>
        </div>
    {:else if data?.error}
        <div
            class="flex h-[50vh] flex-col items-center justify-center text-center"
        >
            <h1 class="text-2xl font-bold text-red-400">Terjadi Kesalahan</h1>
            <p class="mt-4 text-gray-400">{data.error}</p>
        </div>
    {:else if data?.data}
        <!-- Hero / Trending Section -->
        <section class="mx-auto max-w-7xl px-4 sm:px-6">
            <h1 class="mb-8 text-3xl font-bold text-white md:text-5xl">
                <span class="text-blue-500">Drakor</span> Terbaru
            </h1>

            {#if data.data.trending}
                <div class="mb-12">
                    <h2 class="mb-4 text-xl font-semibold text-gray-200">
                        🔥 Trending Week
                    </h2>
                    <div
                        class="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6"
                    >
                        {#each data.data.trending as item}
                            <a
                                href="/drakor/title/{item.slug}"
                                class="group relative block overflow-hidden rounded-xl bg-gray-900 transition-all hover:scale-105 hover:shadow-xl hover:shadow-blue-500/20"
                            >
                                <div
                                    class="aspect-[2/3] w-full overflow-hidden"
                                >
                                    <img
                                        src={item.posterUrl || item.img}
                                        alt={item.title}
                                        class="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                                        loading="lazy"
                                    />
                                    <div
                                        class="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black/90 to-transparent"
                                    ></div>
                                </div>
                                <div class="absolute bottom-0 p-3">
                                    <h3
                                        class="line-clamp-2 text-sm font-semibold text-white group-hover:text-blue-400"
                                    >
                                        {item.title}
                                    </h3>
                                    <div
                                        class="mt-1 flex items-center gap-2 text-xs text-gray-400"
                                    >
                                        <span>{item.rating || "N/A"}</span>
                                        <span>•</span>
                                        <span>{item.year || "2025"}</span>
                                    </div>
                                </div>
                            </a>
                        {/each}
                    </div>
                </div>
            {/if}

            <!-- New Releases -->
            {#if data.data.newReleases}
                <div class="mb-12">
                    <h2 class="mb-4 text-xl font-semibold text-gray-200">
                        🆕 Baru Rilis
                    </h2>
                    <div
                        class="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6"
                    >
                        {#each data.data.newReleases as item}
                            <a
                                href="/drakor/title/{item.slug}"
                                class="group relative block overflow-hidden rounded-xl bg-gray-900 transition-all hover:scale-105 hover:shadow-lg"
                            >
                                <div
                                    class="aspect-[2/3] w-full overflow-hidden"
                                >
                                    <img
                                        src={item.posterUrl || item.img}
                                        alt={item.title}
                                        class="h-full w-full object-cover"
                                        loading="lazy"
                                    />
                                    <div
                                        class="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors"
                                    ></div>
                                </div>
                                <div class="mt-2 px-1">
                                    <h3
                                        class="truncate text-sm font-medium text-gray-200 group-hover:text-white"
                                    >
                                        {item.title}
                                    </h3>
                                </div>
                            </a>
                        {/each}
                    </div>
                </div>
            {/if}
        </section>
    {/if}
</div>
