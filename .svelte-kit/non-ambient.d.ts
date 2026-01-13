
// this file is generated — do not edit it


declare module "svelte/elements" {
	export interface HTMLAttributes<T> {
		'data-sveltekit-keepfocus'?: true | '' | 'off' | undefined | null;
		'data-sveltekit-noscroll'?: true | '' | 'off' | undefined | null;
		'data-sveltekit-preload-code'?:
			| true
			| ''
			| 'eager'
			| 'viewport'
			| 'hover'
			| 'tap'
			| 'off'
			| undefined
			| null;
		'data-sveltekit-preload-data'?: true | '' | 'hover' | 'tap' | 'off' | undefined | null;
		'data-sveltekit-reload'?: true | '' | 'off' | undefined | null;
		'data-sveltekit-replacestate'?: true | '' | 'off' | undefined | null;
	}
}

export {};


declare module "$app/types" {
	export interface AppTypes {
		RouteId(): "/" | "/api" | "/api/health" | "/api/proxy" | "/api/proxy/[...path]" | "/category" | "/category/[type]" | "/detail" | "/detail/[id]" | "/favorites" | "/search" | "/watch" | "/watch/[id]";
		RouteParams(): {
			"/api/proxy/[...path]": { path: string };
			"/category/[type]": { type: string };
			"/detail/[id]": { id: string };
			"/watch/[id]": { id: string }
		};
		LayoutParams(): {
			"/": { path?: string; type?: string; id?: string };
			"/api": { path?: string };
			"/api/health": Record<string, never>;
			"/api/proxy": { path?: string };
			"/api/proxy/[...path]": { path: string };
			"/category": { type?: string };
			"/category/[type]": { type: string };
			"/detail": { id?: string };
			"/detail/[id]": { id: string };
			"/favorites": Record<string, never>;
			"/search": Record<string, never>;
			"/watch": { id?: string };
			"/watch/[id]": { id: string }
		};
		Pathname(): "/" | "/api" | "/api/" | "/api/health" | "/api/health/" | "/api/proxy" | "/api/proxy/" | `/api/proxy/${string}` & {} | `/api/proxy/${string}/` & {} | "/category" | "/category/" | `/category/${string}` & {} | `/category/${string}/` & {} | "/detail" | "/detail/" | `/detail/${string}` & {} | `/detail/${string}/` & {} | "/favorites" | "/favorites/" | "/search" | "/search/" | "/watch" | "/watch/" | `/watch/${string}` & {} | `/watch/${string}/` & {};
		ResolvedPathname(): `${"" | `/${string}`}${ReturnType<AppTypes['Pathname']>}`;
		Asset(): "/qrcode_sds.png" | "/README.md" | string & {};
	}
}