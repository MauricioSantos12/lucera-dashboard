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
export const sesionesPorMes = [
  { mes: "Nov", sesiones: 420, premium: 38 },
  { mes: "Dic", sesiones: 510, premium: 52 },
  { mes: "Ene", sesiones: 612, premium: 71 },
  { mes: "Feb", sesiones: 705, premium: 88 },
  { mes: "Mar", sesiones: 822, premium: 112 },
  { mes: "Abr", sesiones: 940, premium: 138 },
  { mes: "May", sesiones: 1018, premium: 161 },
];
// alias retro-compat
export const consultasPorMes = sesionesPorMes.map((s) => ({
  mes: s.mes,
  consultas: s.sesiones,
  satisfaccion: 88 + Math.round(s.premium / 25),
}));

export const triajeStats = [
  { nivel: "General", value: 1860, color: "hsl(var(--triage-self))" },
  { nivel: "Urgente", value: 612, color: "hsl(var(--triage-priority))" },
  { nivel: "Emergencia", value: 98, color: "hsl(var(--triage-emergency))" },
];

// CSAT calificación 1-5 al cerrar sesión (mostrado como % satisfacción ≥4)
export const csatTrend = [
  { semana: "S1", csat: 84 },
  { semana: "S2", csat: 86 },
  { semana: "S3", csat: 88 },
  { semana: "S4", csat: 87 },
  { semana: "S5", csat: 90 },
  { semana: "S6", csat: 91 },
  { semana: "S7", csat: 90 },
  { semana: "S8", csat: 92 },
];

// Distribución por plan
export const planesDistribucion = [
  { plan: "Gratuito", usuarios: 2840, color: "hsl(var(--triage-self))" },
  { plan: "Premium Mensual", usuarios: 412, color: "hsl(var(--accent))" },
  { plan: "Premium Anual", usuarios: 187, color: "hsl(var(--primary))" },
];

// Tipo de atención al cerrar la sesión
export const tipoAtencion = [
  { tipo: "Virtual (cerrada en chat)", value: 1820 },
  { tipo: "Derivada a presencial", value: 750 },
];

// ---------------- Acudientes y pacientes pediátricos ----------------
export type Relacion = "Madre" | "Padre" | "Tutor" | "Abuelo/a";
export type EstadoCuenta = "activa" | "suspendida" | "baja";

export type NinoPaciente = {
  id: string;
  nombre: string;
  fechaNacimiento: string; // YYYY-MM-DD
  tipoSangre?: "A+" | "A-" | "B+" | "B-" | "AB+" | "AB-" | "O+" | "O-";
  pesoKg?: number;
  condiciones?: string[];
  alergias?: string[];
};

export type Acudiente = {
  id: string;
  telefono: string; // identificador principal
  email: string;
  nombre: string;
  relacion: Relacion;
  ciudad: string;
  estado: EstadoCuenta;
  plan: "Gratuito" | "Premium Mensual" | "Premium Anual";
  registrado: string;
  ninos: NinoPaciente[];
};

