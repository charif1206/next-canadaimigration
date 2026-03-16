/** @type {import('next').NextConfig} */
const nextConfig = {
  // Required for Docker: produces a self-contained server.js in .next/standalone
  output: 'standalone',

  serverExternalPackages: ['@prisma/client', 'bcrypt', 'nodemailer'],

  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
