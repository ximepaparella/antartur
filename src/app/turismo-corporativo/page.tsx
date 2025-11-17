import type { Metadata } from "next";
import { Hero } from "@/modules/content/components/Hero/Hero";
import { Heading } from "@/components/common/Heading/Heading";
import "@/styles/globals.scss";

export const metadata: Metadata = {
  title: "Turismo Corporativo - Antartur",
  description: "Turismo corporativo en Tierra del Fuego",
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

