import { WHATSAPP_PHONE } from "./config";

// Función central para armar el link de WhatsApp (wa.me) a partir del número
// configurado en VITE_WHATSAPP_PHONE. Se usa en todos los CTA de "Registrarse"
// y contacto. Acepta un mensaje opcional para pre-cargar el texto del chat.
export function whatsappUrl(message?: string): string {
  const base = `https://wa.me/${WHATSAPP_PHONE}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}
