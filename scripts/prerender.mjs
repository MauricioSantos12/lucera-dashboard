// Prerender de las páginas públicas. Tras `vite build`, levanta un server
// estático del `dist` (con fallback SPA), carga cada ruta con Chromium headless
// (Puppeteer) y guarda el HTML ya renderizado — con su <head> de SEO y su
// JSON-LD — para que los crawlers que no ejecutan JS (Bing, scrapers sociales)
// vean el contenido completo. Google ya renderiza JS, pero esto lo cubre todo.
import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import puppeteer from "puppeteer";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DIST = path.resolve(__dirname, "..", "dist");
const PORT = 4319;
const SITE_URL = "https://lucera-ai.com";
// Rutas base. Los artículos del blog se descubren solos crawleando /blog.
const ROUTES = ["/", "/register", "/faq", "/blog"];

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript",
  ".css": "text/css",
  ".json": "application/json",
  ".svg": "image/svg+xml",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".ico": "image/x-icon",
  ".woff2": "font/woff2",
  ".txt": "text/plain",
  ".xml": "application/xml",
};

// Server estático con fallback a index.html (comportamiento SPA).
function serveDist() {
  return http.createServer((req, res) => {
    const urlPath = decodeURIComponent(req.url.split("?")[0]);
    let filePath = path.join(DIST, urlPath);
    if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
      const asIndex = path.join(filePath, "index.html");
      filePath = fs.existsSync(asIndex)
        ? asIndex
        : path.join(DIST, "index.html"); // fallback SPA
    }
    const ext = path.extname(filePath).toLowerCase();
    res.writeHead(200, { "Content-Type": MIME[ext] || "application/octet-stream" });
    fs.createReadStream(filePath).pipe(res);
  });
}

async function run() {
  if (!fs.existsSync(path.join(DIST, "index.html"))) {
    console.error("[prerender] No existe dist/index.html. Corre `vite build` antes.");
    process.exit(1);
  }

  const server = serveDist();
  await new Promise((r) => server.listen(PORT, r));

  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  // Cola de rutas a renderizar; puede crecer al descubrir artículos en /blog.
  const queue = [...ROUTES];
  const seen = new Set(queue);
  const rendered = [];

  try {
    while (queue.length) {
      const route = queue.shift();
      const page = await browser.newPage();
      await page.goto(`http://localhost:${PORT}${route}`, {
        waitUntil: "networkidle2",
        timeout: 30000,
      });
      // Asegura que React montó el contenido y que el SEO escribió el <head>.
      await page.waitForSelector("h1, h2", { timeout: 15000 });

      // En el índice del blog, descubre los artículos y encólalos.
      if (route === "/blog") {
        const links = await page.$$eval('a[href^="/blog/"]', (els) =>
          els.map((e) => new URL(e.href).pathname)
        );
        for (const link of links) {
          if (!seen.has(link)) {
            seen.add(link);
            queue.push(link);
          }
        }
      }
      await page
        .waitForFunction(() => !!document.querySelector('link[rel="canonical"]'), {
          timeout: 8000,
        })
        .catch(() => {});

      // Materializa el CSS de Emotion (Chakra) en un <style>. En producción
      // Emotion inserta reglas vía insertRule (CSSOM), así que los <style> que
      // captura Puppeteer salen vacíos → FOUC (el logo se ve gigante y luego se
      // acomoda). Recogemos las reglas reales de las hojas inyectadas por JS y
      // las volcamos como texto para que el primer render ya venga con estilos.
      await page.evaluate(() => {
        let css = "";
        for (const sheet of document.styleSheets) {
          const node = sheet.ownerNode;
          if (node && node.tagName === "STYLE") {
            try {
              for (const rule of sheet.cssRules) css += rule.cssText;
            } catch {
              /* hoja inaccesible (cross-origin): se ignora */
            }
          }
        }
        if (css) {
          const style = document.createElement("style");
          style.setAttribute("data-prerender-css", "");
          style.textContent = css;
          document.head.appendChild(style);
        }
      });

      const html = "<!doctype html>\n" + (await page.content());

      const outDir =
        route === "/" ? DIST : path.join(DIST, route.replace(/^\//, ""));
      fs.mkdirSync(outDir, { recursive: true });
      const outFile = path.join(outDir, "index.html");
      fs.writeFileSync(outFile, html, "utf-8");
      console.log(`[prerender] ${route} -> ${path.relative(DIST, outFile)}`);
      rendered.push(route);
      await page.close();
    }

    // Genera el sitemap con todas las rutas públicas renderizadas (incluye los
    // artículos descubiertos), para no mantener listas a mano.
    writeSitemap(rendered);
  } finally {
    await browser.close();
    server.close();
  }
}

// Escribe dist/sitemap.xml a partir de las rutas renderizadas.
function writeSitemap(routes) {
  const priority = (r) => (r === "/" ? "1.0" : r.startsWith("/blog/") ? "0.7" : "0.8");
  const urls = routes
    .map(
      (r) =>
        `  <url>\n    <loc>${SITE_URL}${r === "/" ? "/" : r}</loc>\n    <changefreq>weekly</changefreq>\n    <priority>${priority(r)}</priority>\n  </url>`
    )
    .join("\n");
  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;
  fs.writeFileSync(path.join(DIST, "sitemap.xml"), xml, "utf-8");
  console.log(`[prerender] sitemap.xml -> ${routes.length} URLs`);
}

run().catch((e) => {
  console.error("[prerender] Falló:", e);
  process.exit(1);
});
