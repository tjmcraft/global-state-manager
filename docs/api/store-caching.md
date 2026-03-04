# StoreCaching API

```ts
StoreCaching(store, storage, cacheKey?, reduceGlobal, options?)
```

Creates cache integration for a store.

## Parameters

- `store`: GSM store instance
- `storage`: object implementing `Storage` interface
- `cacheKey`: storage key (`"tjmc.global.state"` by default)
- `reduceGlobal`: `(global) => cachedSubset`
- `options?: Partial<CachingOptions>`

`CachingOptions`:
- `shouldRunFirstUpdateCacheThrottle: boolean`
- `updateCacheThrottle: number`
- `skipValidateKeySetOnReadCache: boolean`

## Returns

- `loadCache(initialState)`
- `resetCache()`

## Behavior

- `loadCache` enables caching and restores cached data merged with `initialState`.
- Invalid JSON cache is ignored with warning and falls back to `initialState`.
