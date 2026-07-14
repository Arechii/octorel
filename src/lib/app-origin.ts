import type { NextRequest } from "next/server";
import { env } from "~/env";

/**
 * The public origin of this deployment, used to build OAuth redirect URLs.
 *
 * Behind a reverse proxy `request.nextUrl` reflects the internal listen
 * address (e.g. http://localhost:3000), so prefer the standard forwarding
 * headers, and allow pinning the origin explicitly via APP_URL for proxies
 * that don't set them.
 */
export const appOrigin = (request: NextRequest): string => {
  if (env.APP_URL) {
    return new URL(env.APP_URL).origin;
  }

  const host =
    request.headers.get("x-forwarded-host") ??
    request.headers.get("host") ??
    request.nextUrl.host;
  const protocol =
    request.headers.get("x-forwarded-proto")?.split(",")[0]?.trim() ??
    request.nextUrl.protocol.replace(":", "");

  return `${protocol}://${host}`;
};
