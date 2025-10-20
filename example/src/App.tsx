import React, { useCallback, useEffect, useRef, useState } from "react";
import { connector, getDispatch, getState, stateStore, useAppGlobal, useStatic } from "./store/Global";

const Counter = () => {
  const count = useAppGlobal((e) => e.count);
  const { setCount } = getDispatch();
  const handleIncrement = () => setCount(count + 1, {reason: 'set_count_inc'});
  const handleDecrement = () => setCount(count - 1, {reason: 'set_count_dec'});
  useEffect(() => {
    console.log(">>render Counter", count);
  }, [count]);
  return (
    <div className="component counter">
      <h1>Counter</h1>
      <h3>state: {count}</h3>
      <button onClick={handleIncrement}>+</button>
      <button onClick={handleDecrement}>-</button>
    </div>
  );
};

const StaticDependency = ({ id = 1 }) => {
  const staticData = useStatic((e) => e.static[id], [id]);
  useEffect(() => {
    console.log(">>render Static", staticData);
  }, [staticData]);
  return (
    <div className="component static-dependency">
      <h1>Static Dependency</h1>
      <pre>{JSON.stringify(staticData, null, 2)}</pre>
    </div>
  );
};
const StaticDependencyGlobal = ({ id = 1 }) => {
  const staticData = getState((e) => e.static[id]);
  useEffect(() => {
    console.log(">>render Static global", staticData);
  }, [staticData]);
  return (
    <div className="component static-dependency-global">
      <h1>Static Dependency Global</h1>
      <pre>{JSON.stringify(staticData, null, 2)}</pre>
    </div>
  );
};

const ConnectedComponent = connector<{ id: number }, {counter: any, value: any}>((global, props) => {
  return ({
    counter: global.count,
    value: global.dataObject.value,
    id: props.id,
  })
}, {
  label: 'ConnectedComponent',
  debugInitialPicker: false,
  debugCallbackPicker: false,
  debugCallbackPicked: true,
})(({ counter, id, value }) => {
  console.debug('[ConnectedComponent]', 'render', { counter, id, value });
  return (
    <div className="component connected-component">
      <h1>Connected Component</h1>
      <span>id (max. 5):<pre>{JSON.stringify(id, null, 2)}</pre></span>
      <span>Counter:<pre>{JSON.stringify(counter, null, 2)}</pre></span>
      <span>value:<pre>{JSON.stringify({ value }, null, 2)}</pre></span>
    </div>
  );
});

const Resetter = () => {
  const { setValue } = getDispatch();
  const value = useAppGlobal((e) => e.dataObject.value);
  useEffect(() => {
    console.log(">>render Counter", value);
  }, [value]);
  return (
    <div className="component resetter">
      <h1>Resetter</h1>
      <h3>value: {JSON.stringify(value)}</h3>
      <button onClick={() => setValue(10)}>set</button>
      <button onClick={() => setValue(undefined)}>unset</button>
    </div>
  );
};

const SyncChain = () => {
  const { syncChain } = getDispatch();
  const value = useAppGlobal((e) => e.syncChainValue);
  useEffect(() => {
    console.log(">>render SyncChain", value);
  }, [value]);
  const [chainState, setChainState] = useState('none');
  const startSync = useCallback(() => {
    setChainState('pending');
    setTimeout(() => {
      syncChain();
      setChainState('batchDone');
    }, 100);
  }, [syncChain]);
  return (
    <div className="component sync-chain">
      <h1>Sync Chain</h1>
      <p>Represents synchronous chain support</p>
      <p>{`Chain should be:
      (none, 0)
      after 100ms delay start sync with (pending, 0)
      after first reducer 1000ms timeout (pending, 1)
      after second reducer 500ms timeout (pending, 1+2)
      end (batchDone, 3)
      WARNING: during optimization you only see one render after all reducers execution
      `}</p>
      <h3>chainState: {JSON.stringify(chainState)}</h3>
      <h3>value: {JSON.stringify(value)}</h3>
      <button onClick={startSync}>startSync</button>
    </div>
  );
};

