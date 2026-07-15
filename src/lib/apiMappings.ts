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
import type { Relacion, EstadoCuenta, Acudiente, TriageLevel, ChatSesion, Pago, Centro } from "@/lib/mockData";

export const relationToEs: Record<GuardianRelationship, Relacion> = {
  mother: "Madre",
  father: "Padre",
  guardian: "Tutor",
  grandparent: "Abuelo/a",
};
export const relationToApi: Record<Relacion, GuardianRelationship> = {
  Madre: "mother",
  Padre: "father",
  Tutor: "guardian",
  "Abuelo/a": "grandparent",
};

export const statusToEs: Record<GuardianStatus, EstadoCuenta> = {
  active: "activa",
  suspended: "suspendida",
  inactive: "baja",
};
export const statusToApi: Record<EstadoCuenta, GuardianStatus> = {
  activa: "active",
  suspendida: "suspended",
  baja: "inactive",
};

export const planToEs: Record<PlanApi, Acudiente["plan"]> = {
  free: "Gratuito",
  premium_monthly: "Premium Mensual",
  premium_annual: "Premium Anual",
};

export const chatTriageToLevel: Record<ChatTriageApi, TriageLevel> = {
  general: "general",
  urgent: "urgente",
  emergency: "emergencia",
};

export const chatAttentionToEs: Record<ChatAttentionApi, ChatSesion["tipoAtencion"]> = {
  virtual: "Virtual",
  in_person: "Presencial",
};

export const chatStatusToEstado: Record<ChatStatusApi, ChatSesion["estado"]> = {
  active: "activa",
  waiting: "esperando",
  closed: "cerrada",
};

export const chatRoleToEs: Record<
  ChatMessageRoleApi,
  ChatSesion["mensajes"][number]["rol"]
> = {
  guardian: "acudiente",
  bot: "bot",
  system: "sistema",
};

export const paymentMethodToEs: Record<PaymentMethodApi, Pago["metodo"]> = {
  stripe: "Stripe",
  yappy: "Yappy",
};

export const paymentStatusToEs: Record<PaymentStatusApi, Pago["estado"]> = {
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

export const centerTypeToEs: Record<CenterTypeApi, Centro["tipo"]> = {
  Hospital: "Hospital",
  Clinic: "Clínica",
  Emergency: "Urgencias",
};

// El backend devuelve el país sin tilde ("Panama"), pero paisesCiudades
// (mockData.ts) usa "Panamá" como clave para las opciones de país/ciudad
// del filtro y del formulario. Este mapa homologa ambos lados.
export const countryApiToEs: Record<string, string> = {
  Panama: "Panamá",
  Colombia: "Colombia",
};
