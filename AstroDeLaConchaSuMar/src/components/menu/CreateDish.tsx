import { useEffect, useState } from "react";
import "./CreateDish.css"

type DishIngredient = {
    ingredient: string;
    quantity: number;
};

type IngredientOption = {
    id: string;
    name: string;
    unit?: {
        id?: string;
        name?: string;
        longName?: string;
        symbol?: string;
    } | string | null;
};

type ProductIngredientResponse = {
    ingredient: number | string;
    quantity: number | string;
};

type ProductIngredientRelationResponse = {
    ingredient?: number | string;
    quantity: number | string;
    ingredients?: {
        id?: number | string;
    } | null;
};

export interface DishProperties {
    name: string;
    description: string;
    category: string;
    price: number;
    image: File | null;
    previewImageUrl: string;
    ingredients: DishIngredient[];
}

interface CreateDishProperties {
    readonly id?: string;
}
const backendUrl = import.meta.env.PUBLIC_BACKEND_URL ?? "http://backend:3001";
export default function CreateDish(props?: CreateDishProperties) {
    const { id } = props ?? { id: "nuevo" };
    const [dish, setDish] = useState({
        name: "",
        description: "",
        category: "",
        price: 0,
        image: null as File | null,
        previewImageUrl: "",
        ingredients: [] as DishIngredient[],
    });

    const [availableIngredients, setAvailableIngredients] = useState<IngredientOption[]>([]);
    const [newIngredient, setNewIngredient] = useState<DishIngredient>({ ingredient: "", quantity: 1 });

    const mapDishIngredients = (data: {
        ingredients?: ProductIngredientResponse[];
        productsIngredients?: ProductIngredientRelationResponse[];
    }): DishIngredient[] => {
        const ingredients = data.ingredients ?? data.productsIngredients ?? [];

        return ingredients
            .map((item) => ({
                ingredient: String(item.ingredient ?? item.ingredients?.id ?? ""),
                quantity: Number(item.quantity),
            }))
            .filter((item) => item.ingredient && Number.isFinite(item.quantity));
    };

    useEffect(() => {
        fetch(`${backendUrl}/ingredients`)
            .then(res => res.json())
            .then(result => {
                if (result.success) {
                    setAvailableIngredients((result.data ?? []).map((ingredient: IngredientOption) => ({
                        id: ingredient.id,
                        name: ingredient.name,
                        unit: ingredient.unit,
                    })));
                }
            })
            .catch(error => console.error(error));
    }, []);

    useEffect(() => {
        if (id === "nuevo") return;
        fetch(
            `${backendUrl}/menu/${id}`
        ).then(res => res.json()).then(result => {
            if (result.success) {
                setDish({
                    ...result.data,
                    image: null,
                    previewImageUrl: result.data.imageUrl,
                    ingredients: mapDishIngredients(result.data),
                });
            }
        });

    }, [id])


    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const imageUrl = URL.createObjectURL(file);
            setDish(prev => ({ ...prev, image: file, previewImageUrl: imageUrl }));
        }
    };

    const addIngredient = () => {
        if (newIngredient.ingredient) {
            setDish(prev => ({
                ...prev,
                ingredients: [...prev.ingredients, { ...newIngredient }]
            }));
            setNewIngredient({ ingredient: "", quantity: 1 });
        }
    };

    const removeIngredient = (index: number) => {
        setDish(prev => ({
            ...prev,
            ingredients: prev.ingredients.filter((_, i) => i !== index)
        }));
    };

    const getIngredientUnit = (ingredientId: string) => {
        const ingredient = availableIngredients.find((item) => item.id === ingredientId);
        const unit = ingredient?.unit;

        if (!unit) return "-";
        if (typeof unit === "string") return unit;

        return unit.symbol ?? unit.longName ?? unit.name ?? "-";
    };

    const handleIngredientChange = (index: number, field: 'ingredient' | 'quantity', value: string | number) => {
        const newIngredients = [...dish.ingredients];
        (newIngredients[index] as any)[field] = value;
        setDish(prev => ({ ...prev, ingredients: newIngredients }));
    };

    const handleSave = () => {
        console.log('Guardando platillo:', dish);
        const formData = new FormData();
        formData.append('name', dish.name);
        formData.append('description', dish.description);
        formData.append('category', dish.category);
        formData.append('price', dish.price.toString());
        if (dish.image) {
            formData.append('image', dish.image);
        }
        const ingredients = dish.ingredients
            .map((ingredient) => ({
                ingredient: ingredient.ingredient,
                quantity: Number(ingredient.quantity),
            }))
            .filter((ingredient) => ingredient.ingredient && Number.isFinite(ingredient.quantity));

        formData.append('ingredients', JSON.stringify(ingredients));
        try {
            const method = id === "nuevo" ? "POST" : "PATCH";
            const url = id === "nuevo" ? `${backendUrl}/menu` : `${backendUrl}/menu/${id}`;
            fetch(url, {
                method,
                body: formData,
            }).then(res => res.json()).then(data => console.log(data));
            alert('Platillo guardado correctamente');

        } catch (error) {
            console.error(error);
            alert('Error al guardar el platillo');
        }
    };

    return (
        <div className="nuevo-platillo-page">
            <nav className="breadcrumb">
                <span className="breadcrumb-link">Menu</span>
                <span className="breadcrumb-separator">
                    <svg width="6" height="10" viewBox="0 0 6 10" fill="none">
                        <path d="M1 9L5 5L1 1" stroke="#6F797D" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                </span>
                <span className="breadcrumb-current">Agregar Nuevo Platillo</span>
            </nav>

            <header className="page-header">
                <h2 className="page-title">Agregar Nuevo Platillo</h2>
                <p className="page-subtitle">
                    Define la esencia del nuevo sabor peruano que llegará a la mesa.
                </p>
            </header>

            <div className="main-grid">
                <div className="left-column">
                    <section className="bento-section image-upload">
                        <div className="section-header">
                            <div className="header-icon">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                                    <circle cx="8.5" cy="8.5" r="1.5" />
                                    <polyline points="21 15 16 10 5 21" />
                                </svg>
                            </div>
                            <h3>Visual del Platillo</h3>
                        </div>
                        <div className="upload-placeholder">
                            {dish.previewImageUrl ? (
                                <>
                                    <input type="file" className="file-input-overlay" onChange={handleImageChange} accept="image/png, image/jpeg, image/webp" />
                                    <img src={dish.previewImageUrl} alt="Preview del plato" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                </>
                            ) : (
                                <div className="preview-overlay">
                                    <input type="file" className="file-input-overlay" onChange={handleImageChange} accept="image/png, image/jpeg, image/webp" />
                                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--color-brand-cyan)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                                        <polyline points="17 8 12 3 7 8" />
                                        <line x1="12" y1="3" x2="12" y2="15" />
                                    </svg>
                                    <span>Subir fotografía de alta resolución</span>
                                    <small>Formatos aceptados: JPG, PNG • Máx 5MB</small>
                                </div>
                            )}
                        </div>
                    </section>

                    <section className="form-details">
                        <div className="form-group">
                            <label htmlFor="nombre">Nombre del plato</label>
                            <input
                                type="text"
                                id="nombre"
                                placeholder="Ej: Ceviche de Mero Especial"
                                value={dish.name}
                                onChange={(e) => setDish(prev => ({ ...prev, name: e.target.value }))}
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="descripcion">Descripción detallada</label>
                            <textarea
                                id="descripcion"
                                placeholder="Describe los sabores, texturas e historia del plato..."
                                value={dish.description}
                                onChange={(e) => setDish(prev => ({ ...prev, description: e.target.value }))}
                            ></textarea>
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label htmlFor="categoria">Categoría</label>
                                <div className="select-wrapper">
                                    <select
                                        id="categoria"
                                        value={dish.category}
                                        onChange={(e) => setDish(prev => ({ ...prev, category: e.target.value }))}
                                    >
                                        <option value="">Seleccionar categoría</option>
                                        <option value="entradas">Entradas</option>
                                        <option value="ceviches">Ceviches</option>
                                        <option value="fondos">Platos de Fondo</option>
                                        <option value="bebidas">Bebidas</option>
                                    </select>
                                    <svg className="select-icon" width="12" height="8" viewBox="0 0 12 8" fill="none">
                                        <path d="M1 1L6 6L11 1" stroke="#6F797D" strokeWidth="2" strokeLinecap="round" />
                                    </svg>
                                </div>
                            </div>
                            <div className="form-group">
                                <label htmlFor="precio">Precio (S/.)</label>
                                <div className="price-input">
                                    <span>S/</span>
                                    <input
                                        type="number"
                                        id="precio"
                                        placeholder="0.00"
                                        step="0.01"
                                        value={dish.price || ''}
                                        onChange={(e) => setDish(prev => ({ ...prev, price: Number(e.target.value) }))}
                                    />
                                </div>
                            </div>
                        </div>
                    </section>
                </div>

                <div className="right-column">
                    <section className="bento-section ingredients-section">
                        <div className="ingredients-header">
                            <div className="header-main">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                                </svg>
                                <h3>Ingredientes Base</h3>
                            </div>
                            <button className="add-btn" onClick={addIngredient}>Agregar</button>
                        </div>

                        <div className="ingredients-columns">
                            <span className="column-label">Ingrediente</span>
                            <span className="column-label">Cant.</span>
                            <span className="column-label">Und.</span>
                            <span></span>
                        </div>

                        <div className="ingredients-list">
                            {dish.ingredients.map((ing, index) => (
                                <div key={`${ing.ingredient}-${index}`} className="ingredient-item">
                                    <select
                                        className="ingredient-name-input"
                                        value={ing.ingredient}
                                        onChange={(e) => handleIngredientChange(index, 'ingredient', e.target.value)}
                                        aria-label="Ingrediente"
                                    >
                                        <option value="">Seleccionar ingrediente</option>
                                        {availableIngredients.map((ingredient) => (
                                            <option key={ingredient.id} value={ingredient.id}>
                                                {ingredient.name}
                                            </option>
                                        ))}
                                    </select>
                                    <input
                                        type="number"
                                        value={ing.quantity}
                                        onChange={(e) => handleIngredientChange(index, 'quantity', Number(e.target.value))}
                                    />
                                    <span className="ingredient-unit-value">{getIngredientUnit(ing.ingredient)}</span>
                                    <button className="remove-btn" onClick={() => removeIngredient(index)}>
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <line x1="18" y1="6" x2="6" y2="18" />
                                            <line x1="6" y1="6" x2="18" y2="18" />
                                        </svg>
                                    </button>
                                </div>
                            ))}

                            <div className="ingredient-input-row">
                                <select
                                    value={newIngredient.ingredient}
                                    onChange={(e) => setNewIngredient(prev => ({ ...prev, ingredient: e.target.value }))}
                                    aria-label="Nuevo ingrediente"
                                >
                                    <option value="">Nuevo ingrediente...</option>
                                    {availableIngredients.map((ingredient) => (
                                        <option key={ingredient.id} value={ingredient.id}>
                                            {ingredient.name}
                                        </option>
                                    ))}
                                </select>
                                <input
                                    type="number"
                                    value={newIngredient.quantity}
                                    onChange={(e) => setNewIngredient(prev => ({ ...prev, quantity: Number(e.target.value) }))}
                                />
                                <span className="ingredient-unit-value">{getIngredientUnit(newIngredient.ingredient)}</span>
                                <span></span>
                            </div>
                        </div>
                    </section>

                    <div className="sticky-actions">
                        <button className="btn-save" onClick={handleSave}>
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
                                <polyline points="17 21 17 13 7 13 7 21" />
                                <polyline points="7 3 7 8 15 8" />
                            </svg>
                            Guardar Platillo
                        </button>
                        <button className="btn-cancel">Cancelar</button>
                    </div>
                </div>
            </div>
        </div>
    )
}
