import type { Metadata } from "next";
import "@fontsource-variable/manrope";
import "./globals.css";
export const metadata: Metadata = {
  title: "Cauca INNOVA · Festival de Semilleros de Investigación",
  description:
    "13 y 14 de noviembre de 2026. Dos jornadas presenciales para semilleros del Cauca: siete equipos de tres estudiantes. Conoce requisitos y términos.",
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
