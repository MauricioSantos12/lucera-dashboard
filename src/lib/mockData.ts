// Datos simulados para el dashboard Lucera (basado en Informe Apollo v4.0)

// Triaje: 3 niveles según el sistema (verde / amarillo / rojo)
export type TriageLevel = "general" | "urgente" | "emergencia";

export const triageLabels: Record<TriageLevel, string> = {
  general: "General (Verde)",
  urgente: "Urgente (Amarillo)",
  emergencia: "Emergencia (Rojo)",
};

export const triageColor: Record<TriageLevel, string> = {
  general: "bg-triage-self",
  urgente: "bg-triage-priority",
  emergencia: "bg-triage-emergency",
};

export const triageBadgeClass: Record<TriageLevel, string> = {
  general: "bg-triage-self/15 text-triage-self border-triage-self/30",
  urgente:
    "bg-triage-priority/15 text-triage-priority border-triage-priority/30",
  emergencia:
    "bg-triage-emergency/15 text-triage-emergency border-triage-emergency/30",
};

// Sesiones por mes (una sesión = conversación completa) y conversión a pago
export const sessionsPerMonth = [
  { month: "Nov", sessions: 420, premium: 38 },
  { month: "Dic", sessions: 510, premium: 52 },
  { month: "Ene", sessions: 612, premium: 71 },
  { month: "Feb", sessions: 705, premium: 88 },
  { month: "Mar", sessions: 822, premium: 112 },
  { month: "Abr", sessions: 940, premium: 138 },
  { month: "May", sessions: 1018, premium: 161 },
];
// alias retro-compat
export const consultationsPerMonth = sessionsPerMonth.map((s) => ({
  month: s.month,
  consultations: s.sessions,
  satisfaction: 88 + Math.round(s.premium / 25),
}));

export const triageStats = [
  { level: "General", value: 1860, color: "hsl(var(--triage-self))" },
  { level: "Urgente", value: 612, color: "hsl(var(--triage-priority))" },
  { level: "Emergencia", value: 98, color: "hsl(var(--triage-emergency))" },
];

// CSAT calificación 1-5 al cerrar sesión (mostrado como % satisfacción ≥4)
export const csatTrend = [
  { week: "S1", csat: 84 },
  { week: "S2", csat: 86 },
  { week: "S3", csat: 88 },
  { week: "S4", csat: 87 },
  { week: "S5", csat: 90 },
  { week: "S6", csat: 91 },
  { week: "S7", csat: 90 },
  { week: "S8", csat: 92 },
];

// Distribución por plan
export const planDistribution = [
  { plan: "Gratuito", users: 2840, color: "hsl(var(--triage-self))" },
  { plan: "Premium Mensual", users: 412, color: "hsl(var(--accent))" },
  { plan: "Premium Anual", users: 187, color: "hsl(var(--primary))" },
];

// Tipo de atención al cerrar la sesión
export const attentionTypeStats = [
  { type: "Virtual (cerrada en chat)", value: 1820 },
  { type: "Derivada a presencial", value: 750 },
];

// ---------------- Seguros médicos ----------------
export const insuranceNames = [
  "MAPFRE",
  "Pan-American Life Insurance Group (PALIG)",
  "Blue Cross and Blue Shield of Panama",
  "Internacional de Seguros (IS)",
  "Seguros SURA",
] as const;

export type InsuranceName = (typeof insuranceNames)[number];

// ---------------- País / Ciudad ----------------
export const countriesCities: Record<string, string[]> = {
  Panamá: [
    "Ciudad de Panamá",
    "San Miguelito",
    "David",
    "Colón",
    "Santiago",
    "La Chorrera",
    "Chitré",
    "Penonomé",
    "Bocas del Toro",
  ],
  Colombia: [
    "Bogotá",
    "Medellín",
    "Cali",
    "Barranquilla",
    "Cartagena",
    "Bucaramanga",
    "Pereira",
    "Santa Marta",
  ],
};

// ---------------- Acudientes y pacientes pediátricos ----------------
export type Relationship = "Madre" | "Padre" | "Tutor" | "Abuelo/a";
export type AccountStatus = "activa" | "suspendida" | "baja";

export type Child = {
  id: string;
  name: string;
  birthDate: string; // YYYY-MM-DD
  bloodType?: "A+" | "A-" | "B+" | "B-" | "AB+" | "AB-" | "O+" | "O-";
  weightKg?: number;
  conditions?: string[];
  allergies?: string[];
  gender?: string | null;
};

