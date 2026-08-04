import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useAuth } from "@/lib/auth";
import { useFetchAll } from "@/hooks/useFetchAll";
import { apiFetch } from "@/lib/apiClient";
import { toast } from "@/lib/toast";
import { LoadingState } from "@/components/LoadingState";
import { StatCard } from "@/components/StatCard";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { Pagination } from "@/components/Pagination";
import type {
  InsuranceRef,
  NameInPayload,
  DeleteResponse,
  ChatApi,
  GuardianApi,
} from "@/lib/apiTypes";
import {
  Box,
  Button,
  Flex,
  HStack,
  Heading,
  Icon,
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
  FormControl,
  FormLabel,
  Select,
  SimpleGrid,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  Text,
  useDisclosure,
} from "@chakra-ui/react";
import {
  BarChart,
  Bar,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LabelList,
} from "recharts";
import { Search, ShieldCheck, Plus, Pencil, Trash2 } from "lucide-react";
import { formatNumber } from "@/lib/format";

const brandColors = ["#6d122b", "#ef7d54", "#f8cc37"];
const dispositionColors = {
  urgencias: "#b91c1c",
  citas: "#ef7d54",
  casa: "#2f9e6b",
};
const tooltipStyle = {
  background: "white",
  border: "1px solid #e9d2b1",
  borderRadius: 8,
  fontSize: 12,
};
const yAxisDomain: [number, (dataMax: number) => number] = [
  0,
  (dataMax) => Math.ceil((dataMax || 1) * 1.18),
];

