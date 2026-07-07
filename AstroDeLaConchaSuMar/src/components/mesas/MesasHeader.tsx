import { useState, type FormEvent } from "react";
import { erpConection } from "../../controller/erp.hook";
import "./MesasHeader.css";

export default function MesasHeader() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [message, setMessage] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    function closeModal() {
        setIsModalOpen(false);
        setMessage("");
        setIsSubmitting(false);
    }

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        const form = event.currentTarget;
        const formData = new FormData(form);
        const fondoCierre = Number(formData.get("fondo_cierre"));
        const comentarioDiferencia = String(formData.get("comentario_diferencia") ?? "").trim();
        const supervisorPin = String(formData.get("supervisor_pin") ?? "").trim();

        if (!Number.isFinite(fondoCierre) || fondoCierre < 0) {
            setMessage("Ingresa un fondo de cierre valido.");
            return;
        }

        setIsSubmitting(true);
        setMessage("");

        const sessionActive = await erpConection("sessionActive");
        const sessionClose = await erpConection("sessionClose", {
            param: `${sessionActive?.data?.id || '1'}/cerrar`,
            body: {
                fondo_cierre: fondoCierre,
                comentario_diferencia: comentarioDiferencia || "Sin diferencia",
                supervisor_pin: supervisorPin,
            },
        });

        if (sessionClose?.ok) {
            setMessage("Sesion cerrada correctamente.");
            document.dispatchEvent(new CustomEvent("erp-session-closed"));
            document.dispatchEvent(new CustomEvent("erp-session-missing"));
            form.reset();
            closeModal();
            return;
        }

        setMessage(`No se pudo cerrar la sesion. Revisa los datos e intentalo nuevamente. Fondo esperado ${sessionActive?.data?.efectivo_esperado ?? 0}`);
        setIsSubmitting(false);
    }

    return (
        <>
            <div className="mesas-header">
                <div className="legend-container">
                    <div className="legend-item">
                        <div className="dot disponible" />
                        <span>Disponible</span>
                    </div>
                    <div className="legend-item">
                        <div className="dot ocupada" />
                        <span>Ocupada</span>
                    </div>
                    <div className="legend-item">
                        <div className="dot cuenta" />
                        <span>Cuenta Pendiente</span>
                    </div>
                </div>

                <button className="open-mesa-btn" type="button" onClick={() => setIsModalOpen(true)}>
                    <span>Cerrar Sesion</span>
                </button>
            </div>

            {isModalOpen && (
                <div className="close-session-modal">
                    <div className="close-session-backdrop" onClick={closeModal} />
                    <section className="close-session-panel" aria-labelledby="close-session-title">
                        <div className="close-session-heading">
                            <div>
                                <span className="close-session-eyebrow">Cierre de caja</span>
                                <h2 id="close-session-title">Cerrar sesion activa</h2>
                            </div>
                            <button
                                className="close-session-icon-btn"
                                type="button"
                                onClick={closeModal}
                                aria-label="Cerrar"
                            >
                                x
                            </button>
                        </div>

                        <form className="close-session-form" onSubmit={handleSubmit} autoComplete="off">
                            <label className="close-session-field" htmlFor="fondo-cierre">
                                <span>Fondo de cierre</span>
                                <div className="close-session-amount">
                                    <span>S/</span>
                                    <input
                                        id="fondo-cierre"
                                        name="fondo_cierre"
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        inputMode="decimal"
                                        required
                                        autoFocus
                                    />
                                </div>
                            </label>

                            <label className="close-session-field" htmlFor="comentario-diferencia">
                                <span>Comentario de diferencia</span>
                                <textarea
                                    id="comentario-diferencia"
                                    name="comentario_diferencia"
                                    rows={3}
                                    placeholder="Sin diferencia"
                                />
                            </label>

                            <label className="close-session-field" htmlFor="supervisor-pin">
                                <span>PIN de supervisor</span>
                                <input
                                    id="supervisor-pin"
                                    name="supervisor_pin"
                                    type="password"
                                    autoComplete="new-password"
                                    defaultValue=""
                                />
                            </label>

                            <p className="close-session-message" role="status">
                                {message}
                            </p>

                            <div className="close-session-actions">
                                <button className="close-session-secondary" type="button" onClick={closeModal}>
                                    Cancelar
                                </button>
                                <button className="close-session-primary" type="submit" disabled={isSubmitting}>
                                    {isSubmitting ? "Cerrando..." : "Confirmar cierre"}
                                </button>
                            </div>
                        </form>
                    </section>
                </div>
            )}
        </>
    );
}
