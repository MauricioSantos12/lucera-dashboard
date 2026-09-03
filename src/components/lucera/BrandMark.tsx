// Reusable isolated brand mark (Círculo / Espiral). Renders the official
// Lucera graphic asset as-is. A luminance mask removes the black backdrop
// (black → transparent) while keeping the true stroke colors intact over
// the cream background — unlike mix-blend-mode: screen, which washed the
// colors out. Purely decorative.
export const BRAND_ASSETS = {
  espiral:
    "https://media.base44.com/images/public/6a7903d2ae6b2ce903b46d38/f0c135892_Espiral-Lucera-ai.png",
  circulo:
    "https://media.base44.com/images/public/6a7903d2ae6b2ce903b46d38/e61ccae97_Circulo-2.png",
};

// Shared mask style: drops the black background via luminance, preserves color.
export function maskStyle(src) {
  return {
    WebkitMaskImage: `url(${src})`,
    maskImage: `url(${src})`,
    WebkitMaskMode: "luminance",
    maskMode: "luminance",
    WebkitMaskRepeat: "no-repeat",
    maskRepeat: "no-repeat",
    WebkitMaskSize: "contain",
    maskSize: "contain",
    WebkitMaskPosition: "center",
    maskPosition: "center",
  };
}

export default function BrandMark({ src, className = "", opacity = 0.5 }) {
  return (
    <img
      src={src}
      alt=""
      aria-hidden="true"
      className={`brand-mark ${className}`}
      style={{ ...maskStyle(src), opacity }}
    />
  );
}