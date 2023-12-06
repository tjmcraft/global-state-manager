import { shallowEqual } from "Util/Iterates";
import { generateIdFor } from "Util/Random";
import { ActionOptions, ActionPayload, MapStateToProps } from "types";

interface StateStoreInterface<TState, ActionPayloads> {
	setState: (state?: Partial<TState>, options?: ActionOptions) => void;
	getState: <S = Partial<TState> | TState>(selector: (state: TState) => S) => S;
	addCallback: (cb: Function) => void;
	removeCallback: (cb: Function) => void;
	addReducer: (name: StateStore.StoreActionsName<ActionPayloads>, reducer: unknown) => void;
  removeReducer: (name: StateStore.StoreActionsName<ActionPayloads>, reducer: unknown) => void;
  getDispatch: () => StateStore.StoreActions<ActionPayloads>;
  withState: (selector: MapStateToProps, debug?: AnyLiteral | undefined) => (callback: Function) => (() => void) | undefined;
}

function StateStore<TState, ActionPayloads>(
	this: StateStoreInterface<TState, ActionPayloads>,
	initialState?: TState | undefined
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
	type ActionHandlers = {
		[ActionName in keyof ActionPayloads]: (
			global: TState,
      actions: Actions,
      payload: ActionPayloads[ActionName],
			) => TState | void | Promise<void>;
		};
	type Containers = Map<string, {
		selector: (state: TState, ownProps?: AnyLiteral) => Partial<TState>;
		ownProps?: AnyLiteral | undefined;
		mappedProps?: AnyLiteral | undefined;
		callback: Function;
		debug?: AnyLiteral | string;
	}>;

	let currentState: TState | undefined = initialState as TState | undefined;
	let reducers: ActionHandlers = {} as ActionHandlers;
	let actions: Actions = {} as Actions;
	let containers: Containers = new Map();

	this.setState = (state = {}, options = {}) => {
		if (typeof state === "object" && state !== currentState) {
			currentState = state as TState;
			if (options?.silent) return; // if silent -> no callbacks
			runCallbacks();
		}
	}

	this.getState = (selector) => selector(currentState as TState);

	const updateContainers = (currentState: TState) => {
		for (const container of containers.values()) {
			const { selector, ownProps, mappedProps, callback } = container;

			let newMappedProps;

			try {
				newMappedProps = selector(currentState, ownProps);
			} catch (err) {
				console.error(">> GSTATE", "CONTAINER\n", "UPDATE",
					"Чёт наебнулось, но всем как-то похуй, да?\n",
					"Может трейс глянешь хоть:\n", err);
				return;
			}

			if (Object.keys(newMappedProps).length && !shallowEqual(mappedProps, newMappedProps)) {
				container.mappedProps = newMappedProps;
				callback(container.mappedProps);
			}
		}
	};

	const callbacks: Function[] = [updateContainers];
	const addCallback = (cb: Function) => {
		if (typeof cb === "function") {
			callbacks.push(cb);
		}
	};
	const removeCallback = (cb: Function) => {
		const index = callbacks.indexOf(cb);
		if (index !== -1) {
			callbacks.splice(index, 1);
		}
	};
	const runCallbacks = () => {
		//console.debug("run callbacks", callbacks)
		callbacks.forEach((cb) => typeof cb === "function" ? cb(currentState) : null);
	};

};

export class StateStore0<TState extends AnyLiteral, ActionPayloads> {

	private currentState: TState = {} as TState;

	private reducers: Record<StateStore.StoreActionsName<ActionPayloads>, StateStore.StoreActionHandler<TState, StateStore.StoreActions<ActionPayloads>, any>[]> =
		{} as Record<StateStore.StoreActionsName<ActionPayloads>, StateStore.StoreActionHandler<TState, StateStore.StoreActions<ActionPayloads>, any>[]>;
	private actions: StateStore.StoreActions<ActionPayloads> = {} as StateStore.StoreActions<ActionPayloads>;

	private containers: Map<string, {
		selector: MapStateToProps<AnyLiteral>;
		ownProps?: AnyLiteral;
		mappedProps?: AnyLiteral;
		callback: Function;
		debug?: AnyLiteral | string;
	}> = new Map();

	setState = (state: Partial<TState> = {}, options: ActionOptions = {}) => {
		if (typeof state === "object" && state !== this.currentState) {
			this.currentState = state as TState;
			if (options?.silent) return; // if silent -> no callbacks
			this.runCallbacks();
		}
	};

