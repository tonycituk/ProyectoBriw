$(document).ready(function () {
  const suggestionsContainer = $("#suggestionsContainer");

  const hideDropdownIfFocusedOutside = (event) => {
    const focusedElement = event.relatedTarget;
    if (focusedElement == null || !(focusedElement.classList.contains('dropdown-item') || focusedElement.id === 'queryInput')){
      suggestionsContainer.addClass('hidden');
    }
  }

  // Función para obtener sugerencias de ortografía desde la API de Google en español
  function mostrarSugerencias(sugerencias) {
    if (sugerencias?.length > 0) {
      suggestionsContainer
        .removeClass('hidden')
        .empty();

      sugerencias.forEach(sugerencia => {
        const sugerenciaElemento = $("<button>")
          .addClass('dropdown-item')
          .text(sugerencia)
          .on('focusout', hideDropdownIfFocusedOutside)
          .click(() => {
            obtenerResultados(sugerencia);
            obtenerPalabrasRelacionadas(sugerencia);
            $("#queryInput").val(sugerencia);
            suggestionsContainer.addClass('hidden').empty();
          });

        suggestionsContainer.append(sugerenciaElemento);
      });
    } else {
      suggestionsContainer.addClass('hidden').empty();
    }
  }

  // Escuchar el evento de cambio en el input
  $("#queryInput")
    .on('input', function () {
      const palabraConsulta = $(this).val();
      obtenerSugerencias(palabraConsulta);
    })
    .on('focus', () => suggestionsContainer.removeClass('hidden'))
    .on('focusout', hideDropdownIfFocusedOutside);

  // Función para obtener sugerencias de ortografía desde la API de Google en español
  function obtenerSugerencias(palabra) {
    // Llamada a la API de Google para español
    fetch(`https://inputtools.google.com/request?text=${palabra}&itc=es-t-i0-und&num=5`)
      .then(response => response.json())
      .then(data => {
        const sugerencias = data?.[1]?.[0]?.[1] || [];
        mostrarSugerencias(sugerencias);

        // Verificar si hay correcciones y mostrarlas
        if (sugerencias && sugerencias.length > 0) {
          const correccion = sugerencias[0]; // Tomar la primera sugerencia como corrección

          // Mostrar la corrección en el contenedor de correcciones
          mostrarCorreccion(correccion);
        }
      })
      .catch(error => console.error('Error al obtener sugerencias:', error));
  }

  // Función para mostrar las correcciones
  function mostrarCorreccion(correccion) {
    const correctionContainer = $("#correctionContainer");
    correctionContainer.empty(); // Limpiar el contenedor antes de mostrar la corrección

    if (correccion && correccion !== $("#queryInput").val()) {
      const correccionElemento = $("<p>").text(`Quizás quisiste decir: ${correccion}`);
      correctionContainer.html(correccionElemento); // Mostrar la corrección en el contenedor
    } else {
      correctionContainer.empty(); // Vaciar el contenedor si no hay corrección o es igual a la palabra original
    }
  }

  // Función para obtener y mostrar palabras relacionadas semánticamente
  function obtenerPalabrasRelacionadas(consulta) {
    const palabrasConsulta = $(".palabrasconsulta");

    // Verificar que haya una consulta escrita
    if (consulta === '') {
      palabrasConsulta.text('Por favor, ingresa una consulta válida.');
      return;
    }

    fetch(`https://api.datamuse.com/words?ml=${consulta}&max=5`)
      .then(respuesta => respuesta.json())
      .then(datos => {
        // Limpiar el contenedor antes de mostrar nuevas palabras
        palabrasConsulta.empty();

        // Mostrar la consulta original
        const consultaOriginal = $("<h2>").text(`Palabra consultada: ${consulta}`);
        palabrasConsulta.append(consultaOriginal);

        // Mostrar las palabras relacionadas
        const palabrasExpandidas = $("<h2>").text('Palabras relacionadas:');
        palabrasConsulta.append(palabrasExpandidas);

        // Mostrar las palabras obtenidas de la API
        datos.forEach(palabra => {
          const palabraElemento = $("<span>").text(palabra.word + ' ');
          palabrasConsulta.append(palabraElemento);
        });
      })
      .catch(error => console.error('Error al obtener palabras relacionadas:', error));
  }

  function obtenerResultados(consulta) {
    // Realizar la solicitud AJAX a search.php para realizar la búsqueda en Solr
    $.ajax({
      url: "../Back/search.php", // Ruta a search.php desde index.html
      data: {
        q: consulta // La consulta que se enviará a search.php
      },
      success: function (respuesta) {
        console.log("Resultados de Solr desde PHP:", respuesta);
        // Mostrar los resultados en la sección searchResults
        mostrarResultados(respuesta);
      },
      error: function (xhr, estado, error) {
        console.error("Error al buscar en Solr desde PHP:", error);
        $("#searchResults").empty().append("<p>Error al buscar en Solr desde PHP</p>");
      }
    });
  }
  function obtenerResultadosFaceta(consulta, faceta) {
    // Realizar la solicitud AJAX a search.php para realizar la búsqueda en Solr
    $.ajax({
      url: "../Back/search.php", // Ruta a search.php desde index.html
      data: {
        q: consulta, // La consulta que se enviará a search.php
        f: faceta
      },
      success: function (respuesta) {
        console.log("Resultados de Solr desde PHP:", respuesta);
        // Mostrar los resultados en la sección searchResults
        mostrarResultados(respuesta);
      },
      error: function (xhr, estado, error) {
        console.error("Error al buscar en Solr desde PHP:", error);
        $("#searchResults").empty().append("<p>Error al buscar en Solr desde PHP</p>");
      }
    });
  }


  $("#executeButton").click(function () {
    const consulta = $("#queryInput").val(); // Obtener el valor del input
    obtenerResultados(consulta);
    obtenerPalabrasRelacionadas(consulta);
  });
});

$("#busquedaFacetada").click(function () {
  console.log("hola, fui presionado");
  const consulta = $("#queryInput").val(); // Obtener el valor del input
  const faceta = $('input[name="f"]:checked').val();
  console.log(faceta);
  obtenerResultadosFaceta(consulta, faceta);
  obtenerPalabrasRelacionadas(consulta);
});

function botonFaceta(){
  const consulta = $("#queryInput").val(); // Obtener el valor del input
  const faceta = $('input[name="f"]:checked').val();
  console.log(faceta);
  obtenerResultadosFaceta(consulta, faceta);
  obtenerPalabrasRelacionadas(consulta);
}

function displayRadioValue() {
  var ele = document.getElementsByName('gender');

  for (i = 0; i < ele.length; i++) {
      if (ele[i].checked)
          document.getElementById("result").innerHTML
              = "Gender: " + ele[i].value;
  }
}

// Función para mostrar los resultados en la lista de búsqueda
function mostrarResultados(resultados) {
  var listaResultados = $("#searchResults");
  listaResultados.empty(); // Limpiar la lista antes de agregar nuevos resultados

  if (resultados === "") {
    listaResultados.append("<p>No se encontraron resultados</p>");
  } else {
    listaResultados.append(resultados); // Agregar los resultados al contenedor
  }
}
