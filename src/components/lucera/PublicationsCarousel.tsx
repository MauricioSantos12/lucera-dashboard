import { useEffect, useRef, useState } from "react";
import { ArrowUpRight, Download, FileText } from "lucide-react";

const CARD_BG_IMG =
  "https://media.base44.com/images/public/6a7903d2ae6b2ce903b46d38/835c4a85d_fondo-lucera-luz.jpg";

// Carrusel horizontal arrastrable con peek de la tarjeta siguiente y puntos
// de navegación debajo. Recibe la lista filtrada y un callback al abrir el modal.
export default function PublicationsCarousel({ items, onOpen }) {
  const trackRef = useRef(null);
  const [active, setActive] = useState(0);
  const drag = useRef({ down: false, startX: 0, startLeft: 0, moved: false });

  const onPointerDown = (e) => {
    const track = trackRef.current;
    if (!track) return;
    drag.current = {
      down: true,
      startX: e.clientX,
      startLeft: track.scrollLeft,
      moved: false,
    };
  };
  const onPointerMove = (e) => {
    if (!drag.current.down) return;
    const track = trackRef.current;
    if (!track) return;
    const dx = e.clientX - drag.current.startX;
    if (Math.abs(dx) > 4) drag.current.moved = true;
    track.scrollLeft = drag.current.startLeft - dx;
  };
  const onPointerUp = () => {
    drag.current.down = false;
  };

  const openCard = (e, pub) => {
    if (drag.current.moved) {
      e.preventDefault();
      return;
    }
    onOpen(pub);
  };

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const cards = track.querySelectorAll(".pub-card");
        if (!cards.length) return;
        const center = track.getBoundingClientRect().left + track.clientWidth / 2;
        let best = 0;
        let bestDist = Infinity;
        cards.forEach((card, i) => {
          const c = card.getBoundingClientRect();
          const dist = Math.abs(c.left + c.width / 2 - center);
          if (dist < bestDist) {
            bestDist = dist;
            best = i;
          }
        });
        setActive(best);
      });
    };
    track.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      track.removeEventListener("scroll", onScroll);
    };
  }, [items]);

  const goTo = (i) => {
    const card = trackRef.current?.querySelectorAll(".pub-card")[i];
    if (card) card.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
  };

  if (!items.length) {
    return (
      <p className="text-sm text-lucera-wine/55 py-8 text-center">
        No hay publicaciones en este filtro todavía.
      </p>
    );
  }

  return (
    <div>
      <div
        ref={trackRef}
        className="pub-carousel"
        aria-label="Carrusel de publicaciones"
        tabIndex={0}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerLeave={onPointerUp}
      >
        {items.map((pub) => (
          <article key={pub.id ?? pub.title} className="pub-card" draggable={false}>
            <div
              className="lucera-card h-full w-full p-6 flex flex-col overflow-hidden hover:-translate-y-[4px] hover:shadow-[var(--shadow-card-hover)] transition-all duration-500"
              style={{
                backgroundImage: `url(${CARD_BG_IMG})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
            >
              <span className="inline-flex items-center gap-1.5 text-eyebrow text-lucera-orange">
                <FileText className="w-3.5 h-3.5" /> {pub.category}
              </span>
              <h3 className="mt-3 font-display text-[var(--text-card-title)] text-lucera-wine leading-snug">
                {pub.title}
              </h3>
              <div className="mt-3 text-sm text-lucera-wine/55 space-y-0.5">
                <p>{pub.author ?? "Autor pendiente"}</p>
                <p>{pub.publicationDate ?? "Fecha pendiente"}</p>
              </div>
              <p className="mt-3 text-sm leading-relaxed text-lucera-wine/70 line-clamp-4">
                {pub.summary ??
                  "Resumen pendiente. Se incorporará al recibir el contenido editorial definitivo."}
              </p>
              <div className="mt-auto pt-5 flex flex-wrap gap-2">
                <button
                  onClick={(e) => openCard(e, pub)}
                  className="lucera-btn-pill inline-flex items-center gap-1.5 px-4 py-2.5 bg-white/70 border border-lucera-wine/10 text-lucera-wine text-sm hover:bg-white"
                >
                  <ArrowUpRight className="w-4 h-4" /> Ver resumen
                </button>
                {pub.downloadUrl ? (
                  <a
                    href={pub.downloadUrl}
                    download
                    className="lucera-btn-pill inline-flex items-center gap-1.5 px-4 py-2.5 bg-lucera-wine text-lucera-cream text-sm"
                  >
                    <Download className="w-4 h-4" /> Descargar
                  </a>
                ) : null}
              </div>
            </div>
          </article>
        ))}
      </div>

      <div className="hero-pagination" role="tablist" aria-label="Navegación del carrusel de publicaciones">
        {items.map((_, i) => (
          <button
            key={i}
            role="tab"
            aria-selected={active === i}
            aria-current={active === i ? "true" : undefined}
            aria-label={`Ir a la publicación ${i + 1}`}
            onClick={() => goTo(i)}
          />
        ))}
      </div>
    </div>
  );
}