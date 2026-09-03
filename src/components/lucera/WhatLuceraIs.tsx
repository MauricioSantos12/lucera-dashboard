import { Check, X } from "lucide-react";
import Reveal from "./Reveal";

const YES = [
"Te orienta sobre qué hacer y con qué urgencia",
"Recuerda a tus hijos y su historia",
"Está disponible 24/7",
"Está construida sobre protocolos pediátricos y supervisada por un Consejo Asesor Clínico de pediatras"];


const NO = [
"No da diagnósticos",
"No receta medicamentos",
"No reemplaza a tu pediatra ni a una sala de urgencias",
"No toma decisiones por ti"];


const CARD_BG_IMG =
"https://media.base44.com/images/public/6a7903d2ae6b2ce903b46d38/835c4a85d_fondo-lucera-luz.jpg";


export default function WhatLuceraIs() {
  return (
    <section id="que-es-lucera" className="relative lucera-section overflow-hidden">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <Reveal className="max-w-2xl">
          <p className="text-eyebrow text-lucera-orange mb-4">Qué es y qué no es Lucera</p>
          <h2 className="font-display text-[var(--text-h2)] leading-tight text-lucera-wine text-balance">Claridad sobre lo que puede y lo que no

          </h2>
        </Reveal>

        <div className="mt-12 grid gap-6 md:grid-cols-2">
          <Reveal className="h-full">
            <article
              className="lucera-card h-full p-7 overflow-hidden"
              style={{ backgroundImage: `url(${CARD_BG_IMG})`, backgroundSize: "cover", backgroundPosition: "center" }}>
              
              <div className="flex items-center gap-3 mb-5">
                <span className="grid place-items-center w-10 h-10 rounded-full bg-lucera-orange/15 text-lucera-orange">
                  <Check className="w-5 h-5" />
                </span>
                <h3 className="font-display text-xl text-lucera-wine">Lucera sí</h3>
              </div>
              <ul className="space-y-3">
                {YES.map((item) =>
                <li key={item} className="flex items-start gap-3 text-[15px] leading-relaxed text-lucera-wine/80">
                    <span className="mt-2 w-1.5 h-1.5 rounded-full shrink-0 bg-lucera-orange" />
                    <span>{item}</span>
                  </li>
                )}
              </ul>
            </article>
          </Reveal>

          <Reveal className="h-full">
            <article
              className="lucera-card h-full p-7 overflow-hidden"
              style={{ backgroundImage: `url(${CARD_BG_IMG})`, backgroundSize: "cover", backgroundPosition: "center" }}>
              
              <div className="flex items-center gap-3 mb-5">
                <span className="grid place-items-center w-10 h-10 rounded-full bg-lucera-wine/10 text-lucera-wine">
                  <X className="w-5 h-5" />
                </span>
                <h3 className="font-display text-xl text-lucera-wine">Lucera no</h3>
              </div>
              <ul className="space-y-3">
                {NO.map((item) =>
                <li key={item} className="flex items-start gap-3 text-[15px] leading-relaxed text-lucera-wine/80">
                    <span className="mt-2 w-1.5 h-1.5 rounded-full shrink-0 bg-lucera-wine/40" />
                    <span>{item}</span>
                  </li>
                )}
              </ul>
            </article>
          </Reveal>
        </div>

        <Reveal>
          <p className="mt-8 text-center text-sm text-lucera-wine/60 max-w-2xl mx-auto">
            Lucera es un servicio de teleorientación en salud, conforme a la normativa panameña.
          </p>
        </Reveal>
      </div>
    </section>);

}