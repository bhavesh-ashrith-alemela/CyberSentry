import dns from "dns/promises";
import net from "net";

/**
 * Checks if an IPv4 address falls within private, loopback, link-local, or metadata ranges
 */
function isPrivateIPv4(ip: string): boolean {
  const parts = ip.split(".").map(Number);
  if (parts.length !== 4 || parts.some(isNaN)) return true;

  const [a, b] = parts;

  // 0.0.0.0/8 (Current network)
  if (a === 0) return true;

  // 10.0.0.0/8 (Private-Use)
  if (a === 10) return true;

  // 127.0.0.0/8 (Loopback)
  if (a === 127) return true;

  // 169.254.0.0/16 (Link-Local / Cloud Metadata e.g. 169.254.169.254)
  if (a === 169 && b === 254) return true;

  // 172.16.0.0/12 (Private-Use 172.16.0.0 - 172.31.255.255)
  if (a === 172 && b >= 16 && b <= 31) return true;

  // 192.168.0.0/16 (Private-Use)
  if (a === 192 && b === 168) return true;

  // 100.64.0.0/10 (Carrier-Grade NAT)
  if (a === 100 && b >= 64 && b <= 127) return true;

  // 198.18.0.0/15 (Benchmarking)
  if (a === 198 && (b === 18 || b === 19)) return true;

  // 224.0.0.0/4 (Multicast) & 240.0.0.0/4 (Reserved)
  if (a >= 224) return true;

  return false;
}

/**
 * Checks if an IPv6 address is private, loopback, or link-local
 */
function isPrivateIPv6(ip: string): boolean {
  const normalized = ip.toLowerCase();

  // Loopback (::1)
  if (normalized === "::1" || normalized === "0000:0000:0000:0000:0000:0000:0000:0001") return true;

  // Unspecified (::)
  if (normalized === "::" || normalized === "0000:0000:0000:0000:0000:0000:0000:0000") return true;

  // IPv4-mapped IPv6 (e.g. ::ffff:192.168.1.1)
  if (normalized.startsWith("::ffff:")) {
    const ipv4Part = normalized.substring(7);
    if (net.isIPv4(ipv4Part)) {
      return isPrivateIPv4(ipv4Part);
    }
  }

  // Unique Local Address (fc00::/7 -> fc00 to fdff)
  if (normalized.startsWith("fc") || normalized.startsWith("fd")) return true;

  // Link-Local Unicast (fe80::/10 -> fe80 to febf)
  if (normalized.startsWith("fe8") || normalized.startsWith("fe9") || normalized.startsWith("fea") || normalized.startsWith("feb")) {
    return true;
  }

  return false;
}

/**
 * Validates a target URL against SSRF vulnerabilities:
 * - Ensures valid HTTP or HTTPS protocol.
 * - Rejects loopback, internal hosts, and IP addresses.
 * - Performs DNS resolution and verifies resolved IP is public.
 */
export async function validateUrlSafety(
  inputUrl: string,
  options?: { allowLocalhost?: boolean }
): Promise<{
  safe: boolean;
  error?: string;
  normalizedUrl: string;
  hostname: string;
}> {
  let normalized = inputUrl.trim();

  // Default to https if no protocol specified
  if (!/^https?:\/\//i.test(normalized)) {
    normalized = `https://${normalized}`;
  }

  let parsed: URL;
  try {
    parsed = new URL(normalized);
  } catch {
    return { safe: false, error: "Malformed URL provided.", normalizedUrl: normalized, hostname: "" };
  }

  // 1. Protocol check (HTTP/HTTPS only)
  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    return {
      safe: false,
      error: `Invalid protocol "${parsed.protocol}". Only HTTP and HTTPS are permitted.`,
      normalizedUrl: normalized,
      hostname: parsed.hostname,
    };
  }

  const hostname = parsed.hostname.toLowerCase();

  // Allow localhost/127.0.0.1 if explicitly requested (e.g. testing mock fixtures)
  const isLoopback = hostname === "localhost" || hostname === "127.0.0.1" || hostname === "::1";
  if (options?.allowLocalhost && isLoopback) {
    return {
      safe: true,
      normalizedUrl: normalized,
      hostname,
    };
  }

  // 2. Reject obvious localhost and internal strings
  const blockedHostnames = ["localhost", "127.0.0.1", "0.0.0.0", "::1", "metadata.google.internal", "instance-data"];
  if (blockedHostnames.includes(hostname) || hostname.endsWith(".local") || hostname.endsWith(".internal")) {
    return {
      safe: false,
      error: "Access to local and internal hostnames is prohibited.",
      normalizedUrl: normalized,
      hostname,
    };
  }

  // 3. Domain format check
  if (!hostname.includes(".")) {
    return {
      safe: false,
      error: "Target URL must contain a valid domain name with a top-level domain.",
      normalizedUrl: normalized,
      hostname,
    };
  }

  // 4. If hostname is already a raw IP, check immediately
  if (net.isIPv4(hostname)) {
    if (isPrivateIPv4(hostname)) {
      return {
        safe: false,
        error: "Direct access to private and loopback IP addresses is prohibited.",
        normalizedUrl: normalized,
        hostname,
      };
    }
  } else if (net.isIPv6(hostname)) {
    if (isPrivateIPv6(hostname)) {
      return {
        safe: false,
        error: "Direct access to private IPv6 addresses is prohibited.",
        normalizedUrl: normalized,
        hostname,
      };
    }
  } else {
    // 5. DNS Resolution check to prevent DNS rebinding / internal resolution
    try {
      const addresses = await dns.lookup(hostname, { all: true });

      if (!addresses || addresses.length === 0) {
        return {
          safe: false,
          error: "Domain could not be resolved via DNS.",
          normalizedUrl: normalized,
          hostname,
        };
      }

      for (const record of addresses) {
        if (record.family === 4 && isPrivateIPv4(record.address)) {
          return {
            safe: false,
            error: `Domain resolved to restricted internal IP (${record.address}). Access denied.`,
            normalizedUrl: normalized,
            hostname,
          };
        }
        if (record.family === 6 && isPrivateIPv6(record.address)) {
          return {
            safe: false,
            error: `Domain resolved to restricted IPv6 address (${record.address}). Access denied.`,
            normalizedUrl: normalized,
            hostname,
          };
        }
      }
    } catch (dnsErr: any) {
      return {
        safe: false,
        error: `DNS lookup failed for "${hostname}": ${dnsErr.message}`,
        normalizedUrl: normalized,
        hostname,
      };
    }
  }

  return {
    safe: true,
    normalizedUrl: parsed.toString(),
    hostname,
  };
}
