import { createContext } from "react";
import { Favorito } from "../interfaces/Favorito";

interface ContextProps {
  readonly favoritos: Favorito[];
  readonly setFavoritos: (favoritos: Favorito[]) => void;
}

export const UserContext = createContext<ContextProps>({
  favoritos: [],
  setFavoritos: () => null,
});
