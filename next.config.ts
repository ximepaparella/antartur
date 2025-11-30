import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Docker standalone output
  output: 'standalone',
  
  // Optimización de imágenes
  images: {
    formats: ["image/avif", "image/webp"],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60,
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    remotePatterns: [
      {
        protocol: "https",
        hostname: "www.afip.gob.ar",
        pathname: "/images/**",
      },
    ],
  },

  // Compresión
  compress: true,

  // Headers de seguridad
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "X-DNS-Prefetch-Control",
            value: "on",
          },
          {
            key: "X-Frame-Options",
            value: "SAMEORIGIN",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Referrer-Policy",
            value: "origin-when-cross-origin",
          },
        ],
      },
    ];
  },

  // Optimizaciones de producción
  poweredByHeader: false,
  reactStrictMode: true,

  // Módulos que deben ser externos en el servidor (no empaquetados)
  // PayPal SDK es CommonJS y debe ser externo para evitar problemas de resolución
  serverExternalPackages: ["@paypal/checkout-server-sdk"],

  // Configuración de webpack para módulos CommonJS
  webpack: (config, { isServer }) => {
    if (isServer) {
      // Asegurar que los módulos CommonJS se resuelvan correctamente en el servidor
      config.externals = config.externals || [];
      // No empaquetar PayPal SDK, usarlo como externo
      if (Array.isArray(config.externals)) {
        config.externals.push("@paypal/checkout-server-sdk");
      } else if (typeof config.externals === "object") {
        config.externals["@paypal/checkout-server-sdk"] = "@paypal/checkout-server-sdk";
      }
    }
    return config;
  },
};

export default nextConfig;

