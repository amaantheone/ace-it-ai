import type { NextConfig } from "next";


module.exports = {
  images: {
    remotePatterns: [new URL('https://lh3.googleusercontent.com/**')],
  },
}

const nextConfig: NextConfig = {
  /* config options here */
};

export default nextConfig;
