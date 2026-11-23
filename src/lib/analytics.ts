import type { BeforeSendEvent } from "@vercel/analytics/next";

export function sanitizePageview(event: BeforeSendEvent): BeforeSendEvent | null {
  // Preset URLs contain user-entered design text. Never send it to analytics.
  try {
    const url = new URL(event.url);
    url.search = "";
    url.hash = "";
    url.username = "";
    url.password = "";
    return { ...event, url: url.href };
  } catch {
    return null;
  }
}