export default function Insurances() {
  const { user, token, getValidToken } = useAuth();
  const isAdmin = user?.role === "Admin";
  const canEdit = user?.role !== "Invitado" && isAdmin;

  const {
    data: insurancesData,
    loading,
    error,
    refetch,
  } = useFetchAll<InsuranceRef>(token ? "/api/insurances" : null);
  const insurances = useMemo(
    () => insurancesData?.items ?? [],
    [insurancesData]
  );

  // Data para los indicadores por aseguradora (consultas/urgencias/disposición).
  const { data: chatsData, error: chatsError } = useFetchAll<ChatApi>(
    token ? "/api/chats" : null
  );
  const { data: guardiansData, error: guardiansError } =
    useFetchAll<GuardianApi>(token ? "/api/guardians" : null);
  const chats = useMemo(() => chatsData?.items ?? [], [chatsData]);
  const guardians = useMemo(() => guardiansData?.items ?? [], [guardiansData]);

  useEffect(() => {
    const err = error || chatsError || guardiansError;
    if (err) {
      toast.error("No se pudieron cargar los seguros médicos", {
        description: err,
      });
    }
  }, [error, chatsError, guardiansError]);

  // -------- Filtros de los indicadores (reactivos, sin botón Buscar) --------
  const [analyticsInsurance, setAnalyticsInsurance] = useState("todos");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // Cada chat se asocia a un seguro vía el teléfono de su acudiente.
  const insuranceByPhone = useMemo(
    () =>
      new Map(
        guardians.map((g) => [g.phone, g.insurance?.name ?? "Sin seguro"])
      ),
    [guardians]
  );

  const insurerStats = useMemo(() => {
    const byInsurer = new Map<
      string,
      {
        name: string;
        total: number;
        urgencias: number;
        citas: number;
        casa: number;
      }
    >();
    chats.forEach((c) => {
      const date = c.startedAt.slice(0, 10);
      if (startDate && date < startDate) return;
      if (endDate && date > endDate) return;
      const name = insuranceByPhone.get(c.phone) ?? "Sin seguro";
      if (analyticsInsurance !== "todos" && name !== analyticsInsurance) return;
      if (!byInsurer.has(name)) {
        byInsurer.set(name, {
          name,
          total: 0,
          urgencias: 0,
          citas: 0,
          casa: 0,
        });
      }
      const entry = byInsurer.get(name)!;
      entry.total++;
      if (c.triage === "emergency") entry.urgencias++;
      else if (c.attentionType === "in_person") entry.citas++;
      else entry.casa++;
    });
    return [...byInsurer.values()].sort((a, b) => b.total - a.total);
  }, [chats, insuranceByPhone, analyticsInsurance, startDate, endDate]);

  // Consultas totales por aseguradora (todo el histórico, sin los filtros de
  // fecha/seguro de arriba), para la columna "Consultas" de la tabla.
  const consultationsByInsurance = useMemo(() => {
    const m = new Map<string, number>();
    chats.forEach((c) => {
      const name = insuranceByPhone.get(c.phone) ?? "Sin seguro";
      m.set(name, (m.get(name) ?? 0) + 1);
    });
    return m;
  }, [chats, insuranceByPhone]);

  // -------- CRUD (directorio de aseguradoras) --------
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const perPage = 10;
  const filtered = useMemo(() => {
    return insurances.filter((i) =>
      `${i.id} ${i.name}`.toLowerCase().includes(q.toLowerCase())
    );
  }, [insurances, q]);
  const totalPages = Math.ceil(filtered.length / perPage);
  const paginated = filtered.slice((page - 1) * perPage, page * perPage);

  const { isOpen, onOpen, onClose } = useDisclosure();
  const [editing, setEditing] = useState<InsuranceRef | null>(null);
  const [toDelete, setToDelete] = useState<InsuranceRef | null>(null);
  const [saving, setSaving] = useState(false);
  // Loading breve para dar feedback al cambiar el filtro o tras crear/editar/eliminar.
  const [searching, setSearching] = useState(false);
  const searchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const flashLoading = useCallback(() => {
    setSearching(true);
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(() => setSearching(false), 450);
  }, []);
  useEffect(() => {
    return () => {
      if (searchTimeout.current) clearTimeout(searchTimeout.current);
    };
  }, []);
  // Al cambiar la búsqueda: volver a la primera página y mostrar loading breve.
  useEffect(() => {
    setPage(1);
    flashLoading();
  }, [q, flashLoading]);

  const openEdit = (i: InsuranceRef | null) => {
    setEditing(i);
    onOpen();
  };

  const handleSave = async (form: HTMLFormElement) => {
    const fd = new FormData(form);
    const payload: NameInPayload = { name: String(fd.get("name")) };

    setSaving(true);
    try {
      const freshToken = await getValidToken();
      if (editing) {
        await apiFetch(`/api/insurances/${editing.id}`, freshToken, {
          method: "PATCH",
          body: JSON.stringify(payload),
        });
        toast.success("Seguro médico actualizado");
      } else {
        await apiFetch("/api/insurances", freshToken, {
          method: "POST",
          body: JSON.stringify(payload),
        });
        toast.success("Seguro médico creado");
      }
      onClose();
      setEditing(null);
      refetch();
      flashLoading();
    } catch (err) {
      const isDuplicate =
        err instanceof Error && err.message.startsWith("Error 409");
      toast.error(
        editing
          ? "No se pudo actualizar el seguro médico"
          : "No se pudo crear el seguro médico",
        {
          description: isDuplicate
            ? "Ya existe un seguro médico con ese nombre."
            : err instanceof Error
            ? err.message
            : undefined,
        }
      );
    } finally {
      setSaving(false);
    }
  };

  const totalConsultas = insurerStats.reduce((s, e) => s + e.total, 0);
  const totalUrgencias = insurerStats.reduce((s, e) => s + e.urgencias, 0);

  return (
    <DashboardLayout
      title="Seguros médicos"
      subtitle="Directorio de aseguradoras soportadas"
    >
      {(loading && !insurancesData) || searching ? (
        <LoadingState label="Cargando seguros médicos…" />
      ) : (
        <>
          {/* ==================== DIRECTORIO (CRUD) ==================== */}
          <StatCard mb={4}>
            <Flex
              direction={{ base: "column", sm: "row" }}
              gap={3}
              align={{ sm: "center" }}
              justify="space-between"
              mb={4}
            >
              <Box>
                <Heading size="sm" fontFamily="heading">
                  Directorio de seguros
                </Heading>
                <Text fontSize="xs" color="lucera.textMuted">
                  {filtered.length} de {insurances.length} aseguradoras
                </Text>
              </Box>
              <HStack gap={3} w={{ base: "100%", sm: "auto" }}>
                <InputGroup size="sm" maxW={{ sm: "260px" }}>
                  <InputLeftElement pointerEvents="none">
                    <Search size={14} />
                  </InputLeftElement>
                  <Input
                    placeholder="Buscar seguro médico…"
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                  />
                </InputGroup>
                {canEdit && (
                  <Button
                    size="sm"
                    colorScheme="vino"
                    leftIcon={<Plus size={16} />}
                    onClick={() => openEdit(null)}
                    flexShrink={0}
                  >
                    Nuevo
                  </Button>
                )}
              </HStack>
            </Flex>

            <TableContainer
              borderWidth="1px"
              borderColor="lucera.border"
              borderRadius="md"
            >
              <Table size="sm">
                <Thead bg="crema.100">
                  <Tr>
                    <Th>Seguro médico</Th>
                    <Th isNumeric>Consultas</Th>
                    {canEdit && <Th textAlign="right">Acciones</Th>}
                  </Tr>
                </Thead>
                <Tbody>
                  {paginated.map((i) => (
                    <Tr key={i.id} _hover={{ bg: "crema.50" }}>
                      <Td>
                        <HStack spacing={3}>
                          <Flex
                            h={8}
                            w={8}
                            flexShrink={0}
                            borderRadius="lg"
                            align="center"
                            justify="center"
                            bg="vino.50"
                            color="vino.500"
                          >
                            <Icon as={ShieldCheck} boxSize={4} />
                          </Flex>
                          <Text fontSize="sm" fontWeight={600}>
                            {i.name}
                          </Text>
                        </HStack>
                      </Td>
                      <Td isNumeric fontWeight={600}>
                        {formatNumber(
                          consultationsByInsurance.get(i.name) ?? 0
                        )}
                      </Td>
                      {canEdit && (
                        <Td textAlign="right">
                          <IconButton
                            aria-label="Editar"
                            size="sm"
                            variant="ghost"
                            icon={<Pencil size={14} />}
                            onClick={() => openEdit(i)}
                          />
                          <IconButton
                            aria-label="Eliminar"
                            size="sm"
                            variant="ghost"
                            color="peligro.500"
                            icon={<Trash2 size={14} />}
                            onClick={() => setToDelete(i)}
                          />
                        </Td>
                      )}
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </TableContainer>

            {filtered.length === 0 && (
              <Text
                mt={6}
                fontSize="sm"
                color="lucera.textMuted"
                textAlign="center"
              >
                No hay resultados.
              </Text>
            )}

            <Pagination
              page={page}
              totalPages={totalPages}
              onPageChange={setPage}
            />
          </StatCard>

          {/* ==================== INDICADORES POR ASEGURADORA ==================== */}
          <StatCard mb={4}>
            <Box mb={4}>
              <Heading size="sm" fontFamily="heading">
                Indicadores por aseguradora
              </Heading>
              <Text fontSize="xs" color="lucera.textMuted">
                Consultas y disposición de los chats por seguro médico.
              </Text>
            </Box>
            <Flex
              direction={{ base: "column", md: "row" }}
              gap={3}
              align={{ md: "end" }}
              wrap="wrap"
              mb={4}
            >
              <Box>
                <Text fontSize="xs" fontWeight={600} mb={1}>
                  Seguro médico
                </Text>
                <Select
                  size="sm"
                  w={{ base: "100%", md: "220px" }}
                  value={analyticsInsurance}
                  onChange={(e) => setAnalyticsInsurance(e.target.value)}
                >
                  <option value="todos">Todos los seguros</option>
                  <option value="Sin seguro">Sin seguro</option>
                  {insurances.map((i) => (
                    <option key={i.id} value={i.name}>
                      {i.name}
                    </option>
                  ))}
                </Select>
              </Box>
              <Box>
                <Text fontSize="xs" fontWeight={600} mb={1}>
                  Fecha inicio
                </Text>
                <Input
                  type="date"
                  size="sm"
                  w={{ base: "100%", md: "160px" }}
                  value={startDate}
                  max={endDate || undefined}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </Box>
              <Box>
                <Text fontSize="xs" fontWeight={600} mb={1}>
                  Fecha fin
                </Text>
                <Input
                  type="date"
                  size="sm"
                  w={{ base: "100%", md: "160px" }}
                  value={endDate}
                  min={startDate || undefined}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </Box>
              <Box flex={1} />
              <Text fontSize="xs" color="lucera.textMuted">
                {formatNumber(totalConsultas)} consultas ·{" "}
                {formatNumber(totalUrgencias)} urgencias
              </Text>
            </Flex>

            <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={4}>
              <Box>
                <Heading size="sm" fontFamily="heading" mb={4}>
                  Total de consultas por aseguradora
                </Heading>
                <ResponsiveContainer width="100%" height={240}>
                  <BarChart data={insurerStats} margin={{ top: 20, left: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e9d2b1" />
                    <XAxis
                      dataKey="name"
                      interval={0}
                      angle={-20}
                      textAnchor="end"
                      height={60}
                      tick={{ fontSize: 10, fill: "#7b5a48" }}
                    />
                    <YAxis
                      allowDecimals={false}
                      domain={yAxisDomain}
                      tick={{ fontSize: 11, fill: "#7b5a48" }}
                    />
                    <Tooltip
                      cursor={{ fill: "rgba(109,18,43,0.06)" }}
                      contentStyle={tooltipStyle}
                    />
                    <Bar
                      dataKey="total"
                      radius={[6, 6, 0, 0]}
                      maxBarSize={60}
                      animationDuration={700}
                    >
                      {insurerStats.map((_, i) => (
                        <Cell
                          key={i}
                          fill={brandColors[i % brandColors.length]}
                        />
                      ))}
                      <LabelList
                        dataKey="total"
                        position="top"
                        formatter={(v: number) => formatNumber(v)}
                        fontSize={11}
                        fontWeight={700}
                        fill="#3a2a1f"
                      />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </Box>

              <Box>
                <Heading size="sm" fontFamily="heading" mb={4}>
                  Urgencias por aseguradora
                </Heading>
                <ResponsiveContainer width="100%" height={240}>
                  <BarChart data={insurerStats} margin={{ top: 20, left: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e9d2b1" />
                    <XAxis
                      dataKey="name"
                      interval={0}
                      angle={-20}
                      textAnchor="end"
                      height={60}
                      tick={{ fontSize: 10, fill: "#7b5a48" }}
                    />
                    <YAxis
                      allowDecimals={false}
                      domain={yAxisDomain}
                      tick={{ fontSize: 11, fill: "#7b5a48" }}
                    />
                    <Tooltip
                      cursor={{ fill: "rgba(185,28,28,0.06)" }}
                      contentStyle={tooltipStyle}
                    />
                    <Bar
                      dataKey="urgencias"
                      radius={[6, 6, 0, 0]}
                      maxBarSize={60}
                      fill={dispositionColors.urgencias}
                      animationDuration={700}
                    >
                      <LabelList
                        dataKey="urgencias"
                        position="top"
                        formatter={(v: number) => formatNumber(v)}
                        fontSize={11}
                        fontWeight={700}
                        fill="#3a2a1f"
                      />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            </SimpleGrid>

            <Box mt={2}>
              <Heading size="sm" fontFamily="heading" mb={1}>
                Eventos por aseguradora
              </Heading>
              <Text fontSize="xs" color="lucera.textMuted" mb={4}>
                Barra segmentada con casa · cita · urgencia por seguro.
              </Text>
              <ResponsiveContainer
                width="100%"
                height={Math.max(180, insurerStats.length * 42 + 60)}
              >
                <BarChart
                  layout="vertical"
                  data={insurerStats}
                  margin={{ top: 0, left: 20, right: 20 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#e9d2b1" />
                  <XAxis
                    type="number"
                    allowDecimals={false}
                    tick={{ fontSize: 11, fill: "#7b5a48" }}
                  />
                  <YAxis
                    type="category"
                    dataKey="name"
                    width={140}
                    tick={{ fontSize: 10, fill: "#7b5a48" }}
                  />
                  <Tooltip
                    cursor={{ fill: "rgba(109,18,43,0.06)" }}
                    contentStyle={tooltipStyle}
                  />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  <Bar
                    dataKey="casa"
                    name="Casa"
                    stackId="a"
                    fill={dispositionColors.casa}
                    maxBarSize={26}
                  />
                  <Bar
                    dataKey="citas"
                    name="Cita"
                    stackId="a"
                    fill={dispositionColors.citas}
                    maxBarSize={26}
                  />
                  <Bar
                    dataKey="urgencias"
                    name="Urgencia"
                    stackId="a"
                    fill={dispositionColors.urgencias}
                    maxBarSize={26}
                    radius={[0, 6, 6, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
              {insurerStats.length === 0 && (
                <Text
                  mt={2}
                  fontSize="sm"
                  color="lucera.textMuted"
                  textAlign="center"
                >
                  No hay consultas para los filtros seleccionados.
                </Text>
              )}
            </Box>
          </StatCard>
        </>
      )}
      <Modal isOpen={isOpen} onClose={onClose} isCentered size="sm">
        <ModalOverlay />
        <ModalContent
          as="form"
          onSubmit={(e) => {
            e.preventDefault();
            handleSave(e.currentTarget as HTMLFormElement);
          }}
        >
          <ModalHeader>
            {editing ? "Editar seguro médico" : "Nuevo seguro médico"}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <FormControl isRequired>
              <FormLabel>Nombre</FormLabel>
              <Input
                name="name"
                defaultValue={editing?.name}
                placeholder="Ej: MAPFRE"
              />
            </FormControl>
          </ModalBody>
          <ModalFooter>
            <Button
              variant="outline"
              mr={2}
              onClick={onClose}
              isDisabled={saving}
            >
              Cancelar
            </Button>
            <Button type="submit" colorScheme="vino" isLoading={saving}>
              {editing ? "Actualizar" : "Crear"}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <ConfirmDialog
        open={!!toDelete}
        onOpenChange={(o) => !o && setToDelete(null)}
        title="Eliminar seguro médico"
        description={
          <>
            ¿Eliminar <strong>{toDelete?.name}</strong> del directorio? Es un
            borrado suave: se desactiva y deja de aparecer en las listas.
          </>
        }
        onConfirm={async () => {
          if (!toDelete) return;
          try {
            const freshToken = await getValidToken();
            await apiFetch<DeleteResponse>(
              `/api/insurances/${toDelete.id}`,
              freshToken,
              { method: "DELETE" }
            );
            toast.success("Seguro médico eliminado");
            refetch();
            flashLoading();
          } catch (err) {
            toast.error("No se pudo eliminar el seguro médico", {
              description: err instanceof Error ? err.message : undefined,
            });
          }
        }}
      />
    </DashboardLayout>
  );
}
