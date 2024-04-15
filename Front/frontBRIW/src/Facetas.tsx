import React from "react";

interface Propiedades {
    facetas : string[];
    onSelectFaceta : (faceta: string) =>void
}
function Facetas({facetas, onSelectFaceta}: Propiedades){
    return(
    <div className="w-1/6 px-12 h-screen py-12 sticky">
    <ul className="menu bg-base-200 rounded-box w-28">
        {facetas.map((faceta, index) => (
        <li
            key={index}
            onClick={() => {onSelectFaceta(faceta)}}
        >
            <a>{faceta}</a>
        </li>
    ))}
    </ul>
    </div>
    )
}

export default Facetas