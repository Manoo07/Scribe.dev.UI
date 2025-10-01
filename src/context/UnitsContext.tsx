import { createContext, useContext, useState } from "react";

export interface UnitInfo {
  id: string;
  name: string;
}

interface UnitsContextType {
  units: UnitInfo[];
  setUnits: (units: UnitInfo[]) => void;
}

const UnitsContext = createContext<UnitsContextType | undefined>(undefined);

export const UnitsProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [units, setUnits] = useState<UnitInfo[]>([]);
  return (
    <UnitsContext.Provider value={{ units, setUnits }}>
      {children}
    </UnitsContext.Provider>
  );
};

export const useUnitsStore = () => {
  const ctx = useContext(UnitsContext);
  if (!ctx)
    throw new Error("useUnitsStore must be used within a UnitsProvider");
  return ctx;
};
