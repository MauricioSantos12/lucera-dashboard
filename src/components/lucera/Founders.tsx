import { Linkedin } from "lucide-react";
import Reveal from "./Reveal";
import { Image } from "@/components/ui/image";
import { founders } from "@/data/luceraContent";

export default function Founders() {
  return (
    <section id="founders" className="relative lucera-section overflow-hidden">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <Reveal className="max-w-2xl">
          <p className="text-eyebrow text-lucera-orange mb-4">Los Fundadores</p>
          <h2 className="font-display text-[var(--text-h2)] leading-tight text-lucera-wine text-balance">
            Las personas detrás de Lucera
          </h2>
        </Reveal>

        <div className="mt-12 grid lg:grid-cols-3 gap-6">
          {founders.map((f) => (
            <Reveal key={f.name} className="h-full">
              <article className="lucera-card h-full overflow-hidden flex flex-col hover:-translate-y-[4px] hover:shadow-[var(--shadow-card-hover)] transition-all duration-500">
                {f.photo && (
                  <div className="relative w-full aspect-[4/5] overflow-hidden">
                    <Image
                      src={f.photo}
                      alt={f.name}
                      fittingType="fill"
                      className="w-full h-full"
                    />
                  </div>
                )}
                <div className="p-7 flex flex-col flex-1">
                  <div>
                    <h3 className="font-display text-lg text-lucera-wine leading-tight">{f.name}</h3>
                    <p className="text-sm text-lucera-wine/60">{f.role}</p>
                  </div>
                  <p className="mt-5 text-[15px] leading-relaxed text-lucera-wine/75 italic">
                  “{f.biography}”
                </p>
                <div className="mt-auto pt-6">
                  {f.linkedinUrl ? (
                    <a
                      href={f.linkedinUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="lucera-btn-pill inline-flex items-center gap-2 px-5 py-2.5 bg-transparent text-lucera-wine text-sm"
                      style={{ border: "1px solid #e0d8d8" }}
                    >
                      <Linkedin className="w-4 h-4" /> LinkedIn
                    </a>
                  ) : (
                    <span
                      className="lucera-btn-pill inline-flex items-center gap-2 px-5 py-2.5 bg-transparent text-lucera-wine/70 text-sm cursor-default"
                      style={{ border: "1px solid #e0d8d8" }}
                    >
                      <Linkedin className="w-4 h-4" /> LinkedIn
                    </span>
                  )}
                </div>
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}