import type { Metadata } from "next";
import "@fontsource-variable/manrope";
import "./globals.css";
export const metadata: Metadata = {
  title: "Cauca INNOVA · Bootcamp de Semilleros de Investigación",
  description:
    "14 de noviembre de 2026. Jornada presencial intensiva para semilleros del Cauca: siete equipos de tres estudiantes (21 participantes). Conoce requisitos y términos.",
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
