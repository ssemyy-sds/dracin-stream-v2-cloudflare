import adapter from '@sveltejs/adapter-cloudflare';
import autoAdapter from '@sveltejs/adapter-auto';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
    preprocess: vitePreprocess(),

    kit: {
        adapter: process.env.NODE_ENV === 'development' ? autoAdapter() : adapter()
    }
};

export default config;
