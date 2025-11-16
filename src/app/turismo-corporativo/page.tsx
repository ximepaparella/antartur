import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Turismo Corporativo - Antartur",
  description: "Turismo corporativo en Tierra del Fuego",
};

export default function TurismoCorporativoPage() {
  return (
    <main style={{ paddingTop: "90px", minHeight: "100vh", padding: "90px 2rem 2rem" }}>
      <h1>Turismo Corporativo</h1>
    </main>
  );
}

