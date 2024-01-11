import { throttle } from "./Util/Schedules";
import { Store } from "./StateStore";

import { Storage } from "./types";

export const StoreCaching = <T, A>(
	store: Store<T, A>,
	storage: Storage,
	cache_key: string = "tjmc.global.state",
	reduceGlobal: (global: T) => Partial<T> | AnyLiteral,
	shouldRunFirst: boolean = false,
) => {

	if (typeof store != "object") throw new Error("Caching store in not instance of StateStore");

	const STATE_CACHE_KEY = cache_key;
	const UPDATE_THROTTLE = 500;

	const updateCacheThrottled = throttle(() => updateCache(), UPDATE_THROTTLE, shouldRunFirst);
	let isCaching = true;

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
		const newState = {
			...initialState,
			...cached,
		};
		return {
			...newState
		};
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