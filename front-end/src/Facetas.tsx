import React, { useState } from "react";

interface Propiedades {
    facetas : string[];
    onSelectFaceta : (faceta: string) =>void
}
function Facetas({facetas, onSelectFaceta}: Propiedades){
    const [selectedList, setSelectedList] = useState(-1);
  

    return(
    //<div className="w-1/6 px-12 h-screen py-12">
    <ul className="menu bg-base-200 rounded-box w-56 top-20">
        {facetas.map((faceta, index) => (
        <li 
            key={index}
            onClick={() => { 
                setSelectedList(index)
                onSelectFaceta(faceta)}
            }
        >
            <a className={index == selectedList ? "bg-secondary-content m-1": " m-1"}>{faceta}</a>
        </li>
    ))}
    </ul>
    //</div>
    )
}

export default Facetas