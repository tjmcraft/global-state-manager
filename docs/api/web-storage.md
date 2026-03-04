# WebStorage API

```ts
const storage = WebStorage(type?)
```

Creates promise-based adapter over browser storage.

## Parameters

- `type?: string` (`"local"` by default)

## Returned methods

- `getItem(key): Promise<string | null>`
- `setItem(key, item): Promise<void>`
- `removeItem(key): Promise<void>`
- `getAllKeys(): Promise<string[]>`

If requested storage is unavailable, implementation falls back to no-op storage.
