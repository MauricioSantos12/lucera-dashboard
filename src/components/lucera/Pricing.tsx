import { useState } from "react";
import { Check, ArrowRight, Star } from "lucide-react";
import Reveal from "./Reveal";
import { whatsappUrl } from "@/lib/whatsapp";

const WHATSAPP_URL = whatsappUrl(
  "Hola, estoy interesado en Lucera y quiero saber más."
);
import BrandMark, { BRAND_ASSETS } from "./BrandMark";
import { pricingPlans, pricingHighlights } from "@/data/luceraContent";

const CARD_BG_IMG =
  "https://media.base44.com/images/public/6a7903d2ae6b2ce903b46d38/90ed42432_fondo-lucera-luz.jpg";

const money = (n) =>
  n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export default function Pricing() {
  const [annual, setAnnual] = useState(false);

  return (
    <section id="suscripcion" className="relative lucera-section overflow-hidden">
      <BrandMark src={BRAND_ASSETS.espiral} className="bottom-[-90px] right-[-60px] w-[clamp(300px,34vw,520px)]" opacity={0.4} />

      <div className="relative mx-auto max-w-6xl px-4 sm:px-6">
        <Reveal className="max-w-2xl mx-auto text-center">
          <p className="text-eyebrow text-lucera-orange mb-4">Suscripción</p>
          <h2 className="font-display text-[var(--text-h2)] leading-tight text-lucera-wine text-balance">
            Un plan por familia. Todos tus hijos, un solo precio.
          </h2>
          <p className="mt-4 text-[15px] text-lucera-wine/70">
            Orientación pediátrica por WhatsApp, a cualquier hora. Sin descargar nada.
          </p>
        </Reveal>

        {/* Billing toggle */}
        <Reveal className="mt-8 flex justify-center">
          <div
            role="group"
            aria-label="Periodicidad de pago"
            className="inline-flex items-center p-1.5 rounded-full bg-white/70 border border-lucera-wine/10"
          >
            <button
              onClick={() => setAnnual(false)}
              aria-pressed={!annual}
              className={`lucera-pill px-5 py-2.5 text-sm font-semibold transition-colors ${
                !annual ? "bg-lucera-wine text-lucera-cream" : "text-lucera-wine/60"
              }`}
            >
              Mensual
            </button>
            <button
              onClick={() => setAnnual(true)}
              aria-pressed={annual}
              className={`lucera-pill px-5 py-2.5 text-sm font-semibold transition-colors ${
                annual ? "bg-lucera-wine text-lucera-cream" : "text-lucera-wine/60"
              }`}
            >
              Anual · ahorra ~21%
            </button>
          </div>
        </Reveal>

        <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-5 gap-5">
          {pricingPlans.map((plan) => {
            const featured = plan.featured;
            const price = annual ? plan.annualMonthly : plan.monthly;
            return (
              <Reveal key={plan.id} className="h-full">
                <article
                  className="relative lucera-card h-full p-7 flex flex-col overflow-hidden hover:-translate-y-[4px] hover:shadow-[var(--shadow-card-hover)] transition-all duration-500"
                  style={
                    featured
                      ? { background: "#6c122b" }
                      : { backgroundImage: `url(${CARD_BG_IMG})`, backgroundSize: "cover", backgroundPosition: "center" }
                  }
                >
                  {featured && (
                    <span className="absolute top-4 right-4 inline-flex items-center gap-1 lucera-pill px-2.5 py-1 text-[11px] font-semibold bg-lucera-yellow/25 text-lucera-cream">
                      <Star className="w-3 h-3" /> Más elegido
                    </span>
                  )}

                  <h3 className={`font-display text-2xl ${featured ? "text-lucera-cream" : "text-lucera-wine"}`}>
                    {plan.name}
                  </h3>
                  <p className={`mt-1 text-sm ${featured ? "text-lucera-cream/60" : "text-lucera-wine/55"}`}>
                    {plan.children}
                  </p>

                  <div className="mt-5 flex items-end gap-1">
                    <span className={`font-display text-4xl ${featured ? "text-lucera-cream" : "text-lucera-wine"}`}>
                      ${money(price)}
                    </span>
                    <span className={`mb-1 text-sm ${featured ? "text-lucera-cream/60" : "text-lucera-wine/55"}`}>
                      /mes
                    </span>
                  </div>

                  <p className={`mt-2 text-xs ${featured ? "text-lucera-cream/60" : "text-lucera-wine/55"}`}>
                    {annual
                      ? `Se cobra $${money(plan.annualTotal)} una vez al año.`
                      : `Se cobra $${money(plan.monthly)} cada mes.`}
                  </p>

                  <p className={`mt-3 text-sm ${featured ? "text-lucera-cream/80" : "text-lucera-wine/75"}`}>
                    {annual ? plan.annualNote : plan.note}
                  </p>

                  <a
                    href={WHATSAPP_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`mt-auto pt-[15px] lucera-btn-pill inline-flex items-center justify-center gap-2 px-5 py-3.5 ${
                      featured
                        ? "bg-lucera-cream text-lucera-wine hover:bg-white"
                        : "bg-lucera-wine text-lucera-cream hover:bg-lucera-wine/90"
                    }`}
                  >
                    Elegir plan
                    <ArrowRight className="w-4 h-4" />
                  </a>
                </article>
              </Reveal>
            );
          })}
        </div>

        {/* Destacadas */}
        <Reveal className="mt-10 grid grid-cols-2 lg:grid-cols-4 gap-4">
          {pricingHighlights.map((h) => (
            <div
              key={h}
              className="flex items-center gap-3 rounded-2xl bg-white/70 border border-lucera-wine/10 px-4 py-4"
            >
              <span className="grid place-items-center w-8 h-8 shrink-0 rounded-full bg-lucera-orange/15 text-lucera-orange">
                <Check className="w-4 h-4" />
              </span>
              <span className="text-sm font-medium text-lucera-wine leading-snug">{h}</span>
            </div>
          ))}
        </Reveal>

        {/* Pie de sección */}
        <Reveal className="mt-10 max-w-2xl mx-auto text-center space-y-2">
          <p className="text-xs text-lucera-wine/60">
            Precios en dólares, más ITBMS (7%). Puedes cambiar de plan cuando cambie tu familia.
          </p>
          <p className="text-xs text-lucera-wine/55 leading-relaxed">
            Lucera es un servicio de teleorientación pediátrica bajo la Ley 203/2021 de Panamá. No emite
            diagnósticos, no receta medicamentos y no sustituye la consulta con tu pediatra ni la atención
            de urgencias. Ante una emergencia, llama al 911.
          </p>
        </Reveal>
      </div>
    </section>
  );
}