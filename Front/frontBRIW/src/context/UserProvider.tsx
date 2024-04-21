import React, { useEffect, useState } from "react";
import { UserContext } from "./UserContext";
import { Favorito } from "../interfaces/Favoritos";

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
  const [favoritos, setFavoritos] = useState<Favorito[]>([]);

  useEffect(() => {
    localStorage.setItem("favoritos", JSON.stringify(favoritos));
  }, [favoritos]);

  return (
    <UserContext.Provider value={{ favoritos, setFavoritos }}>
      {children}
    </UserContext.Provider>
  );
};
