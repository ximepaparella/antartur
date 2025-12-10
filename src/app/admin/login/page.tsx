"use client";

import { useState, FormEvent } from "react";
import { useAdminAuth } from "@/modules/admin/hooks/useAdminAuth";
import { Input } from "@/components/common/Input/Input";
import { Button } from "@/components/common/Button/Button";
import styles from "./page.module.scss";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAdminAuth();

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const success = login(email, password);

      if (success) {
        // Redirección simple y directa
        window.location.href = "/admin/dashboard";
      } else {
        setError("Credenciales inválidas. Por favor, intenta nuevamente.");
        setIsLoading(false);
      }
    } catch (err) {
      setError("Error al iniciar sesión. Por favor, intenta nuevamente.");
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.loginPage}>
      <div className={styles.loginCard}>
        <div className={styles.header}>
          <h1 className={styles.title}>Antartur Admin</h1>
          <p className={styles.subtitle}>Inicia sesión para continuar</p>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          <Input
            type="email"
            label="Email"
            name="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="admin@antartur.com"
            disabled={isLoading}
            autoComplete="email"
          />

          <Input
            type="password"
            label="Contraseña"
            name="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder="••••••••"
            disabled={isLoading}
            autoComplete="current-password"
          />

          {error && <div className={styles.errorMessage}>{error}</div>}

          <Button
            type="submit"
            variant="primary"
            disabled={isLoading}
            className={styles.submitButton}
          >
            {isLoading ? "Iniciando sesión..." : "Iniciar sesión"}
          </Button>
        </form>

        <div className={styles.footer}>
          <p className={styles.helpText}>
            Usa las credenciales de administrador para acceder
          </p>
        </div>
      </div>
    </div>
  );
}