export const acudientes: Acudiente[] = [
  {
    id: "ID-002",
    telefono: "+507 6123-4567",
    email: "maria.mendoza@gmail.com",
    nombre: "María Mendoza",
    relacion: "Madre",
    ciudad: "Ciudad de Panamá",
    estado: "activa",
    plan: "Premium Mensual",
    registrado: "2025-11-12",
    ninos: [
      {
        id: "N-1",
        nombre: "Sofía Mendoza",
        fechaNacimiento: "2019-03-14",
        tipoSangre: "O+",
        pesoKg: 22,
        alergias: ["Penicilina"],
      },
    ],
  },
  {
    id: "ID-003",
    telefono: "+507 6234-5678",
    email: "lquintero@hotmail.com",
    nombre: "Luis Quintero",
    relacion: "Padre",
    ciudad: "San Miguelito",
    estado: "activa",
    plan: "Gratuito",
    registrado: "2026-02-03",
    ninos: [
      {
        id: "N-2",
        nombre: "Mateo Quintero",
        fechaNacimiento: "2021-08-22",
        pesoKg: 16,
      },
      {
        id: "N-3",
        nombre: "Camila Quintero",
        fechaNacimiento: "2024-01-09",
        pesoKg: 9,
      },
    ],
  },
  {
    id: "ID-004",
    telefono: "+507 6345-6789",
    email: "carmen.r@yahoo.com",
    nombre: "Carmen Rodríguez",
    relacion: "Madre",
    ciudad: "David",
    estado: "activa",
    plan: "Premium Anual",
    registrado: "2025-09-21",
    ninos: [
      {
        id: "N-4",
        nombre: "Isabella Rodríguez",
        fechaNacimiento: "2017-05-30",
        tipoSangre: "A+",
        pesoKg: 28,
        alergias: ["Maní", "Mariscos"],
        condiciones: ["Asma leve"],
      },
    ],
  },
  {
    id: "ID-005",
    telefono: "+507 6456-7890",
    email: "ana.castillo@gmail.com",
    nombre: "Ana Castillo",
    relacion: "Madre",
    ciudad: "Colón",
    estado: "activa",
    plan: "Premium Mensual",
    registrado: "2026-01-15",
    ninos: [
      {
        id: "N-5",
        nombre: "Diego Castillo",
        fechaNacimiento: "2022-06-11",
        pesoKg: 14,
        condiciones: ["Bronquiolitis recurrente"],
      },
    ],
  },
  {
    id: "ID-006",
    telefono: "+507 6567-8901",
    email: "rperez@gmail.com",
    nombre: "Roberto Pérez",
    relacion: "Padre",
    ciudad: "Santiago",
    estado: "suspendida",
    plan: "Gratuito",
    registrado: "2025-08-04",
    ninos: [
      {
        id: "N-6",
        nombre: "Valentina Pérez",
        fechaNacimiento: "2016-02-18",
        pesoKg: 30,
      },
    ],
  },
  {
    id: "ID-007",
    telefono: "+507 6678-9012",
    email: "patricia.h@gmail.com",
    nombre: "Patricia Herrera",
    relacion: "Madre",
    ciudad: "Ciudad de Panamá",
    estado: "activa",
    plan: "Premium Mensual",
    registrado: "2026-03-02",
    ninos: [
      {
        id: "N-7",
        nombre: "Lucas Herrera",
        fechaNacimiento: "2023-10-05",
        pesoKg: 12,
        alergias: ["Lactosa"],
      },
    ],
  },
  {
    id: "ID-008",
    telefono: "+507 6789-0123",
    email: "jorge.vega@gmail.com",
    nombre: "Jorge Vega",
    relacion: "Padre",
    ciudad: "La Chorrera",
    estado: "activa",
    plan: "Premium Anual",
    registrado: "2025-07-19",
    ninos: [
      {
        id: "N-8",
        nombre: "Camila Vega",
        fechaNacimiento: "2018-09-01",
        tipoSangre: "B+",
        pesoKg: 24,
      },
    ],
  },
  {
    id: "ID-009",
    telefono: "+507 6123-4567",
    email: "maria.mendoza@gmail.com",
    nombre: "María Mendoza",
    relacion: "Madre",
    ciudad: "Ciudad de Panamá",
    estado: "activa",
    plan: "Premium Mensual",
    registrado: "2025-11-12",
    ninos: [
      {
        id: "N-1",
        nombre: "Sofía Mendoza",
        fechaNacimiento: "2019-03-14",
        tipoSangre: "O+",
        pesoKg: 22,
        alergias: ["Penicilina"],
      },
    ],
  },
  {
    id: "ID-010",
    telefono: "+507 6234-5678",
    email: "lquintero@hotmail.com",
    nombre: "Luis Quintero",
    relacion: "Padre",
    ciudad: "San Miguelito",
    estado: "activa",
    plan: "Gratuito",
    registrado: "2026-02-03",
    ninos: [
      {
        id: "N-2",
        nombre: "Mateo Quintero",
        fechaNacimiento: "2021-08-22",
        pesoKg: 16,
      },
      {
        id: "N-3",
        nombre: "Camila Quintero",
        fechaNacimiento: "2024-01-09",
        pesoKg: 9,
      },
    ],
  },
  {
    id: "ID-011",
    telefono: "+507 6345-6789",
    email: "carmen.r@yahoo.com",
    nombre: "Carmen Rodríguez",
    relacion: "Madre",
    ciudad: "David",
    estado: "activa",
    plan: "Premium Anual",
    registrado: "2025-09-21",
    ninos: [
      {
        id: "N-4",
        nombre: "Isabella Rodríguez",
        fechaNacimiento: "2017-05-30",
        tipoSangre: "A+",
        pesoKg: 28,
        alergias: ["Maní", "Mariscos"],
        condiciones: ["Asma leve"],
      },
    ],
  },
  {
    id: "ID-012",
    telefono: "+507 6456-7890",
    email: "ana.castillo@gmail.com",
    nombre: "Ana Castillo",
    relacion: "Madre",
    ciudad: "Colón",
    estado: "activa",
    plan: "Premium Mensual",
    registrado: "2026-01-15",
    ninos: [
      {
        id: "N-5",
        nombre: "Diego Castillo",
        fechaNacimiento: "2022-06-11",
        pesoKg: 14,
        condiciones: ["Bronquiolitis recurrente"],
      },
    ],
  },
  {
    id: "ID-013",
    telefono: "+507 6567-8901",
    email: "rperez@gmail.com",
    nombre: "Roberto Pérez",
    relacion: "Padre",
    ciudad: "Santiago",
    estado: "suspendida",
    plan: "Gratuito",
    registrado: "2025-08-04",
    ninos: [
      {
        id: "N-6",
        nombre: "Valentina Pérez",
        fechaNacimiento: "2016-02-18",
        pesoKg: 30,
      },
    ],
  },
  {
    id: "ID-014",
    telefono: "+507 6678-9012",
    email: "patricia.h@gmail.com",
    nombre: "Patricia Herrera",
    relacion: "Madre",
    ciudad: "Ciudad de Panamá",
    estado: "activa",
    plan: "Premium Mensual",
    registrado: "2026-03-02",
    ninos: [
      {
        id: "N-7",
        nombre: "Lucas Herrera",
        fechaNacimiento: "2023-10-05",
        pesoKg: 12,
        alergias: ["Lactosa"],
      },
    ],
  },
  {
    id: "ID-015",
    telefono: "+507 6789-0123",
    email: "jorge.vega@gmail.com",
    nombre: "Jorge Vega",
    relacion: "Padre",
    ciudad: "La Chorrera",
    estado: "activa",
    plan: "Premium Anual",
    registrado: "2025-07-19",
    ninos: [
      {
        id: "N-8",
        nombre: "Camila Vega",
        fechaNacimiento: "2018-09-01",
        tipoSangre: "B+",
        pesoKg: 24,
      },
    ],
  },
];

