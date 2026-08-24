// Contenido del blog / centro de recursos. Fuente única: alimenta el índice,
// las páginas de artículo, el SEO (Article JSON-LD), el prerender y el sitemap.
// El cuerpo se modela por bloques (sin dependencias de markdown) para controlar
// el estilo y que prerenderice limpio.

export type Block =
  | { type: "p"; text: string }
  | { type: "h2"; text: string }
  | { type: "ul"; items: string[] }
  | { type: "callout"; text: string };

export type Article = {
  slug: string;
  title: string;
  description: string;
  excerpt: string;
  /** Fecha de publicación en formato ISO (YYYY-MM-DD). */
  date: string;
  readingMinutes: number;
  keywords: string[];
  body: Block[];
};

const DISCLAIMER =
  "Esta información es orientativa y no reemplaza la evaluación de un profesional de la salud. Lucera no da diagnósticos ni receta medicamentos: te ayuda a entender qué nivel de atención necesita tu hijo. Ante una emergencia, acude de inmediato a un servicio de urgencias.";

export const articles: Article[] = [
  {
    slug: "fiebre-en-ninos-cuando-preocuparse",
    title: "Fiebre en niños: cuándo preocuparse y cuándo buscar atención",
    description:
      "Guía para padres en Panamá: qué se considera fiebre en niños, cómo actuar en casa y las señales que indican que debes buscar atención médica o acudir a urgencias.",
    excerpt:
      "Qué se considera fiebre, cómo cuidar a tu hijo en casa y las señales de alarma que no debes ignorar.",
    date: "2026-08-24",
    readingMinutes: 5,
    keywords: [
      "fiebre en niños",
      "fiebre bebé",
      "cuándo llevar al pediatra",
      "pediatría Panamá",
    ],
    body: [
      {
        type: "p",
        text: "La fiebre es uno de los motivos más frecuentes de consulta pediátrica. En la mayoría de los casos es una respuesta normal del cuerpo ante una infección y no es peligrosa por sí misma. Lo importante no es solo el número del termómetro, sino cómo se ve y se comporta tu hijo.",
      },
      { type: "h2", text: "¿Qué se considera fiebre?" },
      {
        type: "p",
        text: "En general se habla de fiebre cuando la temperatura corporal es igual o mayor a 38 °C medida de forma confiable. Entre 37.5 y 38 °C suele considerarse febrícula (temperatura ligeramente elevada).",
      },
      {
        type: "ul",
        items: [
          "Menores de 3 meses con 38 °C o más: requieren evaluación médica inmediata, siempre.",
          "Entre 3 meses y 3 años: importa cómo se ve el niño más que el número exacto.",
          "Mayores de 3 años: observa el estado general, la hidratación y otros síntomas.",
        ],
      },
      { type: "h2", text: "Qué puedes hacer en casa" },
      {
        type: "ul",
        items: [
          "Ofrece líquidos con frecuencia para mantener la hidratación.",
          "Viste al niño con ropa ligera; no lo abrigues de más.",
          "Vigila su ánimo, apetito y nivel de actividad.",
          "Los medicamentos para la fiebre deben usarse según indicación médica y por peso, nunca de forma automática.",
        ],
      },
      { type: "h2", text: "Señales de alarma: busca atención" },
      {
        type: "p",
        text: "Más allá de la temperatura, estos signos indican que conviene buscar atención médica pronto:",
      },
      {
        type: "ul",
        items: [
          "Bebé menor de 3 meses con cualquier fiebre.",
          "Dificultad para respirar, respiración rápida o quejido.",
          "Somnolencia excesiva, irritabilidad que no cede o llanto inconsolable.",
          "Manchas en la piel que no desaparecen al presionar.",
          "Signos de deshidratación: boca seca, orina escasa, ausencia de lágrimas.",
          "Fiebre que dura más de 48–72 horas o convulsión asociada.",
        ],
      },
      {
        type: "callout",
        text: "Si describes los síntomas de tu hijo por WhatsApp, Lucera te orienta sobre el nivel de atención recomendado (general, urgente o emergencia) y un pediatra da seguimiento.",
      },
      { type: "callout", text: DISCLAIMER },
    ],
  },
  {
    slug: "senales-de-alarma-urgencias-pediatricas",
    title: "Señales de alarma en niños: cuándo ir a urgencias",
    description:
      "Aprende a reconocer las señales de alarma en bebés y niños que indican que debes acudir a urgencias, y cuándo una consulta pediátrica normal es suficiente.",
    excerpt:
      "Cómo distinguir entre una molestia que puede esperar y una señal que requiere urgencias.",
    date: "2026-08-24",
    readingMinutes: 4,
    keywords: [
      "señales de alarma niños",
      "cuándo ir a urgencias",
      "emergencia pediátrica",
      "Panamá",
    ],
    body: [
      {
        type: "p",
        text: "Como madre o padre, la duda más común a medianoche es la misma: ¿esto puede esperar o vamos a urgencias? No siempre es fácil decidir. Estas señales ayudan a orientar, pero ante la duda seria, siempre es preferible una evaluación.",
      },
      { type: "h2", text: "Acude a urgencias de inmediato si notas" },
      {
        type: "ul",
        items: [
          "Dificultad para respirar: se le hunden las costillas, respira muy rápido o se pone morado alrededor de los labios.",
          "No responde, está muy decaído o es muy difícil despertarlo.",
          "Convulsión.",
          "Manchas rojas o moradas en la piel que no desaparecen al presionarlas.",
          "Vómitos persistentes con signos de deshidratación, o vómito verdoso.",
          "Un golpe fuerte en la cabeza con pérdida de conciencia o vómitos repetidos.",
        ],
      },
      { type: "h2", text: "Probablemente puede esperar una consulta" },
      {
        type: "ul",
        items: [
          "Fiebre en un niño mayor de 3 meses que sigue activo, bebe líquidos y responde bien.",
          "Tos o mocos sin dificultad para respirar.",
          "Una diarrea leve sin signos de deshidratación.",
          "Molestias que mejoran con el paso de las horas.",
        ],
      },
      {
        type: "p",
        text: "En estos casos, una consulta con el pediatra en las siguientes horas o días suele ser suficiente. La clave está en vigilar la evolución.",
      },
      {
        type: "callout",
        text: "¿No estás seguro de en cuál grupo cae tu caso? Con Lucera describes los síntomas por WhatsApp y recibes una orientación del nivel de atención, con seguimiento de un pediatra.",
      },
      { type: "callout", text: DISCLAIMER },
    ],
  },
  {
    slug: "teleorientacion-pediatrica-panama",
    title: "Teleorientación pediátrica en Panamá: qué es y cómo funciona",
    description:
      "Qué es la teleorientación pediátrica, en qué se diferencia de un diagnóstico, y cómo Lucera acompaña a las familias en Panamá por WhatsApp con triaje por IA y un pediatra.",
    excerpt:
      "Qué es la teleorientación, qué no es, y cómo puede ayudar a tu familia sin reemplazar a tu pediatra.",
    date: "2026-08-24",
    readingMinutes: 4,
    keywords: [
      "teleorientación pediátrica",
      "telemedicina niños",
      "pediatra por WhatsApp",
      "Panamá",
    ],
    body: [
      {
        type: "p",
        text: "La teleorientación en salud es un servicio que te ayuda a entender qué tan urgente es una situación y qué pasos seguir, a distancia. No es lo mismo que un diagnóstico: es una guía para tomar mejores decisiones, sobre todo en esos momentos de duda en que no sabes si esperar o buscar atención.",
      },
      { type: "h2", text: "Qué es y qué no es" },
      {
        type: "ul",
        items: [
          "Sí: orienta sobre el nivel de atención recomendado (general, urgente o emergencia).",
          "Sí: ayuda a priorizar y a no perder tiempo cuando de verdad importa.",
          "No: no da diagnósticos ni receta medicamentos.",
          "No: no reemplaza a tu pediatra ni a una sala de urgencias.",
        ],
      },
      { type: "h2", text: "Cómo funciona Lucera" },
      {
        type: "ul",
        items: [
          "Escribes los síntomas de tu hijo por WhatsApp, en lenguaje natural.",
          "Un sistema de IA analiza el caso con base en guías clínicas y lo clasifica por nivel de atención.",
          "Un pediatra monitorea, valida y da seguimiento: el criterio médico final siempre es humano.",
        ],
      },
      {
        type: "p",
        text: "Todo ocurre desde tu WhatsApp, sin instalar aplicaciones. Lucera está pensado para acompañar a las familias en todo Panamá, con privacidad desde el diseño y conforme a la Ley 81 de 2019 de Protección de Datos.",
      },
      {
        type: "callout",
        text: "Lucera es orientación con acompañamiento médico real, no un chatbot que responde y desaparece.",
      },
      { type: "callout", text: DISCLAIMER },
    ],
  },
];

export function getArticle(slug: string): Article | undefined {
  return articles.find((a) => a.slug === slug);
}

// Artículos ordenados del más reciente al más antiguo (para el índice).
export const articlesByDate = [...articles].sort((a, b) =>
  a.date < b.date ? 1 : -1
);
