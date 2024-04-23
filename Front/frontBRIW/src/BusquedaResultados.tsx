import React, { useState, useEffect } from 'react';

interface Resultado {
  titulo: string;
  url: string;
}

function BusquedaResultados() {
  const [query, setQuery] = useState('');
  const [resultados, setResultados] = useState<Resultado[]>([]); // Especifica el tipo de resultados como un arreglo de Resultado
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null); // Especifica el tipo de error como string o null

  useEffect(() => {
    if (query.trim() !== '') {
      realizarConsulta(query);
    }
  }, [query]);

  const handleSearch = () => {
    if (query.trim() !== '') {
      realizarConsulta(query);
    }
  };

  const realizarConsulta = (query: string) => {
    setLoading(true);
    setError(null);
  
    const baseurl = "http://localhost:8983/solr/ProyectoFinal/select";
    const rows = 30;
  
    // Construir la consulta de búsqueda manualmente
    const queryParams = {
      q: `title:(${query}) OR content:(${query}) OR keywords_s:(${query})`,
      facet: 'true',
      'facet.field': 'keywords_s',
      'facet.sort': 'count',
      indent: 'true',
      'q.op': 'OR',
      start: 0,
      rows: rows,
      sort: 'score desc',
      sw: 'true',
      useParams: '',
    };
  
    // Función para convertir objeto de parámetros en cadena de consulta
    const queryString = Object.keys(queryParams)
      .map(key => encodeURIComponent(key) + '=' + encodeURIComponent(queryParams[key]))
      .join('&');
  
    const url = `${baseurl}?${queryString}`;
  
    fetch(url, {
      mode: 'no-cors'
    })
      .then(response => {
        if (!response.ok) {
          throw new Error('Error en la solicitud');
        }
        return response.json();
      })
      .then(data => {
        // Procesar la respuesta y actualizar el estado de resultados
        const facetFields = data.facet_counts.facet_fields;
        const facets = facetFields.keywords_s;
        const responseDocs = data.response.docs;
  
        // Actualizar el estado de resultados y facetas
        setResultados(responseDocs);
        // Aquí podrías manejar las facetas si las necesitas en tu componente
      })
      .catch(error => {
        setError('Error al realizar la búsqueda');
      })
      .finally(() => {
        setLoading(false);
      });
  };
  
  

  return (
    <div>
      {/* Barra de Búsqueda */}
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Ingrese su consulta..."
      />
      <button onClick={handleSearch} disabled={loading}>
        {loading ? 'Buscando...' : 'Buscar'}
      </button>

      {/* Presentación de Resultados */}
      {error && <p>{error}</p>}
      {resultados.length > 0 && (
        <div>
          <h2>Resultados:</h2>
          <ul>
            {resultados.map((resultado, index) => (
              <li key={index}>
                <a href={resultado.url} target="_blank" rel="noopener noreferrer">
                  {resultado.titulo}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default BusquedaResultados;
