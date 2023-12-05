import { throttle } from "Util/Schedules";
import { pick } from "Util/Iterates";
import { StateStore } from "StateStore";
import { GlobalState, Storage } from "types";

export const StoreCaching = <T extends AnyLiteral>(
	store: StateStore,
	initialState: T,
	cachingKeys: Array<keyof T>,
	storage: Storage,
	cache_key: string = "tjmc.global.state"
) => {

	if (typeof store != "object" || !(store instanceof StateStore)) throw new Error("Caching store in not instance of StateStore");

	const STATE_CACHE_KEY = cache_key;
	const INITIAL_STATE = initialState;
	const UPDATE_THROTTLE = 500;

	const updateCacheThrottled = throttle(() => updateCache(), UPDATE_THROTTLE, false);
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

	const loadCache = async (initialState: GlobalState) => {
		setupCaching();
		return await readCache(initialState);
	};

	const readCache = async (initialState: GlobalState) => {
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
		const global = store.getState(e => e);
		const reducedGlobal = {
			...INITIAL_STATE,
			...pick(global, cachingKeys as string[])
		};
		try {
			const json = JSON.stringify(reducedGlobal);
			storage.setItem(STATE_CACHE_KEY, json);
		} catch (e) {
			console.warn(e, reducedGlobal);
		}
	};

	return { loadCache, resetCache };

};