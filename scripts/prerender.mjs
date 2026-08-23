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
const ROUTES = ["/", "/register"];

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

  try {
    for (const route of ROUTES) {
      const page = await browser.newPage();
      await page.goto(`http://localhost:${PORT}${route}`, {
        waitUntil: "networkidle2",
        timeout: 30000,
      });
      // Asegura que React montó el contenido y que el SEO escribió el <head>.
      await page.waitForSelector("h1, h2", { timeout: 15000 });
      await page
        .waitForFunction(() => !!document.querySelector('link[rel="canonical"]'), {
          timeout: 8000,
        })
        .catch(() => {});

      const html = "<!doctype html>\n" + (await page.content());

      const outDir =
        route === "/" ? DIST : path.join(DIST, route.replace(/^\//, ""));
      fs.mkdirSync(outDir, { recursive: true });
      const outFile = path.join(outDir, "index.html");
      fs.writeFileSync(outFile, html, "utf-8");
      console.log(`[prerender] ${route} -> ${path.relative(DIST, outFile)}`);
      await page.close();
    }
  } finally {
    await browser.close();
    server.close();
  }
}

run().catch((e) => {
  console.error("[prerender] Falló:", e);
  process.exit(1);
});
