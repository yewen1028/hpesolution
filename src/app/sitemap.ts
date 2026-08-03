import type { MetadataRoute } from "next";
import { navigation, services } from "@/lib/site";

const BASE = "https://hpe.com.my";

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  return [
    { url: BASE, lastModified, priority: 1 },
    ...navigation.map((item) => ({
      url: `${BASE}${item.href}`,
      lastModified,
      priority: 0.8,
    })),
    ...services.map((service) => ({
      url: `${BASE}/services/${service.slug}`,
      lastModified,
      priority: 0.7,
    })),
  ];
}
