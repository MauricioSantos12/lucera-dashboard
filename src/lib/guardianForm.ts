// Constantes y tipos compartidos por los formularios de creación de acudiente
// (panel admin en Guardians.tsx y registro público en Register.tsx).

// Etiquetas legibles de los planes. Incluye los que ACEPTA el alta/edición del
// backend (free/premium_monthly/premium_annual) y los tiers legacy que aún
// existen en datos (1_hijo, …) para poder mostrarlos en la tabla.
export const planLabelEs: Record<string, string> = {
  free: "Gratuito",
  premium_monthly: "Premium Mensual",
  premium_annual: "Premium Anual",
  "1_hijo": "1 Hijo",
  "2_hijos": "2 Hijos",
  "3_hijos": "3 Hijos",
  "4_5_hijos": "4-5 Hijos",
  validacion_full: "Validación full",
};

// Planes que el backend acepta en POST/PATCH /api/guardians.
export const ACCEPTED_PLANS = [
  "free",
  "premium_monthly",
  "premium_annual",
] as const;

// Opciones seleccionables en "Elige tu plan" (solo las que acepta el backend).
export const PLAN_TIERS: {
  value: string;
  label: string;
  hint: string;
  price: number;
  period: string;
}[] = [
  { value: "free", label: "Gratuito", hint: "3 consultas IA/mes", price: 0, period: "/mes" },
  {
    value: "premium_monthly",
    label: "Premium Mensual",
    hint: "Consultas ilimitadas",
    price: 9.99,
    period: "/mes",
  },
  {
    value: "premium_annual",
    label: "Premium Anual",
    hint: "2 meses gratis",
    price: 89.99,
    period: "/año",
  },
];

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
