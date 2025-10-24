import React, { useCallback, useEffect, useMemo, useState } from "react";
import { shallowEqual, stacksDiff, stacksEqual } from "../Util/Iterates";
import { randomString } from "../Util/Random";

import type { PickOptions, TypedUseSelectorHook } from "../types";
import useGsmContext from "./useGsmContext";

const updateContainer = <T, S>(
	selector: (state: T) => S,
	updateCallback: Function,
	options: PickOptions
) => {
	return (global: T, reason?: string): S =>
		updateCallback((prevState: T) => {
			let nextState;
			try {
				nextState = selector(global as T);
			} catch (err) {
				console.error("[GSM]", `useGlobal on ${options.label}\n`, "next selector thrown an error\n", err);
				return prevState;
			}

			if (global !== undefined) {
				const isArray = Array.isArray(prevState) || Array.isArray(nextState);
				const shouldUpdate = isArray ?
					!stacksEqual(prevState as Array<any>, nextState as Array<any>) :
					!shallowEqual(prevState, nextState);

				if (options.debugCallbackPicker) {
					// prettier-ignore
					console.debug(
						"[GSM]", `useGlobal on ${options.label}\n`, "next selector is picking",
						"\n", "reason", "=>", reason,
						"\n", "current", "=>", prevState,
						"\n", "next", "=>", nextState,
						"\n", "result", "=>", shouldUpdate,
						...(isArray ? (
							[
								"\n", "stacksEqual", "=>", stacksEqual(prevState as Array<any>, nextState as Array<any>),
								"\n", "stacksDiff", "=>", stacksDiff(prevState as Array<any>, nextState as Array<any>),
							]
						) : [])
					);
				}

				if (
					// !arePropsShallowEqual(prevState, nextState)
					shouldUpdate
				) {
					return nextState;
				}
			}
			return prevState;
		});
};

const useGlobal: TypedUseSelectorHook<AnyLiteral> = <TState = AnyLiteral, Selected = Partial<TState>>(
	selector: (state: TState) => Selected,
	inputs: React.DependencyList = [],
	options: PickOptions = {}
): Selected => {

	const { store } = useGsmContext();

	options = useMemo(() => Object.assign<PickOptions, PickOptions>({
		debugInitialPicker: false,
		debugCallbackPicker: false,
		label: randomString(5),
	}, options), [options]);

	const picker = useCallback(selector, [...inputs]);

	const computeMappedProps: () => Selected = () => {
		try {
			options.debugInitialPicker &&
				console.debug("[GSM]", `useGlobal on ${options.label}\n`, "initial selector is started picking");
			const nextState = picker(store.getState());
			options.debugInitialPicker &&
				console.debug("[GSM]", `useGlobal on ${options.label}\n`, "initial selector is picked\n", { nextState });
			return nextState;
		} catch (err) {
			console.error("[GSM]", `useGlobal on ${options.label}\n`, "initial selector thrown an error\n", err);
			return mappedProps;
		}
	};

	const [mappedProps, setMappedProps] = useState(() => computeMappedProps());

	useEffect(() => { // force update on inputs or selector update
		setMappedProps(computeMappedProps());
	}, [picker]);

	const updateCallback = useCallback((next: AnyFunction | AnyLiteral) =>
		setMappedProps((prev) => {
			const nextState = typeof next === 'function' ? next(prev) : next;
      return nextState !== prev ? nextState : prev;
		})
	, []);

	const storeCallback = useCallback(
		updateContainer<TState, Selected>(picker, updateCallback, options),
		[updateCallback, picker]
	);

	useEffect(() => {
		store.addCallback(storeCallback);
		return () => store.removeCallback(storeCallback);
	}, [storeCallback]);

	return mappedProps as Selected;
};

export default useGlobal;