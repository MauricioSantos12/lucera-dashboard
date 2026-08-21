// Formas reales verificadas contra el backend (lucera-metrics), no el spec OpenAPI
// (que declara additionalProperties: true y no tipa las respuestas).

export interface LoginResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
  user: {
    email: string;
    name: string;
    role: string;
    id: string;
    // Los usuarios recién creados (clave inicial generada por el backend) deben
    // cambiar la contraseña en el primer ingreso.
    mustChangePassword?: boolean;
  };
}

// POST /api/users/me/password → cambia la propia contraseña. Devuelve tokens
// nuevos (sin expires_in) y baja el flag mustChangePassword.
export interface ChangePasswordPayload {
  currentPassword: string;
  newPassword: string;
}

// POST /auth/guardian/login → login del acudiente por teléfono. Devuelve un
// token con scope=portal (solo /portal/*). Respuesta sin tipar en el spec; se
// asume forma tipo LoginResponse (el id del acudiente puede venir como gid).
export interface GuardianLoginPayload {
  phone: string;
  password: string;
}
export interface GuardianLoginResponse {
  access_token: string;
  refresh_token: string;
  expires_in?: number;
  user?: {
    name?: string;
    role?: string;
    id?: string;
    gid?: string;
    phone?: string;
    email?: string;
  };
}
export interface ChangePasswordResponse {
  ok?: boolean;
  mustChangePassword?: boolean;
  access_token: string;
  refresh_token: string;
}

// POST /api/users → alta de usuario del panel. initialPassword solo viene aquí
// (se muestra una sola vez).
export interface UserCreatePayload {
  name: string;
  email: string;
  role: string;
  idNumber: string;
}
export interface UserCreateResponse {
  id: string;
  idNumber: string | null;
  initialPassword: string;
  mustChangePassword: boolean;
}

// POST /api/users/{id}/password/reset → restablece la clave de otro usuario.
// Si derivedFromIdNumber es true, la clave se derivó de la cédula (no aleatoria).
export interface PasswordResetResponse {
  temporaryPassword: string;
  derivedFromIdNumber: boolean;
  mustChangePassword: boolean;
}

export interface KpisResponse {
  activeGuardians: number;
  registeredChildren: number;
  sessionsThisMonth: number;
  premiumConversion: number;
  csat: number;
  emergenciesDetected: number;
  inPersonReferrals: number;
  revenueThisMonth: number;
}

// GET /api/stats/summary → KPIs operativos agrupados. Distinto de KpisResponse:
// forma anidada (accounts/usage/safety) y algunos valores pueden ser null
// (csat, reportedErRate) cuando aún no hay datos suficientes.
export interface StatsSummaryResponse {
  accounts: {
    total: number;
    active: number;
    free: number;
    premium: number;
    conversionRate: number; // %
  };
  revenueUsd: number;
  csat: number | null; // %
  usage: {
    sessions: number;
    sessionCompletionRate: number; // %
    abandoned: number;
  };
  safety: {
    redFlagsToEmergency: number;
    redFlagRate: number; // %
    reportedErRate: number | null; // %
    erConfirmed: number;
    erAnswered: number;
  };
}

// GET /api/stats/performance → indicadores de desempeño globales (ignora
// filtros/query params). Los tiempos vienen en minutos; los rates en %.
// onboardingCompletionRate puede venir null (sin datos suficientes).
export interface StatsPerformanceResponse {
  timeToFirstConsultMin: number | null;
  timeToResolutionMin: number | null;
  activeAccountRate: number | null;
  churnRate: number | null;
  freeLimitNoConversion: number;
  techFailureSessions: number;
  techFailureRate: number | null;
  onboardingCompletionRate: number | null;
  note?: string;
}

// GET /api/bot-status → estado del bot de WhatsApp. Siempre responde 200
// (salvo 401): el estado real va en el JSON, no en el status HTTP.
export interface BotStatusResponse {
  bot: "up" | "down";
  ready: boolean;
  checks: Record<string, boolean>; // mysql, redis, rag · {} si el bot no respondió
  latency_ms: number;
  checked_at: string; // ISO-8601 UTC
  url: string;
  error?: string; // solo cuando bot === "down"
}

// GET /api/geo → catálogo de países con sus provincias/estados. Requiere auth.
// No incluye ciudades (la jerarquía es país → estado, de 2 niveles). El endpoint
// ignora query params (siempre devuelve la lista completa).
export interface GeoCountry {
  code: string; // ISO-2: "AR" | "CO" | "PA"
  name: string; // "Argentina" | "Colombia" | "Panamá"
  phoneCode: string; // "+54" | "+57" | "+507"
  states: string[]; // provincias / departamentos
}

export interface PaginatedResponse<T> {
  items: T[];
  page: number;
  page_limit: number;
  total: number;
  total_pages: number;
}

