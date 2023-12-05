import React from "react";
import { Provider, StateStore } from "index";

const stateStore = new StateStore();

const App = () => {
	return (
		<Provider store={stateStore}>
			<div></div>
		</Provider>
	);
};

export default App;