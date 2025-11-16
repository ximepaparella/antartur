import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contacto - Antartur",
  description: "Contacta con Antartur",
};

export default function ContactoPage() {
  return (
    <main style={{ paddingTop: "90px", minHeight: "100vh", padding: "90px 2rem 2rem" }}>
      <h1>Contacto</h1>
    </main>
  );
}

