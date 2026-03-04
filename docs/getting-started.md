# Getting Started

## Install

```bash
npm install @tjmc/global-state-manager
```

## 1) Create a store

```ts
import { StateStore } from '@tjmc/global-state-manager';

type GlobalState = {
  count: number;
};

type ActionPayloads = {
  setCount: number;
};

export const store = StateStore<GlobalState, ActionPayloads>({ count: 0 });

store.addReducer('setCount', (global, _actions, payload) => ({
  ...global,
  count: payload,
}));
```

## 2) Bind Provider

```tsx
import { Provider } from '@tjmc/global-state-manager';

<Provider store={store}>
  <App />
</Provider>
```

## 3) Read state with `useGlobal`

```tsx
import { useGlobal } from '@tjmc/global-state-manager';

function Counter() {
  const count = useGlobal<GlobalState, number>((s) => s.count);
  return <div>{count}</div>;
}
```

## 4) Dispatch actions

```ts
const { setCount } = store.getDispatch();
await setCount(10, { reason: 'user_click' });
```

Next: [StateStore API](./api/state-store.md)
