import { shallowEqual } from "./Util/Iterates";
import { generateIdFor } from "./Util/Random";
import { throttleWithTickEnd } from "./Util/Schedules";
import { ActionOptions } from "./types";

export default function StateStore<TState = AnyLiteral, ActionPayloads = Record<string, any>>(
	initialState?: TState | undefined,
	debugMode?: boolean,
) {

	type ActionNames = keyof ActionPayloads;
	type Actions = {
		[ActionName in ActionNames]:
		(undefined extends ActionPayloads[ActionName] ? (
			(payload?: ActionPayloads[ActionName], options?: ActionOptions) => void
		) : (
				(payload: ActionPayloads[ActionName], options?: ActionOptions) => void
			))
	};
	type ActionPayload<ActionName extends ActionNames> = ActionPayloads[ActionName];
	type ActionHandler<ActionName extends ActionNames> = (
		global: TState,
		actions: Actions,
		payload: ActionPayload<ActionName>,
	) => TState | void | Promise<void>;
	type ActionHandlers = {
		[ActionName in ActionNames]: ActionHandler<ActionName>[];
	};

	type Container = {
		selector: (state: TState, ownProps?: AnyLiteral) => Partial<TState>;
		ownProps?: AnyLiteral | undefined;
		mappedProps?: AnyLiteral | undefined;
		callback: (mappedProps: AnyLiteral, reason?: string) => void;
		debug?: AnyLiteral | string;
	};
	type Containers = Map<string, Container>;

	let currentState: TState | undefined = initialState;
	let reducers: ActionHandlers = {} as ActionHandlers;
	let actions: Actions = {} as Actions;
	let containers: Containers = new Map();

	const setState: (state: TState, options?: ActionOptions) => TState = (state, options) => {
		if (typeof state === "object" && state !== currentState) {
			currentState = state;
			debugMode && console.debug("[StateStore]", "[setState]", "\noptions:", options, "\nstate:", state);
			if (!options?.silent) { // if silent -> no callbacks
				if (options?.forceSync) {
					runCallbacks(options?.reason);
				} else {
					runCallbacksThrottled(options?.reason);
				}
			}
		}
		return currentState as TState;
	}

	function getState<S = Partial<TState>>(selector: (state: TState) => S): S;
	function getState(selector?: undefined): TState;
	function getState<S = Partial<TState>>(selector?: (state: TState) => S): S | TState {
		return selector ? selector(currentState as TState) : currentState as TState;
	}

	const updateContainers = (currentState: TState, reason?: string) => {
		for (const container of containers.values()) {
			const { selector, ownProps, mappedProps, callback } = container;

			let newMappedProps;

			try {
				newMappedProps = selector(currentState, ownProps);
			} catch (err) {
				debugMode && console.error(">> GSTATE", "CONTAINER\n", "UPDATE",
					"Чёт наебнулось, но всем как-то похуй, да?\n",
					"Может трейс глянешь хоть:\n", err);
				return;
			}

			if (Object.keys(newMappedProps).length && !shallowEqual(mappedProps, newMappedProps)) {
				container.mappedProps = newMappedProps;
				callback(container.mappedProps, reason); // pass reason of update
			}
		}
	};


	type StoreCallback = (global: TState, reason?: string) => void;

	const callbacks: StoreCallback[] = [updateContainers];
	const addCallback = (cb: StoreCallback) => {
		if (typeof cb === "function") {
			callbacks.push(cb);
		}
	};
	const removeCallback = (cb: StoreCallback) => {
		const index = callbacks.indexOf(cb);
		if (index !== -1) {
			callbacks.splice(index, 1);
		}
	};
	const runCallbacks = (reason?: string) => {
		reason = reason || '@ss_no_reason';
		callbacks.forEach((cb) => cb(currentState as TState, reason)); // skip check cause we already checked while adding it
	};

	const runCallbacksThrottled = throttleWithTickEnd(runCallbacks);



	const onDispatch = <T extends ActionNames>(name: T, payload?: ActionPayload<T>, options?: ActionOptions) => {
		if (Array.isArray(reducers[name])) { // if reducers for this name exists
			reducers[name].forEach((reducer) => {
				const response = reducer(currentState as TState, actions, payload as ActionPayload<T>);
				if (!response || typeof (response as Promise<void>).then === "function") {
					return response;
				}
				options = {
					...options,
					reason: '@dispatch:' + name.toString() + (options?.reason ? ('->' + options?.reason) : ''),
				};
				setState(response as TState, options);
			});
		}
	};

	const addReducer = <T extends ActionNames>(name: T, reducer: ActionHandler<T>) => {
		if (!reducers[name]) { // if no reducers for this name
			reducers[name] = [];
			actions[name] = (payload?: ActionPayload<T>, options?: ActionOptions) => // add dispatch action
				onDispatch(name, payload, options);
		}
		reducers[name].push(reducer);
	};

	const removeReducer: (name: keyof ActionPayloads, reducer: AnyFunction) => void = (name, reducer) => {
		if (!reducers[name]) return;
		const index = reducers[name].indexOf(reducer);
		if (index !== -1) {
			reducers[name].splice(index, 1);
		}
	};

	const getDispatch = () => actions as Actions;


	const withState = (
		selector: (state: TState, ownProps?: AnyLiteral) => Partial<TState>,
		debug?: AnyLiteral | undefined
	) => {
		return (callback: Container['callback']) => {
			const id = generateIdFor(containers);
			let container = containers.get(id);
			if (!container) {
				container = {
					selector,
					callback,
					mappedProps: undefined,
					debug: debug || id,
				};
				containers.set(id, container);
			}
			if (!container.mappedProps) {
				try {
					container.mappedProps = selector(currentState as TState);
				} catch (err) {
					debug && console.error(">> GSTATE", "CONTAINER\n", "INITIAL UPDATE",
						"Чёт наебнулось в первый раз, но всем как-то похуй, да?\n",
						"Может трейс глянешь хоть:\n", err);
					return;
				}
			}
			callback(container.mappedProps, '@initial_update');
			return () => {
				debug && console.debug("[withState]", "{GC}", "container", "->", id);
				containers.delete(id);
			};
		};
	};

	return {
		setState,
		getState,
		addCallback,
		removeCallback,
		addReducer,
		removeReducer,
		getDispatch,
		withState,
	};
};

export type Store<T, A> = ReturnType<typeof StateStore<T, A>>;