export type TriageLevelApi = "General" | "Urgent" | "Emergency";

export interface TriageStatApi {
  level: TriageLevelApi;
  value: number;
  color: string;
}

export type PlanApi =
  | "free"
  | "premium_monthly"
  | "premium_annual"
  | "1_hijo"
  | "2_hijos"
  | "3_hijos"
  | "4_5_hijos"
  | "validacion_full";

export interface PlanStatApi {
  plan: PlanApi;
  users: number;
  color: string;
}

export type ChatTriageApi = "general" | "urgent" | "emergency";
export type ChatAttentionApi = "virtual" | "in_person";
export type ChatStatusApi = "active" | "waiting" | "closed";
export type ChatMessageRoleApi = "guardian" | "bot" | "system";

export interface ChatMessageApi {
  role: ChatMessageRoleApi;
  text: string;
  time: string;
  type: string;
  alerts: string[];
}

export interface ChatApi {
  id: string;
  guardian: string;
  patient: string;
  phone: string;
  triage: ChatTriageApi;
  attentionType: ChatAttentionApi;
  aiSummary: string | null;
  rating: number | null;
  lastMessage: string;
  time: string;
  startedAt: string;
  closedAt: string | null;
  status: ChatStatusApi;
  messages: ChatMessageApi[];
  // Comentario final del médico/admin (PATCH /api/chats/{id}/note).
  doctorNote?: string | null;
  reviewedBy?: string | null;
  reviewedAt?: string | null;
  derivation: "emergency" | "appointment" | "home";
}

// PATCH /api/chats/{id}/note → guarda el comentario del médico. reviewedBy y
// reviewedAt los setea el backend (usuario autenticado + fecha del servidor).
export interface ChatNotePayload {
  note: string;
  reviewed_by: string;
}

export type GuardianRelationship =
  | "mother"
  | "father"
  | "guardian"
  | "grandparent";

export type GuardianStatus = "active" | "suspended" | "inactive";

export interface InsuranceRef {
  id: number;
  name: string;
  // El seguro embebido en un acudiente/paciente puede traer el nº de póliza;
  // el catálogo de /api/insurances no lo incluye (por eso es opcional).
  policyNumber?: string | null;
}

export interface SpecialtyApi {
  id: number;
  name: string;
}

// POST y PATCH de seguros/especialidades solo aceptan { name }.
export interface NameInPayload {
  name: string;
}

export interface ChildApi {
  id: string;
  name: string;
  birthDate: string;
  bloodType: string | null;
  weightKg: number | null;
  conditions: string[];
  allergies: string[];
  insurance: InsuranceRef | null;
}

export interface GuardianApi {
  id: string;
  phone: string;
  email: string;
  name: string;
  accountCode: string;
  gender: string | null;
  idNumber: string | null;
  relationship: GuardianRelationship;
  country: string;
  province: string;
  address: string | null;
  city: string;
  status: GuardianStatus;
  plan: PlanApi;
  insurance: InsuranceRef | null;
  registeredAt: string;
  portalEnabled?: boolean;
  chats: number;
  children: ChildApi[];
}

// Todos los campos opcionales. Sin "phone": el teléfono no es editable vía
// API (identificador del acudiente). "children"/"insurance"/"registeredAt"
// tampoco: son de solo lectura o se gestionan por otros endpoints.
export interface GuardianPatchPayload {
  name?: string;
  email?: string;
  country?: string;
  city?: string;
  province?: string;
  address?: string;
  relationship?: GuardianRelationship;
  status?: GuardianStatus;
  plan?: PlanApi;
  insuranceId?: number;
  policyNumber?: string;
  gender?: string;
  idNumber?: string;
  // Pediatra de cabecera (nombre + celular). El backend los acepta aunque no
  // estén tipados en el spec (additionalProperties).
  medico_cabecera_nombre?: string;
  medico_cabecera_celular?: string;
}

// name, phone y email son obligatorios; crea el acudiente y su cuenta de
// usuario. email o phone duplicado responde 409. Si "plan" es un plan pago,
// el backend registra el pago correspondiente.
export interface GuardianCreatePayload {
  name: string;
  phone: string;
  email: string;
  relationship?: GuardianRelationship;
  country?: string;
  city?: string;
  province?: string;
  address?: string;
  status?: GuardianStatus;
  plan?: PlanApi;
  insuranceId?: number;
  policyNumber?: string;
  gender?: string;
  idNumber?: string;
  medico_cabecera_nombre?: string;
  medico_cabecera_celular?: string;
}

export interface DeleteResponse {
  deleted: boolean;
  id: string;
}

// --- Portal del acudiente (fijar clave / link de onboarding) ---
// POST /api/guardians/{gid}/portal-password → el admin fija la clave del portal.
export interface PortalPasswordPayload {
  password: string;
}

