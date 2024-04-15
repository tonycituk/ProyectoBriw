import {useState } from 'react';
import SearchIcon from './assets/SearchIcon';
import {ChangeEvent} from 'react'
import './index.css'
import React from 'react';
import Sugerencias from './Sugerencias';



function Buscador(){
    const [inputValue, setInputValue] = useState('');
    const [suggestions, setSuggestions] = useState([]);
    const [selectedList, setSelectedList] = useState(0);
  
    // Cuando se escriba algo en el buscador
    const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
      const busqueda = event.target.value
      setInputValue(busqueda)
      obtenerSugerencias(busqueda).then(data => {
        setSuggestions(data)
      })
    };

    
    const handleKeySpecial = (event: React.KeyboardEvent<HTMLInputElement>) => {
      const tecla = event.key
      switch(tecla){
        case"ArrowDown":
          if(selectedList >=suggestions.length -1){
            setInputValue(suggestions[suggestions.length -1]);
            setSelectedList(suggestions.length -1);
          }else{
            setInputValue(suggestions[selectedList +1]);
            setSelectedList(selectedList +1)
          }
          break;
        case "ArrowUp":
          if(selectedList <= 0){
            setInputValue(suggestions[0]);
            setSelectedList(0);
          }else{
            setInputValue(suggestions[selectedList -1]);
            setSelectedList(selectedList -1)
          }
          break;
        case "Backspace" :
          setSelectedList(-1);
      }
    };
  
    //Si le das click a una sugerencia
    const handleSuggestionClick = (suggestion) => {
      setInputValue(suggestion)
      //Quitar todas las sugerencias no usadas
      setSuggestions([]);
      //Reiniciar el cursor de sugerencias
      setSelectedList(-1)
    };

    return (
      //Icono de lupa
      <div className="sticky m-12 w-full top-20" onClick={(event)=>{setSuggestions([])}}>
        <label className="absolute inset-y-0 left-1 pl-3 flex items-center pointer-events-none">
          <SearchIcon />
        </label>
        <input
          onKeyDown={handleKeySpecial}
          
          value={inputValue}
          type="text"
          placeholder="Buscar en Solr"
          className=" bg-neutral w-full pl-12 pr-4 py-2 border-primary rounded-full focus:outline-none focus:ring-primary focus:border-primary"
          onInput={handleInputChange}
        />

        {suggestions.length > 0 && 
        <Sugerencias 
          sugerencias={suggestions}
          itemSeleccionado={selectedList}
          onSelectSugerencia={handleSuggestionClick}>
        </Sugerencias>}
        
      </div>

    );
}

async function obtenerSugerencias(palabra) {
    try {
      const response = await fetch(`https://inputtools.google.com/request?text=${palabra}&itc=es-t-i0-und&num=12`);
      const data = await response.json();
      const sugerencias = data?.[1]?.[0]?.[1] || [];
      return sugerencias;
    } catch (error) {
      console.error('Error al obtener sugerencias:', error);
      return [];
    }
  }

export default Buscador