export type Guardian = {
  id: string;
  phone: string; // identificador principal
  email: string;
  name: string;
  relationship: Relationship;
  country: string;
  city: string;
  insurance?: InsuranceName;
  policyNumber?: string;
  status: AccountStatus;
  plan: "Gratuito" | "Premium Mensual" | "Premium Anual";
  registeredAt: string;
  children: Child[];
  // Campos que llegan del API real (opcionales para no romper los mocks).
  accountCode?: string;
  gender?: string | null;
  idNumber?: string | null;
  address?: string | null;
  province?: string | null;
  chats?: number;
};

export const guardians: Guardian[] = [
  {
    id: "ID-002",
    phone: "+507 6123-4567",
    email: "maria.mendoza@gmail.com",
    name: "María Mendoza",
    relationship: "Madre",
    country: "Panamá",
    city: "Ciudad de Panamá",
    insurance: "MAPFRE",
    policyNumber: "MAP-20251112-001",
    status: "activa",
    plan: "Premium Mensual",
    registeredAt: "2025-11-12",
    children: [
      {
        id: "N-1",
        name: "Sofía Mendoza",
        birthDate: "2019-03-14",
        bloodType: "O+",
        weightKg: 22,
        allergies: ["Penicilina"],
      },
    ],
  },
  {
    id: "ID-003",
    phone: "+507 6234-5678",
    email: "lquintero@hotmail.com",
    name: "Luis Quintero",
    relationship: "Padre",
    country: "Panamá",
    city: "San Miguelito",
    status: "activa",
    plan: "Gratuito",
    registeredAt: "2026-02-03",
    children: [
      {
        id: "N-2",
        name: "Mateo Quintero",
        birthDate: "2021-08-22",
        weightKg: 16,
      },
      {
        id: "N-3",
        name: "Camila Quintero",
        birthDate: "2024-01-09",
        weightKg: 9,
      },
    ],
  },
  {
    id: "ID-004",
    phone: "+507 6345-6789",
    email: "carmen.r@yahoo.com",
    name: "Carmen Rodríguez",
    relationship: "Madre",
    country: "Panamá",
    city: "David",
    insurance: "Blue Cross and Blue Shield of Panama",
    policyNumber: "BCBS-2025-4421",
    status: "activa",
    plan: "Premium Anual",
    registeredAt: "2025-09-21",
    children: [
      {
        id: "N-4",
        name: "Isabella Rodríguez",
        birthDate: "2017-05-30",
        bloodType: "A+",
        weightKg: 28,
        allergies: ["Maní", "Mariscos"],
        conditions: ["Asma leve"],
      },
    ],
  },
  {
    id: "ID-005",
    phone: "+507 6456-7890",
    email: "ana.castillo@gmail.com",
    name: "Ana Castillo",
    relationship: "Madre",
    country: "Panamá",
    city: "Colón",
    insurance: "Seguros SURA",
    policyNumber: "SURA-PA-88712",
    status: "activa",
    plan: "Premium Mensual",
    registeredAt: "2026-01-15",
    children: [
      {
        id: "N-5",
        name: "Diego Castillo",
        birthDate: "2022-06-11",
        weightKg: 14,
        conditions: ["Bronquiolitis recurrente"],
      },
    ],
  },
  {
    id: "ID-006",
    phone: "+507 6567-8901",
    email: "rperez@gmail.com",
    name: "Roberto Pérez",
    relationship: "Padre",
    country: "Panamá",
    city: "Santiago",
    status: "suspendida",
    plan: "Gratuito",
    registeredAt: "2025-08-04",
    children: [
      {
        id: "N-6",
        name: "Valentina Pérez",
        birthDate: "2016-02-18",
        weightKg: 30,
      },
    ],
  },
  {
    id: "ID-007",
    phone: "+507 6678-9012",
    email: "patricia.h@gmail.com",
    name: "Patricia Herrera",
    relationship: "Madre",
    country: "Panamá",
    city: "Ciudad de Panamá",
    status: "activa",
    plan: "Premium Mensual",
    registeredAt: "2026-03-02",
    children: [
      {
        id: "N-7",
        name: "Lucas Herrera",
        birthDate: "2023-10-05",
        weightKg: 12,
        allergies: ["Lactosa"],
      },
    ],
  },
  {
    id: "ID-008",
    phone: "+507 6789-0123",
    email: "jorge.vega@gmail.com",
    name: "Jorge Vega",
    relationship: "Padre",
    country: "Panamá",
    city: "La Chorrera",
    insurance: "Pan-American Life Insurance Group (PALIG)",
    policyNumber: "PALIG-507-33201",
    status: "activa",
    plan: "Premium Anual",
    registeredAt: "2025-07-19",
    children: [
      {
        id: "N-8",
        name: "Camila Vega",
        birthDate: "2018-09-01",
        bloodType: "B+",
        weightKg: 24,
      },
    ],
  },
  {
    id: "ID-009",
    phone: "+507 6123-4567",
    email: "maria.mendoza@gmail.com",
    name: "María Mendoza",
    relationship: "Madre",
    country: "Panamá",
    city: "Ciudad de Panamá",
    status: "activa",
    plan: "Premium Mensual",
    registeredAt: "2025-11-12",
    children: [
      {
        id: "N-1",
        name: "Sofía Mendoza",
        birthDate: "2019-03-14",
        bloodType: "O+",
        weightKg: 22,
        allergies: ["Penicilina"],
      },
    ],
  },
  {
    id: "ID-010",
    phone: "+507 6234-5678",
    email: "lquintero@hotmail.com",
    name: "Luis Quintero",
    relationship: "Padre",
    country: "Panamá",
    city: "San Miguelito",
    status: "activa",
    plan: "Gratuito",
    registeredAt: "2026-02-03",
    children: [
      {
        id: "N-2",
        name: "Mateo Quintero",
        birthDate: "2021-08-22",
        weightKg: 16,
      },
      {
        id: "N-3",
        name: "Camila Quintero",
        birthDate: "2024-01-09",
        weightKg: 9,
      },
    ],
  },
  {
    id: "ID-011",
    phone: "+507 6345-6789",
    email: "carmen.r@yahoo.com",
    name: "Carmen Rodríguez",
    relationship: "Madre",
    country: "Panamá",
    city: "David",
    status: "activa",
    plan: "Premium Anual",
    registeredAt: "2025-09-21",
    children: [
      {
        id: "N-4",
        name: "Isabella Rodríguez",
        birthDate: "2017-05-30",
        bloodType: "A+",
        weightKg: 28,
        allergies: ["Maní", "Mariscos"],
        conditions: ["Asma leve"],
      },
    ],
  },
  {
    id: "ID-012",
    phone: "+507 6456-7890",
    email: "ana.castillo@gmail.com",
    name: "Ana Castillo",
    relationship: "Madre",
    country: "Colombia",
    city: "Bogotá",
    insurance: "Internacional de Seguros (IS)",
    policyNumber: "IS-COL-55023",
    status: "activa",
    plan: "Premium Mensual",
    registeredAt: "2026-01-15",
    children: [
      {
        id: "N-5",
        name: "Diego Castillo",
        birthDate: "2022-06-11",
        weightKg: 14,
        conditions: ["Bronquiolitis recurrente"],
      },
    ],
  },
  {
    id: "ID-013",
    phone: "+507 6567-8901",
    email: "rperez@gmail.com",
    name: "Roberto Pérez",
    relationship: "Padre",
    country: "Colombia",
    city: "Medellín",
    status: "suspendida",
    plan: "Gratuito",
    registeredAt: "2025-08-04",
    children: [
      {
        id: "N-6",
        name: "Valentina Pérez",
        birthDate: "2016-02-18",
        weightKg: 30,
      },
    ],
  },
  {
    id: "ID-014",
    phone: "+507 6678-9012",
    email: "patricia.h@gmail.com",
    name: "Patricia Herrera",
    relationship: "Madre",
    country: "Panamá",
    city: "Ciudad de Panamá",
    status: "activa",
    plan: "Premium Mensual",
    registeredAt: "2026-03-02",
    children: [
      {
        id: "N-7",
        name: "Lucas Herrera",
        birthDate: "2023-10-05",
        weightKg: 12,
        allergies: ["Lactosa"],
      },
    ],
  },
  {
    id: "ID-015",
    phone: "+507 6789-0123",
    email: "jorge.vega@gmail.com",
    name: "Jorge Vega",
    relationship: "Padre",
    country: "Panamá",
    city: "La Chorrera",
    status: "activa",
    plan: "Premium Anual",
    registeredAt: "2025-07-19",
    children: [
      {
        id: "N-8",
        name: "Camila Vega",
        birthDate: "2018-09-01",
        bloodType: "B+",
        weightKg: 24,
      },
    ],
  },
];

