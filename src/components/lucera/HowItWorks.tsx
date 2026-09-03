import Reveal from "./Reveal";

const STEPS = [
{
  n: "01",
  title: "Escribes por WhatsApp",
  body: "El mismo chat de siempre. Cuéntale a Lucera qué está pasando, como se lo contarías a alguien de confianza."
},
{
  n: "02",
  title: "Lucera pregunta lo necesario",
  body: "Preguntas claras y cortas, basadas en protocolos pediátricos. Sin cuestionarios interminables a medianoche."
},
{
  n: "03",
  title: "Sabes qué hacer ahora",
  body: "Te orienta sobre el siguiente paso: observar en casa, ver a tu pediatra pronto, o ir a urgencias sin perder tiempo."
}];


export default function HowItWorks() {
  return (
    <section id="como-funciona" className="relative lucera-section overflow-hidden">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <Reveal className="max-w-2xl mx-auto text-center">
          <p className="text-eyebrow text-lucera-orange mb-4">Cómo funciona</p>
          <h2 className="font-display text-[var(--text-h2)] leading-tight text-lucera-wine text-balance">
            Tres pasos. Sin apps, sin citas, sin esperar.
          </h2>
        </Reveal>

        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {STEPS.map((step, idx) =>
          <Reveal key={step.n} className="h-full" style={{ transitionDelay: `${idx * 90}ms` }}>
              <article className="lucera-card h-full p-7 flex flex-col">
                <span className="font-display text-3xl text-lucera-orange/80 leading-none">
                  {step.n}
                </span>
                <h3 className="mt-4 font-display text-xl text-lucera-wine leading-snug">
                  {step.title}
                </h3>
                <p className="mt-3 text-[15px] leading-relaxed text-lucera-wine/70">
                  {step.body}
                </p>
              </article>
            </Reveal>
          )}
        </div>
      </div>
    </section>);

}