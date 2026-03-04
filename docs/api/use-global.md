# useGlobal API

```ts
useGlobal<TState, Selected>(selector, inputs?, options?)
```

React hook for selecting reactive state from store.

## Parameters

- `selector: (state: TState) => Selected`
- `inputs?: React.DependencyList` selector dependencies
- `options?: PickOptions`

`PickOptions`:
- `label?: string`
- `debugSnapshotPicker?: boolean`
- `debugSnapshotSkip?: boolean`

## Notes

- Built on modern concurrent-safe React subscription APIs.
- If selector throws, hook logs error and reuses previous snapshot.
- If `inputs` change, selector re-evaluates against current state.
