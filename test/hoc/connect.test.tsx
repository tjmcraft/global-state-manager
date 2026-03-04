import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { act, render, screen } from '@testing-library/react';

import Provider from '../../src/components/Provider';
import StateStore from '../../src/StateStore';
import connect from '../../src/components/connect';

type GlobalState = {
  count: number;
  other: number;
};

function renderWithProvider(ui: React.ReactElement, store: ReturnType<typeof StateStore<GlobalState>>) {
  return render(<Provider store={store}>{ui}</Provider>);
}

describe('connect HOC', () => {
  it('maps state to props and updates after store changes', () => {
    const store = StateStore<GlobalState>({ count: 1, other: 0 });

    const Connected = connect<{ id: string }, { count: number }, GlobalState>(
      (global, ownProps) => ({
        count: global.count,
        id: ownProps.id,
      }),
      { nonMemoizedContainer: true }
    )(({ id, count }) => <div data-testid="value">{id}:{count}</div>);

    renderWithProvider(<Connected id="x" />, store);

    expect(screen.getByTestId('value')).toHaveTextContent('x:1');

    act(() => {
      store.setState({ count: 2, other: 0 }, { forceSync: true, reason: 'inc' });
    });

    expect(screen.getByTestId('value')).toHaveTextContent('x:2');
  });

  it('ownProps override mapped props on key conflict', () => {
    const store = StateStore<GlobalState>({ count: 1, other: 0 });

    const Connected = connect<{ count: number }, { count: number }, GlobalState>(
      (global) => ({ count: global.count }),
      { nonMemoizedContainer: true }
    )(({ count }) => <div data-testid="value">{count}</div>);

    renderWithProvider(<Connected count={999} />, store);

    expect(screen.getByTestId('value')).toHaveTextContent('999');
  });

  it('handles selector throw and keeps previous props snapshot', () => {
    const store = StateStore<GlobalState>({ count: 5, other: 0 });

    const Connected = connect<{ crash: boolean }, { count?: number }, GlobalState>(
      (global, ownProps) => {
        if (ownProps.crash) throw new Error('selector failed');
        return { count: global.count };
      },
      { nonMemoizedContainer: true }
    )(({ count }) => <div data-testid="value">{String(count)}</div>);

    const spy = vi.spyOn(console, 'error').mockImplementation(() => undefined);

    const view = renderWithProvider(<Connected crash={false} />, store);
    expect(screen.getByTestId('value')).toHaveTextContent('5');

    view.rerender(
      <Provider store={store}>
        <Connected crash={true} />
      </Provider>
    );

    expect(screen.getByTestId('value')).toHaveTextContent('5');
    expect(spy).toHaveBeenCalled();

    spy.mockRestore();
  });
});
