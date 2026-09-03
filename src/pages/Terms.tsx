import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import ReactMarkdown from "react-markdown";
import "@/landing.css";
import { termsTitle, termsMarkdown } from "@/data/termsContent";

export default function Terms() {
  return (
    <div className="lucera-lp min-h-screen bg-lucera-cream">
      <header className="sticky top-0 z-20 border-b border-lucera-wine/10 bg-lucera-cream/90 backdrop-blur">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 py-4 flex items-center justify-between">
          <Link
            to="/"
            className="lucera-btn-pill inline-flex items-center gap-2 px-4 py-2 text-sm text-lucera-wine border border-lucera-wine/30 hover:bg-lucera-wine hover:text-lucera-cream transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Volver al inicio
          </Link>
          <span className="text-eyebrow text-lucera-orange hidden sm:block">Legal</span>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 sm:px-6 py-12 sm:py-16">
        <p className="text-eyebrow text-lucera-orange mb-3">Documento legal</p>
        <h1 className="font-display text-[clamp(2rem,5vw,3rem)] leading-tight text-lucera-wine text-balance">
          {termsTitle}
        </h1>

        <article className="terms-content mt-10 text-lucera-wine/85">
          <ReactMarkdown>{termsMarkdown}</ReactMarkdown>
        </article>
      </main>
    </div>
  );
}