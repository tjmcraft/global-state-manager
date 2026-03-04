import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { act, render, screen } from '@testing-library/react';

import Provider from '../../src/components/Provider';
import StateStore from '../../src/StateStore';
import useGlobal from '../../src/hooks/useGlobal';

type GlobalState = {
  count: number;
  map: Record<string, number>;
};

function renderWithProvider(ui: React.ReactElement, store: ReturnType<typeof StateStore<GlobalState>>) {
  return render(<Provider store={store}>{ui}</Provider>);
}

describe('useGlobal', () => {
  it('reads selected state and updates after store changes', () => {
    const store = StateStore<GlobalState>({ count: 1, map: { a: 10, b: 20 } });

    function Counter() {
      const count = useGlobal<GlobalState, number>((s) => s.count);
      return <div data-testid="value">{count}</div>;
    }

    renderWithProvider(<Counter />, store);

    expect(screen.getByTestId('value')).toHaveTextContent('1');

    act(() => {
      store.setState({ count: 2, map: { a: 10, b: 20 } }, { forceSync: true, reason: 'set_count' });
    });

    expect(screen.getByTestId('value')).toHaveTextContent('2');
  });

  it('re-evaluates selector when dependency list changes', () => {
    const store = StateStore<GlobalState>({ count: 1, map: { a: 10, b: 20 } });

    function PickById({ id }: { id: string }) {
      const value = useGlobal<GlobalState, number>((s) => s.map[id], [id]);
      return <div data-testid="value">{value}</div>;
    }

    const view = renderWithProvider(<PickById id="a" />, store);

    expect(screen.getByTestId('value')).toHaveTextContent('10');

    view.rerender(
      <Provider store={store}>
        <PickById id="b" />
      </Provider>
    );

    expect(screen.getByTestId('value')).toHaveTextContent('20');
  });

  it('handles selector throw and keeps previous snapshot', () => {
    const store = StateStore<GlobalState>({ count: 3, map: { a: 10, b: 20 } });

    function SafePicker({ crash }: { crash: boolean }) {
      const value = useGlobal<GlobalState, number | undefined>((s) => {
        if (crash) throw new Error('picker failed');
        return s.count;
      }, [crash]);
      return <div data-testid="value">{String(value)}</div>;
    }

    const spy = vi.spyOn(console, 'error').mockImplementation(() => undefined);

    const view = renderWithProvider(<SafePicker crash={false} />, store);
    expect(screen.getByTestId('value')).toHaveTextContent('3');

    view.rerender(
      <Provider store={store}>
        <SafePicker crash={true} />
      </Provider>
    );

    expect(screen.getByTestId('value')).toHaveTextContent('3');
    expect(spy).toHaveBeenCalled();

    spy.mockRestore();
  });
});
