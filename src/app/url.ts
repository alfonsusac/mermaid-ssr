export function getDomain() {
  return process.env.VERCEL_URL
    ? "https://mermaid-ssr.vercel.app"
    : "http://localhost:3010"
}