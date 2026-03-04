# Overview

`@tjmc/global-state-manager` is a lightweight React state manager built around:

- A central mutable store (`StateStore`)
- Typed reducer-style actions (`addReducer` + `getDispatch`)
- React bindings via modern concurrent-safe APIs (`useGlobal`, `connect`)

## Key Concepts

- **State updates** are done through `setState` or reducers.
- **Action dispatch** is generated automatically from reducer names.
- **Selectors** derive view data in hooks/HOCs.
- **Callbacks** can subscribe to store updates outside React.

## Package Exports

- `StateStore`
- `Provider`
- `useGlobal`
- `useStaticGlobal`
- `useStore`
- `connect`
- `StoreCaching`
- `WebStorage`

See API docs for exact signatures.
