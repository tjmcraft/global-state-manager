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
  syncChainValue: number;
  asyncChainValue: number;
};

export interface ActionPayloads {
  init: undefined;
  setCount: number;
  setValue: number | undefined;
  syncChain: undefined;
  asyncChain: undefined;
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
  },
  syncChainValue: 0,
  asyncChainValue: 0,
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

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

stateStore.addReducer('asyncChain', async (global) => {
  await sleep(1000);
  global = stateStore.getState();
  setState({
    ...global,
    asyncChainValue: 1,
  })
  await sleep(800);
  global = stateStore.getState();
  setState({
    ...global,
    asyncChainValue: global.asyncChainValue + 1,
  })
});
stateStore.addReducer('asyncChain', async (global) => {
  await sleep(500);
  global = stateStore.getState();
  setState({
    ...global,
    asyncChainValue: global.asyncChainValue + 1,
  })
  await sleep(200);
  global = stateStore.getState();
  setState({
    ...global,
    asyncChainValue: global.asyncChainValue + 2,
  })
});

stateStore.addReducer('syncChain', (global) => {
  const start = Date.now();
  const duration = 1000;

  while (Date.now() - start < duration) {
    // "Тяжёлая" работа — имитация нагрузки
    Math.sqrt(Math.random() * 1e8);
  }

  global = getState();

  return {
    ...global,
    syncChainValue: 1,
  }
});
stateStore.addReducer('syncChain', (global) => {

  const start = Date.now();
  const duration = 500;

  while (Date.now() - start < duration) {
    // "Тяжёлая" работа — имитация нагрузки
    Math.sqrt(Math.random() * 1e8);
  }

  global = getState();

  return {
    ...global,
    syncChainValue: global.syncChainValue + 2,
  }
});

stateStore.addCallback((global, reason) => console.debug("stateStore", "update", "\nreason:", reason, "\nglobal:", global));

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
