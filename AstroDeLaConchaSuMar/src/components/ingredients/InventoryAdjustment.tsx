import { useEffect, useMemo, useState, type FormEvent } from "react";
import { backendConection } from "../../controller/salesOrders.hook";
import "./InventoryAdjustment.css";

type Ingredient = {
  id: string;
  name: string;
  description?: string;
  category?: string;
  currentStock: string | number;
  units?: { name?: string; longName?: string; symbol?: string };
};

type AdjustmentMode = "delta" | "total";

const reasons = [
  "Merma / Desperdicio",
  "Corrección de conteo",
  "Ingreso no registrado",
  "Consumo interno",
  "Producto vencido",
  "Otro",
];

export default function InventoryAdjustment({ id }: { id: string }) {
  const [ingredient, setIngredient] = useState<Ingredient | null>(null);
  const [mode, setMode] = useState<AdjustmentMode>("delta");
  const [quantity, setQuantity] = useState(-1.5);
  const [reason, setReason] = useState(reasons[0]);
  const [observations, setObservations] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    let active = true;
    backendConection("GET", "ingredients", id).then((response) => {
      if (!active) return;
      setIngredient((response.data?.at(0) as Ingredient | undefined) ?? null);
      setMessage(response.success ? "" : response.message || "No se pudo cargar el insumo.");
      setLoading(false);
    });
    return () => { active = false; };
  }, [id]);

  const currentStock = Number(ingredient?.currentStock ?? 0);
  const newTotal = useMemo(
    () => mode === "delta" ? currentStock + quantity : quantity,
    [currentStock, mode, quantity],
  );
  const unit = ingredient?.units?.symbol || ingredient?.units?.name || "UND";

  const setAdjustmentMode = (nextMode: AdjustmentMode) => {
    setMode(nextMode);
    setQuantity(nextMode === "delta" ? 0 : currentStock);
  };

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!ingredient || !Number.isFinite(newTotal) || newTotal < 0) {
      setMessage("El nuevo total no puede ser menor que cero.");
      return;
    }

    setSaving(true);
    setMessage("");
    const response = await backendConection("POST", "ingredient-ajustment", undefined, {
      ingredient: Number(id),
      previousStock: currentStock,
      newStock: newTotal,
      quantity: quantity,
      reason: reason,
      observations: observations,
    });
    setSaving(false);

    if (!response.success) {
      setMessage(response.message || "No se pudo guardar el ajuste.");
      return;
    }
    window.location.assign("/insumos");
  };

  if (loading) return <div className="adjustment-status">Cargando información del insumo…</div>;
  if (!ingredient) return <div className="adjustment-status adjustment-error">{message || "Insumo no encontrado."}</div>;

  return (
    <section className="adjustment-page" aria-labelledby="adjustment-title">
      <header className="adjustment-header">
        <h1 id="adjustment-title">Ajuste de Inventario</h1>
        <p>Modifica existencias, registra mermas o corrige errores de conteo.</p>
      </header>

      <form onSubmit={submit}>
        <div className="adjustment-grid">
          <section className="adjustment-card stock-card" aria-labelledby="current-stock-title">
            <h2 id="current-stock-title"><span>2</span> Stock Actual</h2>
            <div className="ingredient-summary">
              <div className="ingredient-placeholder" aria-hidden="true">▦</div>
              <div>
                <small>SKU: {ingredient.id}</small>
                <h3>{ingredient.name}</h3>
                <p>{ingredient.category || ingredient.description || "Insumo de inventario"}</p>
              </div>
            </div>
            <div className="registered-stock">
              <div><small>Cantidad Registrada</small><strong>{currentStock.toFixed(1)} <em>{unit}</em></strong></div>
              <span aria-hidden="true">⌛</span>
            </div>
          </section>

          <section className="adjustment-card details-card" aria-labelledby="details-title">
            <h2 id="details-title"><span>3</span> Detalles del Ajuste</h2>
            <div className="mode-toggle" role="group" aria-label="Modo de ajuste">
              <button type="button" className={mode === "delta" ? "active" : ""} onClick={() => setAdjustmentMode("delta")}>Valor de Ajuste<br />(+/-)</button>
              <button type="button" className={mode === "total" ? "active" : ""} onClick={() => setAdjustmentMode("total")}>Fijar Nuevo Total</button>
            </div>
            <label className="quantity-field">
              <span>{mode === "delta" ? `Cantidad (${unit})` : `Nuevo total (${unit})`}</span>
              <div className="quantity-control">
                <button type="button" onClick={() => setQuantity((value) => value - 0.5)} aria-label="Disminuir cantidad">−</button>
                <input type="number" step="0.1" value={quantity} onChange={(event) => setQuantity(Number(event.target.value))} />
                <button type="button" onClick={() => setQuantity((value) => value + 0.5)} aria-label="Aumentar cantidad">+</button>
              </div>
              <small className={newTotal < currentStock ? "negative" : ""}>Nuevo total estimado: {newTotal.toFixed(1)} {unit}</small>
            </label>
            <label className="reason-field">
              <span>Motivo del Ajuste</span>
              <select value={reason} onChange={(event) => setReason(event.target.value)}>
                {reasons.map((item) => <option key={item}>{item}</option>)}
              </select>
            </label>
          </section>
        </div>

        <section className="adjustment-card observations-card" aria-labelledby="observations-title">
          <h2 id="observations-title"><span>4</span> Observaciones</h2>
          <textarea value={observations} onChange={(event) => setObservations(event.target.value)} placeholder="Añade detalles adicionales sobre este ajuste…" />
        </section>

        {message && <p className="form-message" role="alert">{message}</p>}
        <div className="adjustment-actions">
          <a href="/insumos">Cancelar</a>
          <button type="submit" disabled={saving}>{saving ? "Guardando…" : "Confirmar Ajuste"}</button>
        </div>
      </form>
    </section>
  );
}
