// Configuración base de SEO. El dominio de producción se usa para canonicals,
// Open Graph y sitemap. Si algún día cambia, se ajusta solo aquí.
export const SITE_URL = "https://lucera-ai.com";
export const SITE_NAME = "Lucera";
export const DEFAULT_OG_IMAGE =
  "https://res.cloudinary.com/dj4fryydl/image/upload/v1779755263/Lucera_Dashboard_xrt4bu.png";

// URL absoluta a partir de un path relativo ("/register" -> "https://…/register").
export function absoluteUrl(path = "/"): string {
  if (/^https?:\/\//.test(path)) return path;
  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}
