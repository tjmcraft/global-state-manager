import {
  StateStore,
  TypedConnector,
  TypedUseSelectorHook,
  TypedUseStaticHook,
  connect,
  useGlobal,
  useStaticGlobal,
} from "global-state-manager";

export type GlobalState = {
  count: number;
  static: Record<string, any>;
  dataObject: {
    value: number | undefined,
  };
};

export interface ActionPayloads {
  init: undefined;
  setCount: number;
  setValue: number | undefined;
}

const INITIAL_STATE: GlobalState = {
  count: 0,
  static: {
    "0": "first",
    "1": { two: 2 },
    "2": { three: 3 },
  },
  dataObject: {
    value: 1,
  }
};

export const stateStore = StateStore<GlobalState, ActionPayloads>(undefined, true);

stateStore.addReducer("init", () => {
  return Object.assign({}, INITIAL_STATE);
});

stateStore.addReducer("setCount", (global, _actions, payload) => {
  return {
    ...global,
    count: payload,
  };
});

stateStore.addReducer('setValue', (global, actions, payload) => {
  return {
    ...global,
    dataObject: {
      ...global.dataObject,
      value: payload,
    }
  };
});

stateStore.addCallback(e => console.debug(">>", e));

export const useAppGlobal = useGlobal as TypedUseSelectorHook<GlobalState>;
export const useStatic = useStaticGlobal as TypedUseStaticHook<GlobalState>;
export const connector = connect as TypedConnector<GlobalState>;

export const getDispatch = stateStore.getDispatch;
export const getState = stateStore.getState;
export const setState = stateStore.setState;
export const withState = stateStore.withState;
export const addReducer = stateStore.addReducer;
export const removeReducer = stateStore.removeReducer;
export const addCallback = stateStore.addCallback;
export const removeCallback = stateStore.removeCallback;
