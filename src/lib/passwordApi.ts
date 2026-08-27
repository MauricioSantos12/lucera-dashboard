import { apiFetch } from "@/lib/apiClient";
import type {
  ChangePasswordPayload,
  ChangePasswordResponse,
} from "@/lib/apiTypes";

// Cambia la propia contraseña (primer ingreso o cambio voluntario en Perfil).
// Devuelve los tokens nuevos que hay que aplicar con applyPasswordChanged.
export async function changePassword(
  currentPassword: string,
  newPassword: string,
  token: string | null
): Promise<ChangePasswordResponse> {
  const payload: ChangePasswordPayload = { currentPassword, newPassword };
  return apiFetch<ChangePasswordResponse>("/api/users/me/password", token, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

// Cambio de clave del ACUDIENTE en el portal (primer ingreso forzado). Mismo
// contrato que el de operador pero contra /portal/password (token scope=portal).
// Devuelve tokens nuevos que hay que aplicar con applyPasswordChanged.
export async function changePortalPassword(
  currentPassword: string,
  newPassword: string,
  token: string | null
): Promise<ChangePasswordResponse> {
  const payload: ChangePasswordPayload = { currentPassword, newPassword };
  return apiFetch<ChangePasswordResponse>("/portal/password", token, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}
