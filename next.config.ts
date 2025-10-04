import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  reactStrictMode: true,
  swcMinify: true,
  // Allow images from Cloudinary
  images: {
    domains: ['res.cloudinary.com'],
  },
};

export default nextConfig;