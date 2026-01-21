<script lang="ts">
    import VideoPlayer from "$lib/components/VideoPlayer.svelte";
    import { ChevronLeft } from "lucide-svelte";

    export let data: {
        error?: string;
        streamData?: any;
        slug?: string;
        episode?: string;
    };

    let currentQuality = 720;
    let currentSrc = "";

    // Transform streams for VideoPlayer
    $: streams = data.streamData?.streams || [];
    $: qualities = streams
        .map((s: any) => ({
            quality: parseInt(s.quality),
            label: s.quality,
        }))
        .sort((a: any, b: any) => b.quality - a.quality);

    $: {
        if (streams.length > 0) {
            // Find closest quality or default to highest
            const stream =
                streams.find(
                    (s: any) => parseInt(s.quality) === currentQuality,
                ) || streams[streams.length - 1];
            if (stream) currentSrc = stream.url;
        }
    }

    function handleQualityChange(q: number) {
        currentQuality = q;
    }
</script>

<svelte:head>
    <title>Nonton {data.slug} Episode {data.episode} - Drakor</title>
</svelte:head>

<div class="min-h-screen pt-20 pb-10 max-w-7xl mx-auto px-4 sm:px-6">
    <div class="mb-6">
        <a
            href="/drakor/title/{data.slug}"
            class="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
        >
            <ChevronLeft class="w-5 h-5" />
            Kembali ke Detail
        </a>
    </div>

    {#if data.error}
        <div
            class="aspect-video bg-gray-900 rounded-xl flex items-center justify-center"
        >
            <div class="text-center">
                <p class="text-red-400 mb-2">{data.error}</p>
                <button
                    onclick={() => location.reload()}
                    class="px-4 py-2 bg-blue-600 rounded hover:bg-blue-700"
                    >Coba Lagi</button
                >
            </div>
        </div>
    {:else if streams.length > 0}
        <div class="space-y-4">
            <h1 class="text-xl md:text-2xl font-bold text-white">
                Episode {data.episode}
            </h1>

            <div class="rounded-xl overflow-hidden shadow-2xl bg-black">
                <VideoPlayer
                    src={currentSrc}
                    qualityOptions={qualities}
                    onQualityChange={handleQualityChange}
                    poster=""
                />
            </div>

            <div class="p-4 bg-white/5 rounded-xl">
                <p class="text-sm text-gray-400">
                    Sedang memutar: <span class="text-white font-medium"
                        >{data.slug}</span
                    >
                    - Episode {data.episode}
                </p>
            </div>
        </div>
    {:else}
        <div
            class="aspect-video bg-gray-900 rounded-xl flex items-center justify-center"
        >
            <p class="text-gray-400">Stream tidak tersedia.</p>
        </div>
    {/if}
</div>
