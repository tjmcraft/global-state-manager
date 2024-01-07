import { createElement, useCallback, useEffect, useMemo, useRef } from "react";
import useForceUpdate from "src/hooks/useForceUpdate";
import useGsmContext from "src/hooks/useGsmContext";
import { TypedConnector } from "src/types";

const connect = <
  OwnProps extends AnyLiteral,
  TState extends AnyLiteral,
  Selected extends AnyLiteral & OwnProps
>(
  selector: (global: TState, props: OwnProps) => Selected
) => {
  return (Component: React.FC<Selected>) => {
    return function TCContainer(props: OwnProps) {
      const { store } = useGsmContext();

      const forceUpdate = useForceUpdate();
      const mappedProps = useRef<ReturnType<typeof selector>>();
      const picker = useCallback(selector, [selector]);

      useMemo(() => {
        let nextState;
        try {
          const global = store.getState((e) => e);
          nextState = picker(global, props);
        } catch (e) {
          return undefined;
        }
        mappedProps.current = nextState;
      }, [picker, props]);

      useEffect(() => {
        const callback = (global: TState) => {
          let nextState;
          try {
            nextState = picker(global, props);
          } catch (e) {
            return undefined;
          }
          if (nextState != null && nextState != mappedProps.current) {
            mappedProps.current = nextState;
            void forceUpdate((bool) => !bool);
          }
        };
        store.addCallback(callback);
        return () => store.removeCallback(callback);
      }, [forceUpdate]);

      return createElement(Component, {
        ...mappedProps.current,
        ...props,
      } as Selected);
    };
  };
};

export default connect as TypedConnector<AnyLiteral>;