// alias retro-compat (Pacientes legacy mapeado al primer niño)
export type LegacyPatient = {
  id: string;
  name: string;
  nationalId: string;
  age: number;
  guardianName: string;
  phone: string;
  status: "activo" | "suspendido" | "pendiente";
  lastConsultation: string;
};
export const legacyPatients: LegacyPatient[] = guardians.map((g) => {
  const child = g.children[0];
  const age = Math.floor(
    (Date.now() - new Date(child.birthDate).getTime()) / (365.25 * 86400000)
  );
  return {
    id: g.id.replace("AC-", "P-"),
    name: child.name,
    nationalId: `8-PI-${child.birthDate.slice(2, 4)}-${g.id.slice(-4)}`,
    age,
    guardianName: g.name,
    phone: g.phone,
    status:
      g.status === "activa"
        ? "activo"
        : g.status === "suspendida"
        ? "suspendido"
        : "pendiente",
    lastConsultation: g.registeredAt,
  };
});

// ---------------- Médicos ----------------
export type ConsultationMode = "Virtual" | "Presencial" | "Ambas";

export type Doctor = {
  id: string;
  name: string;
  specialty: string;
  license: string; // número de idoneidad
  email: string;
  mode: ConsultationMode;
  hospitals: string[];
  status: "activo" | "vacaciones" | "inactivo";
  monthlyConsultations: number;
  hours: string; // resumen
};

