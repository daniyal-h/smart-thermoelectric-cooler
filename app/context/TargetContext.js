import { createContext, useContext, useState } from "react";

const TargetContext = createContext(null);

export const TargetProvider = ({ children }) => {
  const [target, setTarget] = useState(null); // target should be universal; context

  return (
    <TargetContext.Provider value={{ target, setTarget }}>
      {children}
    </TargetContext.Provider>
  );
};

export const useTarget = () => {
  const context = useContext(TargetContext);
  if (!context) {
    throw new Error("useTarget must be used within a TargetProvider");
  }
  return context;
};
