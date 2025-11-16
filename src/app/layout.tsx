import type { Metadata } from "next";
import { Work_Sans, Roboto } from "next/font/google";
import { Header } from "@/modules/layout/components/Header/Header";
import { Footer } from "@/modules/layout/components/Footer/Footer";
import "@/styles/globals.scss";

const workSans = Work_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
  variable: "--font-work-sans",
});

const roboto = Roboto({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  display: "swap",
  variable: "--font-roboto",
});

export const metadata: Metadata = {
  title: "Antartur",
  description: "Sitio web de Antartur",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={`${workSans.variable} ${roboto.variable}`}>
      <body>
        <Header />
        {children}
        <Footer />
      </body>
    </html>
  );
}

