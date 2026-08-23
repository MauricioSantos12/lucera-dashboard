import { useEffect } from "react";
import { SITE_NAME, DEFAULT_OG_IMAGE, absoluteUrl } from "@/lib/seo";

type Props = {
  /** Título de la pestaña/SERP. Se le añade "· Lucera" salvo isRoot. */
  title: string;
  description: string;
  /** Path relativo, p. ej. "/register". Genera canonical y og:url. */
  path?: string;
  image?: string;
  /** true en páginas privadas (dashboard, login) para no indexarlas. */
  noindex?: boolean;
  /** Marca el título como raíz (no le agrega el sufijo "· Lucera"). */
  isRoot?: boolean;
  /** Uno o varios bloques JSON-LD (datos estructurados). */
  jsonLd?: Record<string, unknown> | Record<string, unknown>[];
};

// Upsert de un <meta> por atributo/clave (name o property).
function upsertMeta(attr: "name" | "property", key: string, content: string) {
  let el = document.head.querySelector<HTMLMetaElement>(
    `meta[${attr}="${key}"]`
  );
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

function upsertCanonical(href: string | null) {
  let el = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
  if (!href) {
    if (el) el.remove();
    return;
  }
  if (!el) {
    el = document.createElement("link");
    el.setAttribute("rel", "canonical");
    document.head.appendChild(el);
  }
  el.setAttribute("href", href);
}

// SEO por página escribiendo el <head> directamente (title, description,
// canonical, Open Graph, Twitter, robots y JSON-LD). Sustituye/actualiza las
// meta base del index.html en cada navegación de cliente. Sin dependencias.
export function Seo({
  title,
  description,
  path = "/",
  image = DEFAULT_OG_IMAGE,
  noindex = false,
  isRoot = false,
  jsonLd,
}: Props) {
  const fullTitle = isRoot ? title : `${title} · ${SITE_NAME}`;
  const url = absoluteUrl(path);
  const blocks = jsonLd ? (Array.isArray(jsonLd) ? jsonLd : [jsonLd]) : [];
  const ldJson = JSON.stringify(blocks);

  useEffect(() => {
    document.title = fullTitle;
    upsertMeta("name", "description", description);
    upsertMeta("name", "robots", noindex ? "noindex, nofollow" : "index, follow");
    upsertCanonical(noindex ? null : url);

    upsertMeta("property", "og:site_name", SITE_NAME);
    upsertMeta("property", "og:type", "website");
    upsertMeta("property", "og:title", fullTitle);
    upsertMeta("property", "og:description", description);
    upsertMeta("property", "og:url", url);
    upsertMeta("property", "og:image", image);
    upsertMeta("property", "og:locale", "es_PA");

    upsertMeta("name", "twitter:card", "summary_large_image");
    upsertMeta("name", "twitter:title", fullTitle);
    upsertMeta("name", "twitter:description", description);
    upsertMeta("name", "twitter:image", image);

    // JSON-LD: quita cualquiera existente (incluye los "horneados" por el
    // prerender) para no duplicar al hidratar, y agrega los de esta página.
    document.head
      .querySelectorAll("script[data-seo-jsonld]")
      .forEach((n) => n.remove());
    const parsed: Record<string, unknown>[] = JSON.parse(ldJson);
    const nodes = parsed.map((block) => {
      const s = document.createElement("script");
      s.type = "application/ld+json";
      s.setAttribute("data-seo-jsonld", "");
      s.textContent = JSON.stringify(block);
      document.head.appendChild(s);
      return s;
    });
    return () => nodes.forEach((n) => n.remove());
  }, [fullTitle, description, url, image, noindex, ldJson]);

  return null;
}
