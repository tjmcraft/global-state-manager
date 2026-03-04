# useStaticGlobal API

```ts
useStaticGlobal<TState, Selected>(selector, inputs?)
```

Non-reactive selector hook (memoized by `inputs`).

## Parameters

- `selector: (state: TState) => Selected`
- `inputs?: React.DependencyList`

## Behavior

- Reads from current store state.
- Does not subscribe to store updates.
