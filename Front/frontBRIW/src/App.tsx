//import Buscador from "./buscador"
import React, { useState , useEffect} from "react"
//No se preocupen, no es un erro, (Bueno, si pero no, el caso es que funciona)
import Buscador from './Buscador'
import Resultado from "./Resultado"
import Facetas from "./Facetas"


interface Resultado {
  titulo: string;
  snippet: string;
  logo: string;
  url: string
  id : number;
}

const params = new URLSearchParams({
  q: 'méxico',
  f: '',
});


function App() {
  const initRes: Resultado[] = []
  const [resultados, setResultados] = useState(initRes);
  const [facetas, setFacetas] = useState([""]);
  const [lastQuery, setLastQuery] = useState("");
  const baseUrl = window.location.origin; 
  const endpoint = '/ProyectoBRIW/Back/search.php';
  
  const [fileList, setFileList] = useState<FileList | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFileList(e.target.files);
    }
  };


  const handleOnEnter = async (busqueda: string) => {
    try {
      const data = await obtenerResultados(busqueda);
      //const data = await fetchDataFromPHP();
      const actual: Resultado[] = [];
      const actualFacet: string[] = [];

      // Procesar datos de la búsqueda
      data.result.forEach(resultado => {
        console.log(resultado);
        actual.push({
          logo: resultado.icon_url,
          titulo: resultado.value,
          snippet: resultado.id,
          url: resultado.url,
          id : resultado.index
        });

        if(resultado.categories.length > 0){
          (actualFacet.indexOf(resultado.categories[0]) == -1)? actualFacet.push(resultado.categories[0]) : false
        }
      });

      // Actualizar estados
      setFacetas(actualFacet);
      setResultados(actual);
      setLastQuery(busqueda);
    } catch (error) {
      console.error('Error al obtener consulta:', error);
    }
  };
  const handleOnEnter1 = (busqueda: string)=>{
    if(!(busqueda=='')){
      fetchDataFromPHP(busqueda).then(
        data=>{
          const actual: Resultado[] = [];
        const actualFacet: string[] = [];
        console.log(data);
        for(const resultado of data.results){
          
          actual.push({
            logo: resultado.icon_url,
            titulo: resultado.value,
            snippet: resultado.id,
            url: resultado.url,
            id : resultado.index
          })
          
        }
        setResultados(actual);
        for (let i = 1; i < 18; i++) {
          //console.log (data.categories[i]);
          if(data.categories){
            if(!(data.categories[i] =='')){
              if(data.categories[i].length > 2){
                const value = parseInt(data.categories[i]);
                if (isNaN(value)) {
                  actualFacet.push(data.categories[i+1] + " " + data.categories[i]);
                }
              }
            }
          }
          
        }
        setFacetas(actualFacet);
        setLastQuery(busqueda);
        }
      )
    }
  }

  const handlerFaceta = (faceta: string)=>{
    let parts = faceta.split(' '); 
    let f = parts[1]
    fetchDataFromPHPWithFaceta(lastQuery, f).then(
      data=>{
        const actual: Resultado[] = [];
      const actualFacet: string[] = [];
      console.log(data);
      for(const resultado of data.results){
        
        actual.push({
          logo: resultado.icon_url,
          titulo: resultado.value,
          snippet: resultado.id,
          url: resultado.url,
          id : resultado.index
        })
        
      }
      setResultados(actual);
      }
    )
  }

  const files = fileList ? [...fileList] : [];

  const handleUpload = async () => {
    document.getElementById('loadingModal').showModal();
    document.getElementById('loadingSpin').style.display="block";
    document.getElementById('loadingCompl').style.display="none";
    document.getElementById('loadingWarn').style.display="none";
    if (fileList) {
      console.log("Uploading file...");
      const formData = new FormData();
      files.forEach((file, i ) => {
        formData.append(`archivos[]`, file)
      });
      console.log(Array.from(formData.keys()).length);
      try {
        // You can write the URL of your server or any other endpoint used for file upload
        const result = await fetch(`http://localhost/BRIW/ProyectoBRIW/Back/subirpdf.php`, {
          method: "POST",
          body: formData
        }).then(response=>{
          if(response.status===200){
            console.log("Exito");
            document.getElementById('loadingSpin').style.display="none";
            document.getElementById('loadingCompl').style.display="block";
            
          }else{
            document.getElementById('loadingSpin').style.display="none";
            document.getElementById('loadingWarn').style.display="block";
          }
        });
      } catch (error) {
        console.error(error);
      }
    }
    setTimeout(() => {
      document.getElementById('exitBtn').click();
    }, 3000);
    
    
  }

  

  return(<>
    <div className="navbar bg-neutral text-primary-conten sticky top-0 h-auto">
      <button className="btn btn-ghost text-xl">BRIW</button>
      {/* Modal para subir PDFs */}
      <button className="btn" onClick={()=>document.getElementById('ModalPDF').showModal()}>Subir PDF</button>
      <dialog id="ModalPDF" className="modal">
        <div className="modal-box">
          <h3 className="font-bold text-lg">Sube tu PDF haciendo click al botón.</h3>
            <div className="py-10 px-10 mx-0 min-w-full flex flex-col items-center">
              <input type="file" onChange={handleFileChange} accept="application/pdf" name="archivos[]" multiple/>
              <br />
              <input className="btn btn-wide btn-accent" onClick={handleUpload} value="Indexar archivos" name="subir"/>
            </div> 
          
          
          <div className="modal-action">
            <form method="dialog">
              {/* if there is a button in form, it will close the modal */}
              <button className="btn">Close</button>
            </form>
          </div>
        </div>
      </dialog>
      
      {/*Loading*/}

      <dialog id="loadingModal" className="modal">
        <div className="modal-box">
            <div className="py-10 px-10 mx-0 min-w-full flex flex-col items-center" id="loadingSpin">
              <span className="loading loading-spinner loading-lg"></span>
            </div>
            <div role="alert" className="alert alert-success" id="loadingCompl">
              <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              <span>Archivo indexado con exito</span>
            </div>
            <div role="alert" className="alert alert-warning" id="loadingWarn">
              <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              <span>Hubo un problema.</span>
            </div>
        </div>
        <form method="dialog" className="modal-backdrop">
          <button id="exitBtn">close</button>
        </form>
      </dialog>

      {/* Modal para subir PDFs */}
    </div>
    <div className="flex justify-center items-center h-screen">
  
    {facetas.length > 0 && 
    //Elemento Facetas
    <Facetas 
        facetas={facetas}
        onSelectFaceta={handlerFaceta} 
       >
    </Facetas>}
  
      <div className="flex flex-col items-center h-screen w-full m-12">
        <Buscador onEnter={handleOnEnter1 /*Barra de busqueda*/}/>
        <div className="justify-content w-full">
        { resultados.map((resultado) =>(
          /*Cuando setResultadosSeUsa, todo esto cambia*/
          <Resultado
          key={resultado.id}
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


async function obtenerResultados(busqueda: string) {
  //const response = await fetch(`https://api.chucknorris.io/jokes/search?query=${busqueda}`);
  const response = await fetch(`http://localhost/BRIW/ProyectoBRIW/Back/search.php?q=${busqueda}`);
  if (!response.ok) {
    throw new Error('Error fetching');
  }
  const data = await response.json();
  return data;
}

async function fetchDataFromPHP (busqueda : string ) {
  const response = await fetch(`http://localhost/BRIW/ProyectoBRIW/Back/search.php?q=${busqueda}`);
  if (!response.ok) {
    throw new Error('Error fetching');
  }
  const data = await response.json();
  return data; 
    
};

async function fetchDataFromPHPWithFaceta(lastQuery : string, faceta: string) {
  //const response = await fetch(`https://api.chucknorris.io/jokes/search?query=${busqueda}`);
  const response = await fetch(`http://localhost/BRIW/ProyectoBRIW/Back/search.php?q=${lastQuery}&f=${faceta}`);
  if (!response.ok) {
    throw new Error('Error fetching');
  }
  const data = await response.json();
  return data;
  }
}

export default App;
