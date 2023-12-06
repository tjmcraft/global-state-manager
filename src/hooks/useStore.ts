import { StateStore } from "StateStore"
import useGsmContext from "./useGsmContext";


const useStore = <S extends AnyLiteral, Action>() => {
	const { store } = useGsmContext();
	return store as StateStore<S, Action>;
}

export default useStore;