// alias retro-compat (Pacientes legacy mapeado al primer niño)
export type Paciente = {
  id: string;
  nombre: string;
  cedula: string;
  edad: number;
  tutor: string;
  telefono: string;
  estado: "activo" | "suspendido" | "pendiente";
  ultimaConsulta: string;
};
export const pacientes: Paciente[] = acudientes.map((a) => {
  const n = a.ninos[0];
  const edad = Math.floor(
    (Date.now() - new Date(n.fechaNacimiento).getTime()) / (365.25 * 86400000)
  );
  return {
    id: a.id.replace("AC-", "P-"),
    nombre: n.nombre,
    cedula: `8-PI-${n.fechaNacimiento.slice(2, 4)}-${a.id.slice(-4)}`,
    edad,
    tutor: a.nombre,
    telefono: a.telefono,
    estado:
      a.estado === "activa"
        ? "activo"
        : a.estado === "suspendida"
        ? "suspendido"
        : "pendiente",
    ultimaConsulta: a.registrado,
  };
});

// ---------------- Médicos ----------------
export type Modalidad = "Virtual" | "Presencial" | "Ambas";

export type Medico = {
  id: string;
  nombre: string;
  especialidad: string;
  licencia: string; // número de idoneidad
  email: string;
  modalidad: Modalidad;
  hospitales: string[];
  estado: "activo" | "vacaciones" | "inactivo";
  consultasMes: number;
  horarios: string; // resumen
};