export const doctors: Doctor[] = [
  {
    id: "M-201",
    name: "Dra. Elena Sánchez",
    specialty: "Pediatría General",
    license: "MINSA-12045",
    email: "esanchez@lucera.pa",
    mode: "Ambas",
    hospitals: ["Hospital del Niño", "Clínica Hospital San Fernando"],
    status: "activo",
    monthlyConsultations: 124,
    hours: "Lun-Vie 08:00-14:00",
  },
  {
    id: "M-202",
    name: "Dr. Carlos Arosemena",
    specialty: "Neonatología",
    license: "MINSA-09872",
    email: "carosemena@lucera.pa",
    mode: "Presencial",
    hospitals: ["Hospital Punta Pacífica"],
    status: "activo",
    monthlyConsultations: 87,
    hours: "Mar-Sáb 09:00-15:00",
  },
  {
    id: "M-203",
    name: "Dra. Mariela De León",
    specialty: "Pediatría General",
    license: "MINSA-15324",
    email: "mdeleon@lucera.pa",
    mode: "Virtual",
    hospitals: ["Centro Médico Paitilla"],
    status: "vacaciones",
    monthlyConsultations: 0,
    hours: "Lun-Vie 14:00-20:00",
  },
  {
    id: "M-204",
    name: "Dr. Andrés Pinilla",
    specialty: "Cardiología Pediátrica",
    license: "MINSA-11290",
    email: "apinilla@lucera.pa",
    mode: "Ambas",
    hospitals: ["Hospital del Niño"],
    status: "activo",
    monthlyConsultations: 56,
    hours: "Mié-Vie 10:00-16:00",
  },
  {
    id: "M-205",
    name: "Dra. Rocío Batista",
    specialty: "Dermatología Pediátrica",
    license: "MINSA-13478",
    email: "rbatista@lucera.pa",
    mode: "Virtual",
    hospitals: ["Clínica Hospital San Fernando"],
    status: "activo",
    monthlyConsultations: 92,
    hours: "Lun-Jue 16:00-20:00",
  },
  {
    id: "M-206",
    name: "Dr. Hugo Saavedra",
    specialty: "Gastroenterología Pediátrica",
    license: "MINSA-10567",
    email: "hsaavedra@lucera.pa",
    mode: "Presencial",
    hospitals: ["Hospital Punta Pacífica"],
    status: "inactivo",
    monthlyConsultations: 0,
    hours: "—",
  },
];
// alias
export type Specialist = Doctor & { licenseRegistration: string };
export const specialists: Specialist[] = doctors.map((d) => ({
  ...d,
  licenseRegistration: d.license,
}));

// ---------------- Centros de atención ----------------
export type CenterType =
  | "Clínica"
  | "Hospital"
  | "Farmacia"
  | "Laboratorio"
  | "Urgencias";

export type Center = {
  id: string;
  name: string;
  type: CenterType;
  city: string;
  address: string;
  phone: string;
  hours: string;
  recommended: boolean;
};

