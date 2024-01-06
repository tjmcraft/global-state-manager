import {
  StateStore,
  TypedUseSelectorHook,
  TypedUseStaticHook,
  useGlobal,
  useStaticGlobal,
} from "global-state-manager";

export type GlobalState = {
  count: number;
  static: Record<string, any>;
};

export interface ActionPayloads {
  init: undefined;
  setCount: number;
}

const INITIAL_STATE: GlobalState = {
  count: 0,
  static: {
    "0": "first",
    "1": { two: 2 },
    "2": { three: 3 },
  },
};

export const stateStore = StateStore<GlobalState, ActionPayloads>();

stateStore.addReducer("init", () => {
  return Object.assign({}, INITIAL_STATE);
});

stateStore.addReducer("setCount", (global, _actions, payload) => {
  return {
    ...global,
    count: payload,
  };
});

export const useAppGlobal: TypedUseSelectorHook<GlobalState> = useGlobal;
export const useStatic: TypedUseStaticHook<GlobalState> = useStaticGlobal;

export const getDispatch = stateStore.getDispatch;
export const getState = stateStore.getState;
export const setState = stateStore.setState;
export const withState = stateStore.withState;
export const addReducer = stateStore.addReducer;
export const removeReducer = stateStore.removeReducer;
export const addCallback = stateStore.addCallback;
export const removeCallback = stateStore.removeCallback;