// GET /api/accounts → cuentas titulares (una por acudiente; account.id === el
// id del acudiente). insurance llega como nombre (string) o null; country en
// formato API ("Panama"). createdAt viene como "YYYY-MM-DD HH:mm".
export interface AccountApi {
  id: string;
  accountCode: string;
  guardian: string;
  idNumber: string | null;
  gender: string | null;
  phone: string;
  email: string;
  country: string | null;
  province: string | null;
  city: string | null;
  address: string | null;
  insurance: string | null;
  status: string; // "active" | "inactive"
  plan: string; // free | validacion_full | 1_hijo | 2_hijos | ...
  paymentStatus: string | null; // "confirmed" | null
  children: number;
  chats: number;
  createdAt: string;
  subscriptionExpiresAt: string | null;
  subscriptionState: string;
}

// GET /api/roles → catálogo de roles del panel. Devuelve { items: [...] } con
// el valor interno, la etiqueta en español y el dashboardRole asociado.
export interface RoleCatalogItem {
  value: string; // interno: "admin" | "doctor" | "marketing" | "gerente_cuenta"…
  label: string; // etiqueta legible: "Administrador", "Médico"…
  dashboardRole: string; // "Admin" | "Doctor" | "Sales"
}
export interface RolesCatalogResponse {
  items: RoleCatalogItem[];
}

// GET /api/users → usuarios del panel (staff: admin, médico, ventas), no
// acudientes. dashboardRole es el rol legible; role es el interno del backend.
export interface UserApi {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string; // interno: "admin" | "doctor" | "marketing" | ...
  dashboardRole: string; // "Admin" | "Doctor" | "Sales" | ...
  status: string; // "active" | "inactive"
  isActive: boolean;
  dashboardAccess: boolean;
  hasPassword: boolean;
  mustChangePassword: boolean;
  idNumber: string | null;
  licenseId: string | null;
  specialty: string | null;
  createdAt: string;
}

export type BloodType = "A+" | "A-" | "B+" | "B-" | "AB+" | "AB-" | "O+" | "O-";

export interface PatientApi {
  id: string;
  name: string;
  nationalId: string;
  age: number;
  birthDate: string;
  bloodType: BloodType | null;
  weightKg: number | null;
  conditions: string[];
  allergies: string[];
  insurance: InsuranceRef | null;
  gender: string | null;
  idNumber: string | null;
  school: string | null;
  guardianId: string;
  guardian: string;
  phone: string;
  accountCode: string;
  address: string | null;
  status: string;
  chats: number;
  lastConsultation: string | null;
}

// guardianId, name y birthDate son obligatorios
export interface PatientCreatePayload {
  guardianId: string;
  name: string;
  birthDate: string;
  weightKg?: number;
  bloodType?: BloodType;
  conditions?: string[];
  allergies?: string[];
  insuranceId?: number;
  address?: string;
  school?: string;
  idNumber?: string;
  gender?: string;
}

// Todos los campos opcionales
export interface PatientPatchPayload {
  name?: string;
  birthDate?: string;
  weightKg?: number;
  bloodType?: BloodType;
  conditions?: string[];
  allergies?: string[];
  insuranceId?: number;
  address?: string;
  school?: string;
  gender?: string;
}

export type PaymentMethodApi = "stripe" | "yappy";
export type PaymentStatusApi = "confirmed" | "pending" | "failed" | "refunded";

export interface PaymentApi {
  id: string;
  guardian: string;
  amount: number;
  method: PaymentMethodApi;
  plan: string;
  status: PaymentStatusApi;
  date: string;
  providerResponse?: string;
  paymentType?: string;
}

export interface UsageSummaryApi {
  calls: number;
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
  costUsd: number;
  avgLatencyMs: number;
}

export interface UsageByDayApi {
  date: string;
  calls: number;
  tokens: number;
  costUsd: number;
}

export interface UsageByUserApi {
  guardian: string;
  phone: string;
  calls: number;
  tokens: number;
  costUsd: number;
}

export type CenterTypeApi = "Hospital" | "Clinic" | "Emergency";

export interface CenterApi {
  id: string;
  name: string;
  type: CenterTypeApi;
  city: string;
  address: string;
  phone: string;
  hours: string;
  recommended: boolean;
}

// name y city obligatorios. No incluye "type" ni "hours" (esos campos del
// GET no son editables vía API); "tier" y "country" son propios del alta.
export interface CenterCreatePayload {
  name: string;
  city: string;
  address?: string;
  phone?: string;
  tier?: string;
  recommended?: boolean;
  country?: string;
}

// Todos los campos opcionales; solo se manda lo que cambia. Sin "country"
// (no se puede reubicar el centro de país vía PATCH).
export interface CenterUpdatePayload {
  name?: string;
  city?: string;
  address?: string;
  phone?: string;
  tier?: string;
  recommended?: boolean;
}