	getState = <T extends TState,S = Partial<TState>>(selector: (state: T) => S): S => selector(this.currentState as T);

	private updateContainers = (currentState: TState) => {
		for (const container of this.containers.values()) {
			const { selector, ownProps, mappedProps, callback } = container;

			let newMappedProps;

			try {
				newMappedProps = selector(currentState, ownProps);
			} catch (err) {
				console.error(">> GSTATE", "CONTAINER\n", "UPDATE",
					"Чёт наебнулось, но всем как-то похуй, да?\n",
					"Может трейс глянешь хоть:\n", err);
				return;
			}

			if (Object.keys(newMappedProps).length && !shallowEqual(mappedProps, newMappedProps)) {
				container.mappedProps = newMappedProps;
				callback(container.mappedProps);
			}
		}
	}

	private callbacks: Function[] = [this.updateContainers];

	addCallback = (cb: Function) => {
		if (typeof cb === "function") {
			this.callbacks.push(cb);
		}
	};

	removeCallback = (cb: Function) => {
		const index = this.callbacks.indexOf(cb);
		if (index !== -1) {
			this.callbacks.splice(index, 1);
		}
	};

	private runCallbacks = () => {
		//console.debug("run callbacks", callbacks)
		this.callbacks.forEach((cb) => typeof cb === "function" ? cb(this.currentState) : null);
	};

	private onDispatch = (name: StateStore.StoreActionsName<ActionPayloads>, payload?: ActionPayload, options?: ActionOptions) => {
		if (this.reducers[name]) { // if reducers for this name exists
			this.reducers[name].forEach((reducer) => {
				const response = reducer(this.currentState, this.actions, payload);
				if (!response || typeof response.then === "function") {
					return response;
				}
				this.setState(response as TState, options);
			});
		}
	};

	addReducer = (name: StateStore.StoreActionsName<ActionPayloads>, reducer: StateStore.StoreActionHandler<TState,StateStore.StoreActions<ActionPayloads>,any>) => {
		if (!this.reducers[name]) { // if no reducers for this name
			this.reducers[name] = []; // create empty
			this.actions[name] = (payload?: ActionPayload, options?: ActionOptions) => // add dispatch action
				this.onDispatch(name, payload, options);
		}
		this.reducers[name].push(reducer);
	};

	removeReducer = (name: StateStore.StoreActionsName<ActionPayloads>, reducer: StateStore.StoreActionHandler<TState,StateStore.StoreActions<ActionPayloads>,any>) => {
		if (!this.reducers[name]) return;
		const index = this.reducers[name].indexOf(reducer);
		if (index !== -1) {
			this.reducers[name].splice(index, 1);
		}
	};

	getDispatch = () => this.actions;

	withState = (
		selector: MapStateToProps,
		debug?: AnyLiteral | undefined
	) => {
		return (callback: Function) => {
			const id = generateIdFor(this.containers);
			let container = this.containers.get(id);
			if (!container) {
				container = {
					selector,
					callback,
					mappedProps: undefined,
					debug: debug || id,
				};
				this.containers.set(id, container);
			}
			if (!container.mappedProps) {
				try {
					container.mappedProps = selector(this.currentState);
				} catch (err) {
					console.error(">> GSTATE", "CONTAINER\n", "INITIAL UPDATE",
						"Чёт наебнулось в первый раз, но всем как-то похуй, да?\n",
						"Может трейс глянешь хоть:\n", err);
					return;
				}
			}
			callback(container.mappedProps);
			return () => {
				console.debug("[withState]", "{GC}", "container", "->", id);
				this.containers.delete(id);
			};
		};
	};

}

module StateStore {
	export type StoreActionsName<Payloads> = keyof Payloads;
	export type StoreActions<Payloads = Record<string, any>> = {
		[ActionName in keyof Payloads]:
		(undefined extends Payloads[ActionName] ? (
			(payload?: Payloads[ActionName], options?: ActionOptions) => void
		) : (
				(payload: Payloads[ActionName], options?: ActionOptions) => void
			))
	};
	export type StoreActionHandler<TState,SActions,APayload> = (
		global: TState,
		actions: SActions,
		payload: APayload,
	) => TState | void | Promise<void>;
}