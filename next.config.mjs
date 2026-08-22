import path from "path"
import { fileURLToPath } from "url"

const projectRoot = path.dirname(fileURLToPath(import.meta.url))

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  // Oculta el indicador "N" de Next Dev Tools (abajo a la izquierda).
  // Si hay un error de compile/runtime, Next lo vuelve a mostrar.
  devIndicators: false,
  turbopack: {
    root: projectRoot,
    resolveAlias: {
      jspdf: "./node_modules/jspdf/dist/jspdf.es.min.js",
    },
  },
  outputFileTracingRoot: projectRoot,
  allowedDevOrigins: [
    '192.168.0.3',
    '192.168.1.56',
    '192.168.1.72',
  ],
  typescript: {
    ignoreBuildErrors: true
  },
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'londonmanager.com',
        pathname: '/static/media/**'
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        pathname: '/**'
      }
    ]
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.alias = {
        ...config.resolve.alias,
        jspdf: path.join(projectRoot, "node_modules/jspdf/dist/jspdf.es.min.js"),
      }
    }
    return config
  },
}

export default nextConfig
