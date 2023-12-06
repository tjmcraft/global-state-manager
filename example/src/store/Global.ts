import { StateStore, useGlobal } from 'global-state-manager';
import type { ActionNames, ActionOptions, Actions } from 'global-state-manager';

export type GlobalState = {
	count: number
}

export interface ActionPayloads {
	init: undefined;
};

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

interface TypedGetDispatch<Payloads> {
	(): {
		[ActionName in keyof Payloads]:
		(undefined extends Payloads[ActionName] ? (
			(payload?: Payloads[ActionName], options?: ActionOptions) => void
		) : (
			(payload: Payloads[ActionName], options?: ActionOptions) => void
		))
	}
}

export interface TypedUseSelectorHook<TState> {
  <TSelected>(
    selector: (state: TState) => TSelected,
  ): TSelected
}

export const useAppGlobal: TypedUseSelectorHook<GlobalState> = useGlobal;

export const getDispatch: TypedGetDispatch<ActionPayloads> = stateStore.getDispatch;
export const getState = stateStore.getState;
export const setState = stateStore.setState;
export const withState = stateStore.withState;
export const addReducer = stateStore.addReducer;
export const removeReducer = stateStore.removeReducer;
export const addCallback = stateStore.addCallback;
export const removeCallback = stateStore.removeCallback;