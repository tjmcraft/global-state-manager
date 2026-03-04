import { createElement, memo, useCallback, useRef, useSyncExternalStore } from "react";
import useGsmContext from "../hooks/useGsmContext";
import { ConnectOptions, TypedConnector } from "../types";
import { randomString } from "../Util/Random";
import { shallowEqual } from "../Util/Iterates";

const connect = <
  OwnProps extends AnyLiteral,
  TState extends AnyLiteral,
  Selected extends AnyLiteral & OwnProps
>(
  selector: (global: TState, props: OwnProps) => Selected,
  options: Partial<ConnectOptions> = {}
) => {

  options = Object.assign<ConnectOptions, Partial<ConnectOptions>>({
    nonMemoizedContainer: false,
    label: randomString(5),
    debugSnapshotSkip: false,
    debugSnapshotPicker: false,
  }, options);

  const anyDebugEnabled = options.debugSnapshotPicker || options.debugSnapshotSkip;

  return (Component: React.FC<Selected>) => {

    function TCContainer(ownProps: OwnProps) {
      const { store } = useGsmContext();
      const reasonRef = useRef<string | undefined>("@connect_initial_snapshot");
      const propsRef = useRef(ownProps);
      propsRef.current = ownProps;

      const lastRef = useRef<{
        state: TState;
        props: OwnProps;
        selected: Selected;
      }>();

      const getSnapshot = useCallback(() => {
        const state = store.getState();
        const prev = lastRef.current;
        const reason = options.debugSnapshotPicker
          ? (reasonRef.current || "@connect_snapshot")
          : undefined;

        if (
          prev &&
          prev.state === state &&
          shallowEqual(prev.props, propsRef.current)
        ) {
          if (options.debugSnapshotSkip) {
            console.debug(
              "[GSM]", `connect on ${options.label}\n`,
              "skipping snapshot on same state and own props",
            );
          }
          return prev.selected;
        }

        if (options.debugSnapshotPicker) {
          console.debug("[GSM]", `connect on ${options.label}\n`, "snapshot is picking");
        }

        let nextSelected: Selected;
        try {
          nextSelected = selector(state, propsRef.current);
        } catch (err) {
          console.error("[GSM]", `connect on ${options.label}\n`, "selector thrown an error\n", err);
          return prev?.selected as Selected;
        }

        const shouldSkipUpdate = prev && shallowEqual(prev.selected, nextSelected);
        if (options.debugSnapshotPicker) {
          console.debug(
            "[GSM]", `connect on ${options.label}\n`, "snapshot is picked, equaling..",
            "\n", "call_reason", "=>", reason,
            "\n", "current_state", "=>", prev?.selected,
            "\n", "next_state", "=>", nextSelected,
            "\n", "shouldUpdate", "=>", !shouldSkipUpdate,
          );
        }
        if (shouldSkipUpdate) return prev.selected;

        lastRef.current = {
          state,
          props: propsRef.current,
          selected: nextSelected,
        };

        if (options.debugSnapshotPicker) {
          console.debug(
            "[GSM]", `connect on ${options.label}\n`, "state is picked",
            "\n", "call_reason", "=>", reason,
            "\n", "next_state", "=>", nextSelected,
          );
        }

        return nextSelected;
      }, [store, selector, options]);

      const subscribe = useCallback((onStorageChange: () => void) => {
        const cb = (_global: TState, reason?: string) => {
          if (anyDebugEnabled) {
            reasonRef.current = reason;
            console.debug("[GSM]", `connect on ${options.label}\n`,
              "store pushed update", { reason });
          }
          onStorageChange();
        }
        store.addCallback(cb);
        return () => store.removeCallback(cb);
      }, [store, anyDebugEnabled, options]);

      const mappedProps = useSyncExternalStore(
        subscribe,
        getSnapshot,
      );

      anyDebugEnabled &&
        console.debug("[GSM]", `connect on ${options.label}\n`,
          "rendering TCContainer", { ownProps, mappedProps });

      return createElement(Component, {
        ...mappedProps,
        ...ownProps,
      } as Selected);
    }

    return options.nonMemoizedContainer
      ? TCContainer
      : memo(TCContainer);
  };
};

export default connect as TypedConnector<AnyLiteral>;
