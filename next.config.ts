import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  output: 'standalone', // For better Amplify compatibility
  experimental: {
    serverComponentsExternalPackages: ['aws-amplify'], // For Amplify compatibility
  },
};

export default nextConfig;
