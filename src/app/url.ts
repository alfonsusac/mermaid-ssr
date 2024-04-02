export function getDomain() {
  return process.env.NEXT_PUBLIC_DOMAIN	
    ? process.env.NEXT_PUBLIC_DOMAIN
    : "http://localhost:3010"
}