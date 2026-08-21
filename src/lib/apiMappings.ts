import type {
  GuardianRelationship,
  GuardianStatus,
  PlanApi,
  ChatTriageApi,
  ChatAttentionApi,
  ChatStatusApi,
  ChatMessageRoleApi,
  PaymentMethodApi,
  PaymentStatusApi,
  CenterTypeApi,
} from "@/lib/apiTypes";
import type {
  Relationship,
  AccountStatus,
  Guardian,
  TriageLevel,
  ChatSession,
  Payment,
  Center,
} from "@/lib/mockData";

export const relationToEs: Record<GuardianRelationship, Relationship> = {
  mother: "Madre",
  father: "Padre",
  guardian: "Tutor",
  grandparent: "Abuelo/a",
};
export const relationToApi: Record<Relationship, GuardianRelationship> = {
  Madre: "mother",
  Padre: "father",
  Tutor: "guardian",
  "Abuelo/a": "grandparent",
};

export const statusToEs: Record<GuardianStatus, AccountStatus> = {
  active: "activa",
  suspended: "suspendida",
  inactive: "baja",
};
export const statusToApi: Record<AccountStatus, GuardianStatus> = {
  activa: "active",
  suspendida: "suspended",
  baja: "inactive",
};

// Solo cubre los planes "legacy"; los tiers nuevos (1_hijo, …) se muestran con
// planLabelEs en Guardians. Por eso es parcial.
export const planToEs: Partial<Record<PlanApi, Guardian["plan"]>> = {
  free: "Gratuito",
  premium_monthly: "Premium Mensual",
  premium_annual: "Premium Anual",
};
export const planToApi: Record<Guardian["plan"], PlanApi> = {
  Gratuito: "free",
  "Premium Mensual": "premium_monthly",
  "Premium Anual": "premium_annual",
};

export const chatTriageToLevel: Record<ChatTriageApi, TriageLevel> = {
  general: "general",
  urgent: "urgente",
  emergency: "emergencia",
};

export const chatAttentionToEs: Record<ChatAttentionApi, ChatSession["attentionType"]> = {
  virtual: "Virtual",
  in_person: "Presencial",
};

export const chatStatusToEstado: Record<ChatStatusApi, ChatSession["status"]> = {
  active: "activa",
  waiting: "esperando",
  closed: "cerrada",
};

export const chatRoleToEs: Record<
  ChatMessageRoleApi,
  ChatSession["messages"][number]["role"]
> = {
  guardian: "acudiente",
  bot: "bot",
  system: "sistema",
};

export const paymentMethodToEs: Record<PaymentMethodApi, Payment["method"]> = {
  stripe: "Stripe",
  yappy: "Yappy",
};

export const paymentStatusToEs: Record<PaymentStatusApi, Payment["status"]> = {
  confirmed: "confirmado",
  pending: "pendiente",
  failed: "fallido",
  refunded: "reembolsado",
};

// El plan de un pago puede ser cualquier PlanApi; a diferencia de planToEs
// (usado para el plan del guardián), aquí no hay "Gratuito" porque un pago
// siempre corresponde a un plan pagado.
export const paymentPlanToEs: Record<string, string> = {
  premium_monthly: "Premium Mensual",
  premium_annual: "Premium Anual",
};

export const centerTypeToEs: Record<CenterTypeApi, Center["type"]> = {
  Hospital: "Hospital",
  Clinic: "Clínica",
  Emergency: "Urgencias",
};

// El backend devuelve el país sin tilde ("Panama"), pero countriesCities
// (mockData.ts) usa "Panamá" como clave para las opciones de país/ciudad
// del filtro y del formulario. Este mapa homologa ambos lados.
export const countryApiToEs: Record<string, string> = {
  Panama: "Panamá",
  Colombia: "Colombia",
};
export const countryEsToApi: Record<string, string> = Object.fromEntries(
  Object.entries(countryApiToEs).map(([api, es]) => [es, api])
);

// --- Género -----------------------------------------------------------------
// El backend guarda `gender` como string libre (o null) y puede llegar en
// varios formatos (inglés/español/abreviado). Canonicalizamos a una de estas
// claves para el <Select> y homologamos la etiqueta visible en las tablas.
export type GenderValue = "female" | "male" | "other" | "";

export function genderToValue(g?: string | null): GenderValue {
  const v = (g ?? "").toString().trim().toLowerCase();
  if (["female", "f", "femenino", "femenina", "mujer"].includes(v)) return "female";
  if (["male", "m", "masculino", "hombre"].includes(v)) return "male";
  if (v) return "other";
  return "";
}

export function genderLabel(g?: string | null): string {
  switch (genderToValue(g)) {
    case "female":
      return "Femenino";
    case "male":
      return "Masculino";
    case "other":
      return "Otro";
    default:
      return "—";
  }
}
