// Organic SVG path evoking a firefly's flight. Decorative; hidden from AT.
export default function FireflyPath({ className = "", variant = "guide", loop = false, strokeWidth = 2.5 }) {
  const stroke =
    variant === "warm"
      ? "url(#firefly-warm)"
      : variant === "light"
      ? "url(#firefly-light)"
      : "url(#firefly-guide)";

  return (
    <svg
      className={className}
      viewBox="0 0 1200 200"
      fill="none"
      aria-hidden="true"
      preserveAspectRatio="none"
    >
      <defs>
        <linearGradient id="firefly-guide" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#f5e7d3" stopOpacity="0.2" />
          <stop offset="55%" stopColor="#f6ca35" stopOpacity="0.95" />
          <stop offset="100%" stopColor="#f08159" stopOpacity="0.95" />
        </linearGradient>
        <linearGradient id="firefly-warm" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#f6ca35" stopOpacity="0.1" />
          <stop offset="100%" stopColor="#f08159" stopOpacity="0.9" />
        </linearGradient>
        <linearGradient id="firefly-light" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.1" />
          <stop offset="100%" stopColor="#f6ca35" stopOpacity="0.9" />
        </linearGradient>
      </defs>
      <path
        d="M-20 100 C 40 30, 140 30, 200 100 S 360 170, 400 100 S 560 30, 600 100 S 760 170, 800 100 S 960 30, 1000 100 S 1160 170, 1220 100"
        stroke={stroke}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        className={loop ? "animate-path-flow" : "animate-path-draw"}
      />
      {!loop && <circle cx="1220" cy="70" r="6" fill="#f6ca35" className="animate-firefly" />}
    </svg>
  );
}