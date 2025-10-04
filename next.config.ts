import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  reactStrictMode: true,
  swcMinify: true,
  // Configure for GitHub Pages
  basePath: '/disasterReport',
  assetPrefix: '/disasterReport/',
  // Enable static export
  output: 'export',
  // Allow images from Cloudinary
  images: {
    domains: ['res.cloudinary.com'],
    unoptimized: true, // Required for static export
  },
};

export default nextConfig;