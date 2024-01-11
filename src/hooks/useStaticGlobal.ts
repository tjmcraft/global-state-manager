import type { TypedUseStaticHook } from "../types";

import { useCallback, useMemo, useRef } from "react";
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
const useStaticGlobal: TypedUseStaticHook<AnyLiteral> = (
  selector,
  inputs = []
) => {
  const { store } = useGsmContext();
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

  return mappedProps.current;
};

export default useStaticGlobal;
