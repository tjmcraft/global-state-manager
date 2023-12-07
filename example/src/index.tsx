import React from 'react';
import { createRoot } from 'react-dom/client';

import { Provider } from 'global-state-manager';

import { getDispatch, stateStore } from './store/Global';
import App from './App';

const root = createRoot(document.getElementById('app-root')!);

getDispatch().init();

root.render(
	<Provider store={stateStore}>
		<App />
	</Provider>
);