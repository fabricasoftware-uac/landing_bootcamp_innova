import type { NextConfig } from "next";

const ORIGEN_SUPABASE_POR_DEFECTO = "https://*.supabase.co";

function origenSupabase(): string {
  try {
    return new URL(process.env.NEXT_PUBLIC_SUPABASE_URL ?? "").origin;
  } catch {
    return ORIGEN_SUPABASE_POR_DEFECTO;
  }
}

/**
 * 'unsafe-inline' en script-src es deliberado. /, /postulacion y las páginas legales
 * son estáticas: un nonce exigiría renderizarlas en cada petición, y los hashes no
 * cubren los scripts de datos que Next emite por página y por build. El coste es
 * real: esta CSP no frena un script en línea inyectado, solo los externos, eval y la
 * salida de datos a otros orígenes. Decisión completa en docs/seguridad.md.
 */
function construirCsp(esProduccion: boolean): string {
  const directivas = [
    "default-src 'self'",
    `script-src 'self' 'unsafe-inline'${esProduccion ? "" : " 'unsafe-eval'"}`,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob:",
    "font-src 'self'",
    "media-src 'self'",
    `connect-src 'self' ${origenSupabase()}${
      esProduccion ? "" : " ws://127.0.0.1:* ws://localhost:*"
    }`,
    "worker-src 'self' blob:",
    "frame-src 'none'",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
  ];

  if (esProduccion) directivas.push("upgrade-insecure-requests");

  return directivas.join("; ");
}

function construirCabeceras() {
  const esProduccion = process.env.NODE_ENV === "production";

  return [
    { key: "Content-Security-Policy", value: construirCsp(esProduccion) },
    ...(esProduccion
      ? [
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains",
          },
        ]
      : []),
    { key: "X-Content-Type-Options", value: "nosniff" },
    { key: "X-Frame-Options", value: "DENY" },
    { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
    {
      key: "Permissions-Policy",
      value: "camera=(), microphone=(), geolocation=(), payment=()",
    },
    { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
    { key: "X-DNS-Prefetch-Control", value: "on" },
  ];
}

const config: NextConfig = {
  poweredByHeader: false,
  images: { qualities: [75] },
  experimental: {
    // El formulario frena el envío en 4,4 MB; el servidor deja un margen sobre esa cifra.
    serverActions: {
      bodySizeLimit: "10mb",
      allowedOrigins: [
        "caucainnova.uniautonoma.edu.co",
        "*.uniautonoma.edu.co",
      ],
    },
  },
  async headers() {
    return [{ source: "/:path*", headers: construirCabeceras() }];
  },
};

export default config;
