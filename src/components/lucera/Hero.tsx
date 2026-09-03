import { PlayCircle } from "lucide-react";
import HeroSpiral from "./HeroSpiral";
import HeroCarousel from "./HeroCarousel";

export default function Hero({ onReplayVideo }) {
  return (
    <section id="inicio" className="hero">
      <HeroSpiral />

      <div className="hero-title">
        <h1>Ser mamá o papá no viene con un manual</h1>
        <p className="hero-subtitle">
          Orientación pediátrica confiable, cuando más la necesitas.
        </p>
        <p className="hero-safety">
          Lucera orienta. No diagnostica, no receta ni sustituye la consulta
          médica. Ante una emergencia, acude a urgencias o llama al 911.
        </p>
      </div>

      <HeroCarousel />

      {onReplayVideo && (
        <div className="hero-replay">
          <button onClick={onReplayVideo} className="hero-replay__btn">
            <PlayCircle className="w-4 h-4" aria-hidden="true" />
            Ver el video
          </button>
        </div>
      )}
    </section>
  );
}