//import Buscador from "./buscador"
import React, { useState } from "react"
//No se preocupen, no es un erro, (Bueno, si pero no, el caso es que funciona)
import Buscador from './Buscador'
import Resultado from "./Resultado"
import Facetas from "./Facetas"

interface Resultado {
  titulo: string
  snippet: string
  logo: string
  url: string


}

function App() {
  const initRes: Resultado[] = []
  const [resultados, setResultados] = useState(initRes);
  const [facetas, setFacetas] = useState([""]);

  const handleOnEnter = (busqueda: string) =>{
    const actual: Resultado[] = []
    var actualFacet: string[] = []
    obtenerResultados(busqueda).then(data => {
      data = data["result"]
      for(const resultado of data){
        actual.push({
          logo: resultado.icon_url,
          titulo: resultado.value,
          snippet: resultado.id,
          url: resultado.url
        })
        if(resultado.categories.length > 0){
          (actualFacet.indexOf(resultado.categories[0]) == -1)? actualFacet.push(resultado.categories[0]) : false
        }
      }
      //Cuando actualices la variable, todo lugar en donde la uses va a actualizarce
      setFacetas(actualFacet)
      setResultados(actual)
      
    })
  }

 return(<>
  <div className="navbar bg-neutral text-primary-conten sticky top-0 h-auto">
    <button className="btn btn-ghost text-xl">BRIW</button>
  </div>
  <div className="flex justify-center items-center h-screen">

  {facetas.length > 0 && 
  //Elemento Facetas
  <Facetas 
      facetas={facetas}
      onSelectFaceta={(faceta) => { console.log(faceta)} 
     }>
  </Facetas>}

    <div className="flex flex-col items-center h-screen w-full m-12">
      <Buscador onEnter={handleOnEnter /*Barra de busqueda*/}/>
      <div className="justify-content w-full">
      { resultados.map((resultado) =>(
        /*Cuando setResultadosSeUsa, todo esto cambia*/
        <Resultado
        key={resultado.titulo}
        titulo={resultado.titulo}
        snippet={resultado.snippet} 
        //No se preocupen, la ip de chuck norris no tiene imagenes
        logo={resultado.logo} 
        url={resultado.url}
      />
      ))}
      <Resultado 
        titulo={"Tremendo Proyecto"}
        snippet={"Debe ser un link a un lugar maravilloso"} 
        logo={"./pat.svg"} 
        url={"http://localhost/briw"}
      />
      </div>
    </div>
  </div>
</>)
}

async function obtenerResultados(busqueda) {
  try {
    //Simular que se está haciendo la consulta, Ip de chuck, huesos colorados norris
    const response = await fetch(`https://api.chucknorris.io/jokes/search?query=${busqueda}`);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error al obtener consulta:', error);
    return [];
  }
}

export default App
