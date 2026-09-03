import { ArrowRight, Lock } from "lucide-react";
import { Link } from "react-router-dom";
import Reveal from "./Reveal";
import { whatsappUrl } from "@/lib/whatsapp";

const WHATSAPP_URL = whatsappUrl(
  "Hola, estoy interesado en Lucera y quiero saber más."
);

// Sección informativa del portal. Sin formulario: un único enlace que abre
// el panel externo en una nueva pestaña.
export default function PortalLogin() {
  return (
    <section id="portal" className="relative lucera-section overflow-hidden">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
          {/* Left — copy */}
          <Reveal>
            <p className="text-eyebrow text-lucera-orange mb-4">
              Portal de mis hijos
            </p>
            <h2 className="font-display text-[var(--text-h2)] leading-tight text-lucera-wine text-balance">
              Gestiona tu cuenta y la información de tus hijos.
            </h2>
            <p className="mt-5 text-[15px] leading-relaxed max-w-[52ch]" style={{ color: "#8c6f6b" }}>
              Aquí puedes gestionar tu cuenta y la información tuya y de tus hijos. Presiona
              Entrar al panel para acceder a tu portal.
            </p>
            <ul className="mt-8 space-y-4 text-sm" style={{ color: "#8c6f6b" }}>
              {[
                "Datos y perfil de cada hijo",
                "Historial de consultas y orientaciones",
                "Papá y mamá con acceso desde la misma cuenta",
              ].map((item) => (
                <li key={item} className="flex items-center gap-3">
                  <span className="w-2 h-2 rounded-full shrink-0" style={{ background: "#e2a39a" }} />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </Reveal>

          {/* Right — access card */}
          <Reveal>
            <div className="lucera-card p-7 sm:p-9 text-center">
              <div className="flex items-center justify-center gap-2.5 mb-7">
                <Lock className="w-5 h-5 text-lucera-wine" />
                <h3 className="font-display text-2xl text-lucera-wine">Tu portal</h3>
              </div>

              <p className="text-[15px] leading-relaxed text-lucera-wine/70 mb-8">
                Ingresa a tu cuenta para ver la información de tus hijos y su historial de
                orientaciones.
              </p>

              <Link
                to="/dashboard"
                className="lucera-btn-pill w-full inline-flex items-center justify-center gap-2 px-6 py-4 bg-lucera-wine text-lucera-cream hover:bg-lucera-wine/90">
                Entrar al panel
                <ArrowRight className="w-4 h-4" />
              </Link>

              <p className="mt-6 text-sm text-center text-lucera-wine">
                ¿Aún no tienes cuenta?{" "}
                <a
                  href={WHATSAPP_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold hover:underline underline-offset-4">
                  Suscríbete
                </a>
              </p>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}