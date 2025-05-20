/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: ['puppeteer-core', '@sparticuz/chromium'],
  webpack: (
    config,
  ) => {
    // Important: return the modified config
    config.module.rules.push({
      test: /\.html$/i,
      use: 'raw-loader',
    })
    return config
  }
}

export default nextConfig;
