import { createElement, memo, useCallback, useEffect, useMemo, useRef } from "react";
import useForceUpdate from "../hooks/useForceUpdate";
import useGsmContext from "../hooks/useGsmContext";
import { TypedConnector } from "../types";
import { randomString } from "../Util/Random";

type PickOptions = {
  nonMemoizedContainer?: boolean;
  label?: string;
  debugCallbackPicker?: boolean;
  debugInitialPicker?: boolean;
};

const connect = <
  OwnProps extends AnyLiteral,
  TState extends AnyLiteral,
  Selected extends AnyLiteral & OwnProps
>(
  selector: (global: TState, props: OwnProps) => Selected,
  options: PickOptions = {}
) => {

  options = Object.assign({
    nonMemoizedContainer: false,
    label: randomString(5),
    debugCallbackPicker: false,
    debugInitialPicker: false,
  } satisfies PickOptions, options);

  return (Component: React.FC<Selected>) => {

    function TCContainer(props: OwnProps) {
      const { store } = useGsmContext();

      const forceUpdate = useForceUpdate();
      const mappedProps = useRef<ReturnType<typeof selector>>();
      const picker = useCallback(selector, [selector, props]);

      useMemo(() => {
        let nextState;
        try {
          const global = store.getState((e) => e);
          nextState = picker(global, props);
          options.debugInitialPicker &&
            console.debug('[gsm:connect]', `{${options.label}}`, { global, props, nextState });
        } catch (e) {
          return undefined;
        }
        mappedProps.current = nextState;
      }, [picker]);

      useEffect(() => {
        const callback = (global: TState) => {
          let nextState;
          try {
            nextState = picker(global, props);
            options.debugCallbackPicker &&
              console.debug('[gsm:connect]', `{${options.label}}`, { global, props, nextState });
          } catch (e) {
            return undefined;
          }
          if (nextState != mappedProps.current) {
            mappedProps.current = nextState;
            void forceUpdate((bool) => !bool);
            options.debugCallbackPicker &&
              console.debug('[gsm:connect]', `{${options.label}}`, 'forcing update', { mappedProps, global, props, nextState });
          }
        };
        store.addCallback(callback);
        return () => store.removeCallback(callback);
      }, [forceUpdate, picker]);

      return createElement(Component, {
        ...mappedProps.current,
        ...props,
      } as Selected);
    };

    return options.nonMemoizedContainer ? TCContainer : memo(TCContainer);
  };
};

export default connect as TypedConnector<AnyLiteral>;
