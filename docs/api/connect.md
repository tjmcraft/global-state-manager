# connect API

```ts
connect(selector, options?)(Component)
```

Higher-order component for mapping store state + own props into component props.

## Selector

```ts
(global: TState, ownProps: OwnProps) => Selected
```

## Options

- `nonMemoizedContainer?: boolean`
- `label?: string`
- `debugSnapshotPicker?: boolean`
- `debugSnapshotSkip?: boolean`

## Behavior

- Built on modern concurrent-safe React subscription APIs.
- Own props are merged after mapped props (`ownProps` win on conflicts).
- If selector throws, logs error and reuses previous mapped snapshot.
