// Constantes y tipos compartidos por los formularios de creación de acudiente
// (panel admin en Guardians.tsx y registro público en Register.tsx).

// Modelo de planes (confirmado con el backend, ago-2026):
//   - `plan` = capacidad por hijos: free, 1_hijo, 2_hijos, 3_hijos, 4_5_hijos.
//   - `billingCycle` = monthly | annual (solo aplica a planes de pago).
//   - El server deriva `planTier` (premium_monthly/annual) y `planMaxDependents`.
// `validacion_full` y premium_* existen en datos legacy pero NO son asignables
// vía API → solo se muestran (etiquetas abajo).
export const planLabel: Record<string, string> = {
  free: "Gratuito",
  "1_hijo": "1 hijo",
  "2_hijos": "2 hijos",
  "3_hijos": "3 hijos",
  "4_5_hijos": "4-5 hijos",
  // Legacy (solo display):
  validacion_full: "Validación full",
  premium_monthly: "Premium Mensual",
  premium_annual: "Premium Anual",
};

// Planes que el backend acepta en POST/PATCH /api/guardians.
export const ACCEPTED_PLANS = [
  "free",
  "1_hijo",
  "2_hijos",
  "3_hijos",
  "4_5_hijos",
] as const;

// Ciclo de cobro (solo para planes de pago).
export const BILLING_CYCLES = [
  { value: "monthly", label: "Mensual" },
  { value: "annual", label: "Anual" },
] as const;

// Opciones seleccionables en "Elige tu plan". `maxDependents` limita cuántos
// hijos se pueden cargar (el server confirma con `planMaxDependents`).
export const PLAN_TIERS: {
  value: string;
  label: string;
  hint: string;
  maxDependents: number;
}[] = [
  { value: "free", label: "Gratuito", hint: "Para empezar · 1 niño", maxDependents: 1 },
  { value: "1_hijo", label: "1 hijo", hint: "Seguimiento para 1 niño", maxDependents: 1 },
  { value: "2_hijos", label: "2 hijos", hint: "Hasta 2 niños", maxDependents: 2 },
  { value: "3_hijos", label: "3 hijos", hint: "Hasta 3 niños", maxDependents: 3 },
  { value: "4_5_hijos", label: "4-5 hijos", hint: "Hasta 5 niños", maxDependents: 5 },
];

// Tope de hijos que permite un plan (para limitar el formulario al crear).
export function planMaxDependents(plan: string): number {
  return PLAN_TIERS.find((p) => p.value === plan)?.maxDependents ?? 1;
}

// ¿El plan es de pago? (los free no llevan ciclo de cobro).
export function isPaidPlan(plan: string): boolean {
  return !!plan && plan !== "free";
}

// Un hijo del formulario de creación (se crean con POST /api/patients tras
// crear el acudiente, porque el alta del acudiente no los acepta anidados).
export interface ChildForm {
  name: string;
  birthDate: string;
  weightKg: string;
  idNumber: string;
  school: string;
  allergies: string;
  conditions: string;
}

export const emptyChild = (): ChildForm => ({
  name: "",
  birthDate: "",
  weightKg: "",
  idNumber: "",
  school: "",
  allergies: "",
  conditions: "",
});
