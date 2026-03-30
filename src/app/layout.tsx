import type { Metadata } from "next";
import Script from "next/script";
import { Work_Sans, Roboto } from "next/font/google";
import { ConditionalLayout } from "@/components/layout/ConditionalLayout";
import { ErrorBoundaryClient } from "@/components/common/ErrorBoundary/ErrorBoundaryClient";
import { Providers } from "@/components/providers/Providers";
import { CookieBanner } from "@/components/common/CookieBanner/CookieBanner";
import { getEffectiveGtmId } from "@/lib/analytics/config";
import { getSiteSettings } from "@/modules/settings/repository";
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

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const siteSettings = await getSiteSettings();
  const gtmId = await getEffectiveGtmId(siteSettings);

  return (
    <html lang="es" className={`${workSans.variable} ${roboto.variable}`}>
      <head>
        {gtmId && (
          <Script id="gtm-base" strategy="afterInteractive">
            {`
              (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
              new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
              j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
              'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
              })(window,document,'script','dataLayer','${gtmId}');
            `}
          </Script>
        )}
      </head>
      <body>
        {gtmId && (
          <noscript>
            <iframe
              src={`https://www.googletagmanager.com/ns.html?id=${gtmId}`}
              height="0"
              width="0"
              style={{ display: "none", visibility: "hidden" }}
            />
          </noscript>
        )}
        <ErrorBoundaryClient>
          <Providers>
            <ConditionalLayout siteSettings={siteSettings}>{children}</ConditionalLayout>
            <CookieBanner />
          </Providers>
        </ErrorBoundaryClient>
      </body>
    </html>
  );
}

