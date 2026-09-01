import { useEffect, useMemo, useRef, useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useAuth } from "@/lib/auth";
import { useFetch } from "@/hooks/useFetch";
import { useFetchAll } from "@/hooks/useFetchAll";
import { apiFetch } from "@/lib/apiClient";
import type {
  UserApi,
  UserCreatePayload,
  UserCreateResponse,
  PasswordResetResponse,
  RolesCatalogResponse,
} from "@/lib/apiTypes";
import {
  Box,
  Button,
  Flex,
  FormControl,
  FormLabel,
  HStack,
  IconButton,
  Input,
  InputGroup,
  InputLeftElement,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
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
  VStack,
  useDisclosure,
} from "@chakra-ui/react";
import { Search, Mail, CheckCircle2, XCircle, Plus, KeyRound } from "lucide-react";
import { StatCard } from "@/components/StatCard";
import { Pagination } from "@/components/Pagination";
import { LoadingState } from "@/components/LoadingState";
import { ExportButton } from "@/components/ExportButton";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { RevealSecretDialog } from "@/components/RevealSecretDialog";
import { toast } from "@/lib/toast";

// Rol del panel a etiqueta legible en español. Cubre tanto el dashboardRole
// (Admin/Doctor/Sales) como el rol interno (admin/doctor/marketing) de /api/roles.
const roleLabel: Record<string, string> = {
  Admin: "Admin",
  Doctor: "Médico",
  Sales: "Ventas",
  Guest: "Invitado",
  admin: "Admin",
  doctor: "Médico",
  marketing: "Ventas",
};

const PER_PAGE = 12;

