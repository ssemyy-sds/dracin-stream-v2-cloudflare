<script lang="ts">
    import { Search } from "lucide-svelte";
    import { goto } from "$app/navigation";

    export let data: { error?: string; results?: any[]; query?: string };

    let searchTerm = data.query || "";

    function handleSearch(e: Event) {
        e.preventDefault();
        if (searchTerm.trim()) {
            goto(`/drakor/search?q=${encodeURIComponent(searchTerm.trim())}`);
        }
    }

    function fixUrl(url: string) {
        if (!url) return "";
        return url.startsWith("http") ? url : `https://${url}`;
    }
</script>

<svelte:head>
    <title>Cari Drama Korea - Drakor</title>
</svelte:head>

<div class="min-h-screen pt-24 pb-10 max-w-7xl mx-auto px-4 sm:px-6">
    <!-- Search Header -->
    <div class="mb-8">
        <h1 class="text-3xl font-bold text-white mb-6">Pencarian</h1>
        <form on:submit={handleSearch} class="relative max-w-2xl">
            <input
                type="text"
                bind:value={searchTerm}
                placeholder="Cari judul drama..."
                class="w-full bg-gray-900 border border-gray-700 rounded-full py-4 pl-14 pr-6 text-white text-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
            <Search
                class="absolute left-5 top-1/2 -translate-y-1/2 text-gray-500 w-6 h-6"
            />
        </form>
    </div>

    {#if data.error}
        <div class="text-center py-20">
            <p class="text-red-400">{data.error}</p>
        </div>
    {:else if data.results === undefined}
        <div class="text-center py-20">
            <p class="text-gray-500 text-lg">
                Mulai pencarian dengan mengetik judul drama.
            </p>
        </div>
    {:else if data.results.length === 0}
        <div class="text-center py-20">
            <p class="text-gray-400 text-lg">
                Tidak ditemukan hasil untuk "{data.query}".
            </p>
        </div>
    {:else}
        <div
            class="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5"
        >
            {#each data.results as item}
                <a
                    href="/drakor/title/{item.slug}"
                    class="group relative block overflow-hidden rounded-xl bg-gray-900 transition-all hover:scale-105"
                >
                    <div class="aspect-[2/3] w-full overflow-hidden">
                        {#if item.img}
                            <img
                                src={fixUrl(item.img)}
                                alt={item.title}
                                class="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                                loading="lazy"
                            />
                        {:else}
                            <div
                                class="h-full w-full bg-gray-800 flex items-center justify-center"
                            >
                                <span class="text-gray-500 text-xs"
                                    >No Image</span
                                >
                            </div>
                        {/if}
                        <div
                            class="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors"
                        ></div>
                    </div>
                    <div class="p-3">
                        <h3
                            class="line-clamp-2 text-sm font-medium text-gray-200 group-hover:text-white"
                        >
                            {item.title}
                        </h3>
                    </div>
                </a>
            {/each}
        </div>
    {/if}
</div>
