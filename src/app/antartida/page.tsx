import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Antártida - Antartur",
  description: "Viajes a la Antártida",
};

export default function AntartidaPage() {
  return (
    <main style={{ paddingTop: "90px", minHeight: "100vh", padding: "90px 2rem 2rem" }}>
      <h1>Antártida</h1>
    </main>
  );
}