export const medicos: Medico[] = [
  {
    id: "M-201",
    nombre: "Dra. Elena Sánchez",
    especialidad: "Pediatría General",
    licencia: "MINSA-12045",
    email: "esanchez@lucera.pa",
    modalidad: "Ambas",
    hospitales: ["Hospital del Niño", "Clínica Hospital San Fernando"],
    estado: "activo",
    consultasMes: 124,
    horarios: "Lun-Vie 08:00-14:00",
  },
  {
    id: "M-202",
    nombre: "Dr. Carlos Arosemena",
    especialidad: "Neonatología",
    licencia: "MINSA-09872",
    email: "carosemena@lucera.pa",
    modalidad: "Presencial",
    hospitales: ["Hospital Punta Pacífica"],
    estado: "activo",
    consultasMes: 87,
    horarios: "Mar-Sáb 09:00-15:00",
  },
  {
    id: "M-203",
    nombre: "Dra. Mariela De León",
    especialidad: "Pediatría General",
    licencia: "MINSA-15324",
    email: "mdeleon@lucera.pa",
    modalidad: "Virtual",
    hospitales: ["Centro Médico Paitilla"],
    estado: "vacaciones",
    consultasMes: 0,
    horarios: "Lun-Vie 14:00-20:00",
  },
  {
    id: "M-204",
    nombre: "Dr. Andrés Pinilla",
    especialidad: "Cardiología Pediátrica",
    licencia: "MINSA-11290",
    email: "apinilla@lucera.pa",
    modalidad: "Ambas",
    hospitales: ["Hospital del Niño"],
    estado: "activo",
    consultasMes: 56,
    horarios: "Mié-Vie 10:00-16:00",
  },
  {
    id: "M-205",
    nombre: "Dra. Rocío Batista",
    especialidad: "Dermatología Pediátrica",
    licencia: "MINSA-13478",
    email: "rbatista@lucera.pa",
    modalidad: "Virtual",
    hospitales: ["Clínica Hospital San Fernando"],
    estado: "activo",
    consultasMes: 92,
    horarios: "Lun-Jue 16:00-20:00",
  },
  {
    id: "M-206",
    nombre: "Dr. Hugo Saavedra",
    especialidad: "Gastroenterología Pediátrica",
    licencia: "MINSA-10567",
    email: "hsaavedra@lucera.pa",
    modalidad: "Presencial",
    hospitales: ["Hospital Punta Pacífica"],
    estado: "inactivo",
    consultasMes: 0,
    horarios: "—",
  },
];
// alias
export type Especialista = Medico & { registroIdoneidad: string };
export const especialistas: Especialista[] = medicos.map((m) => ({
  ...m,
  registroIdoneidad: m.licencia,
}));

// ---------------- Centros de atención ----------------
export type TipoCentro =
  | "Clínica"
  | "Hospital"
  | "Farmacia"
  | "Laboratorio"
  | "Urgencias";

export type Centro = {
  id: string;
  nombre: string;
  tipo: TipoCentro;
  ciudad: string;
  direccion: string;
  telefono: string;
  horarios: string;
  recomendado: boolean;
};

export const centros: Centro[] = [
  {
    id: "C-01",
    nombre: "Hospital del Niño Dr. José Renán Esquivel",
    tipo: "Hospital",
    ciudad: "Ciudad de Panamá",
    direccion: "Av. Balboa",
    telefono: "+507 512-9800",
    horarios: "24/7",
    recomendado: true,
  },
  {
    id: "C-02",
    nombre: "Clínica Hospital San Fernando",
    tipo: "Clínica",
    ciudad: "Ciudad de Panamá",
    direccion: "Vía España",
    telefono: "+507 305-6300",
    horarios: "24/7",
    recomendado: true,
  },
  {
    id: "C-03",
    nombre: "Hospital Punta Pacífica",
    tipo: "Hospital",
    ciudad: "Ciudad de Panamá",
    direccion: "Punta Pacífica",
    telefono: "+507 204-8000",
    horarios: "24/7",
    recomendado: true,
  },
  {
    id: "C-04",
    nombre: "Farmacia Arrocha — Multiplaza",
    tipo: "Farmacia",
    ciudad: "Ciudad de Panamá",
    direccion: "Multiplaza Pacific",
    telefono: "+507 302-5800",
    horarios: "Lun-Dom 07:00-23:00",
    recomendado: true,
  },
  {
    id: "C-05",
    nombre: "Laboratorio Clínico Hospital Nacional",
    tipo: "Laboratorio",
    ciudad: "Ciudad de Panamá",
    direccion: "Av. Cuba",
    telefono: "+507 207-8100",
    horarios: "Lun-Sáb 06:00-18:00",
    recomendado: false,
  },
  {
    id: "C-06",
    nombre: "Urgencias Pediátricas — Centro Médico Paitilla",
    tipo: "Urgencias",
    ciudad: "Ciudad de Panamá",
    direccion: "Calle 53 Este, Paitilla",
    telefono: "+507 265-8800",
    horarios: "24/7",
    recomendado: true,
  },
  {
    id: "C-07",
    nombre: "Hospital Mae Lewis",
    tipo: "Hospital",
    ciudad: "David",
    direccion: "Vía Panamericana",
    telefono: "+507 775-4616",
    horarios: "24/7",
    recomendado: false,
  },
];

