# global-state-manager

Global State Manager for React

## Installation

```bash
npm install @tjmc/global-state-manager
```

## Usage

### In React Project

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

In `store/Global.ts`:

```typescript
import { StateStore, TypedUseSelectorHook, useGlobal } from '@tjmc/global-state-manager';

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

export const useAppGlobal: TypedUseSelectorHook<GlobalState> = useGlobal;

export const getDispatch = stateStore.getDispatch;
export const getState = stateStore.getState;
export const setState = stateStore.setState;
export const withState = stateStore.withState;
export const addReducer = stateStore.addReducer;
export const removeReducer = stateStore.removeReducer;
export const addCallback = stateStore.addCallback;
export const removeCallback = stateStore.removeCallback;
```
