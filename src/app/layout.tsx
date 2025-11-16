import type { Metadata } from "next";
import { Work_Sans } from "next/font/google";
import "@/styles/globals.scss";

const workSans = Work_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
  variable: "--font-work-sans",
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
    <html lang="es" className={workSans.variable}>
      <body>{children}</body>
    </html>
  );
}

