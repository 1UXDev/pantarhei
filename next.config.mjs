/** @type {import('next').NextConfig} */

// include bilder.deutschlandfunk.de in the list of allowed domains
const nextConfig = {
  images: {
    domains: ["bilder.deutschlandfunk.de"],
  },
};

export default nextConfig;
