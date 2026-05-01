import React, { useRef } from "react"
import './Modal.css'

interface ModalProps {
    readonly title: string;
    readonly name?: string;
    readonly place?: string;
    readonly height: string;
    readonly width: string;
    readonly button?: React.ReactNode
}

export default function Modal({ title, name, place, height, width, button }: ModalProps) {
    const dialogRef = useRef<HTMLDialogElement>(null)
    const openModal = () => dialogRef.current?.showModal();
    const closeModal = () => dialogRef.current?.close();
    return (
        <div className="modal-container" >
            <button className="modal-OpenButton" onClick={openModal} style={{ height: height, width: width }}>
                {button ?? ''}
            </button>
            <dialog ref={dialogRef} className="miPopup">
                <h2>{title}</h2>
                <form id="formRest">

                    <label htmlFor="inputNombre">Nombre:</label>
                    <input type="text" id="inputNombre" name="nombre" defaultValue={name ?? ''} required />

                    <label htmlFor="inputLugar">Lugar:</label>
                    <input type="text" id="inputLugar" name="lugar" defaultValue={place ?? ''} required />

                    <div className="actions">
                        <button type="submit">Enviar</button>
                        <button type="button" id="closeModal" onClick={closeModal}>Cancelar</button>
                    </div>
                </form>
            </dialog>
        </div>
    )
}