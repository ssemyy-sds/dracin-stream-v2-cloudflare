<script lang="ts">
    import { goto, preloadData } from "$app/navigation";
    import { setClientMode, getClientMode } from "$lib/modePreference";
    import { page } from "$app/stores";
    import { onMount } from "svelte";

    let currentMode = $derived(
        $page.url.pathname.startsWith("/drakor") ? "drakor" : "dracin",
    );

    function switchMode(mode: "dracin" | "drakor") {
        if (currentMode === mode) return;

        setClientMode(mode);
        if (mode === "dracin") {
            goto("/");
        } else {
            goto("/drakor");
        }
    }
</script>

<div
    class="flex items-center bg-white/5 rounded-full p-1 border border-white/10"
>
    <button
        class="px-3 py-1.5 rounded-full text-xs font-semibold transition-all {currentMode ===
        'dracin'
            ? 'bg-brand-orange text-white shadow-lg'
            : 'text-gray-400 hover:text-white'}"
        on:mouseenter={() => preloadData("/")}
        on:click={() => switchMode("dracin")}
    >
        Dracin
    </button>
    <button
        class="px-3 py-1.5 rounded-full text-xs font-semibold transition-all {currentMode ===
        'drakor'
            ? 'bg-blue-600 text-white shadow-lg'
            : 'text-gray-400 hover:text-white'}"
        on:mouseenter={() => preloadData("/drakor")}
        on:click={() => switchMode("drakor")}
    >
        Drakor
    </button>
</div>
