import React from "react";

function ResultadoBusqueda({ titulo, snippet, logo, url }) {
    return (
      <div className=" border-secondary p-4 rounded-lg shadow-md flex items-center space-x-4 mr-12 z-0">
        {logo && (
            <div className=" w-12 bg-neutral rounded-full">
              <img  className="rounded-full" src={"./chuck.png"} alt="page logo"/> 
            </div>
        )}
        <div className="flex-grow">
          <a href={url} className="font-medium text-accent hover:underline" target="_blank" rel="noopener noreferrer">
            {titulo}
          </a>
          <p className="text-gray-500">{snippet}</p>
          <a href={url} className="text-sm text-gray-400 hover:text-gray-600 hover:underline" target="_blank" rel="noopener noreferrer">
            {url}
          </a>
        </div>
      </div>
    );
  }
  
  export default ResultadoBusqueda;
  