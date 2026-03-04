import React, { useCallback, useMemo, useRef, useSyncExternalStore } from "react";
import { shallowEqual, stacksEqual } from "../Util/Iterates";
import { randomString } from "../Util/Random";

import type { PickOptions, TypedUseSelectorHook } from "../types";
import useGsmContext from "./useGsmContext";

const useGlobal: TypedUseSelectorHook<AnyLiteral> = <TState = AnyLiteral, Selected = Partial<TState>>(
	selector: (state: TState) => Selected,
	inputs: React.DependencyList = [],
	options: Partial<PickOptions> = {}
): Selected => {

	const { store } = useGsmContext();

	const normalizedOptions = useMemo(() => Object.assign<PickOptions, Partial<PickOptions>>({
		debugSnapshotPicker: false,
		debugSnapshotSkip: false,
		label: randomString(5),
	}, options), [options]);

	const debugSnapshotPicker = normalizedOptions.debugSnapshotPicker;
	const debugSnapshotSkip = normalizedOptions.debugSnapshotSkip;
	const anyDebugEnabled = debugSnapshotPicker || debugSnapshotSkip;

	const reasonRef = useRef<string | undefined>("@useGlobal_initial_snapshot");
	const inputsRef = useRef(inputs);
	inputsRef.current = inputs;
	const lastRef = useRef<{
		state: TState;
		inputs: React.DependencyList;
		selected: Selected;
	}>();

	const getSnapshot = useCallback(() => {
		const state = store.getState();
		const prev = lastRef.current;
		const currentInputs = inputsRef.current;
		const shouldResolveReason = debugSnapshotPicker;
		const hasInputsChanged = shouldResolveReason && !!prev
			? !stacksEqual(prev.inputs as Array<any>, currentInputs as Array<any>)
			: false;
		const reason = shouldResolveReason
			? (hasInputsChanged ? "@useGlobal_inputs_changed" : (reasonRef.current || "@useGlobal_snapshot"))
			: undefined;

		if (
			prev &&
			prev.state === state &&
			stacksEqual(prev.inputs as Array<any>, currentInputs as Array<any>)
		) {
			if (debugSnapshotSkip) {
				console.debug(
					"[GSM]", `useGlobal on ${normalizedOptions.label}\n`,
					"skipping snapshot on same state and inputs",
				);
			}
			return prev.selected;
		}

		if (debugSnapshotPicker) {
			console.debug("[GSM]", `useGlobal on ${normalizedOptions.label}\n`, "snapshot is picking");
		}

		let nextSelected: Selected;
		try {
			nextSelected = selector(state);
		} catch (err) {
			console.error("[GSM]", `useGlobal on ${normalizedOptions.label}\n`, "selector thrown an error\n", err);
			return prev?.selected as Selected;
		}

		const shouldSkipUpdate = prev && shallowEqual(prev.selected, nextSelected);
		if (debugSnapshotPicker) {
			console.debug(
				"[GSM]", `useGlobal on ${normalizedOptions.label}\n`, "snapshot is picked, equaling..",
				"\n", "call_reason", "=>", reason,
				"\n", "current_state", "=>", prev?.selected,
				"\n", "next_state", "=>", nextSelected,
				"\n", "shouldUpdate", "=>", !shouldSkipUpdate,
			);
		}
		if (shouldSkipUpdate) return prev.selected;

		lastRef.current = {
			state,
			inputs: [...currentInputs],
			selected: nextSelected,
		};

		if (debugSnapshotPicker) {
			console.debug(
				"[GSM]", `useGlobal on ${normalizedOptions.label}\n`, "state is picked",
				"\n", "call_reason", "=>", reason,
				"\n", "next_state", "=>", nextSelected,
			);
		}

		return nextSelected;
	}, [store, selector, normalizedOptions, ...inputs]);

	const subscribe = useCallback((onStorageChange: () => void) => {
		const cb = (_global: TState, reason?: string) => {
			reasonRef.current = reason;
			anyDebugEnabled &&
				console.debug("[GSM]", `useGlobal on ${normalizedOptions.label}\n`,
					"store pushed update", { reason });
			onStorageChange();
		};
		store.addCallback(cb);
		return () => store.removeCallback(cb);
	}, [store, anyDebugEnabled, normalizedOptions.label]);

	return useSyncExternalStore(
		subscribe,
		getSnapshot,
	);
};

export default useGlobal;
