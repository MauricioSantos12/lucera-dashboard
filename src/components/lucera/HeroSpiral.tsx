// Decorative brand marks for the hero. Uses the official Lucera graphic
// assets exactly as provided (Círculo, Espiral). A luminance mask removes
// the black backdrop (black → transparent) over the cream hero while
// keeping the true gradient colors intact — no recoloring, no color loss.
import { maskStyle } from "./BrandMark";

const ESPIRAL =
  "https://media.base44.com/images/public/6a7903d2ae6b2ce903b46d38/c6a01554a_espiral-lucera.png";
const CIRCULO =
  "https://media.base44.com/images/public/6a7903d2ae6b2ce903b46d38/e61ccae97_Circulo-2.png";

export default function HeroSpiral() {
  return (
    <>
      {/* Espiral — large, top-right */}
      <img
        src={ESPIRAL}
        alt=""
        aria-hidden="true"
        className="hero-spiral"
        style={{ ...maskStyle(ESPIRAL), opacity: 0.95 }}
      />
      {/* Círculo — medium, bottom-left */}
      <img
        src={CIRCULO}
        alt=""
        aria-hidden="true"
        className="hero-spiral hero-spiral--secondary"
        style={{ ...maskStyle(CIRCULO), opacity: 0.85 }}
      />
    </>
  );
}