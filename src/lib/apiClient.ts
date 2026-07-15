import { BACKEND_URL } from "@/lib/config";

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
    throw new Error(`Error ${res.status}: ${res.statusText}`);
  }
  return res.json() as Promise<T>;
}
