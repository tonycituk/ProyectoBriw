import React, { useEffect, useState } from "react";
import { UserContext } from "./UserContext";
import { Favorito } from "../interfaces/Favorito";

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
  const [favoritos, setFavoritos] = useState<Favorito[]>(
    JSON.parse(localStorage.getItem("favoritos")!) || []
  );

  useEffect(() => {
    localStorage.setItem("favoritos", JSON.stringify(favoritos));
  }, [favoritos]);

  return (
    <UserContext.Provider value={{ favoritos, setFavoritos }}>
      {children}
    </UserContext.Provider>
  );
};
