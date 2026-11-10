import { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://upahar-tiffins.com";

  const routes = [
    "",
    "/tiffins",
    "/biryanis",
    "/fast-food",
    "/pickles",
    "/menu",
    "/about",
    "/experience",
    "/gallery",
    "/contact",
    "/orders",
    "/qr",
    "/privacy",
    "/terms",
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: "daily" as const,
    priority: route === "" ? 1 : 0.85,
  }));

  return routes;
}
