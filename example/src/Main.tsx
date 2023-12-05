import { useGlobal } from "global-state-manager";
import React from "react";
import { getDispatch } from "./store/Global";

function Main() {
	const count = useGlobal(e => e.count);
  const { setCount } = getDispatch();
  const handleIncrement = () => setCount(count + 1);
  const handleDecrement = () => setCount(count - 1);
  console.log('>>render main')
  return (
    <div>
      <h1>state: {count}</h1>
      <button onClick={handleIncrement}>+</button>
      <button onClick={handleDecrement}>-</button>
    </div>
  );
}

export default Main;
