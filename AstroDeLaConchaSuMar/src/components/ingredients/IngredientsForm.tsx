import { useEffect, useState, type SubmitEvent } from "react";
import "./IngredientsForm.css";

type SupplierOption = {
  name: string;
  type: string;
};

type SelectedSupplier = SupplierOption & {
  price: number;
};

export type IngredientFormState = {
  name: string;
  description: string;
  category: string;
  minimumStock: string;
  currentStock: string;
  unitId: string;
};

const supplierOptions: SupplierOption[] = [
  { name: "Distribuidora del Mar", type: "Principal" },
  { name: "Pesquera San Jose", type: "Alternativo" },
  { name: "Mercado Central Marino", type: "Local" },
  { name: "Insumos Costa Azul", type: "Mayorista" },
];

const initialFormState: IngredientFormState = {
  name: "",
  description: "",
  category: "Pescados",
  minimumStock: "",
  currentStock: "",
  unitId: "-",
};

type Meassures = {
  id: string;
  name: string;
  longName: string;
  description?: string;
  symbol: string;
}

type IngredientsResponse = {
  name: string;
  description: string;
  category: string;
  minimumStock: string;
  currentStock: string;
  unit: string;
};
const backendUrl = import.meta.env.PUBLIC_BACKEND_URL ?? "http://backend:3001";

