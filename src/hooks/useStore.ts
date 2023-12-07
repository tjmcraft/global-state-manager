import { Store } from "StateStore";
import useGsmContext from "./useGsmContext";

const useStore = <S extends AnyLiteral, Action>() => {
	const { store } = useGsmContext();
	return store as Store<S, Action>;
}

export default useStore;