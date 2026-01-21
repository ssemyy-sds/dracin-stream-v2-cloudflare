import type { Handle } from '@sveltejs/kit';

export const handle: Handle = async ({ event, resolve }) => {
    const mode = event.cookies.get('contentMode');
    const drakorEnabled = event.platform?.env?.DRAKOR_ENABLED === 'true';

    // Redirect to /drakor if:
    // 1. Drakor mode is enabled via env var
    // 2. User is visiting the root path (/)
    // 3. User has explicitly selected 'drakor' preference
    if (drakorEnabled && event.url.pathname === '/' && mode === 'drakor') {
        return Response.redirect(new URL('/drakor', event.url), 302);
    }

    return resolve(event);
};
