import { Hero } from "@/modules/content/components/Hero/Hero";
import { Heading } from "@/components/common/Heading/Heading";
import "@/styles/globals.scss";

export default function Home() {
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
    </>
  );
}

