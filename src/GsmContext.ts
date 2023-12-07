import { createContext } from "react";
import { StateStoreInterface } from "StateStore";


export interface ReactGSMContextValue<S extends AnyLiteral = any, A = unknown> {
	store: StateStoreInterface<S,A>;
}

export const ReactGSMContext = createContext<ReactGSMContextValue | null>(null as any);

export type ReactGSMContextInstance = typeof ReactGSMContext

export default ReactGSMContext;