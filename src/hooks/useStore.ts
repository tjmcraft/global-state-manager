import { StateStore } from "StateStore"
import { useGsmContext } from "./useGSMContext"

const useStore = () => {
	const { store } = useGsmContext();
	return store as StateStore;
}

export default useStore;