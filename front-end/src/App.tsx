//import Buscador from "./buscador"
import React, { useState, useEffect } from "react";
//No se preocupen, no es un erro, (Bueno, si pero no, el caso es que funciona)
import Buscador from "./Buscador";
import Resultado from "./Resultado";
import Facetas from "./Facetas";
import MenuFavoritos from "./MenuFavoritos";
import DropdownFacets from "./DropdownFacets";

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
  const [loading, setLoading] = useState(false);
  const [fileList, setFileList] = useState<FileList | null>(null);
  const [dateFacets, setDateFacets] = useState<
    Array<{ val: string; count: number }>
  >([]);
  const [sizeFacets, setSizeFacets] = useState<
    Array<{ val: string; count: number }>
  >([]);
  const [siteFacets, setSiteFacets] = useState<
    Array<{ val: string; count: number }>
  >([]);
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
        const response = await fetch(
          `${import.meta.env.VITE_BASE_URL}/crawler.php?startUrl=${urlInput}`
        );
        if (!response.ok) {
          throw new Error("Failed to start crawl");
        }
        const data = await response;
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
          const actualDateFacets: Array<{ val: string; count: number }> = [];
          const actualSizeFacets: Array<{ val: string; count: number }> = [];
          const actualSiteFacets: Array<{ val: string; count: number }> = [];
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
          if (data.facets) {
            if (data.facets.date_facet) {
              setDateFacets(agruparFechas(data.facets.date_facet.buckets));
            }
            if (data.facets.size) {
              setSizeFacets(agruparTamanos(data.facets.size.buckets));
            }
            if (data.facets.url_facet) {
              setSiteFacets(data.facets.url_facet.buckets);
            }
          }
          setLastQuery(busqueda);
        })
        .finally(() => {
          setLoading(false); // Ocultar spinner de carga
        });
    }
    function agruparTamanos(sizeFacets: Array<{ val: string; count: number }>) {
      let rangosAgrupados: Array<{ val: string; count: number }> = [];
      let rangoInicio = 0;
      let rangoFin = 10000;
      let contador = 0;
      let index = 0;
      sizeFacets.forEach((facet) => {
        const valor = parseInt(facet.val, 10);
        if (valor > rangoInicio && valor < rangoFin) {
          //contador += facet.count;
          contador += facet.count;
        } else {
          rangosAgrupados.push({
            val: `${rangoInicio}-${rangoFin}`,
            count: sizeFacets.at(index++).count,
            //count: contador,
          });
          rangoInicio = rangoFin + 1;
          rangoFin += 10000;
          contador = facet.count; // Comenzar el conteo para el nuevo rango
        }
      });
      if (contador > 0) {
        rangosAgrupados.push({
          val: `${rangoInicio}-${rangoFin}`,
          count: contador,
        });
      }

      return rangosAgrupados;
    }
    function agruparFechas(sizeFacets: Array<{ val: string; count: number }>) {
      let rangosAgrupados: Array<{ val: string; count: number }> = [];

      for (let i = 0; i < sizeFacets.length; i++) {
        const fecha1 = sizeFacets[i];
        //const fecha2 = sizeFacets[i + 1];
        const fecha2 = new Date(fecha1.val);
        fecha2.setHours(fecha2.getHours() + 6);
        //const rangoVal = `${fecha1.val}|${fecha2.val}`;
        const rangoVal = `${fecha1.val}|${fecha2.toISOString()}`;
        //const sumaCount = fecha1.count + fecha2.count;
        const sumaCount = fecha1.count;
        rangosAgrupados.push({
          val: rangoVal,
          count: sumaCount,
        });
      }

      return rangosAgrupados;
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
  const handleSelectFacet = (facetType: string, facetValue: string) => {
    setLoading(true);
    fetchDataFromPHPWithNewFacet(lastQuery, facetType, facetValue)
      .then((data) => {
        const actual: Resultado[] = [];
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

  const handleGenerateFile = async (fileType: string) => {
    const endpoint = `${
      import.meta.env.VITE_API_REPORTE_URL
    }/generate-files/${fileType}`;
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
        const result = await fetch(
          `${import.meta.env.VITE_BASE_URL}/subirpdf.php`,
          {
            method: "POST",
            body: formData,
          }
        ).then((response) => {
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
        <div className="flex space-x-6">
          <input
            type="text"
            className="input input-bordered"
            placeholder="Enter URL to crawl"
            value={urlInput}
            onChange={handleUrlChange}
          />
          <button
            className="btn btn-primary"
            onClick={handleCrawlSubmit}
            disabled={loading}
          >
            Start Crawl
          </button>
        </div>

        {/* Result message after crawling */}
        {crawlResults && (
          <div className="mt-5 text-center">
            <p>{crawlResults}</p>
          </div>
        )}

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
        <MenuFavoritos />
      </div>
      <div className="flex justify-center items-center h-screen">
        <div className="flex flex-col justify-center items-center h-screen">
          {dateFacets.length > 0 ||
          sizeFacets.length > 0 ||
          siteFacets.length > 0 ? (
            <div className="w-full px-12 py-6">
              <DropdownFacets
                dateFacets={dateFacets}
                sizeFacets={sizeFacets}
                siteFacets={siteFacets}
                onSelectFacet={handleSelectFacet}
              />
            </div>
          ) : (
            <span>No hay facetas disponibles</span>
          )}
          <div className="w-full px-12 py-6">
            {facetas.length > 0 && (
              // Elemento Facetas
              <Facetas
                facetas={facetas}
                onSelectFaceta={handlerFaceta}
              ></Facetas>
            )}
          </div>
        </div>

        <div className="flex flex-col items-center h-screen w-full m-12">
          <Buscador onEnter={handleOnEnter1 /*Barra de busqueda*/} />
          <div className="justify-content w-full">
            {resultados.map((resultado) => (
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
              url={"https://www.google.com/"}
            />
          </div>
        </div>
      </div>
    </>
  );
}

async function obtenerResultados(busqueda: string) {
  //const response = await fetch(`https://api.chucknorris.io/jokes/search?query=${busqueda}`);
  const response = await fetch(
    `${import.meta.env.VITE_BASE_URL}/search.php?q=${busqueda}` +
      "&facet=true&facet.field=url&facet.range=size&facet.range=date&facet.range.start=0&facet.range.end=50000000&facet.range.gap=10000000&facet.range.start=NOW-1YEAR&facet.range.end=NOW&facet.range.gap=+1MONTH"
  );
  if (!response.ok) {
    throw new Error("Error fetching");
  }
  const data = await response.json();
  return data;
}

async function fetchDataFromPHP(busqueda: string) {
  const response = await fetch(
    `${import.meta.env.VITE_BASE_URL}/search.php?q=${busqueda}`
  );
  if (!response.ok) {
    throw new Error("Error fetching");
  }
  const data = await response.json();
  return data;
}

async function fetchDataFromPHPWithFaceta(lastQuery: string, faceta: string) {
  //const response = await fetch(`https://api.chucknorris.io/jokes/search?query=${busqueda}`);
  const response = await fetch(
    `${import.meta.env.VITE_BASE_URL}/search.php?q=${lastQuery}&f=${faceta}`
  );
  if (!response.ok) {
    throw new Error("Error fetching");
  }
  const data = await response.json();
  return data;
}

async function fetchDataFromPHPWithNewFacet(
  lastQuery: string,
  facetType: string,
  facetValue: string
) {
  //const response = await fetch(`https://api.chucknorris.io/jokes/search?query=${busqueda}`);
  const response = await fetch(
    `${
      import.meta.env.VITE_BASE_URL
    }/search.php?q=${lastQuery}&facetType=${facetType}&facetValue=${facetValue}`
  );
  if (!response.ok) {
    throw new Error("Error fetching");
  }
  const data = await response.json();
  return data;
}

export default App;
