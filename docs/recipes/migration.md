# Migration Notes

## From old debug options

Current options:
- `debugSnapshotPicker`
- `debugSnapshotSkip`

Deprecated names such as `debugInitialPicker` / `debugCallbackPicker` are not part of the current API.

## Hooks/HOC internals

`useGlobal` and `connect` now rely on modern concurrent-safe React subscription APIs.

Practical impact:
- consistent snapshot reads
- fewer async update edge cases
- selector errors no longer crash render path (previous snapshot is reused)
