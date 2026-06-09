import { useEffect, useMemo, useState, type FormEvent } from "react";
import "./CreateUser.css";
import { backendConection, type Response, type RoleJSONInterface } from "../../controller/salesOrders.hook";

type UserFormState = {
    email: string;
    roles: number[];
};

const initialFormState: UserFormState = {
    email: "",
    roles: [],
};

export default function CreateUser(props: { id?: string }) {
    const { id = "nuevo" } = props;
    const [formState, setFormState] = useState<UserFormState>(initialFormState);
    const [roles, setRoles] = useState<RoleJSONInterface[]>([]);
    const [isSaving, setIsSaving] = useState(false);

    const isEditing = id !== "nuevo";
    const selectedRoles = useMemo(() => new Set(formState.roles), [formState.roles]);

    useEffect(() => {
        backendConection("GET", "user", "roles")
            .then((res) => {
                const rolesResponse = res as Response<RoleJSONInterface[]>;
                setRoles(rolesResponse.data ?? []);
            });

        if (!isEditing) return;

        backendConection("GET", "user", id)
            .then((res) => {
                const user = res.data?.at(0);
                if (!user) return;

                setFormState({
                    email: user.email,
                    roles: user.usersRoles.map((userRole) => Number(userRole.roles.id)),
                });
            });
    }, [id, isEditing]);

    function toggleRole(roleId: number) {
        setFormState((currentForm) => {
            const exists = currentForm.roles.includes(roleId);

            return {
                ...currentForm,
                roles: exists
                    ? currentForm.roles.filter((currentRoleId) => currentRoleId !== roleId)
                    : [...currentForm.roles, roleId],
            };
        });
    }

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setIsSaving(true);

        const payload = {
            email: formState.email.trim(),
            roles: formState.roles,
        };

        const res = isEditing
            ? await backendConection("PATCH", "user", id, payload)
            : await backendConection("POST", "user", undefined, payload);

        setIsSaving(false);

        if (res.success) {
            globalThis.location.href = "/users";
            return;
        }

        alert(res.message || "No se pudo guardar el usuario");
    }

    return (
        <section className="user-form-page" aria-labelledby="user-form-title">
            <nav className="breadcrumbs" aria-label="Ruta de navegacion">
                <a href="/users">Usuarios</a>
                <span aria-hidden="true">&gt;</span>
                <span>{isEditing ? "Editar Usuario" : "Agregar Usuario"}</span>
            </nav>

            <header className="page-header">
                <h2 id="user-form-title">{isEditing ? "Editar Usuario" : "Agregar Nuevo Usuario"}</h2>
                <p>Configura el correo de acceso y los permisos operativos asociados.</p>
            </header>

            <form className="user-form-layout" onSubmit={handleSubmit}>
                <section className="form-panel">
                    <div className="panel-header">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                            <path
                                d="M20 21a8 8 0 0 0-16 0M12 13a5 5 0 1 0 0-10 5 5 0 0 0 0 10Z"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                            />
                        </svg>
                        <h3>Datos del usuario</h3>
                    </div>

                    <div className="field">
                        <label htmlFor="email">Correo electronico</label>
                        <input
                            id="email"
                            name="email"
                            type="email"
                            placeholder="usuario@restaurante.com"
                            value={formState.email}
                            onChange={(event) => setFormState((currentForm) => ({ ...currentForm, email: event.target.value }))}
                            required
                        />
                    </div>
                </section>

                <section className="form-panel roles-panel">
                    <div className="panel-header">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                            <path
                                d="M12 3 4 6v6c0 5 3.4 8 8 9 4.6-1 8-4 8-9V6l-8-3Z"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinejoin="round"
                            />
                        </svg>
                        <h3>Roles asociados</h3>
                    </div>

                    <div className="roles-grid">
                        {roles.map((role) => {
                            const roleId = Number(role.id);
                            const checked = selectedRoles.has(roleId);

                            return (
                                <label className={`role-option ${checked ? "selected" : ""}`} key={role.id}>
                                    <input
                                        type="checkbox"
                                        checked={checked}
                                        onChange={() => toggleRole(roleId)}
                                    />
                                    <span>{role.name}</span>
                                </label>
                            );
                        })}
                    </div>
                </section>

                <div className="form-actions">
                    <button className="btn-save" type="submit" disabled={isSaving}>
                        {isSaving ? "Guardando..." : "Guardar Usuario"}
                    </button>
                    <a className="btn-cancel" href="/users">Cancelar</a>
                </div>
            </form>
        </section>
    );
}
