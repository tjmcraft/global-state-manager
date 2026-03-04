import { describe, it, expect, vi } from 'vitest';

import StateStore from '../../src/StateStore';

describe('StateStore', () => {
  it('returns initial state', () => {
    const store = StateStore({ count: 1 });
    expect(store.getState()).toEqual({ count: 1 });
  });

  it('setState with forceSync notifies callbacks with reason', () => {
    const store = StateStore({ count: 0 });
    const reasons: string[] = [];

    const cb = (_global: { count: number }, reason?: string) => reasons.push(reason || '');
    store.addCallback(cb);

    store.setState({ count: 2 }, { forceSync: true, reason: 'manual_update' });

    expect(reasons).toContain('manual_update');
  });

  it('setState with silent=true does not notify callbacks', () => {
    const store = StateStore({ count: 0 });
    let calls = 0;

    store.addCallback(() => {
      calls += 1;
    });

    store.setState({ count: 1 }, { forceSync: true, silent: true });

    expect(calls).toBe(0);
  });

  it('setState with same object reference skips updates', () => {
    const state = { count: 0 };
    const store = StateStore(state);
    let calls = 0;

    store.addCallback(() => {
      calls += 1;
    });

    store.setState(state, { forceSync: true, reason: 'same_ref' });

    expect(calls).toBe(0);
  });

  it('dispatch prefixes reason with action name', async () => {
    const store = StateStore<{ count: number }, { inc: number }>({ count: 0 });
    const reasons: string[] = [];

    store.addReducer('inc', (global, _actions, payload) => ({
      ...global,
      count: global.count + payload,
    }));

    store.addCallback((_global, reason) => {
      reasons.push(reason || '');
    });

    await store.getDispatch().inc(2, { forceSync: true, reason: 'from_test' });

    expect(store.getState().count).toBe(2);
    expect(reasons).toContain('@dispatch:inc->from_test');
  });

  it('removeReducer stops reducer execution', async () => {
    const store = StateStore<{ count: number }, { inc: number }>({ count: 0 });

    const reducer = (global: { count: number }, _actions: any, payload: number) => ({
      ...global,
      count: global.count + payload,
    });

    store.addReducer('inc', reducer);
    await store.getDispatch().inc(1, { forceSync: true });
    expect(store.getState().count).toBe(1);

    store.removeReducer('inc', reducer);
    await store.getDispatch().inc(1, { forceSync: true });
    expect(store.getState().count).toBe(1);
  });

  it('reducer error throws when shouldThrow=true', async () => {
    const store = StateStore<{ count: number }, { boom: undefined }>({ count: 0 });
    const spy = vi.spyOn(console, 'error').mockImplementation(() => undefined);

    store.addReducer('boom', () => {
      throw new Error('boom');
    });

    await expect(store.getDispatch().boom(undefined, { shouldThrow: true })).rejects.toThrow('boom');
    spy.mockRestore();
  });

  it('selector error in one withState container does not block others', () => {
    const store = StateStore({ count: 0 });

    store.withState(() => {
      throw new Error('broken selector');
    })(() => {});

    const calls: Array<{ count: number; reason?: string }> = [];
    store.withState((global) => ({ count: global.count }))((mapped, reason) => {
      calls.push({ count: mapped.count, reason });
    });

    expect(calls).toHaveLength(1);
    expect(calls[0]).toEqual({ count: 0, reason: '@initial_update' });

    store.setState({ count: 1 }, { forceSync: true, reason: 'state_update' });

    expect(calls).toHaveLength(2);
    expect(calls[1]).toEqual({ count: 1, reason: 'state_update' });
  });
});