export const centers: Center[] = [
  {
    id: "C-01",
    name: "Hospital del Niño Dr. José Renán Esquivel",
    type: "Hospital",
    city: "Ciudad de Panamá",
    address: "Av. Balboa",
    phone: "+507 512-9800",
    hours: "24/7",
    recommended: true,
  },
  {
    id: "C-02",
    name: "Clínica Hospital San Fernando",
    type: "Clínica",
    city: "Ciudad de Panamá",
    address: "Vía España",
    phone: "+507 305-6300",
    hours: "24/7",
    recommended: true,
  },
  {
    id: "C-03",
    name: "Hospital Punta Pacífica",
    type: "Hospital",
    city: "Ciudad de Panamá",
    address: "Punta Pacífica",
    phone: "+507 204-8000",
    hours: "24/7",
    recommended: true,
  },
  {
    id: "C-04",
    name: "Farmacia Arrocha — Multiplaza",
    type: "Farmacia",
    city: "Ciudad de Panamá",
    address: "Multiplaza Pacific",
    phone: "+507 302-5800",
    hours: "Lun-Dom 07:00-23:00",
    recommended: true,
  },
  {
    id: "C-05",
    name: "Laboratorio Clínico Hospital Nacional",
    type: "Laboratorio",
    city: "Ciudad de Panamá",
    address: "Av. Cuba",
    phone: "+507 207-8100",
    hours: "Lun-Sáb 06:00-18:00",
    recommended: false,
  },
  {
    id: "C-06",
    name: "Urgencias Pediátricas — Centro Médico Paitilla",
    type: "Urgencias",
    city: "Ciudad de Panamá",
    address: "Calle 53 Este, Paitilla",
    phone: "+507 265-8800",
    hours: "24/7",
    recommended: true,
  },
  {
    id: "C-07",
    name: "Hospital Mae Lewis",
    type: "Hospital",
    city: "David",
    address: "Vía Panamericana",
    phone: "+507 775-4616",
    hours: "24/7",
    recommended: false,
  },
];

// ---------------- Sesiones de chat ----------------
export type ChatSession = {
  id: string;
  guardian: string;
  patient: string; // niño
  phone: string;
  triage: TriageLevel;
  attentionType: "Virtual" | "Presencial";
  aiSummary?: string;
  rating?: number; // 1..5
  lastMessage: string;
  time: string;
  startedAt: string;
  closedAt?: string;
  messages: {
    role: "acudiente" | "bot" | "sistema";
    text: string;
    time: string;
    type?: "texto" | "imagen" | "pdf";
    alerts?: string[];
  }[];
  status: "activa" | "esperando" | "cerrada";
  derivation: "appointment" | "home" | "emergency";
};

export const chatSessions: ChatSession[] = [
  {
    id: "SES-9001",
    guardian: "María Mendoza",
    patient: "Sofía Mendoza",
    phone: "+507 6123-4567",
    triage: "urgente",
    attentionType: "Virtual",
    aiSummary:
      "Fiebre persistente 39.5°C >12h sin respuesta a antipirético. Recomendada valoración pediátrica en 24h.",
    lastMessage: "Tiene fiebre de 39.5°C desde anoche...",
    time: "10:42",
    startedAt: "2026-05-06 10:38",
    status: "activa",
    messages: [
      {
        role: "acudiente",
        text: "Hola, mi hija tiene fiebre alta",
        time: "10:38",
      },
      {
        role: "bot",
        text: "Hola María. Lamento escuchar eso. ¿Cuál es la temperatura actual y desde cuándo comenzó?",
        time: "10:38",
      },
      {
        role: "acudiente",
        text: "Tiene fiebre de 39.5°C desde anoche, no baja con acetaminofén",
        time: "10:42",
        alerts: ["Fiebre alta sostenida"],
      },
      {
        role: "bot",
        text: "Voy a clasificar esto como URGENTE (amarillo). Te recomiendo valoración con pediatra hoy. ¿Quieres ver opciones cercanas en Ciudad de Panamá?",
        time: "10:42",
      },
    ],
    derivation: "appointment",
  },
  {
    id: "SES-9002",
    guardian: "Luis Quintero",
    patient: "Mateo Quintero",
    phone: "+507 6234-5678",
    triage: "general",
    attentionType: "Virtual",
    lastMessage: "Le salió un sarpullido en los brazos",
    time: "10:30",
    startedAt: "2026-05-06 10:28",
    status: "esperando",
    messages: [
      {
        role: "acudiente",
        text: "Buenas, le salió un sarpullido en los brazos",
        time: "10:28",
        type: "imagen",
      },
      {
        role: "bot",
        text: "Hola Luis. ¿Pica? ¿Hubo cambio de jabón o alimento reciente?",
        time: "10:30",
      },
    ],
    derivation: "appointment",
  },
  {
    id: "SES-9003",
    guardian: "Ana Castillo",
    patient: "Diego Castillo",
    phone: "+507 6456-7890",
    triage: "emergencia",
    attentionType: "Presencial",
    aiSummary:
      "Dificultad respiratoria con cianosis. EMERGENCIA. Derivado a 911 y a Urgencias Pediátricas Paitilla.",
    lastMessage: "Está respirando muy rápido y morado",
    time: "10:15",
    startedAt: "2026-05-06 10:14",
    status: "activa",
    messages: [
      {
        role: "acudiente",
        text: "AYUDA mi hijo está respirando muy rápido y morado",
        time: "10:14",
        alerts: ["Cianosis", "Dificultad respiratoria"],
      },
      {
        role: "bot",
        text: "🚨 EMERGENCIA (rojo). Llama al 911 ahora mismo. Te derivo a Urgencias Pediátricas — Centro Médico Paitilla.",
        time: "10:15",
      },
      {
        role: "sistema",
        text: "Derivación enviada al acudiente: Urgencias Pediátricas Paitilla (1.2 km).",
        time: "10:15",
      },
    ],
    derivation: "appointment",
  },
  {
    id: "SES-9004",
    guardian: "Patricia Herrera",
    patient: "Lucas Herrera",
    phone: "+507 6678-9012",
    triage: "general",
    attentionType: "Virtual",
    aiSummary:
      "Cuadro viral leve. Indicado lavado nasal + hidratación. Sin necesidad de derivación.",
    rating: 5,
    lastMessage: "Solo tiene mocos, sin fiebre",
    time: "09:50",
    startedAt: "2026-05-06 09:48",
    closedAt: "2026-05-06 09:55",
    status: "cerrada",
    messages: [
      {
        role: "acudiente",
        text: "Mi bebé tiene mocos hace dos días",
        time: "09:48",
      },
      {
        role: "bot",
        text: "¿Tiene fiebre, dificultad para respirar o no come?",
        time: "09:48",
      },
      {
        role: "acudiente",
        text: "Solo tiene mocos, sin fiebre",
        time: "09:50",
      },
      {
        role: "bot",
        text: "Cuadro viral leve. Lavados nasales con suero fisiológico e hidratación. Si aparece fiebre, vuelve a contactarnos.",
        time: "09:50",
      },
    ],
    derivation: "appointment",
  },
  {
    id: "SES-9005",
    guardian: "Jorge Vega",
    patient: "Camila Vega",
    phone: "+507 6789-0123",
    triage: "general",
    attentionType: "Virtual",
    aiSummary:
      "Probable otitis post-viral. Recomendada consulta presencial si dolor persiste >48h.",
    rating: 4,
    lastMessage: "Dolor de oído leve",
    time: "09:20",
    startedAt: "2026-05-06 09:18",
    closedAt: "2026-05-06 09:25",
    status: "cerrada",
    messages: [
      {
        role: "acudiente",
        text: "Camila se queja de dolor de oído",
        time: "09:18",
      },
      { role: "bot", text: "¿Tuvo gripe reciente? ¿Fiebre?", time: "09:19" },
      {
        role: "acudiente",
        text: "Tuvo gripe la semana pasada, sin fiebre ahora",
        time: "09:20",
      },
    ],
    derivation: "appointment",
  },
];

