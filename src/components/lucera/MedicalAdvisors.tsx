import { useId } from "react";
import { ChevronLeft, ChevronRight, Linkedin } from "lucide-react";
import Reveal from "./Reveal";
import BrandMark, { BRAND_ASSETS } from "./BrandMark";
import { medicalAdvisors } from "@/data/luceraContent";

const ADVISOR_ICON =
  "https://media.base44.com/images/public/6a7903d2ae6b2ce903b46d38/3e4fe717e_lucera-simbolo1.svg";

function AdvisorCard({ advisor }) {
  const pending = advisor.name.includes("____");
  return (
    <article className="lucera-card shrink-0 w-[84vw] sm:w-[300px] overflow-hidden hover:-translate-y-[4px] hover:shadow-[var(--shadow-card-hover)] transition-all duration-500">
      <div className="p-5">
        <div className="flex items-center gap-3">
          <img
            src={ADVISOR_ICON}
            alt=""
            aria-hidden="true"
            draggable={false}
            className="w-12 h-12 shrink-0 object-contain"
          />
          <h3 className="font-display text-lg text-lucera-wine leading-tight">
            {pending ? "Dr. Jorge (pendiente)" : advisor.name}
          </h3>
        </div>
        <p className="mt-1 text-sm text-lucera-wine/60">
          {advisor.specialty ?? "Especialidad pendiente"}
        </p>
        <p className="mt-0.5 text-sm text-lucera-wine/60">
          {advisor.location ?? "Institución pendiente"}
        </p>
        {advisor.profile ? (
          <p className="mt-3 text-sm leading-relaxed text-lucera-wine/70 line-clamp-3">{advisor.profile}</p>
        ) : (
          <p className="mt-3 text-xs text-lucera-wine/40">Perfil pendiente</p>
        )}
        {advisor.link ? (
          <a
            href={advisor.link}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-lucera-orange hover:text-lucera-wine transition-colors"
          >
            <Linkedin className="w-4 h-4" /> Ver perfil
          </a>
        ) : (
          <span className="mt-4 inline-block text-xs text-lucera-wine/40">Link pendiente</span>
        )}
      </div>
    </article>
  );
}

export default function MedicalAdvisors() {
  const listId = useId();
  const scroll = (dir) => {
    const el = document.getElementById(listId);
    if (!el) return;
    el.scrollBy({ left: dir * 340, behavior: "smooth" });
  };

  return (
    <section id="consejo-asesor" className="relative lucera-section overflow-hidden">
      <BrandMark src={BRAND_ASSETS.espiral} className="top-[-60px] right-[-40px] w-[clamp(300px,34vw,520px)]" opacity={0.4} />
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <Reveal className="flex flex-wrap items-end justify-between gap-6">
          <div className="max-w-2xl">
            <p className="text-eyebrow text-lucera-orange mb-4">Consejo Asesor Médico</p>
            <h2 className="font-display text-[var(--text-h2)] leading-tight text-lucera-wine text-balance">
              Conoce al equipo médico asesor de Lucera
            </h2>
            <p className="mt-4 text-[15px] text-lucera-wine/70 max-w-xl">
              Profesionales que respaldan el criterio clínico de Lucera. La información faltante se
              incorporará a medida que se suministre.
            </p>
          </div>
          <div className="flex gap-2">
            <button onClick={() => scroll(-1)} aria-label="Anterior" className="grid place-items-center w-12 h-12 rounded-full bg-white/70 border border-lucera-wine/10 text-lucera-wine hover:bg-white">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button onClick={() => scroll(1)} aria-label="Siguiente" className="grid place-items-center w-12 h-12 rounded-full bg-white/70 border border-lucera-wine/10 text-lucera-wine hover:bg-white">
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </Reveal>

        <div
          id={listId}
          className="mt-10 flex gap-5 overflow-x-auto snap-x snap-mandatory pb-4 -mx-4 px-4 scroll-smooth"
          style={{ scrollbarWidth: "none" }}
        >
          {medicalAdvisors.map((a) => (
            <div key={a.name} className="snap-start">
              <AdvisorCard advisor={a} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}