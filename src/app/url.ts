export function getDomain() {
  return process.env.NEXT_PUBLIC_VERCEL_URL	
    ? "https://mermaid-ssr.vercel.app"
    : "http://localhost:3010"
}