import type { Metadata } from "next";
import { Hero } from "@/modules/content/components/Hero/Hero";
import { Heading } from "@/components/common/Heading/Heading";
import { Testimonials } from "@/components/common/Testimonials/Testimonials";
import "@/styles/globals.scss";

export const metadata: Metadata = {
  title: "Verano - Antartur",
  description: "Excursiones de verano en Tierra del Fuego",
};

export default function VeranoPage() {
  const testimonials = [
    {
      text: "Realmente muy gratificado por todo ! La excelente onda de los guias ! David impecable ! Los paseos programados en nuestro full day nieve fueron perfectos en tiempo y disfrute ! El almuerzo en el refugio fue riquísimo ! Se nos pasó el día sin darnos cuenta. Lo recomiendo !",
      author: "rvarela28",
      avatar: "/images/testimonials/author-2.jpg",
      country: "Mexico",
    },
  ];

  return (
    <>
      <Hero variant="internal" pageKey="verano" />
      <main className="mainContainer">
        <Heading
          title="TEMPORADA DE VERANO"
          paragraph='Los días son largos y el clima en verano es muy ameno! Las temperaturas en Verano, van entre los 6° y los 15 grados aproximado. El clima de Ushuaia es bastante cambiante, la recomendación será siempre "campera obligatoria" y si es impermeable mucho mejor!'
        />
      </main>
      <Testimonials testimonials={testimonials} variant="dark" />
    </>
  );
}

