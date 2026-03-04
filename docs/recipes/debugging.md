# Debugging

Enable debug flags per selector/hoc:

## Hook

```ts
const value = useGlobal(selector, [], {
  label: 'counter',
  debugSnapshotPicker: true,
  debugSnapshotSkip: true,
});
```

## HOC

```ts
const Connected = connect(selector, {
  label: 'ConnectedCounter',
  debugSnapshotPicker: true,
  debugSnapshotSkip: true,
})(Component);
```

`label` is included in console output to separate logs.
