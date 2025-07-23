import {createContext, useState} from 'react';

export const ContextAPI = createContext();

export default ContextProvider = ({children}) => {
  return <ContextAPI.Provider value={{}}>{children}</ContextAPI.Provider>;
};
