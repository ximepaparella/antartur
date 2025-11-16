import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Verano - Antartur",
  description: "Excursiones de verano en Tierra del Fuego",
};

export default function VeranoPage() {
  return (
    <main style={{ paddingTop: "90px", minHeight: "100vh", padding: "90px 2rem 2rem" }}>
      <h1>Verano</h1>
    </main>
  );
}

