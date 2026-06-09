import React, { useEffect, useState } from "react";
import "./UsersTable.css";
import { backendConection, type UserJSONInterface } from "../../controller/salesOrders.hook";

export default function UsersTable() {
  const limit = 10;
  const [users, setUsers] = useState<UserJSONInterface[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [cursorHistory, setCursorHistory] = useState<(string | null)[]>([null]);
  const [hasMore, setHasMore] = useState(true);
  const [total, setTotal] = useState(0);

  async function loadUsers(cursor: string | null = null) {
    const params = new URLSearchParams({
      limit: String(limit),
    });

    if (cursor) {
      params.set("cursor", cursor);
    }

    const res = await backendConection("GET", "user", `paginate?${params}`);

    if (res.data && res.nextCursor !== undefined && res.hasMore !== undefined && res.total !== undefined) {
      setUsers(res.data);
      setNextCursor(res.nextCursor);
      setHasMore(res.hasMore);
      setTotal(res.total);
    }
  }

  async function deleteUser(id: string) {
    const res = await backendConection("DELETE", "user", id);

    if (res.success) {
      setUsers((currentUsers) => currentUsers.filter((user) => user.id !== id));
      setTotal((currentTotal) => Math.max(currentTotal - 1, 0));
    }
  }

  async function nextPage() {
    if (!nextCursor || !hasMore) return;

    const newHistory = [...cursorHistory];
    newHistory[currentPage] = nextCursor;

    setCursorHistory(newHistory);
    setCurrentPage((page) => page + 1);
    await loadUsers(nextCursor);
  }

  async function prevPage() {
    if (currentPage === 1) return;

    const previousCursor = cursorHistory[currentPage - 2] ?? null;
    setCurrentPage((page) => page - 1);
    await loadUsers(previousCursor);
  }

  useEffect(() => {
    loadUsers();
  }, []);

  const showingFrom = total === 0 ? 0 : (currentPage - 1) * limit + 1;
  const showingTo = (currentPage - 1) * limit + users.length;

  return (
    <section style={{ padding: "0 24px" }}>
      <div className="users-table-card">
        <div className="table-scroll">
          <table className="users-table">
            <thead>
              <tr>
                <th>Correo</th>
                <th>Roles</th>
                <th>Creado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => {
                const roles = user.usersRoles.map((userRole) => userRole.roles.name);

                return (
                  <tr key={user.id}>
                    <td>
                      <strong>{user.email}</strong>
                      <span>ID {user.id}</span>
                    </td>
                    <td>
                      <div className="role-list">
                        {roles.length > 0 ? roles.map((role) => (
                          <span className="role-pill" key={`${user.id}-${role}`}>
                            {role}
                          </span>
                        )) : (
                          <span className="muted-text">Sin roles</span>
                        )}
                      </div>
                    </td>
                    <td className="date-cell">{new Date(user.createdAt).toLocaleDateString()}</td>
                    <td>
                      <div className="row-actions" aria-label={`Acciones para ${user.email}`}>
                        <a className="icon-button" href={`/users/${user.id}`} aria-label="Editar usuario">
                          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true">
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
                          aria-label="Eliminar usuario"
                          onClick={() => deleteUser(user.id)}
                        >
                          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true">
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
                );
              })}

              {users.length === 0 && (
                <tr>
                  <td className="empty-table-cell" colSpan={4}>
                    No hay usuarios registrados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <footer className="table-footer">
        <span>
          Mostrando {showingFrom} - {showingTo} de {total} usuarios
        </span>
        <nav className="pagination" aria-label="Paginacion de usuarios">
          <button type="button" aria-label="Pagina anterior" onClick={prevPage} disabled={currentPage === 1}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="m15 18-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"></path>
            </svg>
          </button>
          <button type="button" aria-label="Pagina siguiente" disabled={!hasMore} onClick={nextPage}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="m9 18 6-6-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"></path>
            </svg>
          </button>
        </nav>
      </footer>
    </section>
  );
}
