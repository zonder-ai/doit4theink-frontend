/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['fmkzfzlujrmwipkoubmm.supabase.co'],
    unoptimized: process.env.NODE_ENV === 'production',
  },
  output: 'standalone',
  // Add any other configurations here
}

module.exports = nextConfig