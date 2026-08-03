import { useEffect, useMemo, useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useAuth } from "@/lib/auth";
import { useFetchAll } from "@/hooks/useFetchAll";
import { countryApiToEs } from "@/lib/apiMappings";
import type { AccountApi, GuardianApi } from "@/lib/apiTypes";
import {
  Box,
  Flex,
  HStack,
  Input,
  InputGroup,
  InputLeftElement,
  Select,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  IconButton,
  Badge,
  Text,
  TableContainer,
} from "@chakra-ui/react";
import {
  Search,
  Pencil,
  Phone,
  Mail,
  Baby,
  MessageSquare,
} from "lucide-react";
import { StatCard } from "@/components/StatCard";
import { Pagination } from "@/components/Pagination";
import { LoadingState } from "@/components/LoadingState";
import { ExportButton } from "@/components/ExportButton";
import { GuardianEditModal } from "@/components/GuardianEditModal";
import { toast } from "@/lib/toast";

// Etiquetas legibles de los planes que devuelve /api/accounts.
const planLabel: Record<string, string> = {
  free: "Gratuito",
  validacion_full: "Validación full",
  "1_hijo": "1 hijo",
  "2_hijos": "2 hijos",
  premium_monthly: "Premium Mensual",
  premium_annual: "Premium Anual",
};

const PER_PAGE = 12;

