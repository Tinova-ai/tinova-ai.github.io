/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true
  },
  // GitHub Pages configuration
  basePath: process.env.NODE_ENV === 'production' ? '/tinova-web' : '',
  assetPrefix: process.env.NODE_ENV === 'production' ? '/tinova-web/' : '',
}

module.exports = nextConfig