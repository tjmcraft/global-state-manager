# @tjmc/global-state-manager

Global State Manager for React

## Installation

```bash
npm install @tjmc/global-state-manager
```

## Usage

### In React Project

In `store/Global.ts`:

```typescript
import {
 StateStore,
 TypedUseSelectorHook,
 useGlobal,
 useStaticGlobal,
 connect,
} from '@tjmc/global-state-manager';

export type GlobalState = {
 count: number
}

export interface ActionPayloads {
 init: undefined;
 setCount: number;
};

const INITIAL_STATE: GlobalState = { count: 0 };

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

// hooks
export const useAppGlobal = useGlobal as TypedUseSelectorHook<GlobalState>;
export const useStatic = useStaticGlobal as TypedUseStaticHook<GlobalState>;
// hoc
export const withConnect = connect as TypedConnector<GlobalState>;
// dispatch events triggers
export const getDispatch = stateStore.getDispatch;
// reducers on dispatch events
export const addReducer = stateStore.addReducer;
export const removeReducer = stateStore.removeReducer;
// global state getter/setter's
export const getState = stateStore.getState;
export const setState = stateStore.setState;
// callbacks
export const withState = stateStore.withState; // callback with picker
export const addCallback = stateStore.addCallback;
export const removeCallback = stateStore.removeCallback;
```


In `App.tsx`:

```typescript
import React from "react";
import { getDispatch, useAppGlobal } from "./store/Global";

const App = () => {
 const count = useAppGlobal(e => e.count);
  const { setCount } = getDispatch();
  const handleIncrement = () => setCount(count + 1);
  const handleDecrement = () => setCount(count - 1);
  console.log('>>render main')
  return (
    <div className="app">
      <h1>state: {count}</h1>
      <button onClick={handleIncrement}>+</button>
      <button onClick={handleDecrement}>-</button>
    </div>
  );
};

export default App;
```


In `index.tsx`:

```typescript
import React from 'react';
import { createRoot } from 'react-dom/client';

import { Provider } from '@tjmc/global-state-manager';

import { getDispatch, stateStore } from './store/Global';
import App from './App';

const root = createRoot(document.getElementById('app-root')!);

getDispatch().init();

root.render(
 <Provider store={stateStore}>
  <App />
 </Provider>
);
```
