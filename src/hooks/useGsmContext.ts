import ReactGSMContext from "GsmContext";
import React from "react";


const useGsmContext = (context = ReactGSMContext) => {
	const contextValue = React.useContext(context);
	return contextValue!;
}

export default useGsmContext;