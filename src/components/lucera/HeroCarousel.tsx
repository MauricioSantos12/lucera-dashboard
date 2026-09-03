import { useEffect, useRef, useState } from "react";
import { ArrowUpRight } from "lucide-react";
import { Image } from "@/components/ui/image";
import { heroCarouselPhotos } from "@/data/luceraContent";

export default function HeroCarousel() {
  const trackRef = useRef(null);
  const [active, setActive] = useState(0);
  const drag = useRef({ down: false, startX: 0, startLeft: 0, moved: false });

  const onPointerDown = (e) => {
    const track = trackRef.current;
    if (!track) return;
    e.preventDefault();
    track.setPointerCapture?.(e.pointerId);
    drag.current = { down: true, startX: e.clientX, startLeft: track.scrollLeft, moved: false };
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
  const preventClickAfterDrag = (e) => {
    if (drag.current.moved) {
      e.preventDefault();
      e.stopPropagation();
    }
  };

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const cards = track.querySelectorAll(".hero-card");
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
  }, []);

  const goTo = (i) => {
    const card = trackRef.current?.querySelectorAll(".hero-card")[i];
    if (card) card.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
  };

  return (
    <>
      <div
        ref={trackRef}
        className="hero-carousel"
        aria-label="Galería de momentos familiares"
        tabIndex={0}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerLeave={onPointerUp}>
        
        <article className="hero-card hero-card--image" draggable={false}>
          <Image
            src={heroCarouselPhotos[0]}
            alt="Madre riendo con su recién nacido en el sofá"
            className="w-full h-full"
            fittingType="fill"
            draggable={false} />
          
        </article>

        <a href="#portal" className="hero-card hero-card--message" draggable={false} aria-label="Orientación pediátrica confiable" onClick={preventClickAfterDrag}>
          <ArrowUpRight className="hero-card__arrow w-6 h-6" aria-hidden="true" />
          <p>Aquí, la preocupación se transforma en calma</p>
        </a>

        <article className="hero-card hero-card--image" draggable={false}>
          <Image
            src={heroCarouselPhotos[1]}
            alt="Madre levantando a su hijo al aire en un jardín soleado"
            className="w-full h-full"
            fittingType="fill"
            draggable={false} />
          
        </article>
      </div>

      <div className="hero-pagination" role="tablist" aria-label="Navegación del carrusel">
        {[0, 1, 2].map((i) =>
        <button
          key={i}
          role="tab"
          aria-selected={active === i}
          aria-current={active === i ? "true" : undefined}
          aria-label={`Ir al elemento ${i + 1}`}
          onClick={() => goTo(i)} />

        )}
      </div>
    </>);

}