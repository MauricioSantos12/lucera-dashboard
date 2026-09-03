import { Link } from "react-router-dom";
import Logo from "./Logo";
import { navLinks } from "@/data/luceraContent";

const legalLinks = [
  { label: "Términos y condiciones", to: "/terminos" },
  { label: "Política de privacidad", to: null },
  { label: "Política de cookies", to: null },
  { label: "Aviso médico", to: null },
];

export default function Footer() {
  return (
    <footer className="relative bg-lucera-cream pt-16 pb-10 border-t border-lucera-wine/10">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="grid md:grid-cols-[1.4fr_1fr_1fr] gap-10">
          <div>
            <Logo variant="dark" className="w-[140px]" />
            <p className="mt-4 text-sm leading-relaxed text-lucera-wine/70 max-w-sm">
              Lucera lleva luz y orientación clara a padres y madres para cuidar la salud de sus hijos,
              combinando conocimiento médico humano e inteligencia artificial.
            </p>
          </div>

          <nav aria-label="Navegación del pie">
            <p className="text-eyebrow text-lucera-wine/50 mb-4">Navegación</p>
            <ul className="space-y-2.5">
              {navLinks.map((l) => (
                <li key={l.href}>
                  <a href={l.href} className="text-sm text-lucera-wine/70 hover:text-lucera-wine transition-colors">
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <div>
            <p className="text-eyebrow text-lucera-wine/50 mb-4">Contacto y legal</p>
            <ul className="space-y-2.5">
              <li className="text-sm text-lucera-wine/70">Contacto: pendiente de publicar</li>
              <li className="text-sm text-lucera-wine/70">Redes sociales: pendientes</li>
              {legalLinks.map((l) => (
                <li key={l.label}>
                  {l.to ? (
                    <Link to={l.to} className="text-sm text-lucera-wine/70 hover:text-lucera-wine transition-colors">
                      {l.label}
                    </Link>
                  ) : (
                    <a href="#inicio" className="text-sm text-lucera-wine/70 hover:text-lucera-wine transition-colors">
                      {l.label}
                    </a>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-lucera-wine/10 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-lucera-wine/55">© {new Date().getFullYear()} Lucera. Todos los derechos reservados.</p>
          <p className="text-xs text-lucera-wine/45">Aviso médico: Lucera orienta, no sustituye atención de emergencia ni consulta presencial.</p>
        </div>
      </div>
    </footer>
  );
}