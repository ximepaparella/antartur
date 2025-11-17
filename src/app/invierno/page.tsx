import type { Metadata } from "next";
import { Hero } from "@/modules/content/components/Hero/Hero";
import { Heading } from "@/components/common/Heading/Heading";
import "@/styles/globals.scss";

export const metadata: Metadata = {
  title: "Invierno - Antartur",
  description: "Excursiones de invierno en Tierra del Fuego",
};

export default function InviernoPage() {
  return (
    <>
      <Hero variant="internal" pageKey="invierno" />
      <main className="mainContainer">
        <Heading
          title="TEMPORADA DE INVIERNO"
          paragraph="Nuestra temporada de invierno comienza el 21 de junio y se extiende hasta los primeros días de octubre."
        />
      </main>
    </>
  );
}

