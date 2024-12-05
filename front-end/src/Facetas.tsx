import React, { useState } from "react";

interface Propiedades {
  facetas: string[];
  onSelectFaceta: (faceta: string) => void;
}

function Facetas({ facetas, onSelectFaceta }: Propiedades) {
  const [selectedList, setSelectedList] = useState(-1);
  const [isMenuOpen, setIsMenuOpen] = useState(true); // Controlar si el menú está abierto

  const handleMenuToggle = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleItemClick = (faceta: string, index: number) => {
    setSelectedList(index);
    onSelectFaceta(faceta);
    setIsMenuOpen(false); // Opcional, cerrar el menú después de seleccionar una faceta
  };

  return (
    <div
      className="menu-container"
      onMouseEnter={() => setIsMenuOpen(true)} // Mantener abierto el menú al pasar el mouse
      onMouseLeave={() => setIsMenuOpen(false)} // Cerrar el menú al sacar el mouse
    >
      {/* Botón o área para activar el menú (si es necesario) */}
      <button onClick={handleMenuToggle}>Toggle Menu</button>

      {isMenuOpen && (
        <ul className="menu bg-base-200 rounded-box w-56 top-20">
          {facetas.map((faceta, index) => (
            <li
              key={index}
              onClick={() => handleItemClick(faceta, index)} // Seleccionar faceta
            >
              <a
                className={index === selectedList ? "bg-secondary-content m-1" : "m-1"}
              >
                {faceta}
              </a>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default Facetas;
