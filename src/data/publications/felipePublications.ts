// Publicaciones científicas de Msc. Felipe Ocampo. El artículo completo vive en
// un enlace externo (externalUrl); el modal muestra el resumen y un botón
// "Leer artículo completo" en el tinto de la marca para abrirlo.

export const felipePublications = [
  {
    id: "felipe-01",
    author: "Msc. Felipe Ocampo",
    title: "Framework de curiosidad y humildad para LLMs en salud",
    category: "Publicación científica",
    publicationDate: "1 de Marzo de 2026",
    summary:
      "Propone un marco conceptual para que los modelos de lenguaje en contextos clínicos reconozcan activamente los límites de su propio conocimiento (humildad epistémica) y busquen información adicional cuando la certeza es baja (curiosidad), en lugar de generar respuestas seguras pero potencialmente erróneas, un mecanismo pensado para reducir el riesgo de alucinaciones con consecuencias clínicas.",
    image: null,
    externalUrl: "https://pmc.ncbi.nlm.nih.gov/articles/PMC13034379/",
    downloadUrl: null,
    content: null,
  },
  {
    id: "felipe-02",
    author: "Msc. Felipe Ocampo",
    title: "Guía para evaluar críticamente los modelos de IA en medicina",
    category: "Publicación científica",
    publicationDate: "18 de Diciembre de 2024",
    summary:
      "Ofrece un marco estructurado para que clínicos (con foco en anestesiología) evalúen la validez, seguridad y aplicabilidad de modelos de machine learning antes de llevarlos a la práctica, cubriendo especificación de variables y datos, métricas de desempeño según el tipo de modelo (clasificación vs. regresión), interpretabilidad mediante herramientas como SHAP values, y consideraciones éticas que equilibran innovación con seguridad del paciente.",
    image: null,
    externalUrl: "https://link.springer.com/article/10.1186/s12871-024-02840-y",
    downloadUrl: null,
    content: null,
  },
  {
    id: "felipe-03",
    author: "Msc. Felipe Ocampo",
    title: "Perspectiva sobre cómo la IA está cambiando la medicina basada en evidencia",
    category: "Publicación científica",
    publicationDate: "Julio de 2026",
    summary:
      "Argumenta que la IA debe entenderse como una extensión de la generación de evidencia, no como un sustituto del razonamiento epidemiológico, frente a las limitaciones de los ensayos clínicos clásicos para abarcar la escala y heterogeneidad de los sistemas de salud actuales. Examina cómo la IA está remodelando los fundamentos metodológicos y éticos de la medicina basada en evidencia mediante integración de datos multimodales, emulación de ensayos objetivo (target trial emulation) y modelamiento por simulación, subrayando que el buen desempeño predictivo no garantiza validez causal ni beneficio clínico. Señala además que, en la región de las Américas, la fragmentación de los sistemas de salud y la infraestructura digital desigual limitan la representatividad y el despliegue equitativo, y concluye que la IA no transformará por sí sola la medicina basada en evidencia: requiere reforma de gobernanza, validación transparente y cambio estructural para no reforzar inequidades existentes.",
    image: null,
    externalUrl:
      "https://www.thelancet.com/journals/lanam/article/PIIS2667-193X(26)00102-X/fulltext",
    downloadUrl: null,
    content: null,
  },
  {
    id: "felipe-04",
    author: "Msc. Felipe Ocampo",
    title: "Agentes que atrapan agentes y el peligro de esto para la GenAI clínica",
    category: "Publicación científica",
    publicationDate: "17 de Agosto de 2026",
    summary:
      "Demuestra que los comités de agentes LLM usados en apoyo clínico son vulnerables no a señales técnicas o visuales, sino a presión social entre agentes: cuando dos \"compañeros\" coinciden en una respuesta incorrecta, un tercer agente la adopta en el 38% de los casos, y la mayoría de los agentes (90–99%) no son conscientes de haber cedido a ese consenso falso. De los mecanismos de supervisión probados, solo un árbitro independiente que re-consulta en privado al agente disidente logra detectar la manipulación con buena precisión (77–88%), evidencia de que el riesgo central en estos sistemas es social, no puramente técnico.",
    image: null,
    externalUrl: "https://arxiv.org/abs/2608.03744",
    downloadUrl: null,
    content: null,
  },
];