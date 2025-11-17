import type { Metadata } from "next";
import { Hero } from "@/modules/content/components/Hero/Hero";
import { ContactForm } from "@/modules/content/components/ContactForm/ContactForm";
import { ContactInfo } from "@/modules/content/components/ContactInfo/ContactInfo";
import styles from "./page.module.scss";

export const metadata: Metadata = {
  title: "Contacto - Contáctanos | Antartur",
  description: "Estamos siempre disponibles para asistirte. Contactá con Antartur para consultas sobre excursiones, viajes a la Antártida y turismo en Tierra del Fuego.",
  keywords: ["contacto", "Antartur", "Ushuaia", "consultas", "reservas"],
  openGraph: {
    title: "Contacto - Contáctanos | Antartur",
    description: "Estamos siempre disponibles para asistirte. Contactá con Antartur para consultas sobre excursiones y viajes.",
    type: "website",
    locale: "es_AR",
  },
  twitter: {
    card: "summary",
    title: "Contacto - Contáctanos | Antartur",
    description: "Estamos siempre disponibles para asistirte.",
  },
};

export default function ContactoPage() {
  return (
    <>
      <Hero variant="internal" pageKey="contacto" />
      <main className="mainContainer">
        <div className={styles.contactPage}>
          <div className={styles.leftColumn}>
            <ContactForm />
          </div>
          <div className={styles.rightColumn}>
            <ContactInfo />
          </div>
        </div>
      </main>
    </>
  );
}

