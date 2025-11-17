import type { Metadata } from "next";
import { Hero } from "@/modules/content/components/Hero/Hero";
import { Heading } from "@/components/common/Heading/Heading";
import "@/styles/globals.scss";

export const metadata: Metadata = {
  title: "Antártida - Viajes al Continente Blanco desde Ushuaia | Antartur",
  description: "Por su ubicación estratégica, Ushuaia se constituye como Ciudad Puerta de Entrada a la Antártida. La temporada se extiende entre noviembre y abril. Descubrí nuestros viajes a la Antártida.",
  keywords: ["Antártida", "viajes Antártida", "cruceros Antártida", "expedición Antártida", "Ushuaia", "Península Antártica"],
  openGraph: {
    title: "Antártida - Viajes al Continente Blanco desde Ushuaia | Antartur",
    description: "Ushuaia se constituye como Ciudad Puerta de Entrada a la Antártida. La temporada se extiende entre noviembre y abril.",
    type: "website",
    locale: "es_AR",
  },
  twitter: {
    card: "summary_large_image",
    title: "Antártida - Viajes al Continente Blanco | Antartur",
    description: "Ushuaia se constituye como Ciudad Puerta de Entrada a la Antártida.",
  },
};

export default function AntartidaPage() {
  return (
    <>
      <Hero variant="internal" pageKey="antartida" />
      <main className="mainContainer">
        <Heading
          title="PUERTA AL CONTINENTE BLANCO"
          paragraph={[
            "Por su ubicación estratégica, a sólo 1000 km de la Península Antártica y por contar con la adecuada infraestructura para la atención de grandes cruceros y buques de expedición Ushuaia se constituye como Ciudad Puerta de Entrada a la Antártida. La temporada se extiende entre noviembre y abril. Cada año el puerto de Ushuaia recibe miles de turistas ávidas de conocer el Continente Blanco como pasajeros y muchas veces hasta como tripulantes.",
            "La Antártida...Una tierra de hielo brillante, picos majestuosos y belleza deslumbrante, la Antártida es el continente Menos visitado en el fin del mundo. Explora la Península Antártica, la parte septentrional del Último continente, donde te deleitarás con uno de los Entornos Naturales Más pristinos e Inolvidables del mundo. Su Viaje Será resaltado por Pingüinos, focas Y ballenas Que acompañan al barco Durante su viaje a lo largo de la costa antártica. Sus Primeros Pasos en el continente seran inolvidables a medida que visitamos Impresionantes Lugares Históricos."
          ]}
        />
      </main>
    </>
  );
}

