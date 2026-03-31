import type { MetadataRoute } from "next";
import { prisma } from "@/lib/db";
import { getSiteUrl } from "@/lib/siteUrl";

const STATIC_PATHS: Array<{
  path: string;
  priority: number;
  changeFrequency: "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never";
}> = [
  { path: "/", priority: 1, changeFrequency: "weekly" },
  { path: "/tours", priority: 0.9, changeFrequency: "weekly" },
  { path: "/contacto", priority: 0.8, changeFrequency: "monthly" },
  { path: "/invierno", priority: 0.85, changeFrequency: "weekly" },
  { path: "/verano", priority: 0.85, changeFrequency: "weekly" },
  { path: "/antartida", priority: 0.85, changeFrequency: "weekly" },
  { path: "/ushuaia", priority: 0.8, changeFrequency: "monthly" },
  { path: "/ushuaia/hoteles", priority: 0.7, changeFrequency: "monthly" },
  { path: "/ushuaia/gastronomia", priority: 0.7, changeFrequency: "monthly" },
  { path: "/clima", priority: 0.6, changeFrequency: "monthly" },
  { path: "/turismo-corporativo", priority: 0.75, changeFrequency: "monthly" },
  { path: "/politicas-de-privacidad", priority: 0.4, changeFrequency: "yearly" },
  { path: "/terminos-y-condiciones", priority: 0.4, changeFrequency: "yearly" },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = getSiteUrl();
  const now = new Date();

  const staticEntries: MetadataRoute.Sitemap = STATIC_PATHS.map(({ path, priority, changeFrequency }) => ({
    url: `${base}${path}`,
    lastModified: now,
    changeFrequency,
    priority,
  }));

  let tourEntries: MetadataRoute.Sitemap = [];
  try {
    const tours = await prisma.tour.findMany({
      where: { isActive: true },
      select: { slug: true, updatedAt: true },
    });
    tourEntries = tours.map((t) => ({
      url: `${base}/tours/${t.slug}`,
      lastModified: t.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    }));
  } catch {
    // Sin DB (build aislado): solo rutas estáticas
  }

  return [...staticEntries, ...tourEntries];
}
