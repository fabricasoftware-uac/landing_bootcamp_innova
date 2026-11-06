import type { NextConfig } from "next";

const config: NextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: "10mb",
      allowedOrigins: ["caucainnova.uniautonoma.edu.co", "*.uniautonoma.edu.co"],
    },
  },
};

export default config;