// ---------------- Sesiones de chat ----------------
export type ChatSesion = {
  id: string;
  acudiente: string;
  paciente: string; // niño
  telefono: string;
  triaje: TriageLevel;
  tipoAtencion: "Virtual" | "Presencial";
  resumenIA?: string;
  calificacion?: number; // 1..5
  ultimoMensaje: string;
  hora: string;
  inicio: string;
  cierre?: string;
  mensajes: {
    rol: "acudiente" | "bot" | "sistema";
    texto: string;
    hora: string;
    tipo?: "texto" | "imagen" | "pdf";
    alertas?: string[];
  }[];
  estado: "activa" | "esperando" | "cerrada";
};

export const chats: ChatSesion[] = [
  {
    id: "SES-9001",
    acudiente: "María Mendoza",
    paciente: "Sofía Mendoza",
    telefono: "+507 6123-4567",
    triaje: "urgente",
    tipoAtencion: "Virtual",
    resumenIA:
      "Fiebre persistente 39.5°C >12h sin respuesta a antipirético. Recomendada valoración pediátrica en 24h.",
    ultimoMensaje: "Tiene fiebre de 39.5°C desde anoche...",
    hora: "10:42",
    inicio: "2026-05-06 10:38",
    estado: "activa",
    mensajes: [
      {
        rol: "acudiente",
        texto: "Hola, mi hija tiene fiebre alta",
        hora: "10:38",
      },
      {
        rol: "bot",
        texto:
          "Hola María. Lamento escuchar eso. ¿Cuál es la temperatura actual y desde cuándo comenzó?",
        hora: "10:38",
      },
      {
        rol: "acudiente",
        texto: "Tiene fiebre de 39.5°C desde anoche, no baja con acetaminofén",
        hora: "10:42",
        alertas: ["Fiebre alta sostenida"],
      },
      {
        rol: "bot",
        texto:
          "Voy a clasificar esto como URGENTE (amarillo). Te recomiendo valoración con pediatra hoy. ¿Quieres ver opciones cercanas en Ciudad de Panamá?",
        hora: "10:42",
      },
    ],
  },
  {
    id: "SES-9002",
    acudiente: "Luis Quintero",
    paciente: "Mateo Quintero",
    telefono: "+507 6234-5678",
    triaje: "general",
    tipoAtencion: "Virtual",
    ultimoMensaje: "Le salió un sarpullido en los brazos",
    hora: "10:30",
    inicio: "2026-05-06 10:28",
    estado: "esperando",
    mensajes: [
      {
        rol: "acudiente",
        texto: "Buenas, le salió un sarpullido en los brazos",
        hora: "10:28",
        tipo: "imagen",
      },
      {
        rol: "bot",
        texto: "Hola Luis. ¿Pica? ¿Hubo cambio de jabón o alimento reciente?",
        hora: "10:30",
      },
    ],
  },
  {
    id: "SES-9003",
    acudiente: "Ana Castillo",
    paciente: "Diego Castillo",
    telefono: "+507 6456-7890",
    triaje: "emergencia",
    tipoAtencion: "Presencial",
    resumenIA:
      "Dificultad respiratoria con cianosis. EMERGENCIA. Derivado a 911 y a Urgencias Pediátricas Paitilla.",
    ultimoMensaje: "Está respirando muy rápido y morado",
    hora: "10:15",
    inicio: "2026-05-06 10:14",
    estado: "activa",
    mensajes: [
      {
        rol: "acudiente",
        texto: "AYUDA mi hijo está respirando muy rápido y morado",
        hora: "10:14",
        alertas: ["Cianosis", "Dificultad respiratoria"],
      },
      {
        rol: "bot",
        texto:
          "🚨 EMERGENCIA (rojo). Llama al 911 ahora mismo. Te derivo a Urgencias Pediátricas — Centro Médico Paitilla.",
        hora: "10:15",
      },
      {
        rol: "sistema",
        texto:
          "Derivación enviada al acudiente: Urgencias Pediátricas Paitilla (1.2 km).",
        hora: "10:15",
      },
    ],
  },
  {
    id: "SES-9004",
    acudiente: "Patricia Herrera",
    paciente: "Lucas Herrera",
    telefono: "+507 6678-9012",
    triaje: "general",
    tipoAtencion: "Virtual",
    resumenIA:
      "Cuadro viral leve. Indicado lavado nasal + hidratación. Sin necesidad de derivación.",
    calificacion: 5,
    ultimoMensaje: "Solo tiene mocos, sin fiebre",
    hora: "09:50",
    inicio: "2026-05-06 09:48",
    cierre: "2026-05-06 09:55",
    estado: "cerrada",
    mensajes: [
      {
        rol: "acudiente",
        texto: "Mi bebé tiene mocos hace dos días",
        hora: "09:48",
      },
      {
        rol: "bot",
        texto: "¿Tiene fiebre, dificultad para respirar o no come?",
        hora: "09:48",
      },
      {
        rol: "acudiente",
        texto: "Solo tiene mocos, sin fiebre",
        hora: "09:50",
      },
      {
        rol: "bot",
        texto:
          "Cuadro viral leve. Lavados nasales con suero fisiológico e hidratación. Si aparece fiebre, vuelve a contactarnos.",
        hora: "09:50",
      },
    ],
  },
  {
    id: "SES-9005",
    acudiente: "Jorge Vega",
    paciente: "Camila Vega",
    telefono: "+507 6789-0123",
    triaje: "general",
    tipoAtencion: "Virtual",
    resumenIA:
      "Probable otitis post-viral. Recomendada consulta presencial si dolor persiste >48h.",
    calificacion: 4,
    ultimoMensaje: "Dolor de oído leve",
    hora: "09:20",
    inicio: "2026-05-06 09:18",
    cierre: "2026-05-06 09:25",
    estado: "cerrada",
    mensajes: [
      {
        rol: "acudiente",
        texto: "Camila se queja de dolor de oído",
        hora: "09:18",
      },
      { rol: "bot", texto: "¿Tuvo gripe reciente? ¿Fiebre?", hora: "09:19" },
      {
        rol: "acudiente",
        texto: "Tuvo gripe la semana pasada, sin fiebre ahora",
        hora: "09:20",
      },
    ],
  },
];

