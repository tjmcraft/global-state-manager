import { StateStore } from 'global-state-manager';
import type { ActionNames, Actions } from 'global-state-manager';

export type GlobalState = {
	count: number
}

const INITIAL_STATE: GlobalState = { count: 0 };



type ActionHandler = (
  global: GlobalState,
  actions: Actions,
  payload: any,
) => GlobalState | void | Promise<void>;

export type MapStateToProps<T extends AnyFunction, OwnProps = AnyLiteral> =
	(global: GlobalState, ownProps?: OwnProps) => ReturnType<T>;



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

export const getDispatch = stateStore.getDispatch;
export const getState =
	<T extends MapStateToProps<T>>(selector: T): ReturnType<T> => stateStore.getState(selector);
export const setState = stateStore.setState;
export const withState = stateStore.withState;
export const addReducer: (name: ActionNames, reducer: ActionHandler) => void =
	(...args) => stateStore.addReducer(...args);
export const removeReducer: (name: ActionNames, reducer: ActionHandler) => void =
	(...args) => stateStore.removeReducer(...args);
export const addCallback = stateStore.addCallback;
export const removeCallback = stateStore.removeCallback;