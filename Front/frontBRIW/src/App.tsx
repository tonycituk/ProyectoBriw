//import Buscador from "./buscador"
import React from "react"
import Buscador from './Buscador'
import Resultado from "./Resultado"
import Facetas from "./Facetas"

function App() {

 return(<>
  <div className="navbar bg-neutral text-primary-conten sticky top-0">
    <button className="btn btn-ghost text-xl">BRIW</button>
  </div>
  <div className="flex justify-center items-center h-screen">
  <Facetas 
      facetas={["Item 1","Item 2", "Item 3"]}
      onSelectFaceta={(faceta) => { console.log(faceta)} 
     }>
  </Facetas>
    <div className="flex flex-col items-center h-screen w-full m-12">
      <Buscador />
      <div className="justify-content w-full">
      <Resultado 
        titulo={"Tremendo Proyecto"}
        snippet={"Debe ser un link a un lugar maravilloso"} 
        logo={"./pat.svg"} 
        url={"http://localhost/briw"}
      />
      <Resultado 
        titulo={"Otro Titulo"}
        snippet={"Otro snippet"} 
        logo={"./logo.svg"} 
        url={"http://example.com"}
      />
       <Resultado 
        titulo={"Tremendo Proyecto"}
        snippet={"Debe ser un link a un lugar maravilloso"} 
        logo={"./pat.svg"} 
        url={"http://localhost/briw"}
      />
       <Resultado 
        titulo={"Tremendo Proyecto"}
        snippet={"Debe ser un link a un lugar maravilloso"} 
        logo={"./pat.svg"} 
        url={"http://localhost/briw"}
      />
      <div className=" h-screen"></div>
      </div>
    </div>
  </div>
</>)
}

export default App
