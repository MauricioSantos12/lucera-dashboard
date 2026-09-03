import { MessageCircle, ArrowRight, LogIn } from "lucide-react";
import { Link } from "react-router-dom";
import Reveal from "./Reveal";
import { whatsappUrl } from "@/lib/whatsapp";

const WHATSAPP_URL = whatsappUrl(
  "Hola, estoy interesado en Lucera y quiero saber más."
);

export default function FinalCTA() {
  return (
    <section className="relative lucera-section overflow-hidden">
      <div className="absolute inset-0 bg-lucera-wine" aria-hidden="true" />

      {/* A short light that strolls across the section */}
      <div className="pointer-events-none absolute top-12 w-3 h-3 rounded-full bg-lucera-yellow blur-[1.5px] animate-firefly-travel" aria-hidden="true" />

      {/* Two soft firefly dots drifting slowly */}
      <div className="pointer-events-none absolute bottom-1/3 left-[28%] w-2 h-2 rounded-full bg-lucera-yellow/80 blur-[1.5px] animate-firefly-slow" aria-hidden="true" />
      <div className="pointer-events-none absolute top-1/2 right-[26%] w-1.5 h-1.5 rounded-full bg-lucera-orange/80 blur-[1.5px] animate-firefly-slow" style={{ animationDelay: "3.5s" }} aria-hidden="true" />

      <div className="relative mx-auto max-w-3xl px-4 sm:px-6 text-center">
        <Reveal>
          <h2 className="font-display text-[var(--text-h2)] leading-tight text-lucera-cream text-balance">
            No tienes que saberlo todo. Lucera te acompaña.
          </h2>
          <p className="mt-5 text-lg text-lucera-cream/80 max-w-xl mx-auto">
            Encuentra orientación clara, humana y confiable cuando surjan dudas sobre la salud de tus
            hijos.
          </p>

          <div className="mt-9 flex flex-wrap justify-center gap-3">
            <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer" className="lucera-btn-pill inline-flex items-center gap-2 px-6 py-3.5 bg-lucera-orange text-white animate-lucera-pulse">
              <MessageCircle className="w-5 h-5" /> Hablar con Lucera
            </a>
            <a href="#suscripcion" className="lucera-btn-pill inline-flex items-center gap-2 px-6 py-3.5 bg-white/10 text-lucera-cream border border-lucera-cream/20 hover:bg-white/20">
              Conocer las suscripciones <ArrowRight className="w-4 h-4" />
            </a>
            <Link to="/dashboard" className="lucera-btn-pill inline-flex items-center gap-2 px-6 py-3.5 bg-transparent text-lucera-cream/80 hover:bg-white/10">
              <LogIn className="w-5 h-5" /> Ingresar al portal
            </Link>
          </div>
        </Reveal>
      </div>
    </section>
  );
}