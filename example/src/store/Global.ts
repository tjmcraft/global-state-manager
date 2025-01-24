import {
  StateStore,
  StoreCaching,
  TypedConnector,
  TypedUseSelectorHook,
  TypedUseStaticHook,
  connect,
  useGlobal,
  useStaticGlobal,
  WebStorage,
} from "global-state-manager";

export type GlobalState = {
  __initialized: boolean; // add flag for waiting init
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
  __initialized: false,
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

const cachingReducer = (global: GlobalState): Partial<GlobalState> => {
  return {
    count: global.count,
  };
};

const storage = WebStorage();

const { loadCache, resetCache } = StoreCaching<GlobalState, ActionPayloads>(
  stateStore,
  storage,
  "ru.tjmc.gsm.demo.cacheKey",
  cachingReducer,
);

stateStore.addReducer("init", async (_global, actions) => {
  const initial = Object.assign({}, INITIAL_STATE);
  const state = (await loadCache(initial)) || initial; // manually load state from storage
  setTimeout(() => {
    setState({
      ...state,
      __initialized: true,
    }, { silent: false }); // manually set loaded state
  }, 1e2); // 100ms before rehydrating
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
