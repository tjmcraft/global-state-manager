import { createContext } from "react";
import type { StateStore } from "StateStore";

export interface ReactGSMContextValue<S extends AnyLiteral = any, A = unknown> {
	store: StateStore<S,A>;
}

export const ReactGSMContext = createContext<ReactGSMContextValue | null>(null as any);

export type ReactGSMContextInstance = typeof ReactGSMContext

export default ReactGSMContext;