export default function Accounts() {
  const { user, token } = useAuth();
  const canEdit = user?.role === "Admin";
  const canExport = user?.role !== "Invitado";

  const {
    data: accountsData,
    loading,
    error,
    refetch,
  } = useFetchAll<AccountApi>(token ? "/api/accounts" : null);

  // Se cargan los acudientes para poder abrir el modal de edición (que trabaja
  // sobre GuardianApi). account.id === guardian.id, así que se cruza por id.
  const { data: guardiansData, refetch: refetchGuardians } =
    useFetchAll<GuardianApi>(canEdit && token ? "/api/guardians" : null);

  useEffect(() => {
    if (error) {
      toast.error("No se pudieron cargar las cuentas", { description: error });
    }
  }, [error]);

  const accounts = useMemo(
    () => accountsData?.items ?? [],
    [accountsData]
  );
  const guardians = useMemo(
    () => guardiansData?.items ?? [],
    [guardiansData]
  );

  const [q, setQ] = useState("");
  const [countryFilter, setCountryFilter] = useState("todos");
  const [insuranceFilter, setInsuranceFilter] = useState("todos");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [page, setPage] = useState(1);
  const [editing, setEditing] = useState<GuardianApi | null>(null);

  // Opciones de los selects, derivadas de la data real.
  const countryOptions = useMemo(
    () =>
      [...new Set(accounts.map((a) => a.country).filter(Boolean))].sort() as string[],
    [accounts]
  );
  const insuranceOptions = useMemo(
    () =>
      [
        ...new Set(accounts.map((a) => a.insurance).filter(Boolean)),
      ].sort() as string[],
    [accounts]
  );

  const filtered = useMemo(() => {
    return accounts.filter((a) => {
      const okQ = `${a.guardian} ${a.email} ${a.phone} ${a.accountCode}`
        .toLowerCase()
        .includes(q.trim().toLowerCase());
      const okCountry =
        countryFilter === "todos"
          ? true
          : countryFilter === "sin_pais"
          ? !a.country
          : a.country === countryFilter;
      const okInsurance =
        insuranceFilter === "todos"
          ? true
          : insuranceFilter === "sin_seguro"
          ? !a.insurance
          : a.insurance === insuranceFilter;
      const dateStr = a.createdAt?.slice(0, 10) ?? "";
      const okFrom = !dateFrom || dateStr >= dateFrom;
      const okTo = !dateTo || dateStr <= dateTo;
      return okQ && okCountry && okInsurance && okFrom && okTo;
    });
  }, [accounts, q, countryFilter, insuranceFilter, dateFrom, dateTo]);

  // Al cambiar cualquier filtro, se vuelve a la primera página.
  useEffect(() => {
    setPage(1);
  }, [q, countryFilter, insuranceFilter, dateFrom, dateTo]);

  const totalPages = Math.ceil(filtered.length / PER_PAGE);
  const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const openEdit = (a: AccountApi) => {
    const guardian = guardians.find((g) => g.id === a.id);
    if (!guardian) {
      toast.error("No se encontró la cuenta del acudiente para editar");
      return;
    }
    setEditing(guardian);
  };

  return (
    <DashboardLayout title="Cuentas" subtitle="Cuentas titulares registradas">
      <StatCard>
        <Flex
          direction={{ base: "column", md: "row" }}
          gap={3}
          mb={4}
          align={{ md: "end" }}
          wrap="wrap"
        >
          <Box flex={1} minW={{ md: "220px" }}>
            <Text fontSize="xs" fontWeight={600} mb={1}>
              Buscar
            </Text>
            <InputGroup>
              <InputLeftElement pointerEvents="none">
                <Search size={16} />
              </InputLeftElement>
              <Input
                placeholder="Nombre, email, teléfono, código…"
                value={q}
                onChange={(e) => setQ(e.target.value)}
              />
            </InputGroup>
          </Box>
          <Box>
            <Text fontSize="xs" fontWeight={600} mb={1}>
              Desde
            </Text>
            <Input
              type="date"
              w={{ base: "100%", md: "160px" }}
              value={dateFrom}
              max={dateTo || undefined}
              onChange={(e) => setDateFrom(e.target.value)}
            />
          </Box>
          <Box>
            <Text fontSize="xs" fontWeight={600} mb={1}>
              Hasta
            </Text>
            <Input
              type="date"
              w={{ base: "100%", md: "160px" }}
              value={dateTo}
              min={dateFrom || undefined}
              onChange={(e) => setDateTo(e.target.value)}
            />
          </Box>
          <Box>
            <Text fontSize="xs" fontWeight={600} mb={1}>
              País
            </Text>
            <Select
              w={{ base: "100%", md: "160px" }}
              value={countryFilter}
              onChange={(e) => setCountryFilter(e.target.value)}
            >
              <option value="todos">Todos los países</option>
              {countryOptions.map((c) => (
                <option key={c} value={c}>
                  {countryApiToEs[c] ?? c}
                </option>
              ))}
              <option value="sin_pais">Sin país</option>
            </Select>
          </Box>
          <Box>
            <Text fontSize="xs" fontWeight={600} mb={1}>
              Aseguradora
            </Text>
            <Select
              w={{ base: "100%", md: "180px" }}
              value={insuranceFilter}
              onChange={(e) => setInsuranceFilter(e.target.value)}
            >
              <option value="todos">Todas las aseguradoras</option>
              {insuranceOptions.map((i) => (
                <option key={i} value={i}>
                  {i}
                </option>
              ))}
              <option value="sin_seguro">Sin seguro</option>
            </Select>
          </Box>
        </Flex>

        <Flex gap={3} mb={4} justify="space-between" align="center" wrap="wrap">
          <Text fontSize="sm" color="lucera.textMuted">
            {filtered.length} cuenta{filtered.length === 1 ? "" : "s"}
          </Text>
          <ExportButton
            isDisabled={!canExport}
            filename="cuentas-lucera"
            sheetName="Cuentas"
            data={filtered.map((a) => ({
              Código: a.accountCode,
              Titular: a.guardian,
              Email: a.email,
              Teléfono: a.phone,
              País: a.country ? countryApiToEs[a.country] ?? a.country : "",
              Provincia: a.province ?? "",
              Ciudad: a.city ?? "",
              Aseguradora: a.insurance ?? "",
              Plan: planLabel[a.plan] ?? a.plan,
              Estado: a.status === "active" ? "Activa" : "Inactiva",
              Pago: a.paymentStatus ?? "",
              Niños: a.children,
              Chats: a.chats,
              "Fecha de registro": a.createdAt,
            }))}
          />
        </Flex>

        {loading && !accountsData ? (
          <LoadingState label="Cargando cuentas…" />
        ) : (
          <>
            <TableContainer
              borderWidth="1px"
              borderColor="lucera.border"
              borderRadius="md"
            >
              <Table size="sm">
                <Thead bg="crema.100">
                  <Tr>
                    <Th>Código</Th>
                    <Th>Titular</Th>
                    <Th display={{ base: "none", md: "table-cell" }}>
                      Contacto
                    </Th>
                    <Th display={{ base: "none", lg: "table-cell" }}>
                      País / Ciudad
                    </Th>
                    <Th display={{ base: "none", md: "table-cell" }}>
                      Aseguradora
                    </Th>
                    <Th>Plan</Th>
                    <Th>Estado</Th>
                    <Th textAlign="center">Niños</Th>
                    <Th textAlign="center">Chats</Th>
                    <Th display={{ base: "none", lg: "table-cell" }}>
                      Registro
                    </Th>
                    {canEdit && <Th textAlign="right">Acciones</Th>}
                  </Tr>
                </Thead>
                <Tbody>
                  {paginated.map((a) => (
                    <Tr key={a.id} _hover={{ bg: "crema.50" }}>
                      <Td
                        fontFamily="mono"
                        fontSize="xs"
                        fontWeight={600}
                        color="lucera.textMuted"
                      >
                        {a.accountCode}
                      </Td>
                      <Td>
                        <Text fontSize="sm" fontWeight={600}>
                          {a.guardian}
                        </Text>
                      </Td>
                      <Td display={{ base: "none", md: "table-cell" }}>
                        <HStack fontSize="xs">
                          <Phone size={10} />
                          <Text>{a.phone}</Text>
                        </HStack>
                        <HStack fontSize="xs" color="lucera.textMuted">
                          <Mail size={10} />
                          <Text>{a.email}</Text>
                        </HStack>
                      </Td>
                      <Td
                        display={{ base: "none", lg: "table-cell" }}
                        fontSize="sm"
                      >
                        <Text fontSize="xs" color="lucera.textMuted">
                          {a.country ? countryApiToEs[a.country] ?? a.country : "—"}
                        </Text>
                        <Text>{a.city || "—"}</Text>
                      </Td>
                      <Td
                        display={{ base: "none", md: "table-cell" }}
                        fontSize="xs"
                      >
                        {a.insurance || (
                          <Text as="span" color="lucera.textMuted">
                            Sin seguro
                          </Text>
                        )}
                      </Td>
                      <Td>
                        <Badge variant="outline">
                          {planLabel[a.plan] ?? a.plan}
                        </Badge>
                      </Td>
                      <Td>
                        <Badge
                          colorScheme={a.status === "active" ? "green" : "gray"}
                        >
                          {a.status === "active" ? "Activa" : "Inactiva"}
                        </Badge>
                      </Td>
                      <Td textAlign="center">
                        <Badge variant="outline">
                          <HStack spacing={1}>
                            <Baby size={10} />
                            <Text>{a.children}</Text>
                          </HStack>
                        </Badge>
                      </Td>
                      <Td textAlign="center">
                        <Badge variant="outline">
                          <HStack spacing={1}>
                            <MessageSquare size={10} />
                            <Text>{a.chats}</Text>
                          </HStack>
                        </Badge>
                      </Td>
                      <Td
                        display={{ base: "none", lg: "table-cell" }}
                        fontSize="xs"
                        color="lucera.textMuted"
                        sx={{ fontVariantNumeric: "tabular-nums" }}
                      >
                        {a.createdAt}
                      </Td>
                      {canEdit && (
                        <Td textAlign="right">
                          <IconButton
                            aria-label="Editar cuenta"
                            icon={<Pencil size={14} />}
                            size="sm"
                            variant="ghost"
                            onClick={() => openEdit(a)}
                          />
                        </Td>
                      )}
                    </Tr>
                  ))}
                  {paginated.length === 0 && (
                    <Tr>
                      <Td colSpan={canEdit ? 11 : 10}>
                        <Text
                          fontSize="sm"
                          color="lucera.textMuted"
                          textAlign="center"
                          py={4}
                        >
                          No hay cuentas que coincidan con los filtros.
                        </Text>
                      </Td>
                    </Tr>
                  )}
                </Tbody>
              </Table>
            </TableContainer>

            <Box mt={4}>
              <Pagination
                page={page}
                totalPages={totalPages}
                onPageChange={setPage}
              />
            </Box>
          </>
        )}
      </StatCard>

      {canEdit && (
        <GuardianEditModal
          guardian={editing}
          onClose={() => setEditing(null)}
          onSaved={() => {
            refetch();
            refetchGuardians();
          }}
        />
      )}
    </DashboardLayout>
  );
}