// ---------------- Pagos ----------------
export type Payment = {
  id: string; // identificador de transacción Stripe / Yappy
  guardian: string;
  amount: number;
  method: "Stripe" | "Yappy";
  plan: "Premium Mensual" | "Premium Anual" | "Sesión adicional";
  status: "confirmado" | "pendiente" | "fallido" | "reembolsado";
  date: string;
  providerResponse?: string;
  paymentType?: string;
};

export const payments: Payment[] = [
  {
    id: "pi_3OqA1bKx_001",
    guardian: "María Mendoza",
    amount: 9.99,
    method: "Stripe",
    plan: "Premium Mensual",
    status: "confirmado",
    date: "2026-05-06 10:45",
    providerResponse: "succeeded",
    paymentType: "Crédito",
  },
  {
    id: "yp_a98d2f12_002",
    guardian: "Luis Quintero",
    amount: 9.99,
    method: "Yappy",
    plan: "Premium Mensual",
    status: "confirmado",
    date: "2026-05-06 10:32",
    providerResponse: "ok",
    paymentType: "Crédito",
  },
  {
    id: "pi_3OqA2cKx_003",
    guardian: "Ana Castillo",
    amount: 9.99,
    method: "Stripe",
    plan: "Premium Mensual",
    status: "confirmado",
    date: "2026-05-06 10:18",
    providerResponse: "succeeded",
    paymentType: "Crédito",
  },
  {
    id: "yp_b12e44a1_004",
    guardian: "Carmen Rodríguez",
    amount: 89.99,
    method: "Yappy",
    plan: "Premium Anual",
    status: "pendiente",
    date: "2026-05-06 09:55",
    providerResponse: "pending_user_confirmation",
    paymentType: "Crédito",
  },
  {
    id: "pi_3OqA3dKx_005",
    guardian: "Roberto Pérez",
    amount: 9.99,
    method: "Stripe",
    plan: "Premium Mensual",
    status: "fallido",
    date: "2026-05-06 09:30",
    providerResponse: "card_declined",
    paymentType: "Crédito",
  },
  {
    id: "yp_c77f88b2_006",
    guardian: "Patricia Herrera",
    amount: 9.99,
    method: "Yappy",
    plan: "Premium Mensual",
    status: "confirmado",
    date: "2026-05-06 09:20",
    providerResponse: "ok",
    paymentType: "Crédito",
  },
  {
    id: "pi_3OqA4eKx_007",
    guardian: "Jorge Vega",
    amount: 89.99,
    method: "Stripe",
    plan: "Premium Anual",
    status: "confirmado",
    date: "2026-05-05 18:10",
    providerResponse: "succeeded",
    paymentType: "Crédito",
  },
  {
    id: "yp_d22a11c3_008",
    guardian: "Laura Ortiz",
    amount: 9.99,
    method: "Yappy",
    plan: "Premium Mensual",
    status: "reembolsado",
    date: "2026-05-05 16:42",
    providerResponse: "refunded",
    paymentType: "Crédito",
  },
];

