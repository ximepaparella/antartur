import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Información Gastronómica - Ushuaia - Antartur",
  description: "Información gastronómica en Ushuaia",
};

export default function GastronomiaPage() {
  return (
    <main style={{ paddingTop: "90px", minHeight: "100vh", padding: "90px 2rem 2rem" }}>
      <h1>Información Gastronómica</h1>
    </main>
  );
}

