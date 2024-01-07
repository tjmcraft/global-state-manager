import React, { useEffect } from "react";
import { connector, getDispatch, useAppGlobal, useStatic } from "./store/Global";

const Counter = () => {
  const count = useAppGlobal((e) => e.count);
  const { setCount } = getDispatch();
  const handleIncrement = () => setCount(count + 1);
  const handleDecrement = () => setCount(count - 1);
  useEffect(() => {
    console.log(">>render Counter", count);
  }, [count]);
  return (
    <div className="counter" style={{ border: "1px solid", padding: 8 }}>
      <h1 style={{ margin: 0 }}>Counter</h1>
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
    <div className="static-dependency">
      <pre>{JSON.stringify(staticData, null, 2)}</pre>
    </div>
  );
};

const ConnectedComponent = connector((global, props) => {
  return ({
    counter: global.count,
    id: props.id,
  })
})(({counter}) => {
  return (
    <div className="connected-component">
      <pre>{JSON.stringify(counter, null, 2)}</pre>
    </div>
  );
});

const App = () => {
  const count = useAppGlobal((e) => e.count);
  useEffect(() => {
    console.log(">>render App", count);
  }, [count]);
  return (
    <div className="app">
      <Counter />
      <StaticDependency id={Math.min(count, 2)} />
      <ConnectedComponent id={2} />
    </div>
  );
};

export default App;
