import React from "react";
import { StateStore, Provider } from "global-state-manager";
import Main from "./Main";
import { getDispatch, stateStore } from "./store/Global";

getDispatch().init();

const App = () => {
	return (
		<Provider store={stateStore}>
			<div className="app">
				<Main />
			</div>
		</Provider>
	);
};

export default App;