// ---------------- Catálogo de medicamentos ----------------
export type MedicationCategory =
  | "Analgésico"
  | "Antipirético"
  | "Antihistamínico"
  | "Antibiótico"
  | "Antitusivo"
  | "Otros";

export type Medication = {
  id: string;
  name: string;
  genericName: string;
  brand?: string;
  category: MedicationCategory;
  status: "disponible" | "descontinuado";
  recommendable: boolean;
  dosePerKg?: string; // ej. "10-15 mg/kg c/6h"
  notes?: string;
};

export const medications: Medication[] = [
  {
    id: "MED-01",
    name: "Acetaminofén",
    genericName: "Paracetamol",
    brand: "Tempra",
    category: "Antipirético",
    status: "disponible",
    recommendable: true,
    dosePerKg: "10-15 mg/kg cada 6h",
    notes: "Máx. 60 mg/kg/día",
  },
  {
    id: "MED-02",
    name: "Ibuprofeno",
    genericName: "Ibuprofeno",
    brand: "Advil Niños",
    category: "Analgésico",
    status: "disponible",
    recommendable: true,
    dosePerKg: "5-10 mg/kg cada 8h",
    notes: "Con alimentos. >6 meses",
  },
  {
    id: "MED-03",
    name: "Loratadina",
    genericName: "Loratadina",
    category: "Antihistamínico",
    status: "disponible",
    recommendable: true,
    dosePerKg: "0.2 mg/kg/día",
    notes: ">2 años",
  },
  {
    id: "MED-04",
    name: "Suero fisiológico nasal",
    genericName: "Cloruro de sodio 0.9%",
    category: "Otros",
    status: "disponible",
    recommendable: true,
    notes: "Higiene nasal, sin restricción de edad",
  },
  {
    id: "MED-05",
    name: "Sales de rehidratación oral",
    genericName: "SRO OMS",
    brand: "Pedialyte",
    category: "Otros",
    status: "disponible",
    recommendable: true,
    notes: "Diarrea/deshidratación leve",
  },
  {
    id: "MED-06",
    name: "Difenhidramina",
    genericName: "Difenhidramina",
    category: "Antihistamínico",
    status: "descontinuado",
    recommendable: false,
    notes: "Retirado del catálogo: sedación",
  },
  {
    id: "MED-07",
    name: "Amoxicilina",
    genericName: "Amoxicilina",
    category: "Antibiótico",
    status: "disponible",
    recommendable: false,
    notes: "Solo bajo prescripción médica",
  },
];

// ---------------- Auditoría ----------------
export type AuditLog = {
  id: string;
  date: string;
  user: string;
  role: "Admin" | "Médico";
  action: string;
  resource: string;
  ip: string;
  severity: "info" | "advertencia" | "critico";
};

