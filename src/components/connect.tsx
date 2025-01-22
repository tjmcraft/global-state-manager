import { createElement, memo, useCallback, useEffect, useMemo, useRef } from "react";
import useForceUpdate from "../hooks/useForceUpdate";
import useGsmContext from "../hooks/useGsmContext";
import { ConnectOptions, TypedConnector } from "../types";
import { randomString } from "../Util/Random";
import { shallowEqual, stacksDiff, stacksEqual } from "../Util/Iterates";


const updateContainer = <T, S, O>(selector: (state: T, ownProps: O) => S, callback: Function, options: ConnectOptions) => {
  return (global: T): S =>
    callback((prevState: T, ownProps: O) => {

      let nextState;
      try {
        nextState = selector(global, ownProps);
      } catch (err) {
        return;
      }

      if (global !== undefined) {

        const isArray = Array.isArray(prevState) || Array.isArray(nextState);
        const shouldUpdate = isArray ?
          !stacksEqual(prevState as Array<any>, nextState as Array<any>) :
          !shallowEqual(prevState, nextState);

        if (options.debugCallbackPicker) {
          console.debug(
            "[gsm:connect:picker]", "->", options.label,
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

        if (shouldUpdate) {
          if (options.debugCallbackPicker) {
            console.debug(
              "[gsm:connect:picker]", "->", options.label,
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
    debugCallbackPicker: false,
    debugInitialPicker: false,
  } satisfies ConnectOptions, options);

  return (Component: React.FC<Selected>) => {

    function TCContainer(props: OwnProps) {
      const { store } = useGsmContext();

      (options.debugInitialPicker || options.debugCallbackPicker) &&
        console.debug('[gsm:connect]', 'rendering', 'TCContainer', { props });

      const forceUpdate = useForceUpdate();
      const mappedProps = useRef<ReturnType<typeof selector>>();
      const picker = useCallback(selector, [selector, props]);

      useMemo(() => {
        let nextState;
        options.debugInitialPicker &&
          console.debug('[gsm:connect:initial_picker]', '->', `${options.label}\n`, 'start picking')
        try {
          const global = store.getState((e) => e);
          nextState = picker(global, props);
          options.debugInitialPicker &&
            console.debug('[gsm:connect:initial_picker]', '->', `${options.label}\n`, { mappedProps, global, props, nextState });
        } catch (e) {
          // options.debugInitialPicker &&
            console.error('[gsm:connect:initial_picker]', '->', `${options.label}\n`, 'thrown an error\n', e)
          return undefined;
        }
        mappedProps.current = nextState;
      }, [picker, props]);

      useEffect(() => {
        const updateCallback = (next: AnyFunction) => {
          let nextState;
          options.debugCallbackPicker &&
            console.debug('[gsm:connect:next_picker]', '->', `${options.label}\n`, 'start picking');
          try {
            nextState = next(mappedProps.current, props);
            options.debugCallbackPicker &&
              console.debug('[gsm:connect:next_picker]', '->', `${options.label}\n`, { mappedProps, global, props, nextState });
          } catch (e) {
            // options.debugCallbackPicker &&
              console.error('[gsm:connect:next_picker]', '->', `${options.label}\n`, 'thrown an error\n', e);
            return undefined;
          }
          if (nextState != mappedProps.current) {
            mappedProps.current = nextState;
            void forceUpdate(bool => !bool);
          }
        };
        const callback = updateContainer<TState, Selected, OwnProps>(picker, updateCallback, options);
        store.addCallback(callback);
        return () => store.removeCallback(callback);
      }, [forceUpdate, picker, props]);

      return createElement(Component, {
        ...mappedProps.current,
        ...props,
      } as Selected);
    };

    return options.nonMemoizedContainer ? TCContainer : memo(TCContainer);
  };
};

export default connect as TypedConnector<AnyLiteral>;
