"use client";

import { useMemo, useState } from "react";
import { adminApiClient } from "@/modules/admin/lib/adminApiClient";
import { useDataTable } from "@/modules/admin/hooks/useDataTable";
import { DataTable } from "@/components/common/DataTable";
import type { TableColumn } from "@/components/common/Table/Table";
import type { FilterConfig } from "@/components/common/FiltersBar";
import type { UserSummary, CreateUserDto, ChangeUserPasswordDto } from "@/modules/admin/lib/types";
import type { UserRole } from "@prisma/client";
import styles from "./page.module.scss";
import { Modal } from "@/components/common/Modal/Modal";
import { Input } from "@/components/common/Input/Input";
import { Select } from "@/components/common/Select/Select";
import { Button } from "@/components/common/Button/Button";
import { Message } from "@/components/common/Message/Message";

function formatMaybeDate(value: string | null | undefined): string {
  if (!value) return "-";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "-";
  return d.toLocaleDateString("es-AR", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default function AdminUsersPage() {
  const [createOpen, setCreateOpen] = useState(false);
  const [passwordOpen, setPasswordOpen] = useState(false);

  const [createForm, setCreateForm] = useState<{
    email: string;
    name: string;
    role: UserRole;
    password: string;
    confirmPassword: string;
    isActive: boolean;
  }>({
    email: "",
    name: "",
    role: "OPERATOR",
    password: "",
    confirmPassword: "",
    isActive: true,
  });

  const [createError, setCreateError] = useState<string | null>(null);
  const [createIsLoading, setCreateIsLoading] = useState(false);

  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [passwordForm, setPasswordForm] = useState<{
    newPassword: string;
    confirmNewPassword: string;
  }>({
    newPassword: "",
    confirmNewPassword: "",
  });
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordIsLoading, setPasswordIsLoading] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const filterConfigs = useMemo<FilterConfig[]>(
    () => [
      {
        key: "search",
        label: "Buscar",
        type: "text",
        placeholder: "Email o nombre...",
      },
      {
        key: "role",
        label: "Rol",
        type: "select",
        options: [
          { value: "", label: "Todos" },
          { value: "ADMIN", label: "ADMIN" },
          { value: "OPERATOR", label: "OPERATOR" },
        ],
      },
      {
        key: "isActive",
        label: "Estado",
        type: "select",
        options: [
          { value: "", label: "Todos" },
          { value: "true", label: "Activo" },
          { value: "false", label: "Inactivo" },
        ],
      },
    ],
    []
  );

  const {
    data,
    isLoading,
    error,
    page,
    limit,
    filters,
    meta,
    handlePageChange,
    handleLimitChange,
    handleFilterChange,
    clearFilters,
    refetch,
  } = useDataTable<UserSummary>({
    fetchData: async ({ page, limit, filters }) => {
      const response = await adminApiClient.getUsers({
        page,
        limit,
        search: filters?.search || undefined,
        role: filters?.role || undefined,
        isActive: filters?.isActive || undefined,
      });

      return {
        success: response.success,
        data: response.data || [],
        meta: response.meta,
      };
    },
    initialPage: 1,
    initialLimit: 25,
    initialFilters: {},
  });

  const columns = useMemo<TableColumn<UserSummary>[]>(
    () => [
      { key: "email", label: "Email" },
      {
        key: "name",
        label: "Nombre",
        render: (value) => value || "-",
      },
      {
        key: "role",
        label: "Rol",
        render: (value) =>
          String(value).toLowerCase() === "admin" ? "ADMIN" : String(value),
      },
      {
        key: "isActive",
        label: "Activo",
        render: (value) => (value ? "Sí" : "No"),
      },
      {
        key: "lastLoginAt",
        label: "Último login",
        render: (value) => formatMaybeDate(value),
      },
      {
        key: "actions",
        label: "Acciones",
        align: "right",
        render: (_, row) => {
          return (
            <div className={styles.actions}>
              <Button
                variant="outline"
                size="small"
                onClick={() => {
                  setActionError(null);
                  setSelectedUserId(row.id);
                  setPasswordError(null);
                  setPasswordForm({ newPassword: "", confirmNewPassword: "" });
                  setPasswordOpen(true);
                }}
              >
                Cambiar password
              </Button>
              <Button
                variant="danger"
                size="small"
                onClick={async () => {
                  setActionError(null);
                  const ok = window.confirm(
                    `¿Eliminar el usuario "${row.email}"? Esta acción no se puede deshacer.`
                  );
                  if (!ok) return;

                  try {
                    await adminApiClient.deleteUser(row.id);
                    await refetch();
                  } catch (err) {
                    console.error(err);
                    setActionError("No se pudo eliminar el usuario. Intentá nuevamente.");
                  }
                }}
              >
                Eliminar
              </Button>
            </div>
          );
        },
      },
    ],
    [refetch]
  );

  const totalPages = meta?.totalPages || 1;

  const roleOptions = useMemo(
    () => [
      { value: "ADMIN" as const, label: "ADMIN" },
      { value: "OPERATOR" as const, label: "OPERATOR" },
    ],
    []
  );

  const handleCreate = async () => {
    setCreateError(null);
    setCreateIsLoading(true);

    try {
      const dto: CreateUserDto = {
        email: createForm.email,
        name: createForm.name.trim() ? createForm.name : null,
        role: createForm.role,
        password: createForm.password,
        confirmPassword: createForm.confirmPassword,
        isActive: createForm.isActive,
      };

      await adminApiClient.createUser(dto);
      setCreateOpen(false);
      setActionError(null);
      setCreateForm({
        email: "",
        name: "",
        role: "OPERATOR",
        password: "",
        confirmPassword: "",
        isActive: true,
      });
      await refetch();
    } catch (err) {
      setCreateError(err instanceof Error ? err.message : "No se pudo crear el usuario");
    } finally {
      setCreateIsLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (!selectedUserId) return;

    setPasswordError(null);
    setPasswordIsLoading(true);

    try {
      const dto: ChangeUserPasswordDto = {
        newPassword: passwordForm.newPassword,
        confirmNewPassword: passwordForm.confirmNewPassword,
      };

      await adminApiClient.changeUserPassword(selectedUserId, dto);
      setPasswordOpen(false);
      setActionError(null);
      setSelectedUserId(null);
      setPasswordForm({ newPassword: "", confirmNewPassword: "" });
      await refetch();
    } catch (err) {
      setPasswordError(err instanceof Error ? err.message : "No se pudo cambiar la contraseña");
    } finally {
      setPasswordIsLoading(false);
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>Usuarios</h1>
        <p className={styles.subtitle}>Alta, eliminación y cambio de contraseñas</p>
        <div className={styles.headerActions}>
          <Button
            variant="primary"
            onClick={() => {
              setActionError(null);
              setCreateError(null);
              setCreateOpen(true);
            }}
          >
            Crear usuario
          </Button>
        </div>
      </div>

      {error && (
        <Message variant="alert" className={styles.message}>
          {error}
        </Message>
      )}

      {actionError && (
        <Message variant="alert" className={styles.message}>
          {actionError}
        </Message>
      )}

      <DataTable<UserSummary>
        columns={columns}
        data={data}
        isLoading={isLoading}
        error={error}
        page={page}
        totalPages={totalPages}
        onPageChange={handlePageChange}
        pageSize={limit}
        onPageSizeChange={handleLimitChange}
        filters={filterConfigs}
        filterValues={filters}
        onFilterChange={handleFilterChange}
        onClearFilters={clearFilters}
        emptyMessage="No hay usuarios"
      />

      <Modal
        isOpen={createOpen}
        title="Crear usuario"
        onClose={() => {
          if (createIsLoading) return;
          setCreateOpen(false);
          setCreateError(null);
        }}
        size="medium"
      >
        <div className={styles.modalBody}>
          {createError && (
            <Message variant="alert" className={styles.message}>
              {createError}
            </Message>
          )}

          <div className={styles.formGrid}>
            <Input
              label="Email"
              name="email"
              type="email"
              value={createForm.email}
              onChange={(e) => setCreateForm((p) => ({ ...p, email: e.target.value }))}
              required
              placeholder="usuario@dominio.com"
              disabled={createIsLoading}
              autoComplete="email"
            />

            <Input
              label="Nombre"
              name="name"
              type="text"
              value={createForm.name}
              onChange={(e) => setCreateForm((p) => ({ ...p, name: e.target.value }))}
              disabled={createIsLoading}
              placeholder="(opcional)"
              autoComplete="name"
            />

            <Select
              label="Rol"
              name="role"
              value={createForm.role}
              onChange={(e) => setCreateForm((p) => ({ ...p, role: e.target.value as UserRole }))}
              required
              disabled={createIsLoading}
              options={roleOptions}
            />

            <Input
              label="Password"
              name="password"
              type="password"
              value={createForm.password}
              onChange={(e) => setCreateForm((p) => ({ ...p, password: e.target.value }))}
              required
              disabled={createIsLoading}
              placeholder="Mínimo 8 caracteres"
              autoComplete="new-password"
            />

            <Input
              label="Confirmar password"
              name="confirmPassword"
              type="password"
              value={createForm.confirmPassword}
              onChange={(e) =>
                setCreateForm((p) => ({ ...p, confirmPassword: e.target.value }))
              }
              required
              disabled={createIsLoading}
              placeholder="Repetí la password"
              autoComplete="new-password"
            />

            <Select
              label="Estado"
              name="isActive"
              value={createForm.isActive ? "true" : "false"}
              onChange={(e) =>
                setCreateForm((p) => ({ ...p, isActive: e.target.value === "true" }))
              }
              disabled={createIsLoading}
              options={[
                { value: "true", label: "Activo" },
                { value: "false", label: "Inactivo" },
              ]}
            />
          </div>

          <div className={styles.modalActions}>
            <Button
              variant="outline"
              onClick={() => setCreateOpen(false)}
              disabled={createIsLoading}
            >
              Cancelar
            </Button>
            <Button
              variant="primary"
              onClick={() => void handleCreate()}
              disabled={createIsLoading}
            >
              {createIsLoading ? "Creando..." : "Crear usuario"}
            </Button>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={passwordOpen}
        title="Cambiar password"
        onClose={() => {
          if (passwordIsLoading) return;
          setPasswordOpen(false);
          setPasswordError(null);
        }}
        size="medium"
      >
        <div className={styles.modalBody}>
          {passwordError && (
            <Message variant="alert" className={styles.message}>
              {passwordError}
            </Message>
          )}

          <div className={styles.formGrid}>
            <Input
              label="Nueva password"
              name="newPassword"
              type="password"
              value={passwordForm.newPassword}
              onChange={(e) =>
                setPasswordForm((p) => ({ ...p, newPassword: e.target.value }))
              }
              required
              disabled={passwordIsLoading}
              placeholder="Mínimo 8 caracteres"
              autoComplete="new-password"
            />

            <Input
              label="Confirmar nueva password"
              name="confirmNewPassword"
              type="password"
              value={passwordForm.confirmNewPassword}
              onChange={(e) =>
                setPasswordForm((p) => ({ ...p, confirmNewPassword: e.target.value }))
              }
              required
              disabled={passwordIsLoading}
              placeholder="Repetí la password"
              autoComplete="new-password"
            />
          </div>

          <div className={styles.modalActions}>
            <Button
              variant="outline"
              onClick={() => setPasswordOpen(false)}
              disabled={passwordIsLoading}
            >
              Cancelar
            </Button>
            <Button
              variant="primary"
              onClick={() => void handleChangePassword()}
              disabled={passwordIsLoading}
            >
              {passwordIsLoading ? "Actualizando..." : "Cambiar password"}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

