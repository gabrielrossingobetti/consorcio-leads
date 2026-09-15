import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: "/photo-1533473359331-0135ef1b58bf",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: "/photo-1600585154340-be6161a56a0c",
      },
    ],
  },
  async redirects() {
    // As páginas de veículo e imóvel agora são destinos próprios.
    return [{ source: "/obrigado", destination: "/", permanent: true }];
  },
};

export default nextConfig;
