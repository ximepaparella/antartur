import type { Metadata } from "next";
import { Hero } from "@/modules/content/components/Hero/Hero";
import { Heading } from "@/components/common/Heading/Heading";
import { Testimonials } from "@/components/common/Testimonials/Testimonials";
import testimonialsData from "@/modules/content/components/Testimonials/testimonialsdata.json";
import { Banner } from "@/modules/content/components/Banner/Banner";
import "@/styles/globals.scss";

export const metadata: Metadata = {
  title: "Verano - Excursiones de Verano en Tierra del Fuego | Antartur",
  description: "Los días son largos y el clima en verano es muy ameno! Las temperaturas en Verano van entre los 6° y los 15 grados. Descubrí nuestras excursiones de verano en Ushuaia.",
  keywords: ["verano", "Ushuaia", "excursiones verano", "Tierra del Fuego verano", "turismo verano"],
  openGraph: {
    title: "Verano - Excursiones de Verano en Tierra del Fuego | Antartur",
    description: "Los días son largos y el clima en verano es muy ameno! Descubrí nuestras excursiones de verano en Ushuaia.",
    type: "website",
    locale: "es_AR",
  },
  twitter: {
    card: "summary_large_image",
    title: "Verano - Excursiones de Verano | Antartur",
    description: "Los días son largos y el clima en verano es muy ameno! Descubrí nuestras excursiones de verano en Ushuaia.",
  },
};

export default function VeranoPage() {
  const testimonials = testimonialsData.verano;

  return (
    <>
      <Hero variant="internal" pageKey="verano" />
      <main className="mainContainer">
        <Heading
          title="TEMPORADA DE VERANO"
          paragraph='Los días son largos y el clima en verano es muy ameno! Las temperaturas en Verano, van entre los 6° y los 15 grados aproximado. El clima de Ushuaia es bastante cambiante, la recomendación será siempre "campera obligatoria" y si es impermeable mucho mejor!'
        />
      </main>
      <Banner
        backgroundImage="/images/banners/hero-verano.jpg"
        title=""
        excerpt=""
        linkText=""
        linkUrl=""
        minHeight={600}
      >
        {/* Módulo de reservas - se implementará luego */}
        <div style={{ padding: "2rem", background: "white", borderRadius: "8px", boxShadow: "0 4px 20px rgba(0, 0, 0, 0.15)" }}>
          <p>Módulo de reservas - en desarrollo</p>
        </div>
      </Banner>
      <Testimonials testimonials={testimonials} variant="dark" />
    </>
  );
}

