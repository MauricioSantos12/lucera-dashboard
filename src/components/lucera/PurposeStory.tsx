import Reveal from "./Reveal";
import FireflyPath from "./FireflyPath";

export default function PurposeStory() {
  return (
    <section
      id="proposito"
      className="relative lucera-section overflow-hidden"
      style={{ background: "#6c122b" }}>
      
      {/* Soft warm radial glow for depth */}
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[radial-gradient(circle_at_50%_30%,rgba(240,129,89,0.18),transparent_60%)]" />
      

      {/* Subtle firefly light traveling across the section */}
      <FireflyPath className="absolute top-16 left-0 w-full h-24 opacity-60" variant="light" loop strokeWidth={5} />
      <div className="pointer-events-none absolute top-1/3 left-[20%] w-2.5 h-2.5 rounded-full bg-lucera-orange blur-[1px] animate-firefly" aria-hidden="true" />
      <div className="pointer-events-none absolute bottom-1/4 right-[25%] w-2 h-2 rounded-full bg-lucera-yellow blur-[1px] animate-firefly" style={{ animationDelay: "2.4s" }} aria-hidden="true" />

      <div className="relative mx-auto max-w-3xl px-4 sm:px-6 text-center">
        <Reveal>
          <p className="text-lucera-orange mb-5 text-base">Lucera y su propósito</p>
          <h2 className="font-display text-[var(--text-h2)] leading-tight text-lucera-cream text-balance">Luc · era
Lucera: la era de Luc
          </h2>
        </Reveal>

        <Reveal className="mt-8 space-y-5 text-[17px] leading-relaxed text-lucera-cream/85">
          <p>“Luc fue nuestro hijo que no pudo nacer.</p>
          <p>
            Nos anunció que se despedía de nosotros en una noche sin luz, en forma de una luciérnaga
            que apareció y brilló como solo las luciérnagas macho lo hacen.
          </p>
          <p>
            Luc significa luz. Así supimos que su misión era llevar luz a más padres y madres que
            necesitan una guía clara y tranquila para cuidar a sus hijos, sin alarmar y convirtiendo
            la incertidumbre en tranquilidad, así como Luc nos guió a nosotros.”
          </p>
          <p className="pt-2 font-display text-lg text-lucera-cream/90">Dra. Ana G. Lucas  ·  Dr. David Muschett

          </p>
          <img
            src="https://media.base44.com/images/public/6a7903d2ae6b2ce903b46d38/545d1cf3d_lucera-simboloe.png"
            alt="Lucera"
            className="mx-auto mt-6 w-20 h-auto" />
          
        </Reveal>

        {/* Revealed firefly symbol */}
        <Reveal className="mt-10 flex flex-col items-center">
          
          

          
        </Reveal>
      </div>
    </section>);

}