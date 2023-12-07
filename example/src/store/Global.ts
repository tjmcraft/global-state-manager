import { StateStore, TypedUseSelectorHook, useGlobal } from 'global-state-manager';

export type GlobalState = {
	count: number
}

export interface ActionPayloads {
	init: undefined;
	setCount: number;
};

const INITIAL_STATE: GlobalState = { count: 0 };

export const stateStore = StateStore<GlobalState, ActionPayloads>();

stateStore.addReducer("init", () => {
	return Object.assign({}, INITIAL_STATE);
});

stateStore.addReducer("setCount", (global, _actions, payload) => {
	return {
		...global,
		count: payload,
	};
});

export const useAppGlobal: TypedUseSelectorHook<GlobalState> = useGlobal;

export const getDispatch = stateStore.getDispatch;
export const getState = stateStore.getState;
export const setState = stateStore.setState;
export const withState = stateStore.withState;
export const addReducer = stateStore.addReducer;
export const removeReducer = stateStore.removeReducer;
export const addCallback = stateStore.addCallback;
export const removeCallback = stateStore.removeCallback;