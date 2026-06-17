/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [{ source: '/', destination: '/bugs', permanent: false }];
  },
};

export default nextConfig;
