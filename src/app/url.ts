export function getDomain() {
  return process.env.VERCEL_URL
    ? "https://" + process.env.VERCEL_URL
    : "http://localhost:3010"
}