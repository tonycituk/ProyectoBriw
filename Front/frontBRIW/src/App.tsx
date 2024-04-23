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
  const baseUrl = window.location.origin;
  const endpoint = "/ProyectoBRIW/Back/search.php";
  const [loading, setLoading] = useState(false);

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

  return (
    <>
      <div className="flex justify-between navbar bg-neutral text-primary-conten sticky top-0 h-auto">
        <button className="btn btn-ghost text-xl">BRIW</button>
        {loading && (
          <span className="loading loading-spinner loading-lg text-primary"></span>
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
              url={"http://localhost/briw"}
            />
            <Resultado
              titulo={"Facebook"}
              snippet={"Chismes de facebook"}
              logo={"./facebook.svg"}
              url={"https://facebook.com"}
            />
          </div>
        </div>
      </div>
    </>
  );
}
const backLink = "http://localhost/briw/Back/search.php";
async function obtenerResultados(busqueda: string) {
  //const response = await fetch(`https://api.chucknorris.io/jokes/search?query=${busqueda}`);
  const response = await fetch(
    `http://localhost/briw__/ProyectoBRIW/Back/search.php?q=${busqueda}`
  );
  if (!response.ok) {
    throw new Error("Error fetching");
  }
  const data = await response.json();
  return data;
}

async function fetchDataFromPHP(busqueda: string) {
  const response = await fetch(`${backLink}?q=${busqueda}`);
  if (!response.ok) {
    throw new Error("Error fetching");
  }
  const data = await response.json();
  return data;
}

async function fetchDataFromPHPWithFaceta(lastQuery: string, faceta: string) {
  //const response = await fetch(`https://api.chucknorris.io/jokes/search?query=${busqueda}`);
  const response = await fetch(`${backLink}?q=${lastQuery}&f=${faceta}`);
  if (!response.ok) {
    throw new Error("Error fetching");
  }
  const data = await response.json();
  return data;
}

export default App;
