import { StateStore, useGlobal } from 'global-state-manager';
import type { ActionNames, Actions } from 'global-state-manager';

export type GlobalState = {
	count: number
}

const INITIAL_STATE: GlobalState = { count: 0 };

export const stateStore = new StateStore();

stateStore.addReducer("init", () => {
	const initial = Object.assign({}, INITIAL_STATE);
	const state = initial;
	return state;
});

stateStore.addReducer("setCount", (global, _actions, payload) => {
	return {
		...global,
		count: payload,
	};
});

export interface TypedUseSelectorHook<TState> {
  <TSelected>(
    selector: (state: TState) => TSelected,
  ): TSelected
}

export const useAppGlobal: TypedUseSelectorHook<GlobalState> = useGlobal;

export const getDispatch = stateStore.getDispatch;
export const getState = stateStore.getState;
export const setState = stateStore.setState;
export const withState = stateStore.withState;
export const addReducer = stateStore.addReducer;
export const removeReducer = stateStore.removeReducer;
export const addCallback = stateStore.addCallback;
export const removeCallback = stateStore.removeCallback;