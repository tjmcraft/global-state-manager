# StateStore API

```ts
const store = StateStore<TState, ActionPayloads>(initialState?, debugMode?)
```

Creates a store instance.

## Methods

### `setState(state, options?)`

Updates the global state and notifies subscribers.

`options` (`ActionOptions`):
- `silent?: boolean` skip callbacks
- `forceSync?: boolean` run callbacks immediately
- `forceOnHeavyAnimation?: boolean` override animation lock behavior
- `reason?: string` custom update reason
- `shouldThrow?: boolean` rethrow reducer errors

### `getState(selector?)`

- `getState()` -> full state
- `getState(selector)` -> selected slice

### `addReducer(name, reducer)`

Registers reducer for action name.

### `removeReducer(name, reducer)`

Removes previously registered reducer.

### `getDispatch()`

Returns typed action functions based on registered reducers.

### `addCallback(cb)` / `removeCallback(cb)`

Subscribe/unsubscribe to store updates:

```ts
type StoreCallback = (global: TState, reason?: string) => void;
```

### `withState(selector)(callback)`

Legacy callback-style selector subscription. Calls `callback(mappedProps, reason)` on changes.

### `beginHeavyAnimation(duration?)`

Starts heavy animation section and returns an `end` function:

```ts
const end = store.beginHeavyAnimation();
end();
```

While active, callback execution can be delayed.
