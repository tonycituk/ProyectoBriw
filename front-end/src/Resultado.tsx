import React, { useContext, useState } from "react";
import { UserContext } from "./context/UserContext";
import ModalScreenshot from "./ModalScreenshot";

function ResultadoBusqueda({ titulo, snippet, logo, url }) {
  const { favoritos, setFavoritos } = useContext(UserContext);
  const [ tituloModal, setTituloModal] = useState("");
  const [ linkModal, setLinkModal] = useState("");
  const [ showPreview, setShowPreview] = useState(false);

  const shouldAddToFavorites = () => {
    if (favoritos.some((favorito) => favorito.url === url)) {
      setFavoritos(favoritos.filter((favorito) => favorito.url !== url));
    } else {
      setFavoritos([...favoritos, { titulo, url, logo }]);
    }
  };

  const modalHandler = (response : string) => {
    setShowPreview(false);
  }

  return (
    <div className=" border-secondary p-4 rounded-lg shadow-md flex items-center space-x-4 mr-12 z-0">
      {logo && (
        <div className="w-12 h-12 bg-neutral rounded-full flex justify-center">
          <img className="rounded-full" src={logo} alt="page logo" />
        </div>
      )}
      <div className="flex-grow">
        <a
          href={url}
          className="font-medium text-accent hover:underline"
          target="_blank"
          rel="noopener noreferrer"
        >
          {titulo}
        </a>
        <p className="text-gray-500">{snippet}</p>
        <a
          href={url}
          className="text-sm text-gray-400 hover:text-gray-600 hover:underline"
          target="_blank"
          rel="noopener noreferrer"
        >
          {url}
        </a> <br/>
        <button className= {
          (snippet == "Archivo subido por el usuario")? "hidden" : "btn"
        } onClick={() => {
          setTituloModal(titulo);
          setLinkModal("http://localhost/BRIW/ProyectoBRIW/Back/Screenshot.php?link=" + {url});
          setShowPreview(true);
          }}>Previsualizar página</button>
          {showPreview && (
          //Elemento Modal
          <ModalScreenshot 
            titulo = {titulo} 
            link = {"http://localhost/BRIW/ProyectoBRIW/Back/Screenshot.php?link=" + url}
            closeModal = {modalHandler}
            >
          </ModalScreenshot>
          )}
      </div>
      <button id="favButton" onClick={() => shouldAddToFavorites()}>
        <span className="material-icons-outlined">
          {favoritos.some((favorito) => favorito.url === url)
            ? "star"
            : "star_border"}
        </span>
      </button>
    </div>
  );
}



export default ResultadoBusqueda;
