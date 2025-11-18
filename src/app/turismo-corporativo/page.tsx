import type { Metadata } from "next";
import { Hero } from "@/modules/ui/components/Hero/Hero";
import { Heading } from "@/components/common/Heading/Heading";

export const metadata: Metadata = {
  title: "Turismo Corporativo - Incentivos y Eventos Corporativos | Antartur",
  description: "Gestión de viajes corporativos, eventos, organización de incentivos y team buildings. Programas multiaventuras invierno y verano en Tierra del Fuego.",
  keywords: ["turismo corporativo", "incentivos", "eventos corporativos", "team building", "viajes corporativos", "Ushuaia"],
  openGraph: {
    title: "Turismo Corporativo - Incentivos y Eventos Corporativos | Antartur",
    description: "Gestión de viajes corporativos, eventos, organización de incentivos y team buildings.",
    type: "website",
    locale: "es_AR",
  },
  twitter: {
    card: "summary_large_image",
    title: "Turismo Corporativo - Incentivos y Eventos | Antartur",
    description: "Gestión de viajes corporativos, eventos, organización de incentivos y team buildings.",
  },
};

export default function TurismoCorporativoPage() {
  return (
    <>
      <Hero variant="internal" pageKey="turismo-corporativo" />
      <main className="mainContainer">
        <Heading
          title="INCENTIVOS"
          paragraph="Gestión de viajes corporativos. Eventos. Organización de Incentivos y team buildings. Programas Multiaventuras Invierno y Verano"
        />
      </main>
    </>
  );
}

