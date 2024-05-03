import React, {useState} from "react";

interface Propiedades {
    closeModal : (modal : string) =>void,
    titulo : string,
    link : string 
  }

function ModalScreenshot ({titulo, link, closeModal} : Propiedades) {

    return (
        <div className="modal-box">
            <form method="dialog">
                <button 
                className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
                onClick = {(event)=>{closeModal("")}}
                >✕</button>
            </form>
            <h3 className="font-bold text-lg">{titulo}</h3>
            <img id="imagePreview" src={link} />
        </div>
    )
}

export default ModalScreenshot;