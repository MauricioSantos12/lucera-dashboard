import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/lib/auth";
import { useFetchAll } from "@/hooks/useFetchAll";
import type {
  ChatApi,
  GuardianApi,
  PatientApi,
  InsuranceRef,
} from "@/lib/apiTypes";
import { toast } from "@/lib/toast";

// Lógica compartida de filtros + data para las páginas de Estadísticas y
// Desempeño (Performance). Mantiene el estado del formulario de filtros, el
// snapshot aplicado con "Buscar", y los conjuntos ya filtrados que ambas
// páginas consumen. Así las dos usan EXACTAMENTE los mismos filtros.
export function useStatsFilters() {
  const { user, token } = useAuth();

  const {
    data: chatsData,
    loading: chatsLoading,
    error: chatsError,
  } = useFetchAll<ChatApi>(token ? "/api/chats" : null);
  const {
    data: guardiansData,
    loading: guardiansLoading,
    error: guardiansError,
  } = useFetchAll<GuardianApi>(token ? "/api/guardians" : null);
  const {
    data: patientsData,
    loading: patientsLoading,
    error: patientsError,
  } = useFetchAll<PatientApi>(token ? "/api/patients" : null);
  const {
    data: insurancesData,
    loading: insurancesLoading,
    error: insurancesError,
  } = useFetchAll<InsuranceRef>(token ? "/api/insurances" : null);

  const statsLoading =
    chatsLoading || guardiansLoading || patientsLoading || insurancesLoading;

  useEffect(() => {
    const err =
      chatsError || guardiansError || patientsError || insurancesError;
    if (err) {
      toast.error("No se pudieron cargar las estadísticas", {
        description: err,
      });
    }
  }, [chatsError, guardiansError, patientsError, insurancesError]);

  const chats = useMemo(() => chatsData?.items ?? [], [chatsData]);
  const realGuardians = useMemo(
    () => guardiansData?.items ?? [],
    [guardiansData]
  );
  const realPatients = useMemo(() => patientsData?.items ?? [], [patientsData]);
  const insurances = useMemo(
    () => insurancesData?.items ?? [],
    [insurancesData]
  );

  // Por defecto: mes actual (desde el día 1 hasta hoy), calculado con Date.now().
  const defaultEndDate = useMemo(
    () => new Date(Date.now()).toISOString().slice(0, 10),
    []
  );
  const defaultStartDate = useMemo(() => {
    const d = new Date(Date.now());
    d.setDate(1);
    return d.toISOString().slice(0, 10);
  }, []);

  const [startDate, setStartDate] = useState(defaultStartDate);
  const [endDate, setEndDate] = useState(defaultEndDate);
  const [country, setCountry] = useState("");
  const [insurance, setInsurance] = useState("");
  const [guardianFilter, setGuardianFilter] = useState("");
  const [applied, setApplied] = useState(true);
  // Se incrementa en cada "Buscar" para re-montar los resultados y disparar la
  // animación de entrada (más dinámico al aplicar filtros).
  const [searchTick, setSearchTick] = useState(0);
  const [snapshot, setSnapshot] = useState({
    startDate: defaultStartDate,
    endDate: defaultEndDate,
    country: "",
    insurance: "",
    guardian: "",
  });

  // Opciones de los selects, derivadas de la data real (no de listas mock).
  const countryOptions = useMemo(
    () => [...new Set(realGuardians.map((g) => g.country))].sort(),
    [realGuardians]
  );
  const insuranceOptions = useMemo(
    () => [...insurances].sort((a, b) => a.name.localeCompare(b.name)),
    [insurances]
  );
  const guardianOptions = useMemo(
    () => [...realGuardians].sort((a, b) => a.name.localeCompare(b.name)),
    [realGuardians]
  );

  // Acudientes que pasan los filtros de país/seguro/acudiente (SIN acotar por
  // fecha). Es la base para los chats: una consulta del período puede venir de
  // una cuenta registrada antes del rango.
  const scopedGuardians = useMemo(() => {
    if (!applied) return [];
    return realGuardians.filter((g) => {
      const okCountry =
        !snapshot.country ||
        snapshot.country === "todos" ||
        g.country === snapshot.country;
      const okInsurance =
        !snapshot.insurance ||
        snapshot.insurance === "todos" ||
        g.insurance?.name === snapshot.insurance;
      const okGuardian =
        !snapshot.guardian ||
        snapshot.guardian === "todos" ||
        g.id === snapshot.guardian;
      return okCountry && okInsurance && okGuardian;
    });
  }, [applied, snapshot, realGuardians]);

  const scopedGuardianPhones = useMemo(
    () => new Set(scopedGuardians.map((g) => g.phone)),
    [scopedGuardians]
  );

  // Cuentas del rango: además del scope, registradas dentro de [inicio, fin].
  // Todas las métricas de la sección Cuentas (activas, Free, Premium, niños…)
  // se derivan de aquí, así que responden también al filtro de fecha.
  const filteredGuardians = useMemo(() => {
    return scopedGuardians.filter((g) => {
      const date = g.registeredAt.slice(0, 10);
      const okStart = !snapshot.startDate || date >= snapshot.startDate;
      const okEnd = !snapshot.endDate || date <= snapshot.endDate;
      return okStart && okEnd;
    });
  }, [scopedGuardians, snapshot]);

  const filteredGuardianIds = useMemo(
    () => new Set(filteredGuardians.map((g) => g.id)),
    [filteredGuardians]
  );

  const filteredPatients = useMemo(
    () => realPatients.filter((p) => filteredGuardianIds.has(p.guardianId)),
    [realPatients, filteredGuardianIds]
  );

  // Actividad (chats) del período seleccionado, acotada por el rango de fechas
  // sobre startedAt y por el scope de cuentas (no por su fecha de registro).
  const filteredChats = useMemo(() => {
    return chats.filter((c) => {
      if (!scopedGuardianPhones.has(c.phone)) return false;
      const date = c.startedAt.slice(0, 10);
      const okStart = !snapshot.startDate || date >= snapshot.startDate;
      const okEnd = !snapshot.endDate || date <= snapshot.endDate;
      return okStart && okEnd;
    });
  }, [chats, scopedGuardianPhones, snapshot]);

  const activeUsers = useMemo(() => {
    const phones = new Set(filteredChats.map((c) => c.phone));
    return filteredGuardians.filter((g) => phones.has(g.phone)).length;
  }, [filteredChats, filteredGuardians]);

  const handleSearch = () => {
    setSnapshot({
      startDate,
      endDate,
      country,
      insurance,
      guardian: guardianFilter,
    });
    setApplied(true);
    setSearchTick((t) => t + 1);
  };

  const canExport = user?.role !== "Invitado";

  return {
    user,
    chats,
    realGuardians,
    realPatients,
    insurances,
    statsLoading,
    // estado del formulario de filtros
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    country,
    setCountry,
    insurance,
    setInsurance,
    guardianFilter,
    setGuardianFilter,
    applied,
    searchTick,
    snapshot,
    handleSearch,
    // opciones de selects
    countryOptions,
    insuranceOptions,
    guardianOptions,
    // conjuntos filtrados
    scopedGuardians,
    filteredGuardians,
    filteredPatients,
    filteredChats,
    activeUsers,
    canExport,
  };
}
