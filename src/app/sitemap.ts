import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/seo";

export default function sitemap(): MetadataRoute.Sitemap {
  // Editor modes are fragments and presets are design state, not separate pages.
  return [{ url: siteUrl }];
}
