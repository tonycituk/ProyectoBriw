import React from "react"
interface Propiedades {
    sugerencias : string[];
    itemSeleccionado : number;
    onSelectSugerencia : (sugerencia: string) =>void
}

function Sugerencias({sugerencias, itemSeleccionado,onSelectSugerencia} : Propiedades) {
    if(sugerencias.length < 0){
     return (<div className=" hidden border-none"></div>)
    }
    return (
        <ul className="absolute z-10000 left-0 mt-2 w-full rounded-md shadow-lg bg-neutral">
          {sugerencias.map((sugerencia, index) => (

            <li
              key={index}
              className={(itemSeleccionado == index)? "px-4 py-2 cursor-pointer bg-accent-content hover:bg-accent-content": "px-4 py-2 cursor-pointer hover:bg-accent-content" }
              onClick={() => {onSelectSugerencia(sugerencia)}}
            >
              {sugerencia}
            </li>
          ))}
          
        </ul>
    )
 
  }
  
  export default Sugerencias