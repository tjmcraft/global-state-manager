import React, { useCallback, useEffect, useMemo, useRef } from "react";
import { shallowEqual, stacksDiff, stacksEqual } from "../Util/Iterates";
import { randomString } from "../Util/Random";

import type { PickOptions } from "../types";
import useForceUpdate from "./useForceUpdate";
import useGsmContext from "./useGsmContext";

const updateContainer = <T, S>(selector: (state: T) => S, callback: Function, options: PickOptions) => {
	return (global: T): S =>
		callback((prevState: T) => {

			let nextState;
			try {
				nextState = selector(global as T);
			} catch (err) {
				return;
			}

			if (nextState != void 0) {

				const isArray = Array.isArray(prevState) || Array.isArray(nextState);
				const shouldUpdate = isArray ?
					!stacksEqual(prevState as Array<any>, nextState as Array<any>) :
					!shallowEqual(prevState, nextState);

				if (options.debugPicker) {
					// prettier-ignore
					console.debug(
						"[picker]", "->", options.label,
						"\n", "state", "=>", "picking",
						"\n", "next", "=>", nextState,
						...(isArray ? (
							[
								"\n", "stacksEqual", "=>", stacksEqual(prevState as Array<any>, nextState as Array<any>),
								"\n", "stacksDiff", "=>", stacksDiff(prevState as Array<any>, nextState as Array<any>),
								"\n", "current", "=>", prevState,
								"\n", "next", "=>", nextState,
								"\n", "result", "=>", shouldUpdate,
							]
						) : [])
					);
				}

				if (
					// !arePropsShallowEqual(prevState, nextState)
					shouldUpdate
				) {
					if (options.debugPicked) {
						// prettier-ignore
						console.debug(
							"[picker]", "->", options.label,
							"\n", "state", "=>", "picked!",
							"\n", "next", "=>", nextState,
						);
					}
					return nextState;
				}
			}
			return prevState;
		});
};

const useGlobal = <TState = AnyLiteral, Selected = Partial<TState>>(
	selector: (state: TState) => Selected,
	inputs: React.DependencyList = [],
	options: PickOptions = {}
): Selected => {

	const { store } = useGsmContext();

	options = useMemo(() => Object.assign({ debugPicker: false, debugPicked: false, label: randomString(5) }, options), [options]);

	const forceUpdate = useForceUpdate();
	const mappedProps = useRef<ReturnType<typeof selector>>();
	const picker = useCallback(selector, [selector, ...inputs]);

	useMemo(() => {
		let nextState;
		try {
			nextState = store.getState(picker);
		} catch (e) {
			return undefined;
		}
		mappedProps.current = nextState;
	}, [picker]);

	useEffect(() => {
		const updateCallback = (next: AnyFunction | AnyLiteral) => {
			let nextState;
			try {
				if (typeof next == 'function') {
					nextState = next(mappedProps.current);
				} else {
					nextState = next;
				}
			} catch (e) {
				return undefined;
			}
			if (nextState != mappedProps.current) {
				mappedProps.current = nextState;
				void forceUpdate(bool => !bool);
			}
		};
		const callback = updateContainer<TState, Selected>(picker, updateCallback, options);
		store.addCallback(callback);
		return () => store.removeCallback(callback);
	}, [forceUpdate, picker, options]);

	return mappedProps.current as Selected;
};

export default useGlobal;