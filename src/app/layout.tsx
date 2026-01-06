import type { Metadata } from "next";
import { Work_Sans, Roboto } from "next/font/google";
import { ConditionalLayout } from "@/components/layout/ConditionalLayout";
import { ErrorBoundaryClient } from "@/components/common/ErrorBoundary/ErrorBoundaryClient";
import { Providers } from "@/components/providers/Providers";
import { CookieBanner } from "@/components/common/CookieBanner/CookieBanner";
import "@/styles/globals.scss";

const workSans = Work_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
  variable: "--font-roboto",
});

const roboto = Roboto({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  display: "swap",
  variable: "--font-roboto",
});

export const metadata: Metadata = {
  title: {
    default: "Antartur - Experiencia & Aventura en Tierra del Fuego",
    template: "%s | Antartur",
  },
  description: "Descubrí las mejores excursiones y aventuras en Ushuaia, Tierra del Fuego. Excursiones de invierno y verano, viajes a la Antártida y turismo corporativo.",
  keywords: ["Ushuaia", "Tierra del Fuego", "Antártida", "excursiones", "turismo", "aventura"],
  authors: [{ name: "Antartur" }],
  creator: "Antartur",
  openGraph: {
    type: "website",
    locale: "es_AR",
    url: "https://antartur.com",
    siteName: "Antartur",
    title: "Antartur - Experiencia & Aventura en Tierra del Fuego",
    description: "Descubrí las mejores excursiones y aventuras en Ushuaia, Tierra del Fuego.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Antartur - Experiencia & Aventura",
    description: "Descubrí las mejores excursiones y aventuras en Ushuaia, Tierra del Fuego.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={`${workSans.variable} ${roboto.variable}`}>
      <body>
        <ErrorBoundaryClient>
          <Providers>
            <ConditionalLayout>{children}</ConditionalLayout>
            <CookieBanner />
          </Providers>
        </ErrorBoundaryClient>
      </body>
    </html>
  );
}

