import { Hero } from "@/modules/content/components/Hero/Hero";

export default function Home() {
  return (
    <>
      <Hero variant="home" pageKey="home" />
      <main style={{ padding: "2rem", minHeight: "50vh" }}>
        {/* Contenido adicional de la página home */}
      </main>
    </>
  );
}

