import type { Metadata } from "next";
import "@/styles/globals.scss";

export const metadata: Metadata = {
  title: "Carrito - Antartur",
  description: "Carrito de compras",
};

export default function CarritoPage() {
  return (
    <main className="mainContainer mainContainer--cart">
      <h1>Carrito</h1>
    </main>
  );
}

