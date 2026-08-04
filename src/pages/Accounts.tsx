import { useEffect, useMemo, useRef, useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useAuth } from "@/lib/auth";
import { useFetchAll } from "@/hooks/useFetchAll";
import type { UserApi } from "@/lib/apiTypes";
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
  Badge,
  Text,
  TableContainer,
} from "@chakra-ui/react";
import { Search, Mail, CheckCircle2, XCircle } from "lucide-react";
import { StatCard } from "@/components/StatCard";
import { Pagination } from "@/components/Pagination";
import { LoadingState } from "@/components/LoadingState";
import { ExportButton } from "@/components/ExportButton";
import { toast } from "@/lib/toast";

// Rol del panel a etiqueta legible en español.
const roleLabel: Record<string, string> = {
  Admin: "Admin",
  Doctor: "Médico",
  Sales: "Ventas",
  Guest: "Invitado",
};

const PER_PAGE = 12;

export default function Accounts() {
  const { user, token } = useAuth();
  const canExport = user?.role !== "Invitado";

  // Solo lectura: se muestra lo que devuelve GET /api/users.
  const {
    data: usersData,
    loading,
    error,
  } = useFetchAll<UserApi>(token ? "/api/users" : null);

  useEffect(() => {
    if (error) {
      toast.error("No se pudieron cargar los usuarios", { description: error });
    }
  }, [error]);

  const users = useMemo(() => usersData?.items ?? [], [usersData]);

  const [q, setQ] = useState("");
  const [roleFilter, setRoleFilter] = useState("todos");
  const [statusFilter, setStatusFilter] = useState("todos");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [page, setPage] = useState(1);
  // Loading breve al cambiar filtros (el filtrado es client-side e instantáneo;
  // da feedback visual). Se debouncea para que no parpadee en cada tecla.
  const [searching, setSearching] = useState(false);
  const searchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    return () => {
      if (searchTimeout.current) clearTimeout(searchTimeout.current);
    };
  }, []);

  // Opciones de rol derivadas de la data real.
  const roleOptions = useMemo(
    () => [...new Set(users.map((u) => u.dashboardRole).filter(Boolean))].sort(),
    [users]
  );

  const filtered = useMemo(() => {
    return users.filter((u) => {
      const okQ = `${u.name} ${u.email} ${u.idNumber ?? ""}`
        .toLowerCase()
        .includes(q.trim().toLowerCase());
      const okRole =
        roleFilter === "todos" || u.dashboardRole === roleFilter;
      const okStatus =
        statusFilter === "todos" ||
        (statusFilter === "activo" ? u.isActive : !u.isActive);
      const dateStr = u.createdAt?.slice(0, 10) ?? "";
      const okFrom = !dateFrom || dateStr >= dateFrom;
      const okTo = !dateTo || dateStr <= dateTo;
      return okQ && okRole && okStatus && okFrom && okTo;
    });
  }, [users, q, roleFilter, statusFilter, dateFrom, dateTo]);

  // Al cambiar cualquier filtro: volver a la primera página y mostrar un
  // loading breve (~400ms, debounceado) para dar feedback.
  useEffect(() => {
    setPage(1);
    setSearching(true);
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(() => setSearching(false), 400);
  }, [q, roleFilter, statusFilter, dateFrom, dateTo]);

  const totalPages = Math.ceil(filtered.length / PER_PAGE);
  const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  return (
    <DashboardLayout title="Cuentas" subtitle="Usuarios del panel">
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
                placeholder="Nombre, email, cédula…"
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
              Rol
            </Text>
            <Select
              w={{ base: "100%", md: "160px" }}
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
            >
              <option value="todos">Todos los roles</option>
              {roleOptions.map((r) => (
                <option key={r} value={r}>
                  {roleLabel[r] ?? r}
                </option>
              ))}
            </Select>
          </Box>
          <Box>
            <Text fontSize="xs" fontWeight={600} mb={1}>
              Estado
            </Text>
            <Select
              w={{ base: "100%", md: "150px" }}
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="todos">Todos</option>
              <option value="activo">Activos</option>
              <option value="inactivo">Inactivos</option>
            </Select>
          </Box>
        </Flex>

        <Flex gap={3} mb={4} justify="space-between" align="center" wrap="wrap">
          <Text fontSize="sm" color="lucera.textMuted">
            {filtered.length} usuario{filtered.length === 1 ? "" : "s"}
          </Text>
          <ExportButton
            isDisabled={!canExport}
            filename="usuarios-lucera"
            sheetName="Usuarios"
            data={filtered.map((u) => ({
              Nombre: u.name,
              Email: u.email,
              Rol: roleLabel[u.dashboardRole] ?? u.dashboardRole,
              Estado: u.isActive ? "Activo" : "Inactivo",
              "Acceso al panel": u.dashboardAccess ? "Sí" : "No",
              Especialidad: u.specialty ?? "",
              Cédula: u.idNumber ?? "",
              Licencia: u.licenseId ?? "",
              "Fecha de registro": u.createdAt,
            }))}
          />
        </Flex>

        {(loading && !usersData) || searching ? (
          <LoadingState label="Cargando usuarios…" />
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
                    <Th>Nombre</Th>
                    <Th display={{ base: "none", md: "table-cell" }}>Email</Th>
                    <Th>Rol</Th>
                    <Th>Estado</Th>
                    <Th textAlign="center">Acceso al panel</Th>
                    <Th display={{ base: "none", lg: "table-cell" }}>
                      Especialidad
                    </Th>
                    <Th display={{ base: "none", xl: "table-cell" }}>Cédula</Th>
                    <Th display={{ base: "none", xl: "table-cell" }}>
                      Licencia
                    </Th>
                    <Th display={{ base: "none", lg: "table-cell" }}>
                      Registro
                    </Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {paginated.map((u) => (
                    <Tr key={u.id} _hover={{ bg: "crema.50" }}>
                      <Td>
                        <Text fontSize="sm" fontWeight={600}>
                          {u.name}
                        </Text>
                      </Td>
                      <Td display={{ base: "none", md: "table-cell" }}>
                        <HStack fontSize="xs" color="lucera.textMuted">
                          <Mail size={10} />
                          <Text>{u.email}</Text>
                        </HStack>
                      </Td>
                      <Td>
                        <Badge variant="outline">
                          {roleLabel[u.dashboardRole] ?? u.dashboardRole}
                        </Badge>
                      </Td>
                      <Td>
                        <Badge colorScheme={u.isActive ? "green" : "gray"}>
                          {u.isActive ? "Activo" : "Inactivo"}
                        </Badge>
                      </Td>
                      <Td textAlign="center">
                        {u.dashboardAccess ? (
                          <CheckCircle2
                            size={16}
                            color="#2f855a"
                            style={{ display: "inline" }}
                          />
                        ) : (
                          <XCircle
                            size={16}
                            color="#a0aec0"
                            style={{ display: "inline" }}
                          />
                        )}
                      </Td>
                      <Td
                        display={{ base: "none", lg: "table-cell" }}
                        fontSize="xs"
                      >
                        {u.specialty || (
                          <Text as="span" color="lucera.textMuted">
                            —
                          </Text>
                        )}
                      </Td>
                      <Td
                        display={{ base: "none", xl: "table-cell" }}
                        fontSize="xs"
                        color="lucera.textMuted"
                      >
                        {u.idNumber || "—"}
                      </Td>
                      <Td
                        display={{ base: "none", xl: "table-cell" }}
                        fontSize="xs"
                        color="lucera.textMuted"
                      >
                        {u.licenseId || "—"}
                      </Td>
                      <Td
                        display={{ base: "none", lg: "table-cell" }}
                        fontSize="xs"
                        color="lucera.textMuted"
                        sx={{ fontVariantNumeric: "tabular-nums" }}
                      >
                        {u.createdAt}
                      </Td>
                    </Tr>
                  ))}
                  {paginated.length === 0 && (
                    <Tr>
                      <Td colSpan={9}>
                        <Text
                          fontSize="sm"
                          color="lucera.textMuted"
                          textAlign="center"
                          py={4}
                        >
                          No hay usuarios que coincidan con los filtros.
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
    </DashboardLayout>
  );
}