// ---------------- Pagos ----------------
export type Pago = {
  id: string; // identificador de transacción Stripe / Yappy
  acudiente: string;
  monto: number;
  metodo: "Stripe" | "Yappy";
  plan: "Premium Mensual" | "Premium Anual" | "Sesión adicional";
  estado: "confirmado" | "pendiente" | "fallido" | "reembolsado";
  fecha: string;
  respuestaProveedor?: string;
  tipoPago?: string;
};

export const pagos: Pago[] = [
  {
    id: "pi_3OqA1bKx_001",
    acudiente: "María Mendoza",
    monto: 9.99,
    metodo: "Stripe",
    plan: "Premium Mensual",
    estado: "confirmado",
    fecha: "2026-05-06 10:45",
    respuestaProveedor: "succeeded",
    tipoPago: "Crédito",
  },
  {
    id: "yp_a98d2f12_002",
    acudiente: "Luis Quintero",
    monto: 9.99,
    metodo: "Yappy",
    plan: "Premium Mensual",
    estado: "confirmado",
    fecha: "2026-05-06 10:32",
    respuestaProveedor: "ok",
    tipoPago: "Crédito",
  },
  {
    id: "pi_3OqA2cKx_003",
    acudiente: "Ana Castillo",
    monto: 9.99,
    metodo: "Stripe",
    plan: "Premium Mensual",
    estado: "confirmado",
    fecha: "2026-05-06 10:18",
    respuestaProveedor: "succeeded",
    tipoPago: "Crédito",
  },
  {
    id: "yp_b12e44a1_004",
    acudiente: "Carmen Rodríguez",
    monto: 89.99,
    metodo: "Yappy",
    plan: "Premium Anual",
    estado: "pendiente",
    fecha: "2026-05-06 09:55",
    respuestaProveedor: "pending_user_confirmation",
    tipoPago: "Crédito",
  },
  {
    id: "pi_3OqA3dKx_005",
    acudiente: "Roberto Pérez",
    monto: 9.99,
    metodo: "Stripe",
    plan: "Premium Mensual",
    estado: "fallido",
    fecha: "2026-05-06 09:30",
    respuestaProveedor: "card_declined",
    tipoPago: "Crédito",
  },
  {
    id: "yp_c77f88b2_006",
    acudiente: "Patricia Herrera",
    monto: 9.99,
    metodo: "Yappy",
    plan: "Premium Mensual",
    estado: "confirmado",
    fecha: "2026-05-06 09:20",
    respuestaProveedor: "ok",
    tipoPago: "Crédito",
  },
  {
    id: "pi_3OqA4eKx_007",
    acudiente: "Jorge Vega",
    monto: 89.99,
    metodo: "Stripe",
    plan: "Premium Anual",
    estado: "confirmado",
    fecha: "2026-05-05 18:10",
    respuestaProveedor: "succeeded",
    tipoPago: "Crédito",
  },
  {
    id: "yp_d22a11c3_008",
    acudiente: "Laura Ortiz",
    monto: 9.99,
    metodo: "Yappy",
    plan: "Premium Mensual",
    estado: "reembolsado",
    fecha: "2026-05-05 16:42",
    respuestaProveedor: "refunded",
    tipoPago: "Crédito",
  },
];