const AsyncChain = () => {
  const { asyncChain } = getDispatch();
  const value = useAppGlobal((e) => e.asyncChainValue);
  useEffect(() => {
    console.log(">>render AsyncChain", value);
  }, [value]);
  const [promiseState, setPromiseState] = useState('none');
  const startSync = useCallback(() => {
    const promise = asyncChain();
    setPromiseState('pending');
    promise.then(() => setPromiseState('fulfilled'));
    promise.catch(() => setPromiseState('rejected'));
  }, [asyncChain]);
  return (
    <div className="component async-chain">
      <h1>Async Chain</h1>
      <p>Represents asynchronous chain support</p>
      <p>{`Chain should be:
      (none, 0)
      after start (pending, 0)
      after 1000ms delay (pending, 1)
      after 800ms delay (pending, 1+1)
      after 500ms delay (pending, 2+1)
      after 200ms delay (pending, 3+2)
      end (fulfilled, 5)
you should see all data flow
      `}</p>
      <h3>promiseState: {JSON.stringify(promiseState)}</h3>
      <h3>value: {JSON.stringify(value)}</h3>
      <button onClick={startSync}>startSync</button>
    </div>
  );
};

function waitForSmoothScrollEnd(container: HTMLElement, callback: () => void, idleDelay = 20) {
	let timeout: number | null = null;

	const onScroll = () => {
		if (timeout) clearTimeout(timeout);
		timeout = window.setTimeout(() => {
			container.removeEventListener('scroll', onScroll);
			callback();
		}, idleDelay);
	};

	container.addEventListener('scroll', onScroll, { passive: true });
	onScroll(); // запускаем таймер сразу
}

const HeavyAnimationTest = () => {

  const targetValue = useAppGlobal(state => state.heavyAnimationTargetValue);

  const containerRef = useRef<HTMLDivElement>(null);
  const targetRef = useRef<HTMLTextAreaElement>(null);

  const handleStart = useCallback(() => {
    if (!containerRef.current) return;
    if (!targetRef.current) return;
    // begin heavy animation (lock store callbacks)
    console.debug('begin heavy animation for target');
    const animationEnd = stateStore.beginHeavyAnimation();
    targetRef.current.scrollIntoView({
      behavior: 'smooth',
      block: 'center',
    });
    window.setTimeout(() => {
      // trying to patch global in middle of animation
      const global = stateStore.getState();
      console.debug('set heavy animation value');
      stateStore.setState({
        ...global,
        heavyAnimationTargetValue: '💀 1613 ❄️',
      });
    }, 100)
    // on transition end release store lock
    waitForSmoothScrollEnd(containerRef.current, () => {
      console.debug('heavy animation end');
      animationEnd();
    });
  }, []);

  const handleReset = useCallback(() => {
    if (!containerRef.current) return;
    console.debug('begin heavy animation for reset');
    const animationEnd = stateStore.beginHeavyAnimation();
    containerRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    window.setTimeout(() => {
      // trying to patch global in middle of animation
      const global = stateStore.getState();
      console.debug('set heavy animation value');
      stateStore.setState({
        ...global,
        heavyAnimationTargetValue: 'target',
      });
    }, 100)
    // on transition end release store lock
    waitForSmoothScrollEnd(containerRef.current, () => {
      console.debug('heavy animation end');
      animationEnd();
    });
  }, []);

  return (
    <div className="component heavy-animation">
      <h1>Heavy Animation Lock Test</h1>
      <p>When heavy animating some css properties, you should avoid of global state callbacks that triggers new render on animated component, which breaks the animation</p>
      <p>With GSM you can block unwanted updates with <code>store.beginHeavyAnimation(duration)</code></p>
      <p>In this block we trying to imitate setting state while scroll animation happens</p>
      <br />
      <div ref={containerRef} style={{ height: 64, overflowY: 'scroll', width: 128, border: '1px solid red', display: 'flex', flexDirection: 'column' }}>
        {Array.from(Array(2000).fill(0).map((e, i) =>
          i + 1 == 1613 ?
            (<span ref={targetRef}>{targetValue}</span>) :
            (<span>{`element:${i + 1}`}</span>)
        ))}
      </div>
      <button onClick={handleStart}>ScrollIntoView</button>
      <button onClick={handleReset}>Reset</button>
    </div>
  );
};

const App = () => {
  const count = useAppGlobal((e) => e.count);
  const forceUpdate = useState(false)[1];
  useEffect(() => {
    console.log(">>render App", count);
    console.debug("State:", getState());
  }, [count]);
  return (
    <div className="app">
      <button onClick={() => forceUpdate(bool => !bool)}>Force Render Root</button>
      <Counter />
      <StaticDependency id={Math.min(count, 2)} />
      <StaticDependencyGlobal id={Math.min(count, 2)} />
      <ConnectedComponent id={Math.min(count, 5)} />
      <Resetter />
      <SyncChain />
      <AsyncChain />
      <HeavyAnimationTest />
    </div>
  );
};

const AppWrapper = () => {
  const initialized = useAppGlobal(e => e.__initialized);
  return initialized ? <App /> : <span>loading...</span>;
}

export default AppWrapper;
