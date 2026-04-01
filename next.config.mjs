/** @type {import('next').NextConfig} */
const nextConfig = {
  /**
   * Windows + antivirus often corrupt or partially delete `.next` cache files (ENOENT rename,
   * missing `682.js` chunks). Disabling webpack’s persistent cache in dev avoids stale chunk
   * maps pointing at removed files. Slightly slower cold compiles; stable HMR.
   */
  webpack: (config, { dev }) => {
    if (dev) {
      config.cache = false;
    }
    return config;
  },
};

export default nextConfig;
