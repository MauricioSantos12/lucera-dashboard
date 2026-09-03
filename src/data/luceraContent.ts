// Datos de contenido de Lucera. Los campos pendientes se marcan como null
// y se renderizan como placeholders editoriales, no como texto público definitivo.

import { anaPublications } from "./publications/anaPublications";
import { felipePublications } from "./publications/felipePublications";

export const founders = [
  {
    name: "Dra. Ana Lucas",
    role: "Médico pediatra y mamá",
    biography:
      "Médico pediatra y mamá. Diseñé Lucera como una extensión de todo lo que he aprendido en mis 20 años como médico y 9 años como madre, para crear el acompañante esencial que todo padre y madre necesita para navegar la grandiosa experiencia de criar y cuidar la salud de sus hijos.",
    photo:
      "https://media.base44.com/images/public/6a7903d2ae6b2ce903b46d38/8e63b9ea4_Dra-Lucas-Quintero.webp",
    linkedinUrl: "https://www.linkedin.com/in/analucasquintero/",
  },
  {
    name: "Dr. David Muschett",
    role: "Médico y papá",
    biography:
      "Médico y papá. Diseñé Lucera para llevar salud directamente a las personas, de manera fácil e intuitiva, a través de la creatividad y la cercanía. Combino mi experiencia como padre, médico y gestor empresarial para crear con propósito e innovación.",
    photo:
      "https://media.base44.com/images/public/6a7903d2ae6b2ce903b46d38/4286309e0_Dr-David-Muschett.webp",
    linkedinUrl: "https://www.linkedin.com/in/dmuschett/",
  },
  {
    name: "Msc. Felipe Ocampo",
    role: "Ingeniero biomédico · Sistemas inteligentes",
    biography:
      "Ingeniero biomédico, geek de los datos y especialista en sistemas inteligentes. Diseñé Lucera humanizando la inteligencia artificial y asegurando la confianza de tus interacciones. Integro mi pasión por los datos con la tecnología para crear herramientas que generen confianza en las personas.",
    photo:
      "https://media.base44.com/images/public/6a7903d2ae6b2ce903b46d38/0f239ea96_IngFelipeOcampo.webp",
    linkedinUrl: "https://www.linkedin.com/in/felipeocampoo/",
  },
];

// El apellido "XXXXX" se conserva como dato pendiente interno; en la UI se muestra "Pendiente".
export const medicalAdvisors = [
  { name: "Dr. Pedro Vargas", specialty: null, location: null, profile: null, photo: null, link: null },
  { name: "Dra. Geraldine Norte", specialty: null, location: null, profile: null, photo: null, link: null },
  { name: "Dr. Carlos Velarde", specialty: null, location: null, profile: null, photo: null, link: null },
  { name: "Dra. Yessenia Williams", specialty: null, location: null, profile: null, photo: null, link: null },
  { name: "Dr. Darío Antonio Vallarino", specialty: null, location: null, profile: null, photo: null, link: null },
  { name: "Dr. Juan Bautista Dartiguelonge", specialty: null, location: null, profile: null, photo: null, link: null },
  { name: "Dr. Estanislao Díaz Humará", specialty: null, location: null, profile: null, photo: null, link: null },
  { name: "Dr. Jorge ______", specialty: null, location: null, profile: null, photo: null, link: null },
  { name: "Dr. Francisco Becerra", specialty: null, location: null, profile: null, photo: null, link: null },
  { name: "Dra. María Luisa Ávila", specialty: null, location: null, profile: null, photo: null, link: null },
];

// Publicaciones agrupadas por autor. Cada fundador aporta las suyas en
// src/data/publications/<autor>Publications.js y se componen aquí.
export const publications = [...anaPublications, ...felipePublications];

export const publicationCategories = Array.from(
  new Set(publications.map((p) => p.category))
);

export const pricingPlans = [
  {
    id: "plan-1",
    name: "Individual",
    children: "1 hijo",
    monthly: 16.0,
    note: "$16.00 por hijo al mes.",
    annualMonthly: 12.42,
    annualTotal: 149.0,
    annualNote: "$12.42 por hijo al mes.",
    featured: false,
  },
  {
    id: "plan-2",
    name: "Duo",
    children: "2 hijos",
    monthly: 24.0,
    note: "$12.00 por hijo al mes.",
    annualMonthly: 19.08,
    annualTotal: 229.0,
    annualNote: "$9.54 por hijo al mes.",
    featured: true,
  },
  {
    id: "plan-3",
    name: "Trío",
    children: "3 hijos",
    monthly: 32.0,
    note: "$10.67 por hijo al mes.",
    annualMonthly: 24.92,
    annualTotal: 299.0,
    annualNote: "$8.31 por hijo al mes.",
    featured: false,
  },
  {
    id: "plan-4",
    name: "Familiar",
    children: "4 hijos",
    monthly: 39.0,
    note: "$9.75 por hijo al mes.",
    annualMonthly: 30.75,
    annualTotal: 369.0,
    annualNote: "$7.69 por hijo al mes.",
    featured: false,
  },
  {
    id: "plan-5",
    name: "Familiar XL",
    children: "5 hijos",
    monthly: 44.0,
    note: "$8.80 por hijo al mes.",
    annualMonthly: 34.92,
    annualTotal: 419.0,
    annualNote: "$6.98 por hijo al mes.",
    featured: false,
  },
];

export const pricingHighlights = [
  "Hasta 2 adultos por cuenta.",
  "Todo por WhatsApp, sin apps.",
  "Historial de cada hijo.",
  "Cancela cuando quieras.",
];

export const navLinks = [
  { label: "Inicio", href: "#inicio" },
  { label: "Portal de mis hijos", href: "#portal" },
  { label: "Suscripción", href: "#suscripcion" },
  { label: "Propósito", href: "#proposito" },
  { label: "Cómo funciona", href: "#como-funciona" },
  { label: "Consejo Asesor", href: "#consejo-asesor" },
  { label: "Fundadores", href: "#founders" },
  { label: "Publicaciones", href: "#publicaciones" },
];

export const heroImage =
  "https://media.base44.com/images/public/6a7903d2ae6b2ce903b46d38/3e43b4504_generated_970ee126.png";

export const heroCarouselPhotos = [
  "https://media.base44.com/images/public/6a7903d2ae6b2ce903b46d38/5b59b9f9f_Gemini_Generated_Image_2poas32poas32poa.png",
  "https://media.base44.com/images/public/6a7903d2ae6b2ce903b46d38/11637fdba_Gemini_Generated_Image_wmkt72wmkt72wmkt.png",
];

export const purposeAmbient =
  "https://media.base44.com/images/public/6a7903d2ae6b2ce903b46d38/444075e95_generated_e5ab1bf3.png";