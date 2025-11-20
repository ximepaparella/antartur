/**
 * Layout para Swagger UI
 * Solo disponible en desarrollo
 */

export default function AdminApiDocsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Bloquear en producción
  if (process.env.NODE_ENV === "production") {
    return (
      <div style={{ padding: "2rem", textAlign: "center" }}>
        <h1>Acceso no autorizado</h1>
        <p>Esta página solo está disponible en modo desarrollo.</p>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh" }}>
      <div style={{ padding: "1rem", background: "#1f2937", color: "white" }}>
        <h1 style={{ margin: 0, fontSize: "1.5rem" }}>Antartur API Documentation</h1>
        <p style={{ margin: "0.5rem 0 0 0", opacity: 0.8 }}>
          Documentación interna - Solo desarrollo
        </p>
      </div>
      {children}
    </div>
  );
}

