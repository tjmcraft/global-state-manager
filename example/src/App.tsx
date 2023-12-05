import React from "react";
import { StateStore, Provider } from "global-state-manager";

const stateStore = new StateStore();

const App = () => {
	return (
		<Provider store={stateStore}>
			<div></div>
		</Provider>
	);
};

export default App;