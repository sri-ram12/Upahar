import { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://upahar-tiffins.com";

  const routes = [
    "",
    "/menu",
    "/offers",
    "/about",
    "/gallery",
    "/contact",
    "/order-tracking",
    "/privacy",
    "/terms",
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: "daily" as const,
    priority: route === "" ? 1 : 0.8,
  }));

  return routes;
}
