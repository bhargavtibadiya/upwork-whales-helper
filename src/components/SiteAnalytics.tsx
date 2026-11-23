"use client";

import { Analytics } from "@vercel/analytics/next";
import { sanitizePageview } from "@/lib/analytics";

export function SiteAnalytics(): React.JSX.Element {
  return <Analytics beforeSend={sanitizePageview} />;
}
