// Lucera logo — uses the official provided image asset directly.
export default function Logo({ variant = "light", className = "" }) {
  return (
    <img
      src="https://media.base44.com/images/public/6a7903d2ae6b2ce903b46d38/bec833e7c_logo-lucera.png"
      alt="Lucera"
      className={className}
      style={{ display: "block", height: "auto" }}
    />
  );
}