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
  };
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

export type PlanApi = "free" | "premium_monthly" | "premium_annual";

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
  relationship: GuardianRelationship;
  country: string;
  city: string;
  status: GuardianStatus;
  plan: PlanApi;
  insurance: InsuranceRef | null;
  registeredAt: string;
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
  relationship?: GuardianRelationship;
  status?: GuardianStatus;
  plan?: PlanApi;
  insuranceId?: number;
  policyNumber?: string;
}

// name, phone y email son obligatorios; crea el acudiente y su cuenta de
// usuario. email o phone duplicado responde 409.
export interface GuardianCreatePayload {
  name: string;
  phone: string;
  email: string;
  relationship?: GuardianRelationship;
  city?: string;
  province?: string;
  address?: string;
}

export interface DeleteResponse {
  deleted: boolean;
  id: string;
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
  guardianId: string;
  guardian: string;
  phone: string;
  status: string;
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