export default function Accounts() {
  const { user, token, getValidToken } = useAuth();
  const canExport = user?.role !== "Invitado";
  const canManage = user?.role === "Admin";

  const {
    data: usersData,
    loading,
    error,
    refetch,
  } = useFetchAll<UserApi>(token ? "/api/users" : null);

  // Catálogo de roles para el alta (solo admin lo necesita). El endpoint
  // devuelve { items: [{ value, label, dashboardRole }] }.
  const { data: rolesData } = useFetch<RolesCatalogResponse>(
    canManage && token ? "/api/roles" : null
  );
  const roleCatalog = useMemo(() => rolesData?.items ?? [], [rolesData]);

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

  // --- Alta de usuario (admin) ---
  const createModal = useDisclosure();
  const [savingUser, setSavingUser] = useState(false);
  // Secreto a mostrar una sola vez (alta o reset).
  const [secret, setSecret] = useState<{
    title: string;
    description: string;
    secret?: string | null;
    note?: string;
  } | null>(null);

  const handleCreate = async (form: HTMLFormElement) => {
    const fd = new FormData(form);
    const payload: UserCreatePayload = {
      name: String(fd.get("name") || "").trim(),
      email: String(fd.get("email") || "").trim(),
      role: String(fd.get("role") || ""),
      idNumber: String(fd.get("idNumber") || "").trim(),
    };
    setSavingUser(true);
    try {
      const freshToken = await getValidToken();
      const res = await apiFetch<UserCreateResponse>("/api/users", freshToken, {
        method: "POST",
        body: JSON.stringify(payload),
      });
      createModal.onClose();
      refetch();
      setSecret({
        title: "Usuario creado",
        description:
          "Comparte esta contraseña inicial con la persona; deberá cambiarla en su primer ingreso.",
        secret: res.initialPassword,
      });
    } catch (err) {
      toast.error("No se pudo crear el usuario", {
        description: err instanceof Error ? err.message : undefined,
      });
    } finally {
      setSavingUser(false);
    }
  };

  // --- Restablecer contraseña (admin) ---
  const [toReset, setToReset] = useState<UserApi | null>(null);

  const handleReset = async () => {
    if (!toReset) return;
    try {
      const freshToken = await getValidToken();
      const res = await apiFetch<PasswordResetResponse>(
        `/api/users/${toReset.id}/password/reset`,
        freshToken,
        { method: "POST" }
      );
      const name = toReset.name;
      setToReset(null);
      if (res.derivedFromIdNumber) {
        setSecret({
          title: "Contraseña restablecida",
          description: `Se restableció la contraseña de ${name}.`,
          note: "Se dejó como su cédula (Lucera + su número de cédula). Deberá cambiarla al entrar.",
        });
      } else {
        setSecret({
          title: "Contraseña restablecida",
          description: `Contraseña temporal de ${name}. Compártela; deberá cambiarla al entrar.`,
          secret: res.temporaryPassword,
        });
      }
    } catch (err) {
      setToReset(null);
      toast.error("No se pudo restablecer la contraseña", {
        description: err instanceof Error ? err.message : undefined,
      });
    }
  };

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
          <HStack spacing={2}>
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
            {canManage && (
              <Button
                colorScheme="brand"
                leftIcon={<Plus size={16} />}
                onClick={createModal.onOpen}
              >
                Nuevo usuario
              </Button>
            )}
          </HStack>
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
                <Thead bg="cream.100">
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
                    {canManage && <Th textAlign="right">Acciones</Th>}
                  </Tr>
                </Thead>
                <Tbody>
                  {paginated.map((u) => (
                    <Tr key={u.id} _hover={{ bg: "cream.50" }}>
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
                      {canManage && (
                        <Td textAlign="right">
                          <IconButton
                            aria-label="Restablecer contraseña"
                            icon={<KeyRound size={14} />}
                            size="sm"
                            variant="ghost"
                            onClick={() => setToReset(u)}
                          />
                        </Td>
                      )}
                    </Tr>
                  ))}
                  {paginated.length === 0 && (
                    <Tr>
                      <Td colSpan={canManage ? 10 : 9}>
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

      {/* Alta de usuario */}
      <Modal
        isOpen={createModal.isOpen}
        onClose={createModal.onClose}
        size="md"
      >
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Nuevo usuario del panel</ModalHeader>
          <ModalCloseButton />
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleCreate(e.currentTarget);
            }}
          >
            <ModalBody>
              <Text fontSize="xs" color="lucera.textMuted" mb={3}>
                Se crea con la cédula; el sistema genera una contraseña inicial
                que se mostrará una sola vez.
              </Text>
              <VStack spacing={4} align="stretch">
                <FormControl isRequired>
                  <FormLabel>Nombre completo</FormLabel>
                  <Input name="name" placeholder="Nombre del usuario" />
                </FormControl>
                <FormControl isRequired>
                  <FormLabel>Email</FormLabel>
                  <Input name="email" type="email" placeholder="correo@lucera.pa" />
                </FormControl>
                <FormControl isRequired>
                  <FormLabel>Cédula / documento</FormLabel>
                  <Input name="idNumber" placeholder="8-123-4567" />
                </FormControl>
                <FormControl isRequired>
                  <FormLabel>Rol</FormLabel>
                  <Select name="role" placeholder="Seleccionar rol">
                    {roleCatalog.map((r) => (
                      <option key={r.value} value={r.value}>
                        {r.label}
                      </option>
                    ))}
                  </Select>
                </FormControl>
              </VStack>
            </ModalBody>
            <ModalFooter>
              <Button
                variant="outline"
                mr={2}
                onClick={createModal.onClose}
                isDisabled={savingUser}
              >
                Cancelar
              </Button>
              <Button type="submit" colorScheme="brand" isLoading={savingUser}>
                Crear usuario
              </Button>
            </ModalFooter>
          </form>
        </ModalContent>
      </Modal>

      {/* Confirmar restablecimiento */}
      <ConfirmDialog
        open={!!toReset}
        onOpenChange={(o) => !o && setToReset(null)}
        title="Restablecer contraseña"
        description={
          <>
            ¿Restablecer la contraseña de <strong>{toReset?.name}</strong>? Se
            generará una temporal y deberá cambiarla en su próximo ingreso.
          </>
        }
        onConfirm={handleReset}
      />

      {/* Credencial generada (una sola vez) */}
      <RevealSecretDialog
        isOpen={!!secret}
        onClose={() => setSecret(null)}
        title={secret?.title ?? ""}
        description={secret?.description}
        secret={secret?.secret}
        note={secret?.note}
      />
    </DashboardLayout>
  );
}
