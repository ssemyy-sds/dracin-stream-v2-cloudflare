export const manifest = (() => {
function __memo(fn) {
	let value;
	return () => value ??= (value = fn());
}

return {
	appDir: "_app",
	appPath: "_app",
	assets: new Set(["qrcode_sds.png","README.md"]),
	mimeTypes: {".png":"image/png",".md":"text/markdown"},
	_: {
		client: {start:"_app/immutable/entry/start.BFj_gZyu.js",app:"_app/immutable/entry/app.BX7H2_cT.js",imports:["_app/immutable/entry/start.BFj_gZyu.js","_app/immutable/chunks/DZxOtlE5.js","_app/immutable/chunks/vbZyT464.js","_app/immutable/chunks/QNYzxUZg.js","_app/immutable/entry/app.BX7H2_cT.js","_app/immutable/chunks/vbZyT464.js","_app/immutable/chunks/8_rKqoti.js","_app/immutable/chunks/QNYzxUZg.js","_app/immutable/chunks/Dyc3H2TI.js","_app/immutable/chunks/dYPENA2-.js","_app/immutable/chunks/DdS--3oo.js"],stylesheets:[],fonts:[],uses_env_dynamic_public:false},
		nodes: [
			__memo(() => import('./nodes/0.js')),
			__memo(() => import('./nodes/1.js')),
			__memo(() => import('./nodes/2.js')),
			__memo(() => import('./nodes/3.js')),
			__memo(() => import('./nodes/4.js')),
			__memo(() => import('./nodes/5.js')),
			__memo(() => import('./nodes/6.js')),
			__memo(() => import('./nodes/7.js'))
		],
		remotes: {
			
		},
		routes: [
			{
				id: "/",
				pattern: /^\/$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 2 },
				endpoint: null
			},
			{
				id: "/api/health",
				pattern: /^\/api\/health\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('./entries/endpoints/api/health/_server.ts.js'))
			},
			{
				id: "/api/proxy/[...path]",
				pattern: /^\/api\/proxy(?:\/([^]*))?\/?$/,
				params: [{"name":"path","optional":false,"rest":true,"chained":true}],
				page: null,
				endpoint: __memo(() => import('./entries/endpoints/api/proxy/_...path_/_server.ts.js'))
			},
			{
				id: "/category/[type]",
				pattern: /^\/category\/([^/]+?)\/?$/,
				params: [{"name":"type","optional":false,"rest":false,"chained":false}],
				page: { layouts: [0,], errors: [1,], leaf: 3 },
				endpoint: null
			},
			{
				id: "/detail/[id]",
				pattern: /^\/detail\/([^/]+?)\/?$/,
				params: [{"name":"id","optional":false,"rest":false,"chained":false}],
				page: { layouts: [0,], errors: [1,], leaf: 4 },
				endpoint: null
			},
			{
				id: "/favorites",
				pattern: /^\/favorites\/?$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 5 },
				endpoint: null
			},
			{
				id: "/search",
				pattern: /^\/search\/?$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 6 },
				endpoint: null
			},
			{
				id: "/watch/[id]",
				pattern: /^\/watch\/([^/]+?)\/?$/,
				params: [{"name":"id","optional":false,"rest":false,"chained":false}],
				page: { layouts: [0,], errors: [1,], leaf: 7 },
				endpoint: null
			}
		],
		prerendered_routes: new Set([]),
		matchers: async () => {
			
			return {  };
		},
		server_assets: {}
	}
}
})();
