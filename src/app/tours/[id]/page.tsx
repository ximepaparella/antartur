import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/common/Button/Button";
import { getTourById } from "@/modules/content/components/ToursGrid/toursData";
import "@/styles/globals.scss";

interface TourPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: TourPageProps): Promise<Metadata> {
  const { id } = await params;
  const tour = getTourById(id);

  if (!tour) {
    return {
      title: "Tour no encontrado | Antartur",
    };
  }

  return {
    title: `${tour.title} | Antartur`,
    description: `${tour.subtitle} - ${tour.title}. Dificultad: ${tour.difficulty}. Precio: ${tour.price}`,
    openGraph: {
      title: `${tour.title} | Antartur`,
      description: `${tour.subtitle} - ${tour.title}`,
      type: "website",
      locale: "es_AR",
    },
  };
}

export default async function TourPage({ params }: TourPageProps) {
  const { id } = await params;
  const tour = getTourById(id);

  if (!tour) {
    notFound();
  }

  return (
    <>
      <main className="mainContainer">
        <div style={{ marginTop: "2rem", marginBottom: "2rem" }}>
          <Image
            src={tour.featuredImage}
            alt={tour.title}
            width={1200}
            height={600}
            style={{ width: "100%", height: "auto", borderRadius: "8px" }}
          />
        </div>
        <div style={{ maxWidth: "800px", margin: "0 auto" }}>
          <h1 style={{ 
            fontFamily: "var(--font-roboto), sans-serif",
            fontSize: "2rem",
            fontWeight: 400,
            textTransform: "uppercase",
            color: "var(--gray-800)",
            marginBottom: "1rem"
          }}>
            {tour.title}
          </h1>
          <div style={{
            display: "flex",
            flexDirection: "column",
            gap: "1rem",
            marginBottom: "2rem",
            padding: "1.5rem",
            backgroundColor: "var(--gray-100)",
            borderRadius: "8px"
          }}>
            <div>
              <strong>Dificultad:</strong> {tour.difficulty}
            </div>
            <div>
              <strong>Precio:</strong> {tour.price}
            </div>
          </div>
          <Button variant="primary" size="large" href="/carrito">
            RESERVAR AHORA
          </Button>
        </div>
      </main>
    </>
  );
}

