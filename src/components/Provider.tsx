import React from "react";
import type { ReactNode, Context } from "react";
import ReactGSMContext, { ReactGSMContextValue } from "GsmContext";
import { Store } from "StateStore";

export interface ProviderProps<S extends AnyLiteral, A> {
	store: Store<S, A>,
	context?: Context<ReactGSMContextValue | null>,
	children: ReactNode,
}

const Provider = <S extends AnyLiteral, A>({
	store,
	context,
	children,
}: ProviderProps<S, A>) => {

	const contextValue = React.useMemo(() => {
		return { store };
	}, [store]);

	const Context = context || ReactGSMContext;

	return <Context.Provider value={contextValue} children={children} />;

};

export default Provider;