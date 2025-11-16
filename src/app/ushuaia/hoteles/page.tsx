import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Información Hotelera - Ushuaia - Antartur",
  description: "Información hotelera en Ushuaia",
};

export default function HotelesPage() {
  return (
    <main style={{ paddingTop: "90px", minHeight: "100vh", padding: "90px 2rem 2rem" }}>
      <h1>Información Hotelera</h1>
    </main>
  );
}

