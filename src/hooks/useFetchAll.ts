import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/lib/auth";
import { BACKEND_URL } from "@/lib/config";
import type { PaginatedResponse } from "@/lib/apiTypes";

type State<T> = {
  data: PaginatedResponse<T> | null;
  loading: boolean;
  error: string | null;
};

// El backend limita page_limit a 200 (envelope paginado). Este hook recorre
// TODAS las páginas y las une, para que el frontend tenga el dataset completo
// (los filtros y la paginación de la tabla operan sobre todos los registros).
// Devuelve la misma forma PaginatedResponse<T> que useFetch<PaginatedResponse>.
const MAX_PAGE_LIMIT = 200;

export function useFetchAll<T>(basePath: string | null) {
  const { getValidToken } = useAuth();
  const [state, setState] = useState<State<T>>({
    data: null,
    loading: !!basePath,
    error: null,
  });

  const fetchAll = useCallback(async () => {
    if (!basePath) return;
    setState((s) => ({ ...s, loading: true, error: null }));
    try {
      const freshToken = await getValidToken();
      const headers = freshToken
        ? { Authorization: `Bearer ${freshToken}` }
        : undefined;
      const sep = basePath.includes("?") ? "&" : "?";

      const fetchPage = async (page: number) => {
        const res = await fetch(
          `${BACKEND_URL}${basePath}${sep}page=${page}&page_limit=${MAX_PAGE_LIMIT}`,
          { headers }
        );
        if (!res.ok) {
          throw new Error(`Error ${res.status}: ${res.statusText}`);
        }
        return (await res.json()) as PaginatedResponse<T>;
      };

      const first = await fetchPage(1);
      let items = first.items;

      if (first.total_pages > 1) {
        const rest = await Promise.all(
          Array.from({ length: first.total_pages - 1 }, (_, i) =>
            fetchPage(i + 2)
          )
        );
        items = items.concat(...rest.map((r) => r.items));
      }

      setState({
        data: { ...first, items, page: 1, page_limit: items.length },
        loading: false,
        error: null,
      });
    } catch (err) {
      setState({
        data: null,
        loading: false,
        error: err instanceof Error ? err.message : "Error desconocido",
      });
    }
  }, [basePath, getValidToken]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  return { ...state, refetch: fetchAll };
}
