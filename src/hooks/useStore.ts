import { StateStoreInterface } from "StateStore";
import useGsmContext from "./useGsmContext";


const useStore = <S extends AnyLiteral, Action>() => {
	const { store } = useGsmContext();
	return store as StateStoreInterface<S, Action>;
}

export default useStore;