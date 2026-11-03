import type { Metadata } from "next";
import "@fontsource-variable/manrope";
import "./globals.css";
export const metadata: Metadata = {
  title: "Cauca INNOVA · Bootcamp de Semilleros de Investigación",
  description:
    "15 de noviembre de 2026. Jornada presencial intensiva para semilleros del Cauca: seis equipos de tres estudiantes. Conoce requisitos y términos.",
};
export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
