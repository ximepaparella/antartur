import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Carrito - Carrito de Compras | Antartur",
  description: "Tu carrito de compras en Antartur. Gestioná tus reservas y excursiones seleccionadas.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function CarritoPage() {
  return (
    <main className="mainContainer mainContainer--cart">
      <h1>Carrito</h1>
    </main>
  );
}

