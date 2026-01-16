
import type { LayoutServerLoad } from './$types';
import { env } from '$env/dynamic/private';

export const load: LayoutServerLoad = async () => {
    return {
        turnstileSiteKey: env.TURNSTILE_SITE_KEY
    };
};
