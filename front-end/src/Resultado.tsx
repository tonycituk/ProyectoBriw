import React, { useContext, useState } from "react";
import { UserContext } from "./context/UserContext";

function ResultadoBusqueda({ titulo, snippet, logo, url }) {
  const [ tituloModal, setTituloModal] = useState("");
  const [ linkModal, setLinkModal] = useState("");
  const [ showPreview, setShowPreview] = useState(false);


  const modalHandler = (response : string) => {
    setShowPreview(false);
  }

  return (
    <div className=" border-secondary p-4 rounded-lg shadow-md flex items-center space-x-4 mr-12 z-0">
      
      <div className="flex-grow">
        <a
          href={url}
          className="font-medium text-accent hover:underline"
          target="_blank"
          rel="noopener noreferrer"
        >
          {titulo}
        </a>
        <p className="text-gray-300">{snippet}</p>
        <a
          href={url}
          className="text-sm text-gray-400 hover:text-gray-600 hover:underline"
          target="_blank"
          rel="noopener noreferrer"
        >
          {url}
        </a> <br/>
      </div>
    </div>
  );
}



export default ResultadoBusqueda;
