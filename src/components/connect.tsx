import { createElement, memo, useCallback, useEffect, useState } from "react";
import useGsmContext from "../hooks/useGsmContext";
import { ConnectOptions, TypedConnector } from "../types";
import { randomString } from "../Util/Random";
import { shallowEqual, stacksDiff, stacksEqual } from "../Util/Iterates";


const updateContainer = <T, S, O>(selector: (state: T, ownProps: O) => S, updateCallback: Function, options: ConnectOptions) => {
  return (global: T, reason?: string): S =>
    updateCallback((prevState: T, ownProps: O) => {
      let nextState;
      try {
        nextState = selector(global, ownProps);
      } catch (err) {
        console.error("[GSM]", `connect on ${options.label}\n`, "next selector thrown an error\n", err);
        return prevState;
      }

      if (global !== undefined) {
        const isArray = Array.isArray(prevState) || Array.isArray(nextState);
        const shouldUpdate = isArray ?
          !stacksEqual(prevState as Array<any>, nextState as Array<any>) :
          !shallowEqual(prevState, nextState);

        if (options.debugCallbackPicker) {
          console.debug(
            "[GSM]", `connect on ${options.label}\n`, "next selector is picking",
            "\n", "reason", "=>", reason,
            "\n", "next", "=>", nextState,
            "\n", "current", "=>", prevState,
            "\n", "result", "=>", shouldUpdate,
            ...(isArray ? (
              [
                "\n", "stacksEqual", "=>", stacksEqual(prevState as Array<any>, nextState as Array<any>),
                "\n", "stacksDiff", "=>", stacksDiff(prevState as Array<any>, nextState as Array<any>),
              ]
            ) : [])
          );
        }

        if (shouldUpdate) {
          return nextState;
        }
      }
      return prevState;
    });
};

const connect = <
  OwnProps extends AnyLiteral,
  TState extends AnyLiteral,
  Selected extends AnyLiteral & OwnProps
>(
  selector: (global: TState, props: OwnProps) => Selected,
  options: ConnectOptions = {}
) => {

  options = Object.assign({
    nonMemoizedContainer: false,
    label: randomString(5),
    debugInitialPicker: false,
    debugCallbackPicker: false,
  } satisfies ConnectOptions, options);

  return (Component: React.FC<Selected>) => {

    function TCContainer(props: OwnProps) {
      const { store } = useGsmContext();

      const computeMappedProps: () => Selected = () => {
        options.debugInitialPicker &&
          console.debug("[GSM]", `connect on ${options.label}\n`, "initial selector is started picking");
        try {
          const nextState = selector(store.getState(), props);
          options.debugInitialPicker &&
            console.debug("[GSM]", `connect on ${options.label}\n`, "initial selector is picked\n", { nextState, props });
          return nextState;
        } catch (err) {
          console.error("[GSM]", `connect on ${options.label}\n`, "initial selector thrown an error\n", err);
          return mappedProps;
        }
      };

      const [mappedProps, setMappedProps] = useState(() => computeMappedProps());

      useEffect(() => { // force update on selector or props update
        setMappedProps(computeMappedProps());
      }, [selector, props]);

      (options.debugInitialPicker || options.debugCallbackPicker) &&
        console.debug("[GSM]", `connect on ${options.label}\n`, "is rendering TCContainer\n", { props, mappedProps: mappedProps, label: options.label });

      const updateCallback = useCallback((next: AnyFunction) => {
        setMappedProps((prev) => {
          options.debugCallbackPicker &&
            console.debug("[GSM]", `connect on ${options.label}\n`, "next selector is started picking");
            const nextState = next(prev, props);
          options.debugCallbackPicker &&
            console.debug("[GSM]", `connect on ${options.label}\n`, "next selector is picked", { nextState, props });
          return nextState != prev ? nextState : prev;
        });
      }, [mappedProps, props]);

      const storeCallback = useCallback(
        updateContainer<TState, Selected, OwnProps>(selector, updateCallback, options),
        [updateCallback]
      );

      useEffect(() => {
        store.addCallback(storeCallback);
        return () => store.removeCallback(storeCallback);
      }, [storeCallback]);

      return createElement(Component, {
        ...mappedProps,
        ...props,
      } as Selected);
    };

    return options.nonMemoizedContainer ? TCContainer : memo(TCContainer);
  };
};

export default connect as TypedConnector<AnyLiteral>;
