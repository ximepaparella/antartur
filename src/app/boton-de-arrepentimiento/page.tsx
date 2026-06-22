import type { Metadata } from "next";
import { Hero } from "@/modules/ui/components/Hero/Hero";
import { ArrepentimientoForm } from "@/modules/ui/components/ArrepentimientoForm/ArrepentimientoForm";
import { ContactInfo } from "@/modules/ui/components/ContactInfo/ContactInfo";
import styles from "../contacto/page.module.scss";

export const metadata: Metadata = {
  title: "Botón de Arrepentimiento | Antartur",
  description:
    "Ejercé tu derecho de arrepentimiento ante Antartur. Completá el formulario y nos pondremos en contacto a la brevedad.",
  keywords: [
    "botón de arrepentimiento",
    "Antartur",
    "reservas",
    "derecho de arrepentimiento",
  ],
  openGraph: {
    title: "Botón de Arrepentimiento | Antartur",
    description:
      "Ejercé tu derecho de arrepentimiento ante Antartur completando el formulario.",
    type: "website",
    locale: "es_AR",
  },
  twitter: {
    card: "summary",
    title: "Botón de Arrepentimiento | Antartur",
    description: "Ejercé tu derecho de arrepentimiento ante Antartur.",
  },
};

export default function BotonDeArrepentimientoPage() {
  return (
    <>
      <Hero variant="internal" pageKey="boton-de-arrepentimiento" />
      <main className="mainContainer">
        <div className={styles.contactPage}>
          <div className={styles.leftColumn}>
            <ArrepentimientoForm />
          </div>
          <div className={styles.rightColumn}>
            <ContactInfo />
          </div>
        </div>
      </main>
    </>
  );
}
