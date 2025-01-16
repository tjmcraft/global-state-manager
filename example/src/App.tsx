import React, { useEffect } from "react";
import { connector, getDispatch, getState, useAppGlobal, useStatic } from "./store/Global";

const Counter = () => {
  const count = useAppGlobal((e) => e.count);
  const { setCount } = getDispatch();
  const handleIncrement = () => setCount(count + 1);
  const handleDecrement = () => setCount(count - 1);
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
  })
})(({ counter, id, value }) => {
  return (
    <div className="component connected-component">
      <h1>Connected Component</h1>
      <span>id (max. 5):<pre>{JSON.stringify(id, null, 2)}</pre></span>
      <span>Counter:<pre>{JSON.stringify(counter, null, 2)}</pre></span>
      <span>value:<pre>{JSON.stringify({ value }, null, 2)}</pre></span>
    </div>
  );
});

const App = () => {
  const count = useAppGlobal((e) => e.count);
  useEffect(() => {
    console.log(">>render App", count);
    console.debug("State:", getState());
  }, [count]);
  return (
    <div className="app">
      <Counter />
      <StaticDependency id={Math.min(count, 2)} />
      <StaticDependencyGlobal id={Math.min(count, 2)} />
      <ConnectedComponent id={Math.min(count, 5)} />
      <Resetter />
    </div>
  );
};

export default App;