// ---------------- Catálogo de medicamentos ----------------
export type Categoria =
  | "Analgésico"
  | "Antipirético"
  | "Antihistamínico"
  | "Antibiótico"
  | "Antitusivo"
  | "Otros";

export type Medicamento = {
  id: string;
  nombre: string;
  generico: string;
  marca?: string;
  categoria: Categoria;
  estado: "disponible" | "descontinuado";
  recomendable: boolean;
  dosisPorKg?: string; // ej. "10-15 mg/kg c/6h"
  notas?: string;
};

export const medicamentos: Medicamento[] = [
  {
    id: "MED-01",
    nombre: "Acetaminofén",
    generico: "Paracetamol",
    marca: "Tempra",
    categoria: "Antipirético",
    estado: "disponible",
    recomendable: true,
    dosisPorKg: "10-15 mg/kg cada 6h",
    notas: "Máx. 60 mg/kg/día",
  },
  {
    id: "MED-02",
    nombre: "Ibuprofeno",
    generico: "Ibuprofeno",
    marca: "Advil Niños",
    categoria: "Analgésico",
    estado: "disponible",
    recomendable: true,
    dosisPorKg: "5-10 mg/kg cada 8h",
    notas: "Con alimentos. >6 meses",
  },
  {
    id: "MED-03",
    nombre: "Loratadina",
    generico: "Loratadina",
    categoria: "Antihistamínico",
    estado: "disponible",
    recomendable: true,
    dosisPorKg: "0.2 mg/kg/día",
    notas: ">2 años",
  },
  {
    id: "MED-04",
    nombre: "Suero fisiológico nasal",
    generico: "Cloruro de sodio 0.9%",
    categoria: "Otros",
    estado: "disponible",
    recomendable: true,
    notas: "Higiene nasal, sin restricción de edad",
  },
  {
    id: "MED-05",
    nombre: "Sales de rehidratación oral",
    generico: "SRO OMS",
    marca: "Pedialyte",
    categoria: "Otros",
    estado: "disponible",
    recomendable: true,
    notas: "Diarrea/deshidratación leve",
  },
  {
    id: "MED-06",
    nombre: "Difenhidramina",
    generico: "Difenhidramina",
    categoria: "Antihistamínico",
    estado: "descontinuado",
    recomendable: false,
    notas: "Retirado del catálogo: sedación",
  },
  {
    id: "MED-07",
    nombre: "Amoxicilina",
    generico: "Amoxicilina",
    categoria: "Antibiótico",
    estado: "disponible",
    recomendable: false,
    notas: "Solo bajo prescripción médica",
  },
];

// ---------------- Auditoría ----------------
export type LogAuditoria = {
  id: string;
  fecha: string;
  usuario: string;
  rol: "Admin" | "Médico";
  accion: string;
  recurso: string;
  ip: string;
  severidad: "info" | "advertencia" | "critico";
};

export const logs: LogAuditoria[] = [
  {
    id: "LOG-7821",
    fecha: "2026-05-06 10:48",
    usuario: "esanchez@lucera.pa",
    rol: "Médico",
    accion: "Acceso historial clínico",
    recurso: "Niño N-1 (Sofía M.)",
    ip: "200.46.12.45",
    severidad: "info",
  },
  {
    id: "LOG-7822",
    fecha: "2026-05-06 10:44",
    usuario: "admin@lucera.pa",
    rol: "Admin",
    accion: "Edición de médico",
    recurso: "Médico M-203",
    ip: "200.46.12.10",
    severidad: "advertencia",
  },
  {
    id: "LOG-7823",
    fecha: "2026-05-06 10:30",
    usuario: "desconocido",
    rol: "Admin",
    accion: "Intento fallido de login (3x)",
    recurso: "/login",
    ip: "186.10.55.221",
    severidad: "critico",
  },
  {
    id: "LOG-7824",
    fecha: "2026-05-06 10:15",
    usuario: "esanchez@lucera.pa",
    rol: "Médico",
    accion: "Revisión sesión emergencia",
    recurso: "Sesión SES-9003",
    ip: "200.46.12.45",
    severidad: "info",
  },
  {
    id: "LOG-7825",
    fecha: "2026-05-06 09:55",
    usuario: "admin@lucera.pa",
    rol: "Admin",
    accion: "Exportación reporte planes",
    recurso: "Reporte mensual",
    ip: "200.46.12.30",
    severidad: "info",
  },
  {
    id: "LOG-7826",
    fecha: "2026-05-06 09:42",
    usuario: "admin@lucera.pa",
    rol: "Admin",
    accion: "Configuración MFA actualizada",
    recurso: "Sistema",
    ip: "200.46.12.10",
    severidad: "advertencia",
  },
  {
    id: "LOG-7827",
    fecha: "2026-05-06 09:20",
    usuario: "apinilla@lucera.pa",
    rol: "Médico",
    accion: "Marca disponibilidad",
    recurso: "Calendario",
    ip: "200.46.12.88",
    severidad: "info",
  },
  {
    id: "LOG-7828",
    fecha: "2026-05-06 08:45",
    usuario: "desconocido",
    rol: "Admin",
    accion: "Acceso denegado: rol insuficiente",
    recurso: "/api/medicos",
    ip: "172.20.10.5",
    severidad: "critico",
  },
];

