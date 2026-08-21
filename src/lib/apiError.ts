import { notifyPasswordChangeRequired } from "@/lib/passwordGate";

// Lógica compartida por apiFetch/useFetch/useFetchAll para transformar una
// respuesta HTTP no-ok en un Error, detectando de paso el 403 de cambio de
// contraseña obligatorio para disparar la red de seguridad.
export async function toApiError(res: Response): Promise<Error> {
  let detail: string | undefined;
  try {
    const body = await res.clone().json();
    if (body && typeof body.detail === "string") detail = body.detail;
  } catch {
    // cuerpo no-JSON o vacío
  }
  if (res.status === 403 && detail === "Password change required") {
    notifyPasswordChangeRequired();
  }
  return new Error(detail ?? `Error ${res.status}: ${res.statusText}`);
}