export default function IngredientsForm(props: { id: string }) {
  const { id } = props;
  const [formState, setFormState] = useState<IngredientFormState>(initialFormState);
  const [suppliers, setSuppliers] = useState<SelectedSupplier[]>([]);
  const [selectedSupplierName, setSelectedSupplierName] = useState(supplierOptions[0].name);
  const [supplierPrice, setSupplierPrice] = useState("");
  const [meassures, setMeassures] = useState<Meassures[]>([]);

  const handleFieldChange = (field: keyof IngredientFormState, value: string) => {
    setFormState((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const addSupplier = () => {
    const selectedSupplier = supplierOptions.find((supplier) => supplier.name === selectedSupplierName);
    const price = Number(supplierPrice);

    if (!selectedSupplier || !Number.isFinite(price) || price <= 0) return;

    setSuppliers((prev) => {
      const alreadyAdded = prev.some((supplier) => supplier.name === selectedSupplier.name);

      if (alreadyAdded) return prev;

      return [...prev, { ...selectedSupplier, price }];
    });
    setSupplierPrice("");
  };

  const removeSupplier = (supplierName: string) => {
    setSuppliers((prev) => prev.filter((supplier) => supplier.name !== supplierName));
  };

  const handleSubmit = (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();

    const payload = {
      ...formState,
      unitId: formState.unitId.split("-")[0],
      minimumStock: Number(formState.minimumStock || 0),
      currentStock: Number(formState.currentStock || 0),
      suppliers,
    };

    console.log("Insumo:", payload);

    fetch(`${backendUrl}/ingredients`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    })
      .then((response) => response.json())
      .then((data) => {console.log(data); if (data.success) alert("Insumo guardado correctamente")})
      .catch((error) => console.error(error));

  };

  useEffect(() => {
    fetch(`${backendUrl}/meassures`)
      .then((response) => response.json())
      .then((data) => setMeassures(data.data))
      .catch((error) => console.error(error));


    if (id === "nuevo") return;
    fetch(
      `${backendUrl}/ingredients/${id}`,
      {
        method: "GET",
      },
    )
      .then((res) => res.json())
      .then((data) => {
        const ingredients: IngredientsResponse = data.data || {};
        const ingredientsFormState: IngredientFormState = {
          name: ingredients.name ?? "",
          description: ingredients.description ?? "",
          category: ingredients.category ?? "",
          minimumStock: ingredients.minimumStock ?? "",
          currentStock: ingredients.currentStock ?? "",
          unitId: ingredients.unit,
        };
        setFormState(ingredientsFormState);
        setSuppliers([]);
      })
      .catch((error) => {
        console.error("Error fetching ingredients:", error);
      });
  }, [])


  return (
    <section className="supply-page" aria-labelledby="supply-title">
      <nav className="breadcrumbs" aria-label="Ruta de navegacion">
        <a href="/insumos">Inventario</a>
        <span aria-hidden="true">&gt;</span>
        <span>Agregar Nuevo Insumo</span>
      </nav>

      <h2 id="supply-title">Agregar Nuevo Insumo</h2>

      <div className="supply-layout">
        <form className="supply-form" onSubmit={handleSubmit}>
          <div className="form-panel">
            <div className="field">
              <label htmlFor="name">NOMBRE DEL INSUMO</label>
              <input
                id="name"
                name="name"
                type="text"
                placeholder="Ej: Corvina del Pacifico Extra"
                value={formState.name}
                onChange={(event) => handleFieldChange("name", event.target.value)}
              />
            </div>

            <div className="field">
              <label htmlFor="description">DESCRIPCION DETALLADA</label>
              <textarea
                id="description"
                name="description"
                rows={4}
                placeholder="Especificaciones de frescura, procedencia o manejo especial..."
                value={formState.description}
                onChange={(event) => handleFieldChange("description", event.target.value)}
              ></textarea>
            </div>

            <div className="field-row">
              <div className="field">
                <label htmlFor="category">CATEGORIA</label>
                <select
                  id="category"
                  name="category"
                  value={formState.category}
                  onChange={(event) => handleFieldChange("category", event.target.value)}
                >
                  <option>Pescados</option>
                  <option>Mariscos</option>
                  <option>Verduras</option>
                  <option>Abarrotes</option>
                </select>
              </div>

              <div className="field">
                <label htmlFor="minimum-stock">STOCK MINIMO (ALERTA)</label>
                <input
                  id="minimum-stock"
                  name="minimum-stock"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                  value={formState.minimumStock}
                  onChange={(event) => handleFieldChange("minimumStock", event.target.value)}
                />
              </div>
            </div>

            <section className="inventory-section" aria-labelledby="inventory-title">
              <h3 id="inventory-title">
                <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
                  <path
                    d="M20 8.5v9.75a1.5 1.5 0 0 1-.82 1.34l-6.5 3.25a1.5 1.5 0 0 1-1.36 0l-6.5-3.25A1.5 1.5 0 0 1 4 18.25V8.5m16 0L12 4 4 8.5m16 0-8 4.25m-8-4.25 8 4.25m0 0V22"
                    fill="none"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                  ></path>
                </svg>
                Inventario Actual
              </h3>

              <div className="field-row">
                <div className="field">
                  <label htmlFor="current-stock">CANTIDAD ACTUAL</label>
                  <input
                    id="current-stock"
                    name="current-stock"
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                    value={formState.currentStock}
                    onChange={(event) => handleFieldChange("currentStock", event.target.value)}
                  />
                </div>

                <div className="field">
                  <label htmlFor="unitId">UNIDAD DE MEDIDA</label>
                  <select
                    id="unitId"
                    name="unitId"
                    value={formState.unitId}
                    onChange={(event) => handleFieldChange("unitId", event.target.value)}
                  >
                    <option value={"-"} >Seleccionar</option>
                    {meassures.map((measure) => {
                      return (
                        <option key={measure.id} value={measure.id + "-" + measure.longName}>{measure.longName}</option>
                      )
                    })}
                  </select>
                </div>
              </div>
            </section>
          </div>

          <div className="form-actions">
            <a className="cancel-button" href="/insumos">Cancelar</a>
            <button className="submit-button" type="submit">Guardar Insumo</button>
          </div>
        </form>

        <aside className="suppliers-panel" aria-labelledby="suppliers-title">
          <div className="suppliers-header">
            <h3 id="suppliers-title">Proveedores y Costos</h3>
          </div>

          <div className="supplier-controls">
            <div className="field">
              <label htmlFor="supplier">PROVEEDOR</label>
              <select
                id="supplier"
                value={selectedSupplierName}
                onChange={(event) => setSelectedSupplierName(event.target.value)}
              >
                {supplierOptions.map((supplier) => (
                  <option key={supplier.name} value={supplier.name}>
                    {supplier.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="field supplier-price-field">
              <label htmlFor="supplier-price">PRECIO</label>
              <input
                id="supplier-price"
                type="number"
                min="0"
                step="0.01"
                placeholder="0.00"
                value={supplierPrice}
                onChange={(event) => setSupplierPrice(event.target.value)}
              />
            </div>

            <button type="button" className="add-supplier-button" onClick={addSupplier}>
              <svg width="14" height="14" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M12 5v14M5 12h14" stroke="currentColor" strokeLinecap="round" strokeWidth="2"></path>
              </svg>
              Agregar Proveedor
            </button>
          </div>

          <div className="supplier-list">
            {suppliers.map((supplier) => (
              <article className="supplier-card" key={supplier.name}>
                <div className="supplier-info">
                  <span className="supplier-icon" aria-hidden="true">
                    <svg width="22" height="16" viewBox="0 0 24 18">
                      <path
                        d="M2 15.5h20M3.5 15.5V6.7L12 2l8.5 4.7v8.8M7 15.5V9h10v6.5"
                        fill="none"
                        stroke="currentColor"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                      ></path>
                    </svg>
                  </span>
                  <span>
                    <strong>{supplier.name}</strong>
                    <small>{supplier.type}</small>
                  </span>
                </div>

                <div className="supplier-price">
                  <span>S/. {supplier.price.toFixed(2)}</span>
                  <small>{formState.unitId?.split("-")[1]}</small>
                </div>

                <button
                  className="supplier-menu"
                  type="button"
                  aria-label={`Eliminar ${supplier.name}`}
                  onClick={() => removeSupplier(supplier.name)}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
                    <path
                      d="M18 6V16.2C18 17.9 18 18.7 17.7 19.4C17.4 19.9 16.9 20.4 16.4 20.7C15.7 21 14.9 21 13.2 21H10.8C9.1 21 8.3 21 7.6 20.7C7.1 20.4 6.6 19.9 6.3 19.4C6 18.7 6 17.9 6 16.2V6M4 6H20M16 6L15.7 5.2C15.5 4.4 15.3 4 15.1 3.7C14.9 3.5 14.6 3.3 14.3 3.1C13.9 3 13.5 3 12.7 3H11.3C10.5 3 10.1 3 9.7 3.1C9.4 3.3 9.1 3.5 8.9 3.7C8.7 4 8.5 4.4 8.3 5.2L8 6"
                      fill="none"
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                    ></path>
                  </svg>
                </button>
              </article>
            ))}

            {suppliers.length === 0 && (
              <div className="empty-suppliers">No hay mas proveedores vinculados</div>
            )}
          </div>
        </aside>
      </div>
    </section>
  );
}
