import { BACKEND_URL } from "@/lib/config";
import { toApiError } from "@/lib/apiError";

// Para llamadas imperativas (POST/PATCH/DELETE) fuera del ciclo de vida de useFetch.
export async function apiFetch<T>(
  path: string,
  token: string | null,
  options?: RequestInit
): Promise<T> {
  const res = await fetch(`${BACKEND_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options?.headers,
    },
  });
  if (!res.ok) {
    throw await toApiError(res);
  }
  return res.json() as Promise<T>;
}
