import { useEffect, useRef, useState } from "react";
import { Volume2, VolumeX, Play, Pause, SkipForward } from "lucide-react";
import Logo from "./Logo";

const CAMPAIGN_BG =
  "https://media.base44.com/images/public/6a7903d2ae6b2ce903b46d38/d33251ffc_fondo-lucera-luz.jpg";

const CAMPAIGN_VIDEO =
  "https://media.base44.com/videos/public/6a7903d2ae6b2ce903b46d38/e060ea51a_Lucera-ai-medical.mp4";

// Cinematic welcome overlay. Controlled by parent via `open` / `onEnter`.
// Muted autoplay, playsinline, sound toggle.
export default function CampaignVideoIntro({ open, onEnter }) {
  const [muted, setMuted] = useState(true);
  const [playing, setPlaying] = useState(false);
  const videoRef = useRef(null);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  // Autoplay (muted) once open
  useEffect(() => {
    if (open && videoRef.current) {
      videoRef.current.muted = true;
      videoRef.current.play().catch(() => setPlaying(false));
      setPlaying(true);
      setMuted(true);
    }
  }, [open]);

  const togglePlay = () => {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) {
      v.play().catch(() => {});
      setPlaying(true);
    } else {
      v.pause();
      setPlaying(false);
    }
  };

  const toggleMute = () => {
    const v = videoRef.current;
    if (!v) return;
    v.muted = !v.muted;
    setMuted(v.muted);
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[200] grid place-items-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Video de bienvenida de Lucera"
    >
      {/* Ambient aurora background */}
      <img
        src={CAMPAIGN_BG}
        alt=""
        aria-hidden="true"
        className="absolute inset-0 w-full h-full object-cover"
      />
      {/* Soft wine vignette to anchor the bright center */}
      <div
        className="absolute inset-0 bg-[radial-gradient(circle_at_50%_38%,transparent_46%,rgba(112,21,48,0.30)_100%)]"
        aria-hidden="true"
      />

      <div className="relative flex h-full max-h-[calc(100svh-2rem)] w-full max-w-4xl flex-col items-center justify-center">
        <div className="mb-4 flex shrink-0 justify-center">
          <Logo variant="dark" className="w-[130px]" />
        </div>

        {/* Campaign video frame — flex-1 para que se ajuste a la altura y los
            controles siempre queden visibles. */}
        <div className="relative min-h-0 w-full max-w-[560px] flex-1 overflow-hidden rounded-[30px] border border-lucera-yellow/25 bg-lucera-black">
          <video
            ref={videoRef}
            src={CAMPAIGN_VIDEO}
            className="absolute inset-0 w-full h-full object-cover"
            playsInline
            muted={muted}
            loop
          />
        </div>

        {/* Controls */}
        <div className="mt-4 flex shrink-0 flex-wrap items-center justify-center gap-3">
          <button
            onClick={togglePlay}
            aria-label={playing ? "Pausar" : "Reproducir"}
            className="lucera-btn-pill inline-flex items-center gap-2 px-5 bg-lucera-wine/75 text-lucera-cream hover:bg-lucera-wine"
          >
            {playing ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            <span className="text-sm">{playing ? "Pausar" : "Reproducir"}</span>
          </button>
          <button
            onClick={toggleMute}
            aria-label={muted ? "Activar sonido" : "Silenciar"}
            aria-pressed={!muted}
            className="lucera-btn-pill inline-flex items-center gap-2 px-5 bg-lucera-wine/75 text-lucera-cream hover:bg-lucera-wine"
          >
            {muted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            <span className="text-sm">{muted ? "Activar sonido" : "Silenciar"}</span>
          </button>
          <button
            onClick={onEnter}
            className="lucera-btn-pill inline-flex items-center gap-2 px-6 bg-lucera-orange text-white animate-lucera-pulse"
          >
            <SkipForward className="w-4 h-4" />
            <span className="text-sm font-semibold">Entrar a Lucera</span>
          </button>
        </div>

        <p className="mt-3 shrink-0 text-center text-xs text-lucera-wine/70">
          Puedes omitir el video en cualquier momento. No se volverá a mostrar en esta sesión.
        </p>
      </div>
    </div>
  );
}