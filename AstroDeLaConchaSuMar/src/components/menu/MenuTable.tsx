import React, { useEffect, useState } from 'react'
import './MenuTable.css'

export interface MenuTableProperties {
    readonly id: string;
    readonly name: string;
    readonly description: string;
    readonly category: string;
    readonly price: string;
    readonly imageUrl: string;
    readonly ingredients: readonly {
        readonly name: string;
        readonly quantity: number;
        readonly unit: string;
    }[]
}
const backendUrl = import.meta.env.PUBLIC_BACKEND_URL ?? "http://backend:30011";
export default function MenuTable() {
    const limit = 10
    const [products, setProducts] = useState<MenuTableProperties[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [nextCursor, setNextCursor] = useState<string | null>(null);
    const [cursorHistory, setCursorHistory] = useState<(string | null)[]>([null]);
    const [hasMore, setHasMore] = useState(true);
    const [total, setTotal] = useState(0)

    async function loadProducts(cursor: string | null = null) {
        const params = new URLSearchParams({
            limit: String(limit),
        });
        if (cursor) {
            params.set('cursor', cursor);
        }

        const res = await fetch(
            `${backendUrl}/menu/paginate?${params}`
        );
        const result = await res.json();
        setProducts(result.data.products);
        setNextCursor(result.data.nextCursor);
        setHasMore(result.data.hasMore);
        setTotal(result.data.total)

    }

    async function deleteProduct(id: string) {
        const res = await fetch(
            `${backendUrl}/menu/${id}`,
            {
                method: 'DELETE',
            }
        );
        const result = await res.json();
        if (result.success) {
            setProducts(products.filter(product => product.id !== id));
        }
    }

    async function nextPage() {
        if (!nextCursor || !hasMore) return;

        const newHistory = [...cursorHistory];
        newHistory[currentPage] = nextCursor;

        setCursorHistory(newHistory);
        setCurrentPage(prev => prev + 1);
        await loadProducts(nextCursor);
    }

    async function prevPage() {
        if (currentPage === 1) return;

        const previousCursor = cursorHistory[currentPage - 2] ?? null;
        setCurrentPage(prev => prev - 1);
        await loadProducts(previousCursor);
    }

    useEffect(() => {
        loadProducts();
    }, []);
    return (
        <section>
            <div className="dishes-table-card">
                <div className="table-scroll">
                    <table className="dishes-table">
                        <thead>
                            <tr>
                                <th>Imagen</th>
                                <th>Nombre del platillo</th>
                                <th>Categoría</th>
                                <th>Precio</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {
                                products.map((dish, i) => (
                                    <tr key={dish.name + i}>
                                        <td>
                                            {dish.imageUrl ? (
                                                <img className="dish-image" src={dish.imageUrl} alt={dish.name} />
                                            ) : (
                                                <div className="dish-image-placeholder" aria-hidden="true" />
                                            )}
                                        </td>
                                        <td>
                                            <strong>{dish.name}</strong>
                                            <span>{dish.description}</span>
                                        </td>
                                        <td>
                                            <span
                                                className={`category-pill category-${dish.category.toLowerCase()}`}
                                            >
                                                {dish.category}
                                            </span>
                                        </td>
                                        <td className="price-cell">{dish.price}</td>
                                        <td>
                                            <div
                                                className="row-actions"
                                                aria-label={`Acciones para ${dish.name}`}
                                            >
                                                <button
                                                    type="button"
                                                    className="icon-button"
                                                    aria-label="Editar platillo"
                                                >
                                                    <a href={`/menu/${dish.id}`}>
                                                        <svg
                                                            width="15"
                                                            height="15"
                                                            viewBox="0 0 24 24"
                                                            fill="none"
                                                            aria-hidden="true"
                                                        >
                                                            <path
                                                                d="M4 20h4L18.5 9.5l-4-4L4 16v4Z"
                                                                stroke="currentColor"
                                                                strokeWidth="2"
                                                                strokeLinejoin="round"
                                                            />
                                                            <path
                                                                d="m13.5 6.5 4 4"
                                                                stroke="currentColor"
                                                                strokeWidth="2"
                                                                strokeLinecap="round"
                                                            />
                                                        </svg>
                                                    </a>
                                                </button>
                                                <button
                                                    type="button"
                                                    className="icon-button danger"
                                                    aria-label="Eliminar platillo"
                                                    onClick={() => deleteProduct(dish.id)}
                                                >
                                                    <svg
                                                        width="15"
                                                        height="15"
                                                        viewBox="0 0 24 24"
                                                        fill="none"
                                                        aria-hidden="true"
                                                    >
                                                        <path
                                                            d="M6 7h12M10 11v6M14 11v6M9 7l1-3h4l1 3M8 7l1 13h6l1-13"
                                                            stroke="currentColor"
                                                            strokeWidth="2"
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                        />
                                                    </svg>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            }
                        </tbody>
                    </table>
                </div>
            </div>

            <footer className="table-footer">
                <span>Mostrando {(currentPage - 1) * limit + 1} - {(currentPage - 1) * limit + products.length} de {total} platillos</span>
                <nav className="pagination" aria-label="Paginación de platillos">
                    <button type="button" aria-label="Página anterior"
                        onClick={prevPage}
                        disabled={currentPage === 1}>
                        <svg
                            width="14"
                            height="14"
                            viewBox="0 0 24 24"
                            fill="none"
                            aria-hidden="true"
                        >
                            <path
                                d="m15 18-6-6 6-6"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"></path>
                        </svg>
                    </button>
                    <button type="button" aria-label="Página siguiente"
                        disabled={!hasMore}
                        onClick={nextPage}>
                        <svg
                            width="14"
                            height="14"
                            viewBox="0 0 24 24"
                            fill="none"
                            aria-hidden="true"
                        >
                            <path
                                d="m9 18 6-6-6-6"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"></path>
                        </svg>
                    </button>
                </nav>
            </footer>
        </section>
    )
}
