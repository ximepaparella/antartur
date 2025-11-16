import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Ushuaia - Antartur",
  description: "Información sobre Ushuaia",
};

export default function UshuaiaPage() {
  return (
    <main style={{ paddingTop: "90px", minHeight: "100vh", padding: "90px 2rem 2rem" }}>
      <h1>Ushuaia</h1>
    </main>
  );
}

