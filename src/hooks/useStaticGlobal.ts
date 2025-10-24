import type { TypedUseStaticHook } from "../types";

import { useMemo } from "react";
import useGsmContext from "./useGsmContext";

/**
 * Provides static selector without hooking to global store
 *
 * Useful for picking static state and creating state triggers with dependency
 *
 * @param selector Global state mapper function
 * @param inputs Peer dependency list
 * @returns Selected state
 */
const useStaticGlobal: TypedUseStaticHook<AnyLiteral> = <TState = AnyLiteral, Selected = Partial<TState>>(
  selector: (state: TState) => Selected,
  inputs: React.DependencyList = []
) => {
  const { store } = useGsmContext();

  const mappedProps = useMemo(() => {
    let nextState;
    try {
      nextState = store.getState(selector);
    } catch (e) {
      return undefined;
    }
    return nextState;
  }, [selector, ...inputs]);

  return mappedProps as Selected;
};

export default useStaticGlobal;
