/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    ALCHEMY_API_KEY: process.env.ALCHEMY_API_KEY,
    WALLET_CONNECT_PROJECT_ID: process.env.WALLET_CONNECT_PROJECT_ID,
  },
  images: {
    domains: ['ipfs.io'],
    remotePatterns: [
      {
        hostname: 'ipfs.io',
        protocol: 'https',
      }
    ],
  },
  reactStrictMode: true,
}

module.exports = nextConfig
