import type { Metadata } from "next";
import { Hero } from "@/modules/ui/components/Hero/Hero";
import styles from "./page.module.scss";

export const metadata: Metadata = {
  title: "Políticas de Privacidad - Antartur",
  description: "Política de privacidad de Antartur. Cómo recopilamos, usamos y protegemos tu información personal de acuerdo con la Ley de Protección de Datos Personales 25.326.",
  keywords: ["políticas de privacidad", "protección de datos", "privacidad", "Antartur", "Ley 25.326"],
  openGraph: {
    title: "Políticas de Privacidad - Antartur",
    description: "Política de privacidad de Antartur. Cómo recopilamos, usamos y protegemos tu información personal.",
    type: "website",
    locale: "es_AR",
  },
  twitter: {
    card: "summary",
    title: "Políticas de Privacidad - Antartur",
    description: "Política de privacidad de Antartur. Cómo recopilamos, usamos y protegemos tu información personal.",
  },
};

export default function PoliticasDePrivacidadPage() {
  return (
    <>
      <Hero variant="internal" pageKey="politicas-de-privacidad" />
      <main className="mainContainer">
        <div className={styles.content}>
          <section className={styles.section}>
            <h2>1. Introducción</h2>
            <p>
              En Antartur (la agencia de turismo), nos comprometemos a proteger la privacidad de nuestros usuarios y clientes. Tratamos la información personal que usted nos proporciona de forma confidencial, de conformidad con el art. 43 párrafo tercero de la Constitución Nacional, la Ley de Protección de Datos Personales 25.326, el Decreto Reglamentario 1558/01 y otras disposiciones de la Dirección Nacional de Protección de Datos Personales.
            </p>
            <p>
              Esta Política de Privacidad describe cómo recopilamos, usamos, almacenamos y protegemos la información personal que recibimos a través de nuestro sitio web www.antartur.tur.ar.
            </p>
          </section>

          <section className={styles.section}>
            <h2>2. Información que recopilamos</h2>
            <p>
              Podemos recopilar los siguientes datos personales:
            </p>
            <ul>
              <li>Nombre y apellido</li>
              <li>Dirección de correo electrónico</li>
              <li>Número de teléfono</li>
              <li>Información necesaria para reservas (fecha, cantidad de personas, preferencias)</li>
              <li>Datos de facturación, en caso de compras online</li>
            </ul>
          </section>

          <section className={styles.section}>
            <h2>3. Uso de la información</h2>
            <p>
              La información personal se utiliza para:
            </p>
            <ul>
              <li>Gestionar reservas de excursiones</li>
              <li>Comunicarnos con los usuarios para confirmar o coordinar servicios</li>
              <li>Enviar información sobre nuevas actividades, promociones o cambios relevantes</li>
              <li>Cumplir con obligaciones legales y administrativas</li>
            </ul>
          </section>

          <section className={styles.section}>
            <h2>4. Protección de datos</h2>
            <p>
              Implementamos medidas de seguridad técnicas y organizativas para proteger sus datos contra accesos no autorizados, pérdida o alteración. No compartimos ni vendemos sus datos personales a terceros, salvo cuando sea necesario para la prestación del servicio o por obligación legal.
            </p>
          </section>

          <section className={styles.section}>
            <h2>5. Uso de cookies</h2>
            <p>
              Este sitio puede utilizar cookies para mejorar la experiencia del usuario. Puede configurar su navegador para rechazarlas, aunque eso puede afectar algunas funciones del sitio.
            </p>
          </section>

          <section className={styles.section}>
            <h2>6. Derechos del usuario</h2>
            <p>
              Como titular de los datos, usted tiene derecho a acceder, corregir, actualizar o eliminar su información personal. Para ejercer estos derechos, puede escribirnos a hola@antartur.tur.ar.
            </p>
          </section>

          <section className={styles.section}>
            <h2>7. Cambios en la política</h2>
            <p>
              Nos reservamos el derecho de modificar esta Política de Privacidad en cualquier momento. Las actualizaciones serán publicadas en esta misma sección. El uso continuo del sitio web de Antartur después de cualquier cambio implicará su consentimiento a dichas modificaciones.
            </p>
          </section>

          <section className={styles.section}>
            <h2>8. Contacto</h2>
            <p>
              Si tiene preguntas sobre esta política o el tratamiento de sus datos, escríbanos a hola@antartur.tur.ar.
            </p>
          </section>
        </div>
      </main>
    </>
  );
}

