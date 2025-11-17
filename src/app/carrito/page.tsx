import type { Metadata } from "next";
import "@/styles/globals.scss";

export const metadata: Metadata = {
  title: "Carrito - Antartur",
  description: "Carrito de compras",
};

export default function CarritoPage() {
  return (
    <main className="mainContainer" style={{ paddingTop: "90px" }}>
      <h1>Carrito</h1>
    </main>
  );
}

