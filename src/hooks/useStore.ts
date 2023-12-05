import { StateStore } from "StateStore"
import useGsmContext from "./useGsmContext";


const useStore = () => {
	const { store } = useGsmContext();
	return store as StateStore;
}

export default useStore;