import Reveal from "./Reveal";

const TOPICS = [
"Fiebre",
"Vómitos y diarrea",
"Tos y dificultad para respirar",
"Golpes y caídas",
"Brotes en la piel",
"Sueño y alimentación",
"Dudas sobre el esquema de vacunas",
"Ese «no sé qué tiene, pero algo no está bien»"];


export default function WhatYouCanAsk() {
  return (
    <section id="que-consultar" className="relative lucera-section overflow-hidden">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <Reveal className="max-w-2xl">
          <p className="text-eyebrow text-lucera-orange mb-4">Qué puedes consultarle</p>
          <h2 className="font-display text-[var(--text-h2)] leading-tight text-lucera-wine text-balance">
            Las dudas de siempre, a la hora que sea
          </h2>
        </Reveal>

        <Reveal className="mt-10 flex flex-wrap gap-3">
          {TOPICS.map((topic) =>
          <span
            key={topic}
            className="lucera-pill px-5 py-3 text-sm font-medium text-lucera-wine bg-white/75 border border-lucera-wine/10">
            
              {topic}
            </span>
          )}
        </Reveal>
      </div>
    </section>);

}