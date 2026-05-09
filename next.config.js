/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {

    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        pathname: '/**', // Allows all images from Cloudinary
      },
    ],
    domains: ['res.cloudinary.com'],
  },
};

module.exports = nextConfig;
