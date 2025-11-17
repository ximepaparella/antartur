import { Hero } from "@/modules/content/components/Hero/Hero";
import { Heading } from "@/components/common/Heading/Heading";
import { Testimonials } from "@/components/common/Testimonials/Testimonials";
import "@/styles/globals.scss";

export default function Home() {
  const testimonials = [
    {
      text: "Inesquecível passeio 4x4. O profissional Cristian conduziu um dia inteiro entre trilha, canoagem, explicações da fauna e flora e um excelente almoço na cabana. Super-recomendo.",
      author: "Adriana S. Magalhães",
      avatar: "/images/testimonials/author-1.jpg",
      country: "Brasil",
    },
  ];

  return (
    <>
      <Hero variant="home" pageKey="home" />
      <main className="mainContainer">
        <Heading
          iconName="map-route"
          title="ELEGÍ TU AVENTURA"
        />
        <Heading
          title="EXCURSIONES DE INVIERNO"
          paragraph="En antartur tenemos excursiones para todas las temporadas del año, pudiendo así disfrutar de diversas aventuras según la época del año."
        />
      </main>
      <Testimonials testimonials={testimonials} variant="light" />
    </>
  );
}

