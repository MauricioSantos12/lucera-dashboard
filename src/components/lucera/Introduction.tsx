import Reveal from "./Reveal";

// Editorial value-proposition block. Sits right after the hero: a calm,
// warm statement of what Lucera is, separated by generous negative space.
export default function Introduction() {
  return (
    <section className="relative lucera-section overflow-hidden">
      <div
        className="pointer-events-none absolute bottom-1/4 left-[12%] w-2 h-2 rounded-full bg-lucera-yellow blur-[1px] animate-firefly"
        aria-hidden="true" />
      
      <div
        className="pointer-events-none absolute top-1/3 right-[18%] w-1.5 h-1.5 rounded-full bg-lucera-orange blur-[1px] animate-firefly"
        style={{ animationDelay: "2.2s" }}
        aria-hidden="true" />
      

      <div className="relative mx-auto max-w-3xl px-4 sm:px-6 text-center">
        <Reveal>
          <p className="text-eyebrow text-lucera-orange mb-4">Orientación que acompaña</p>
        </Reveal>

        <div className="space-y-7">
          <Reveal>
            <p className="font-display text-[clamp(1.5rem,2.6vw,2.1rem)] leading-snug text-lucera-wine text-balance">Lucera te acompaña con orientación sobre las dudas de salud de tus hijos, de forma natural, humana y cálida, desde tu WhatsApp.


            </p>
          </Reveal>

          <Reveal>
            <p className="leading-relaxed text-lucera-wine/80 max-w-2xl mx-auto text-sm">Unimos el conocimiento de pediatras expertos con inteligencia artificial para orientarte cuando lo necesitas: a las tres de la mañana, un domingo o a mitad de semana.


            </p>
          </Reveal>

          <Reveal>
            <p className="leading-relaxed text-lucera-wine/80 max-w-2xl mx-auto text-sm">Lucera conoce a tus hijos. Cada respuesta parte de su edad, su historia y lo que nos cuentas hoy — no es información genérica de internet, es orientación pensada para ellos.


            </p>
          </Reveal>
        </div>
      </div>
    </section>);

}