import { useCallback, useMemo } from "react";
import { useFetch } from "./useFetch";
import { countryFromApi } from "@/lib/apiMappings";
import type { GeoCountry } from "@/lib/apiTypes";

// Catálogo geográfico real (GET /api/geo): países + provincias/estados.
// No hay ciudades: la ciudad se captura como texto libre en los formularios.
export function useGeo() {
  const { data, loading, error } = useFetch<GeoCountry[]>("/api/geo");

  const countries = useMemo(() => data ?? [], [data]);

  // Nombres de país para los <Select> (idioma del catálogo: "Panamá", etc.).
  const countryNames = useMemo(() => countries.map((c) => c.name), [countries]);

  // Provincias/estados de un país dado por su nombre. Tolera que llegue el
  // nombre en formato API ("Panama") normalizándolo al del catálogo ("Panamá").
  const statesOf = useCallback(
    (countryName: string | null | undefined): string[] => {
      if (!countryName) return [];
      const target = countryFromApi[countryName] ?? countryName;
      return countries.find((c) => c.name === target)?.states ?? [];
    },
    [countries]
  );

  return { countries, countryNames, statesOf, loading, error };
}
