<script lang="ts">
    import { fade } from "svelte/transition";
    import { PlayCircle, Calendar, Star, Clock, Info } from "lucide-svelte";

    export let data: { error?: string; drama?: any; slug?: string };

    function fixUrl(url: string) {
        if (!url) return "";
        return url.startsWith("http") ? url : `https://${url}`;
    }
</script>

<svelte:head>
    {#if data.drama}
        <title>{data.drama.title} - Drakor</title>
        <meta name="description" content={data.drama.synopsis?.slice(0, 160)} />
        <meta property="og:title" content={data.drama.title} />
        <meta property="og:description" content={data.drama.synopsis} />
        <meta property="og:image" content={fixUrl(data.drama.poster)} />
    {:else}
        <title>Detail Drama - Drakor</title>
    {/if}
</svelte:head>

<div class="min-h-screen pb-20 pt-8" in:fade>
    {#if data.error}
        <div class="flex h-[50vh] items-center justify-center text-center">
            <div>
                <h1 class="text-2xl font-bold text-red-400">
                    Terjadi Kesalahan
                </h1>
                <p class="mt-2 text-gray-400">{data.error}</p>
                <a
                    href="/drakor"
                    class="mt-6 inline-block rounded-full bg-blue-600 px-6 py-2 font-semibold hover:bg-blue-700"
                    >Kembali ke Home</a
                >
            </div>
        </div>
    {:else if data.drama}
        {@const d = data.drama}

        <!-- Hero / Info Section -->
        <div class="mx-auto max-w-7xl px-4 sm:px-6">
            <div class="flex flex-col gap-8 md:flex-row">
                <!-- Poster -->
                <div class="shrink-0 md:w-72 lg:w-80">
                    <div class="relative overflow-hidden rounded-xl shadow-2xl">
                        <img
                            src={fixUrl(d.poster)}
                            alt={d.title}
                            class="w-full object-cover"
                        />
                        <div
                            class="absolute inset-0 ring-1 ring-inset ring-white/10"
                        ></div>
                    </div>
                </div>

                <!-- Details -->
                <div class="flex-1 space-y-6">
                    <div>
                        <h1 class="text-3xl font-bold text-white md:text-5xl">
                            {d.title}
                        </h1>
                        <div
                            class="mt-4 flex flex-wrap items-center gap-3 text-sm text-gray-300"
                        >
                            {#if d.skor}
                                <span
                                    class="flex items-center gap-1 rounded bg-yellow-500/20 px-2 py-1 text-yellow-500"
                                >
                                    <Star class="h-4 w-4 fill-yellow-500" />
                                    {d.skor}
                                </span>
                            {/if}
                            {#if d.status}
                                <span
                                    class="rounded bg-blue-500/20 px-2 py-1 text-blue-400"
                                    >{d.status}</span
                                >
                            {/if}
                            {#if d.tahun}
                                <span class="flex items-center gap-1"
                                    ><Calendar class="h-4 w-4" />
                                    {d.tahun}</span
                                >
                            {/if}
                            {#if d.durasi}
                                <span class="flex items-center gap-1"
                                    ><Clock class="h-4 w-4" /> {d.durasi}</span
                                >
                            {/if}
                        </div>
                    </div>

                    <!-- Genres -->
                    {#if d.genres && d.genres.length}
                        <div class="flex flex-wrap gap-2">
                            {#each d.genres as genre}
                                <span
                                    class="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-gray-300"
                                    >{genre}</span
                                >
                            {/each}
                        </div>
                    {/if}

                    <!-- Synopsis -->
                    <div class="rounded-xl bg-white/5 p-6 backdrop-blur-sm">
                        <h3
                            class="mb-2 flex items-center gap-2 text-lg font-semibold text-white"
                        >
                            <Info class="h-5 w-5 text-blue-500" /> Sinopsis
                        </h3>
                        <p class="leading-relaxed text-gray-300">
                            {d.synopsis}
                        </p>
                    </div>

                    <!-- Metadata Grid -->
                    <div class="grid grid-cols-2 gap-4 text-sm sm:grid-cols-4">
                        <div>
                            <span class="block text-gray-500">Negara</span>
                            <span class="text-white">{d.negara || "-"}</span>
                        </div>
                        <div>
                            <span class="block text-gray-500">Sutradara</span>
                            <span class="text-white">{d.director || "-"}</span>
                        </div>
                        <div>
                            <span class="block text-gray-500">Network</span>
                            <span class="text-white"
                                >{d.original_network || "-"}</span
                            >
                        </div>
                        <div>
                            <span class="block text-gray-500">Rating Usia</span>
                            <span class="text-white"
                                >{d.rating_usia || "-"}</span
                            >
                        </div>
                    </div>
                </div>
            </div>

            <!-- Episode List -->
            <section class="mt-12">
                <h2
                    class="mb-6 flex items-center gap-3 text-2xl font-bold text-white"
                >
                    <PlayCircle class="h-6 w-6 text-blue-500" /> Episode
                </h2>
                {#if d.episodes && d.episodes.length}
                    <div
                        class="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8"
                    >
                        {#each d.episodes as ep}
                            <a
                                href="/drakor/play/{data.slug}/{ep.ep}"
                                class="group flex flex-col items-center justify-center rounded-lg border border-white/10 bg-white/5 p-4 transition-all hover:border-blue-500 hover:bg-blue-600/20"
                            >
                                <span
                                    class="text-xs text-gray-400 group-hover:text-blue-200"
                                    >Episode</span
                                >
                                <span
                                    class="text-xl font-bold text-white group-hover:text-blue-400"
                                    >{ep.ep}</span
                                >
                            </a>
                        {/each}
                    </div>
                {:else}
                    <p class="text-gray-500">Belum ada episode tersedia.</p>
                {/if}
            </section>

            <!-- Recommendations -->
            {#if d.recommendations && d.recommendations.length}
                <section class="mt-16">
                    <h2 class="mb-6 text-xl font-bold text-white">
                        Rekomendasi Serupa
                    </h2>
                    <div
                        class="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6"
                    >
                        {#each d.recommendations as item}
                            <a
                                href="/drakor/title/{item.slug}"
                                class="group relative block overflow-hidden rounded-xl bg-gray-900 transition-all hover:scale-105"
                            >
                                <div
                                    class="aspect-[2/3] w-full overflow-hidden"
                                >
                                    <img
                                        src={fixUrl(item.img)}
                                        alt={item.title}
                                        class="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                                        loading="lazy"
                                    />
                                    <div
                                        class="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors"
                                    ></div>
                                </div>
                                <div class="p-2">
                                    <h3
                                        class="truncate text-xs font-medium text-gray-300 group-hover:text-white"
                                    >
                                        {item.title}
                                    </h3>
                                </div>
                            </a>
                        {/each}
                    </div>
                </section>
            {/if}
        </div>
    {/if}
</div>
