import React, { useEffect, useState } from "react";
import "./IngredientsTable.css";

export interface IngredientsTableProperties {
  readonly id: string;
  readonly name: string;
  readonly category: string;
  readonly currentStock: number | string;
  readonly minimumStock: number | string;
}

export default function IngredientsTable() {
  const limit = 10;
  const [ingredients, setIngredients] = useState<IngredientsTableProperties[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [cursorHistory, setCursorHistory] = useState<(string | null)[]>([null]);
  const [hasMore, setHasMore] = useState(true);
  const [total, setTotal] = useState(0);

  async function loadIngredients(cursor: string | null = null) {
    const params = new URLSearchParams({
      limit: String(limit),
    });
    if (cursor) {
      params.set("cursor", cursor);
    }

    const res = await fetch(`http://localhost:3001/ingredients/paginate?${params}`);
    const result = await res.json();
    setIngredients(result.data.ingredients ?? []);
    setNextCursor(result.data.nextCursor);
    setHasMore(result.data.hasMore);
    setTotal(result.data.total);
  }

  async function deleteIngredient(id: string) {
    const res = await fetch(`http://localhost:3001/ingredients/${id}`, {
      method: "DELETE",
    });
    const result = await res.json();

    if (result.success) {
      setIngredients((currentIngredients) =>
        currentIngredients.filter((ingredient) => ingredient.id !== id),
      );
    }
  }

  useEffect(() => {
    loadIngredients();
  }, []);

  const showingFrom = total === 0 ? 0 : (currentPage - 1) * limit + 1;
  const showingTo = (currentPage - 1) * limit + ingredients.length;

  async function nextPage() {
    if (!nextCursor || !hasMore) return;

    const newHistory = [...cursorHistory];
    newHistory[currentPage] = nextCursor;

    setCursorHistory(newHistory);
    setCurrentPage((page) => page + 1);
    await loadIngredients(nextCursor);
  }

  async function prevPage() {
    if (currentPage === 1) return;

    const previousCursor = cursorHistory[currentPage - 2] ?? null;
    setCurrentPage((page) => page - 1);
    await loadIngredients(previousCursor);
  }

  return (
    <section>
      <div className="ingredients-table-card">
        <div className="table-scroll">
          <table className="ingredients-table">
            <thead>
              <tr>
                <th>Nombre del insumo</th>
                <th>Categoria</th>
                <th>Stock actual</th>
                <th>Stock minimo</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {ingredients.map((ingredient) => (
                <tr key={ingredient.id}>
                  <td>
                    <strong>{ingredient.name}</strong>
                  </td>
                  <td>
                    <span className="ingredient-category-pill">{ingredient.category}</span>
                  </td>
                  <td className="stock-cell">{ingredient.currentStock}</td>
                  <td className="stock-cell minimum-stock-cell">{ingredient.minimumStock}</td>
                  <td>
                    <div
                      className="row-actions"
                      aria-label={`Acciones para ${ingredient.name}`}
                    >
                      <a
                        className="icon-button"
                        href={`/insumos/${ingredient.id}`}
                        aria-label="Editar insumo"
                      >
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

                      <button
                        type="button"
                        className="icon-button danger"
                        aria-label="Eliminar insumo"
                        onClick={() => deleteIngredient(ingredient.id)}
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
              ))}

              {ingredients.length === 0 && (
                <tr>
                  <td className="empty-table-cell" colSpan={5}>
                    No hay insumos registrados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <footer className="table-footer">
        <span>
          Mostrando {showingFrom} - {showingTo} de {total} insumos
        </span>
        <nav className="pagination" aria-label="Paginacion de insumos">
          <button
            type="button"
            aria-label="Pagina anterior"
            onClick={prevPage}
            disabled={currentPage === 1}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path
                d="m15 18-6-6 6-6"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              ></path>
            </svg>
          </button>
          <button
            type="button"
            aria-label="Pagina siguiente"
            disabled={!hasMore}
            onClick={nextPage}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path
                d="m9 18 6-6-6-6"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              ></path>
            </svg>
          </button>
        </nav>
      </footer>
    </section>
  );
}