export const auditLogs: AuditLog[] = [
  {
    id: "LOG-7821",
    date: "2026-05-06 10:48",
    user: "esanchez@lucera.pa",
    role: "Médico",
    action: "Acceso historial clínico",
    resource: "Niño N-1 (Sofía M.)",
    ip: "200.46.12.45",
    severity: "info",
  },
  {
    id: "LOG-7822",
    date: "2026-05-06 10:44",
    user: "admin@lucera.pa",
    role: "Admin",
    action: "Edición de médico",
    resource: "Médico M-203",
    ip: "200.46.12.10",
    severity: "advertencia",
  },
  {
    id: "LOG-7823",
    date: "2026-05-06 10:30",
    user: "desconocido",
    role: "Admin",
    action: "Intento fallido de login (3x)",
    resource: "/login",
    ip: "186.10.55.221",
    severity: "critico",
  },
  {
    id: "LOG-7824",
    date: "2026-05-06 10:15",
    user: "esanchez@lucera.pa",
    role: "Médico",
    action: "Revisión sesión emergencia",
    resource: "Sesión SES-9003",
    ip: "200.46.12.45",
    severity: "info",
  },
  {
    id: "LOG-7825",
    date: "2026-05-06 09:55",
    user: "admin@lucera.pa",
    role: "Admin",
    action: "Exportación reporte planes",
    resource: "Reporte mensual",
    ip: "200.46.12.30",
    severity: "info",
  },
  {
    id: "LOG-7826",
    date: "2026-05-06 09:42",
    user: "admin@lucera.pa",
    role: "Admin",
    action: "Configuración MFA actualizada",
    resource: "Sistema",
    ip: "200.46.12.10",
    severity: "advertencia",
  },
  {
    id: "LOG-7827",
    date: "2026-05-06 09:20",
    user: "apinilla@lucera.pa",
    role: "Médico",
    action: "Marca disponibilidad",
    resource: "Calendario",
    ip: "200.46.12.88",
    severity: "info",
  },
  {
    id: "LOG-7828",
    date: "2026-05-06 08:45",
    user: "desconocido",
    role: "Admin",
    action: "Acceso denegado: rol insuficiente",
    resource: "/api/medicos",
    ip: "172.20.10.5",
    severity: "critico",
  },
];

// ---------------- Disponibilidad médicos ----------------
export type Availability = {
  date: string;
  startHour: string;
  finishHour: string;
  specialistName: string;
  status: "disponible" | "reservado" | "cancelado";
  mode?: ConsultationMode;
};

const today = new Date();
const formatDate = (d: Date) => d.toISOString().slice(0, 10);
export const availability: Availability[] = [
  {
    date: formatDate(today),
    startHour: "08:00",
    finishHour: "10:00",
    specialistName: "Dra. Elena Sánchez",
    status: "reservado",
    mode: "Virtual",
  },
  {
    date: formatDate(today),
    startHour: "08:00",
    finishHour: "10:00",
    specialistName: "Dra. Elena Sánchez",
    status: "disponible",
    mode: "Virtual",
  },
  {
    date: formatDate(today),
    startHour: "08:00",
    finishHour: "10:00",
    specialistName: "Dr. Carlos Arosemena",
    status: "reservado",
    mode: "Presencial",
  },
  {
    date: formatDate(today),
    startHour: "08:00",
    finishHour: "10:00",
    specialistName: "Dr. Andrés Pinilla",
    status: "disponible",
    mode: "Ambas",
  },
  {
    date: formatDate(today),
    startHour: "08:00",
    finishHour: "10:00",
    specialistName: "Dra. Rocío Batista",
    status: "cancelado",
    mode: "Virtual",
  },
  {
    date: formatDate(today),
    startHour: "08:00",
    finishHour: "10:00",
    specialistName: "Dra. Rocío Batista",
    status: "disponible",
    mode: "Virtual",
  },
  {
    date: formatDate(new Date(today.getTime() + 86400000)),
    startHour: "08:00",
    finishHour: "10:00",
    specialistName: "Dra. Elena Sánchez",
    status: "disponible",
    mode: "Virtual",
  },
  {
    date: formatDate(new Date(today.getTime() + 86400000)),
    startHour: "08:00",
    finishHour: "10:00",
    specialistName: "Dr. Andrés Pinilla",
    status: "reservado",
    mode: "Presencial",
  },
  {
    date: formatDate(new Date(today.getTime() + 86400000)),
    startHour: "08:00",
    finishHour: "10:00",
    specialistName: "Dr. Carlos Arosemena",
    status: "disponible",
    mode: "Presencial",
  },
  {
    date: formatDate(new Date(today.getTime() + 2 * 86400000)),
    startHour: "08:00",
    finishHour: "10:00",
    specialistName: "Dra. Rocío Batista",
    status: "disponible",
    mode: "Virtual",
  },
  {
    date: formatDate(new Date(today.getTime() + 2 * 86400000)),
    startHour: "08:00",
    finishHour: "10:00",
    specialistName: "Dra. Elena Sánchez",
    status: "disponible",
    mode: "Ambas",
  },
];

// KPIs principales (basados en informe Apollo)
export const generalKpis = {
  activeGuardians: 3439,
  registeredChildren: 4127,
  sessionsThisMonth: 1018,
  premiumConversion: 17.4, // %
  csat: 92, // % satisfacción ≥4/5
  emergenciesDetected: 98,
  inPersonReferrals: 750,
  revenueThisMonth: 6_482.1, // USD
};
