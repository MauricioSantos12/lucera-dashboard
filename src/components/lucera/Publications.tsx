import { useState } from "react";
import Reveal from "./Reveal";
import BrandMark, { BRAND_ASSETS } from "./BrandMark";
import PublicationModal from "./PublicationModal";
import PublicationsCarousel from "./PublicationsCarousel";
import { publications } from "@/data/luceraContent";

export default function Publications() {
  const [author, setAuthor] = useState("Todos");
  const [active, setActive] = useState(null);

  const authorTabs = [
    "Todos",
    ...Array.from(new Set(publications.map((p) => p.author).filter(Boolean))),
  ];

  const groupedByAuthor = authorTabs
    .slice(1)
    .map((a) => publications.filter((p) => p.author === a));

  const interleaved = [];
  let added = true;
  for (let i = 0; added; i++) {
    added = false;
    groupedByAuthor.forEach((list) => {
      if (list[i]) {
        interleaved.push(list[i]);
        added = true;
      }
    });
  }

  const filtered =
    author === "Todos"
      ? interleaved
      : publications.filter((p) => p.author === author);

  return (
    <section id="publicaciones" className="relative lucera-section overflow-hidden">
      <BrandMark src={BRAND_ASSETS.circulo} className="top-[-60px] left-[-50px] w-[clamp(280px,32vw,480px)]" opacity={0.45} />
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <Reveal className="max-w-2xl">
          <p className="text-eyebrow text-lucera-orange mb-4">Nuestras Publicaciones</p>
          <h2 className="font-display text-[var(--text-h2)] leading-tight text-lucera-wine text-balance">
            Ciencia, evidencia e impacto
          </h2>
          <p className="mt-4 text-[15px] text-lucera-wine/70">
            Nuestro trabajo se adhiere a los más altos estándares de ciencia, evidencia e impacto.
          </p>
        </Reveal>

        {/* Filtro por autor */}
        {authorTabs.length > 2 && (
          <Reveal className="mt-8 flex flex-wrap gap-2" role="tablist" aria-label="Filtrar por autor">
            {authorTabs.map((tab) => {
              const isActive = author === tab;
              return (
                <button
                  key={tab}
                  role="tab"
                  aria-selected={isActive}
                  onClick={() => setAuthor(tab)}
                  className={`lucera-pill px-5 py-2.5 text-sm font-medium transition-colors min-h-[44px] ${
                    isActive
                      ? "bg-lucera-wine text-lucera-cream"
                      : "bg-white/70 text-lucera-wine/70 hover:bg-white border border-lucera-wine/10"
                  }`}
                >
                  {tab}
                </button>
              );
            })}
          </Reveal>
        )}

        <div className="mt-10">
          <PublicationsCarousel items={filtered} onOpen={setActive} />
        </div>
      </div>

      <PublicationModal publication={active} onClose={() => setActive(null)} />
    </section>
  );
}