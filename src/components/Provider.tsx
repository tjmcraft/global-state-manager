import { ReactGSMContextValue } from "GsmContext";
import type { ReactNode, Context } from "react";
import React from "react";
import type { StateStore } from "StateStore";

export interface ProviderProps {
	store: StateStore,
	context: Context<ReactGSMContextValue | null>,
	children: ReactNode,
}

const Provider = ({ store, context, children }: ProviderProps) => {

	const contextValue = React.useMemo(() => {
		return { store };
	}, [store]);

	const Context = context || 1;

	return <Context.Provider value={contextValue} children={children} />;

};

export default Provider;