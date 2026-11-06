import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { AvisoCookies } from "@/components/legal/aviso-cookies";
import "./globals.css";

const museo = localFont({
  src: [
    { path: "./fuentes/museo-300.woff", weight: "300", style: "normal" },
    { path: "./fuentes/museo-500.woff", weight: "500", style: "normal" },
    { path: "./fuentes/museo-700.woff", weight: "700", style: "normal" },
    { path: "./fuentes/museo-900.woff", weight: "900", style: "normal" },
  ],
  variable: "--fuente-museo",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Bootcamp Cauca INNOVA · Del conocimiento al prototipo",
  description:
    "14 de noviembre de 2026. Jornada presencial de prototipado para semilleros de colegios y universidades del Cauca: seis equipos de tres estudiantes.",
};

export const viewport: Viewport = { themeColor: "#0f3550" };

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es" className={museo.variable} suppressHydrationWarning>
      <body>
        {children}
        <AvisoCookies />
      </body>
    </html>
  );
}
