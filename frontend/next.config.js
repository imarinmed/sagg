/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    reactCompiler: false,
  },
  images: {
    unoptimized: true,
  },
}

module.exports = nextConfig
