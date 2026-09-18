/** @type {import('next').NextConfig} */
const nextConfig = {
  // Production builds write to their own directory so `npm run build` cannot
  // clobber the chunks a running `npm run dev` is serving. Sharing .next broke
  // the running app with "Cannot read properties of undefined (reading 'call')"
  // and "Cannot find module for page: /_document".
  // Vercel sets NEXT_PRIVATE_STANDALONE / runs its own build, so keep .next
  // there and only split locally.
  distDir: process.env.NODE_ENV === 'production' && !process.env.VERCEL ? '.next-build' : '.next',

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
