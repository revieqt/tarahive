export function maskIP(ip?: string): string | undefined {
  if (!ip) return undefined;

  // IPv4 masking
  if (ip.includes(".")) {
    const parts = ip.split(".");
    return `${parts[0]}.${parts[1]}.xxx.xxx`;
  }

  // IPv6 (simple fallback)
  return ip.substring(0, 6) + "::xxxx";
}