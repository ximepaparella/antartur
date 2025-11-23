import type { Metadata } from "next";
import { Hero } from "@/modules/ui/components/Hero/Hero";
import { Heading } from "@/components/common/Heading/Heading";
import { Button } from "@/components/common/Button/Button";

export const metadata: Metadata = {
  title: "Hoteles en Ushuaia - Alojamientos | Antartur",
  description: "Tenemos más de 100 alojamientos habilitados en Ushuaia, incluyendo hoteles cinco estrellas de categoría internacional, cabañas de primer nivel, aparts y hostels.",
  keywords: ["hoteles Ushuaia", "alojamientos Ushuaia", "cabañas Ushuaia", "hostels Ushuaia", "hoteles Tierra del Fuego"],
  openGraph: {
    title: "Hoteles en Ushuaia - Alojamientos | Antartur",
    description: "Tenemos más de 100 alojamientos habilitados en Ushuaia, incluyendo hoteles cinco estrellas de categoría internacional.",
    type: "website",
    locale: "es_AR",
  },
  twitter: {
    card: "summary_large_image",
    title: "Hoteles en Ushuaia | Antartur",
    description: "Tenemos más de 100 alojamientos habilitados en Ushuaia.",
  },
};

export default function HotelesPage() {
  return (
    <>
      <Hero variant="internal" pageKey="ushuaia-hoteles" />
      <main className="mainContainer">
        <Heading
          title="HOTELES EN USHUAIA"
          paragraph="Tenemos más de 100 alojamientos habilitados, incluyendo hoteles cinco estrellas de categoría internacional, cabañas de primer nivel en medio del bosque, aparts y hostels con habitaciones compartidas. Cualquiera que venga podrá pasarla muy bien."
        />
        <div style={{ marginTop: "2rem", display: "flex", justifyContent: "center" }}>
          <Button variant="primary" href="https://turismoushuaia.com/contenidos/alojamientos/?lang=es_AR">
            Ver más información
          </Button>
        </div>
      </main>
    </>
  );
}

