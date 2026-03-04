# @tjmc/global-state-manager

Global state manager for React with typed dispatch, selector-based subscriptions, and concurrent-safe bindings via modern React APIs.

## Install

```bash
npm install @tjmc/global-state-manager
```

## Quick Example

```ts
import { StateStore } from '@tjmc/global-state-manager';

type GlobalState = { count: number };
type ActionPayloads = { setCount: number };

export const store = StateStore<GlobalState, ActionPayloads>({ count: 0 });

store.addReducer('setCount', (global, _actions, payload) => ({
  ...global,
  count: payload,
}));

export const { setCount } = store.getDispatch();
```

```tsx
import { Provider, useGlobal } from '@tjmc/global-state-manager';
import { setCount } from './store';

function Counter() {
  const count = useGlobal<GlobalState, number>((s) => s.count);
  return (
    <button onClick={() => setCount(count + 1, { reason: 'counter_click' })}>
      {count}
    </button>
  );
}

<Provider store={store}>
  <Counter />
</Provider>
```

## Documentation

- Docs index: [docs/README.md](./docs/README.md)
- Overview: [docs/overview.md](./docs/overview.md)
- Getting started: [docs/getting-started.md](./docs/getting-started.md)
- API: [docs/api](./docs/api)
- Recipes: [docs/recipes](./docs/recipes)

## Build

```bash
npm run typescript
npm run build
```

## Testing

```bash
npm run test
npm run test:store
npm run test:hooks
npm run test:hoc
```

## License

MIT