// ---------------- Disponibilidad médicos ----------------
export type Disponibilidad = {
  fecha: string;
  startHour: string;
  finishHour: string;
  especialista: string;
  estado: "disponible" | "reservado" | "cancelado";
  modalidad?: Modalidad;
};

const today = new Date();
const fmt = (d: Date) => d.toISOString().slice(0, 10);
export const disponibilidad: Disponibilidad[] = [
  {
    fecha: fmt(today),
    startHour: "08:00",
    finishHour: "10:00",
    especialista: "Dra. Elena Sánchez",
    estado: "reservado",
    modalidad: "Virtual",
  },
  {
    fecha: fmt(today),
    startHour: "08:00",
    finishHour: "10:00",
    especialista: "Dra. Elena Sánchez",
    estado: "disponible",
    modalidad: "Virtual",
  },
  {
    fecha: fmt(today),
    startHour: "08:00",
    finishHour: "10:00",
    especialista: "Dr. Carlos Arosemena",
    estado: "reservado",
    modalidad: "Presencial",
  },
  {
    fecha: fmt(today),
    startHour: "08:00",
    finishHour: "10:00",
    especialista: "Dr. Andrés Pinilla",
    estado: "disponible",
    modalidad: "Ambas",
  },
  {
    fecha: fmt(today),
    startHour: "08:00",
    finishHour: "10:00",
    especialista: "Dra. Rocío Batista",
    estado: "cancelado",
    modalidad: "Virtual",
  },
  {
    fecha: fmt(today),
    startHour: "08:00",
    finishHour: "10:00",
    especialista: "Dra. Rocío Batista",
    estado: "disponible",
    modalidad: "Virtual",
  },
  {
    fecha: fmt(new Date(today.getTime() + 86400000)),
    startHour: "08:00",
    finishHour: "10:00",
    especialista: "Dra. Elena Sánchez",
    estado: "disponible",
    modalidad: "Virtual",
  },
  {
    fecha: fmt(new Date(today.getTime() + 86400000)),
    startHour: "08:00",
    finishHour: "10:00",
    especialista: "Dr. Andrés Pinilla",
    estado: "reservado",
    modalidad: "Presencial",
  },
  {
    fecha: fmt(new Date(today.getTime() + 86400000)),
    startHour: "08:00",
    finishHour: "10:00",
    especialista: "Dr. Carlos Arosemena",
    estado: "disponible",
    modalidad: "Presencial",
  },
  {
    fecha: fmt(new Date(today.getTime() + 2 * 86400000)),
    startHour: "08:00",
    finishHour: "10:00",
    especialista: "Dra. Rocío Batista",
    estado: "disponible",
    modalidad: "Virtual",
  },
  {
    fecha: fmt(new Date(today.getTime() + 2 * 86400000)),
    startHour: "08:00",
    finishHour: "10:00",
    especialista: "Dra. Elena Sánchez",
    estado: "disponible",
    modalidad: "Ambas",
  },
];

// KPIs principales (basados en informe Apollo)
export const kpisGenerales = {
  acudientesActivos: 3439,
  ninosRegistrados: 4127,
  sesionesMes: 1018,
  conversionPremium: 17.4, // %
  csat: 92, // % satisfacción ≥4/5
  emergenciasDetectadas: 98,
  derivacionesPresenciales: 750,
  ingresosMes: 6_482.1, // USD
};
