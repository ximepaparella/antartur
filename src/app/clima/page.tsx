import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Clima - Antartur",
  description: "Información del clima en Tierra del Fuego",
};

export default function ClimaPage() {
  return (
    <main style={{ paddingTop: "90px", minHeight: "100vh", padding: "90px 2rem 2rem" }}>
      <h1>Clima</h1>
    </main>
  );
}

