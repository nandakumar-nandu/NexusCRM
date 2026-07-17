import withPWAInit from 'next-pwa';

// Comment explaining next-pwa options:
// 1. dest: Specifies the output destination folder ('public') for generating the service worker (sw.js).
// 2. disable: Deactivates service worker caching in development mode to prevent local cache collision.
// 3. register: Directs the build tool to automatically inject service worker registration scripts in the runtime.
// 4. skipWaiting: Directs the active service worker to immediately terminate when updates are available.
const withPWA = withPWAInit({
  dest: 'public',
  disable: process.env.NODE_ENV === 'development',
  register: true,
  skipWaiting: true,
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
};

export default withPWA(nextConfig);
