//import Buscador from "./buscador"
import React, { useState, useEffect } from "react";
//No se preocupen, no es un erro, (Bueno, si pero no, el caso es que funciona)
import Buscador from "./Buscador";
import Resultado from "./Resultado";
import Facetas from "./Facetas";
import MenuFavoritos from "./MenuFavoritos";

interface Resultado {
  titulo: string;
  snippet: string;
  logo: string;
  url: string;
  id: number;
}

const params = new URLSearchParams({
  q: "méxico",
  f: "",
});

function App() {
  const initRes: Resultado[] = [];
  const [resultados, setResultados] = useState(initRes);
  const [facetas, setFacetas] = useState([""]);
  const [lastQuery, setLastQuery] = useState("");
  //const baseUrl = window.location.origin;
  const endpoint = "/ProyectoBRIW/Back/search.php";
  const [loading, setLoading] = useState(false);
  const [fileList, setFileList] = useState<FileList | null>(null);
  const [urlInput, setUrlInput] = useState(""); 
  const [crawlResults, setCrawlResults] = useState(""); 

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFileList(e.target.files);
    }
  };

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUrlInput(e.target.value);
  };
  
  const handleCrawlSubmit = async () => {
    if (urlInput) {
      setLoading(true);
      try {
        const response = await fetch(`${import.meta.env.VITE_BASE_URL}/crawler.php?url=${encodeURIComponent(urlInput)}`);
        if (!response.ok) {
          throw new Error("Failed to start crawl");
        }
        const data = await response.json();
        setCrawlResults("Crawl completed successfully. Data is ready.");
        setResultados(data);
      } catch (error) {
        console.error("Error during crawl:", error);
        setCrawlResults("Error during crawl process.");
      } finally {
        setLoading(false);
      }
    }
  };

  const handleOnEnter = async (busqueda: string) => {
    try {
      const data = await obtenerResultados(busqueda);
      //const data = await fetchDataFromPHP();
      const actual: Resultado[] = [];
      const actualFacet: string[] = [];

      // Procesar datos de la búsqueda
      data.result.forEach((resultado) => {
        console.log(resultado);
        actual.push({
          logo: resultado.icon_url,
          titulo: resultado.value,
          snippet: resultado.id,
          url: resultado.url,
          id: resultado.index,
        });

        if (resultado.categories.length > 0) {
          actualFacet.indexOf(resultado.categories[0]) == -1
            ? actualFacet.push(resultado.categories[0])
            : false;
        }
      });

      // Actualizar estados
      setFacetas(actualFacet);
      setResultados(actual);
      setLastQuery(busqueda);
    } catch (error) {
      console.error("Error al obtener consulta:", error);
    }
  };
  const handleOnEnter1 = (busqueda: string) => {
    if (!(busqueda == "")) {
      setLoading(true);
      fetchDataFromPHP(busqueda)
        .then((data) => {
          const actual: Resultado[] = [];
          const actualFacet: string[] = [];
          console.log(data);
          for (const resultado of data.results) {
            actual.push({
              logo: resultado.icon_url,
              titulo: resultado.value,
              snippet: resultado.id,
              url: resultado.url,
              id: resultado.index,
            });
          }
          setResultados(actual);
          for (let i = 1; i < 18; i++) {
            //console.log (data.categories[i]);
            if (data.categories) {
              if (!(data.categories[i] == "")) {
                if (data.categories[i].length > 2) {
                  const value = parseInt(data.categories[i]);
                  if (isNaN(value)) {
                    actualFacet.push(
                      data.categories[i + 1] + " " + data.categories[i]
                    );
                  }
                }
              }
            }
          }
          setFacetas(actualFacet);
          setLastQuery(busqueda);
        })
        .finally(() => {
          setLoading(false); // Ocultar spinner de carga
        });
    }
  };

  const handlerFaceta = (faceta: string) => {
    let parts = faceta.split(" ");
    let f = parts[1];
    setLoading(true);
    fetchDataFromPHPWithFaceta(lastQuery, f)
      .then((data) => {
        const actual: Resultado[] = [];
        const actualFacet: string[] = [];
        console.log(data);
        for (const resultado of data.results) {
          actual.push({
            logo: resultado.icon_url,
            titulo: resultado.value,
            snippet: resultado.id,
            url: resultado.url,
            id: resultado.index,
          });
        }
        setResultados(actual);
      })
      .finally(() => {
        setLoading(false); // Ocultar spinner de carga
      });
  };

  const files = fileList ? [...fileList] : [];

  const handleUpload = async () => {
    document.getElementById("loadingModal").showModal();
    document.getElementById("loadingSpin").style.display = "block";
    document.getElementById("loadingCompl").style.display = "none";
    document.getElementById("loadingWarn").style.display = "none";
    if (fileList) {
      console.log("Uploading file...");
      const formData = new FormData();
      files.forEach((file, i) => {
        formData.append(`archivos[]`, file);
      });
      console.log(Array.from(formData.keys()).length);
      try {
        // You can write the URL of your server or any other endpoint used for file upload
        const result = await fetch(`${import.meta.env.VITE_BASE_URL}/subirpdf.php`, {
          method: "POST",
          body: formData,
        }).then((response) => {
          if (response.status === 200) {
            console.log("Exito");
            document.getElementById("loadingSpin").style.display = "none";
            document.getElementById("loadingCompl").style.display = "block";
          } else {
            document.getElementById("loadingSpin").style.display = "none";
            document.getElementById("loadingWarn").style.display = "block";
          }
        });
      } catch (error) {
        console.error(error);
      }
    }
    setTimeout(() => {
      document.getElementById("exitBtn").click();
    }, 3000);
  };

  const handleGenerateFile = async (fileType: string) => {
    const endpoint = `${import.meta.env.VITE_API_REPORTE_URL}/generate-files/${fileType}`;
    try {
      const response = await fetch(endpoint, {
        method: "GET",
      });
      if (!response.ok) {
        throw new Error("Error al generar el archivo");
      }
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `archivo.${fileType}`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error(`Error al generar el archivo ${fileType}:`, error);
    }
  };

  return (
    <>
      <div className="flex justify-between navbar bg-neutral text-primary-conten sticky top-0 h-auto">
        <button className="btn btn-ghost text-xl">BRIW</button>
        {/* Modal para subir PDFs */}
        <button
          className="btn"
          onClick={() => document.getElementById("ModalPDF").showModal()}
        >
          Subir PDF
        </button>
        <dialog id="ModalPDF" className="modal">
          <div className="modal-box">
            <h3 className="font-bold text-lg">
              Sube tu PDF haciendo click al botón.
            </h3>
            <div className="py-10 px-10 mx-0 min-w-full flex flex-col items-center">
              <input
                type="file"
                onChange={handleFileChange}
                accept="application/pdf"
                name="archivos[]"
                multiple
              />
              <br />
              <input
                className="btn btn-wide btn-accent"
                onClick={handleUpload}
                value="Indexar archivos"
                name="subir"
              />
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
            <div
              className="py-10 px-10 mx-0 min-w-full flex flex-col items-center"
              id="loadingSpin"
            >
              <span className="loading loading-spinner loading-lg"></span>
            </div>
            <div role="alert" className="alert alert-success" id="loadingCompl">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="stroke-current shrink-0 h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span>Archivo indexado con exito</span>
            </div>
            <div role="alert" className="alert alert-warning" id="loadingWarn">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="stroke-current shrink-0 h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span>Hubo un problema.</span>
            </div>
          </div>
          <form method="dialog" className="modal-backdrop">
            <button id="exitBtn">close</button>
          </form>
        </dialog>

        {/* Modal para subir PDFs */}
        {loading && (
          <span className="loading loading-spinner loading-lg text-primary"></span>
        )}

        <button
          className="btn btn-primary"
          onClick={() => handleGenerateFile("pdf")}
        >
          Generar PDF
        </button>
        <button
          className="btn btn-secondary"
          onClick={() => handleGenerateFile("xlsx")}
        >
          Generar Excel
        </button>

                {/* Add the input field for URL */}
        <div className="flex flex-col items-center mt-5">
          <input
            type="text"
            className="input input-bordered"
            placeholder="Enter URL to crawl"
            value={urlInput}
            onChange={handleUrlChange}
          />
          <button
            className="btn btn-primary mt-3"
            onClick={handleCrawlSubmit}
            disabled={loading}
          >
            Start Crawl
          </button>
        </div>

        {/* Loading Spinner */}
        {loading && <span className="loading loading-spinner loading-lg text-primary"></span>}

        {/* Result message after crawling */}
        {crawlResults && (
          <div className="mt-5 text-center">
            <p>{crawlResults}</p>
          </div>
        )}

        <MenuFavoritos />
      </div>
      <div className="flex justify-center items-center h-screen">
        {facetas.length > 0 && (
          //Elemento Facetas
          <Facetas facetas={facetas} onSelectFaceta={handlerFaceta}></Facetas>
        )}

        <div className="flex flex-col items-center h-screen w-full m-12">
          <Buscador onEnter={handleOnEnter1 /*Barra de busqueda*/} />
          <div className="justify-content w-full">
            {resultados.length > 0 ? (
              resultados.map((resultado) => (
                /*Cuando setResultadosSeUsa, todo esto cambia*/
                <Resultado
                  key={resultado.id}
                  titulo={resultado.titulo}
                  snippet={resultado.snippet}
                  //No se preocupen, la ip de chuck norris no tiene imagenes
                  logo={resultado.logo}
                  url={resultado.url}
                />
              ))
            ) : (
              <Resultado
                titulo={"Bienvenido a sistema Briw"}
                snippet={"Inicia usando el buscador o sube tu propio PDF."}
                logo={"./pat.svg"}
                url={""}
              />
            )}
          </div>
        </div>

      </div>
    </>
  );
}

async function obtenerResultados(busqueda: string) {
  const response = await fetch(
    `${import.meta.env.VITE_BASE_URL}/search.php?q=${busqueda}`
  );
  if (!response.ok) {
    throw new Error("Error fetching");
  }
  const data = await response.json();
  return data;
}

async function fetchDataFromPHP(busqueda: string) {
  const response = await fetch(`${import.meta.env.VITE_BASE_URL}/search.php?q=${busqueda}`);
  if (!response.ok) {
    throw new Error("Error fetching");
  }
  const data = await response.json();
  return data;
}

async function fetchDataFromPHPWithFaceta(lastQuery: string, faceta: string) {
  const response = await fetch(`${import.meta.env.VITE_BASE_URL}/search.php?q=${lastQuery}&f=${faceta}`);
  if (!response.ok) {
    throw new Error("Error fetching");
  }
  const data = await response.json();
  return data;
}

export default App;
