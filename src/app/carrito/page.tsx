import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Carrito - Antartur",
  description: "Carrito de compras",
};

export default function CarritoPage() {
  return (
    <main style={{ paddingTop: "90px", minHeight: "100vh", padding: "90px 2rem 2rem" }}>
      <h1>Carrito</h1>
    </main>
  );
}

