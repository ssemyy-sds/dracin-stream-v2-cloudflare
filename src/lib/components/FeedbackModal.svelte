<script lang="ts">
    import { X, MessageSquare, Send, Loader2 } from "lucide-svelte";
    import { fade, scale } from "svelte/transition";

    interface Props {
        isOpen: boolean;
        onClose: () => void;
        apiId: string;
    }

    let { isOpen, onClose, apiId }: Props = $props();

    let name = $state("");
    let feedback = $state("");
    let isSubmitting = $state(false);
    let submitStatus = $state<"idle" | "success" | "error">("idle");
    let errorMessage = $state("");

    async function handleSubmit(e: Event) {
        e.preventDefault();
        if (!feedback.trim()) return;

        isSubmitting = true;
        submitStatus = "idle";
        errorMessage = "";

        try {
            const response = await fetch("/api/feedback", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ name, feedback, apiId }),
            });

            if (!response.ok) {
                throw new Error("Gagal mengirim feedback");
            }

            submitStatus = "success";
            name = "";
            feedback = "";

            // Close modal after success (optional delay)
            setTimeout(() => {
                onClose();
                submitStatus = "idle"; // Reset for next time
            }, 2000);
        } catch (err) {
            submitStatus = "error";
            errorMessage =
                "Terjadi kesalahan saat mengirim feedback. Silakan coba lagi.";
        } finally {
            isSubmitting = false;
        }
    }

    function handleBackdropClick(e: MouseEvent) {
        if (e.target === e.currentTarget) {
            onClose();
        }
    }

    function handleKeydown(e: KeyboardEvent) {
        if (e.key === "Escape") {
            onClose();
        }
    }
</script>

<svelte:window onkeydown={handleKeydown} />

{#if isOpen}
    <!-- Backdrop -->
    <div
        class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
        onclick={handleBackdropClick}
        role="dialog"
        aria-modal="true"
        aria-labelledby="feedback-title"
        transition:fade={{ duration: 200 }}
    >
        <!-- Modal -->
        <div
            class="relative w-full max-w-sm bg-gradient-to-b from-brand-gray to-brand-dark rounded-2xl overflow-hidden shadow-2xl"
            transition:scale={{ duration: 300, start: 0.95 }}
        >
            <!-- Close Button -->
            <button
                onclick={onClose}
                class="absolute top-4 right-4 p-2 rounded-full glass hover:bg-white/20 transition-colors z-10"
                aria-label="Close"
            >
                <X class="w-5 h-5" />
            </button>

            <!-- Header -->
            <div class="p-6 pb-4 text-center border-b border-white/10">
                <div
                    class="inline-flex items-center justify-center w-14 h-14 rounded-full bg-brand-orange/20 mb-4"
                >
                    <MessageSquare class="w-7 h-7 text-brand-orange" />
                </div>
                <h2 id="feedback-title" class="text-xl font-bold">
                    Feedback / Lapor Bug 🐛
                </h2>
                <div
                    class="mt-2 inline-flex items-center px-2 py-1 rounded bg-black/40 border border-white/5 text-xs text-gray-400 font-mono"
                >
                    API ID: {apiId}
                </div>
                <p class="text-sm text-gray-400 mt-2">
                    Masukan anda membantu kami berkembang.
                </p>
            </div>

            <!-- Form -->
            <div class="p-6">
                {#if submitStatus === "success"}
                    <div
                        class="text-center py-8 animate-in fade-in slide-in-from-bottom-4"
                    >
                        <div class="flex justify-center mb-4">
                            <div class="p-3 bg-green-500/20 rounded-full">
                                <Send class="w-8 h-8 text-green-400" />
                            </div>
                        </div>
                        <h3 class="text-lg font-semibold text-green-400">
                            Terkirim!
                        </h3>
                        <p class="text-sm text-gray-400 mt-2">
                            Terima kasih atas masukan anda.
                        </p>
                    </div>
                {:else}
                    <form onsubmit={handleSubmit} class="flex flex-col gap-4">
                        <!-- Name Input -->
                        <div class="space-y-1">
                            <label
                                for="name"
                                class="text-sm font-medium text-gray-300 ml-1"
                                >Nama (Opsional)</label
                            >
                            <input
                                type="text"
                                id="name"
                                bind:value={name}
                                placeholder="Nama anda"
                                class="w-full px-4 py-3 bg-black/30 border border-white/10 rounded-xl focus:border-brand-orange focus:ring-1 focus:ring-brand-orange outline-none transition-all placeholder:text-gray-600"
                            />
                        </div>

                        <!-- Feedback Input -->
                        <div class="space-y-1">
                            <label
                                for="feedback"
                                class="text-sm font-medium text-gray-300 ml-1"
                                >Deskripsi Masalah / Saran</label
                            >
                            <textarea
                                id="feedback"
                                bind:value={feedback}
                                placeholder="Jelaskan masalah atau saran anda..."
                                required
                                rows="4"
                                class="w-full px-4 py-3 bg-black/30 border border-white/10 rounded-xl focus:border-brand-orange focus:ring-1 focus:ring-brand-orange outline-none transition-all placeholder:text-gray-600 resize-none"
                            ></textarea>
                        </div>

                        {#if submitStatus === "error"}
                            <div
                                class="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-sm text-red-400 text-center"
                            >
                                {errorMessage}
                            </div>
                        {/if}

                        <button
                            type="submit"
                            disabled={isSubmitting || !feedback.trim()}
                            class="mt-2 w-full flex items-center justify-center gap-2 py-3 px-4 bg-brand-orange hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-all shadow-lg shadow-brand-orange/20 hover:shadow-brand-orange/40"
                        >
                            {#if isSubmitting}
                                <Loader2 class="w-5 h-5 animate-spin" />
                                <span>Mengirim...</span>
                            {:else}
                                <Send class="w-5 h-5" />
                                <span>Kirim Laporan</span>
                            {/if}
                        </button>
                    </form>
                {/if}
            </div>
        </div>
    </div>
{/if}

<style>
    /* Glass effect for close button */
    .glass {
        background: rgba(255, 255, 255, 0.05);
        backdrop-filter: blur(10px);
        border: 1px solid rgba(255, 255, 255, 0.1);
    }
</style>
