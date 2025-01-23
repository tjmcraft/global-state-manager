import { throttle } from "./Util/Schedules";
import { Store } from "./StateStore";

import { CachingOptions, Storage } from "./types";
import { validateKeySet } from "./Util/Iterates";

export const StoreCaching = <T extends AnyLiteral, A extends AnyLiteral>(
	store: Store<T, A>,
	storage: Storage,
	cache_key: string = "tjmc.global.state",
	reduceGlobal: (global: T) => Partial<T> | AnyLiteral,
	options?: Partial<CachingOptions>
) => {

	if (typeof store != "object") throw new Error("Caching store in not instance of StateStore");

	const opts: CachingOptions = Object.assign<CachingOptions, Partial<CachingOptions>>({
		shouldRunFirstUpdateCacheThrottle: false,
		updateCacheThrottle: 500,
		skipValidateKeySetOnReadCache: false,
	}, options || {});

	const STATE_CACHE_KEY = cache_key;

	const updateCacheThrottled = throttle(() => updateCache(), opts.updateCacheThrottle, opts.shouldRunFirstUpdateCacheThrottle);
	let isCaching = false;

	const setupCaching = () => {
		isCaching = true;
		store.addCallback(updateCacheThrottled);
	};

	const clearCaching = () => {
		isCaching = false;
		store.removeCallback(updateCacheThrottled);
	};

	const resetCache = async () => {
		await storage.removeItem(STATE_CACHE_KEY);
		if (!isCaching) return;
		clearCaching();
	};

	const loadCache = async (initialState: T) => {
		setupCaching();
		return await readCache(initialState);
	};

	const readCache = async (initialState: T) => {
		const json = await storage.getItem(STATE_CACHE_KEY);
		const cached = json ? JSON.parse(json) : undefined;
		const newState = opts.skipValidateKeySetOnReadCache ?
			Object.assign(initialState, cached) :
			validateKeySet<T, Partial<T>>(initialState, cached);
		return { ...newState };
	};

	const updateCache = () => {
		if (!isCaching) {
			return;
		}
		let reducedGlobal = {};
		try {
			const global = store.getState(e => e);
			reducedGlobal = reduceGlobal(global);
		} catch (e) {
			console.warn("[StoreCaching]", e, reducedGlobal);
		}
		try {
			const json = JSON.stringify(reducedGlobal);
			storage.setItem(STATE_CACHE_KEY, json);
		} catch (e) {
			console.warn("[StoreCaching]", e, reducedGlobal);
		}
	};

	return { loadCache, resetCache };

};