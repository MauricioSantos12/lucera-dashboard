import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Guardian, Child, Relationship, AccountStatus } from "@/lib/mockData";
import { useAuth } from "@/lib/auth";
import { useFetchAll } from "@/hooks/useFetchAll";
import { useGeo } from "@/hooks/useGeo";
import { apiFetch } from "@/lib/apiClient";
import {
  relationToEs,
  relationToApi,
  statusToEs,
  statusToApi,
  planToEs,
  planToApi,
  countryApiToEs,
  countryEsToApi,
  chatTriageToLevel,
  genderToValue,
  genderLabel,
} from "@/lib/apiMappings";
import type {
  GuardianApi,
  GuardianPatchPayload,
  GuardianCreatePayload,
  InsuranceRef,
  ChatApi,
  PlanApi,
  DeleteResponse,
} from "@/lib/apiTypes";
import {
  Box,
  Button,
  Flex,
  HStack,
  VStack,
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
  Divider,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  FormControl,
  FormLabel,
  SimpleGrid,
  Text,
  useDisclosure,
  TableContainer,
} from "@chakra-ui/react";
import {
  Search,
  Plus,
  Pencil,
  Trash2,
  Users as UsersIcon,
  Phone,
  Mail,
  Baby,
  MapPin,
  MessageSquare,
  ChevronRight,
  Eye,
} from "lucide-react";
import { TriageBadge } from "@/components/TriageBadge";
import { StatCard } from "@/components/StatCard";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { Pagination } from "@/components/Pagination";
import { LoadingState } from "@/components/LoadingState";
import { ExportButton } from "@/components/ExportButton";
import { toast } from "@/lib/toast";
import { chatStatusLabel } from "./Children";

const statusTone = (status: Guardian["status"]) =>
  status === "activa" ? "green" : status === "suspendida" ? "yellow" : "red";

function guardianApiToRow(g: GuardianApi): Guardian {
  return {
    id: g.id,
    phone: g.phone,
    email: g.email,
    name: g.name,
    relationship: relationToEs[g.relationship] ?? "Tutor",
    country: countryApiToEs[g.country] ?? g.country,
    city: g.city,
    insurance: g.insurance?.name as Guardian["insurance"],
    policyNumber: g.insurance ? String(g.insurance.id) : undefined,
    status: statusToEs[g.status] ?? "activa",
    plan: planToEs[g.plan] ?? "Gratuito",
    registeredAt: g.registeredAt,
    accountCode: g.accountCode,
    gender: g.gender,
    idNumber: g.idNumber,
    address: g.address,
    province: g.province,
    chats: g.chats,
    children: g.children.map(
      (c): Child => ({
        id: c.id,
        name: c.name,
        birthDate: c.birthDate,
        bloodType: (c.bloodType ?? undefined) as Child["bloodType"],
        weightKg: c.weightKg ?? undefined,
        conditions: c.conditions,
        allergies: c.allergies,
      })
    ),
  };
}

export default function Guardians() {
  const { user, token, getValidToken } = useAuth();
  // Solo Admin crea/edita/elimina; el resto (Ventas, Médico) es solo lectura.
  const canEdit = user?.role === "Admin";
  const canExport = user?.role !== "Invitado";
  const {
    data: guardiansData,
    loading: guardiansLoading,
    error: guardiansError,
    refetch: refetchGuardians,
  } = useFetchAll<GuardianApi>(token ? "/api/guardians" : null);
  const { data: insurancesData } = useFetchAll<InsuranceRef>(
    token ? "/api/insurances" : null
  );
  const { data: chatsData } = useFetchAll<ChatApi>(token ? "/api/chats" : null);
  const insurances = useMemo(
    () => insurancesData?.items ?? [],
    [insurancesData]
  );
  const data = useMemo(
    () => (guardiansData?.items ?? []).map(guardianApiToRow),
    [guardiansData]
  );

  // Los chats de cada acudiente se agrupan por su teléfono.
  const chatsByPhone = useMemo(() => {
    const map = new Map<string, ChatApi[]>();
    (chatsData?.items ?? []).forEach((c) => {
      if (!map.has(c.phone)) map.set(c.phone, []);
      map.get(c.phone)!.push(c);
    });
    return map;
  }, [chatsData]);
  const chatCountOf = (g: Guardian) => g.chats ?? 0;

  useEffect(() => {
    if (guardiansError) {
      toast.error("No se pudieron cargar los acudientes", {
        description: guardiansError,
      });
    }
  }, [guardiansError]);

  console.log({ guardiansData });

  const [q, setQ] = useState("");
  const [status, setStatus] = useState("todos");
  const [countryFilter, setCountryFilter] = useState("todos");
  const [planFilter, setPlanFilter] = useState("todos");
  const [insuranceFilter, setInsuranceFilter] = useState("todos");
  const [page, setPage] = useState(1);
  const perPage = 10;
  const { isOpen, onOpen, onClose } = useDisclosure();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [editing, setEditing] = useState<Guardian | null>(null);
  const [toDelete, setToDelete] = useState<Guardian | null>(null);
  const [detail, setDetail] = useState<Guardian | null>(null);
  const [selectedChild, setSelectedChild] = useState<string | null>(null);
  const [country, setCountry] = useState("");
  const [province, setProvince] = useState("");
  const [gender, setGender] = useState("");
  const [saving, setSaving] = useState(false);
  const { countryNames, statesOf } = useGeo();

  // Al abrir el detalle de un acudiente, se selecciona "Todos" por defecto
  // (selectedChild = null → se muestran todos sus chats).
  useEffect(() => {
    setSelectedChild(null);
  }, [detail]);

  // Todos los chats del acudiente (por teléfono), ordenados por fecha.
  const guardianChats = useMemo(
    () =>
      detail
        ? (chatsByPhone.get(detail.phone) ?? [])
            .slice()
            .sort((a, b) => b.startedAt.localeCompare(a.startedAt))
        : [],
    [detail, chatsByPhone]
  );

  // Chats filtrados por el hijo seleccionado (por nombre del paciente). Si el
  // acudiente no tiene hijos registrados, se muestran todos sus chats.
  const detailChats = useMemo(
    () =>
      selectedChild
        ? guardianChats.filter(
            (c) => (c.patient || "Sin paciente") === selectedChild
          )
        : guardianChats,
    [guardianChats, selectedChild]
  );

  // Tags del modal = hijos registrados ∪ pacientes que aparecen en los chats,
  // cada uno con su conteo. Así la suma de los tags cuadra con el total
  // ("Todos"): hay chats cuyo paciente no está en la lista de hijos registrados
  // (o viene vacío), y si solo se usaran los hijos esos chats no serían
  // alcanzables desde ningún tag y los números no coincidirían.
  const chatChildTags = useMemo(() => {
    const counts = new Map<string, number>();
    guardianChats.forEach((c) => {
      const name = c.patient || "Sin paciente";
      counts.set(name, (counts.get(name) ?? 0) + 1);
    });
    const names = new Set<string>((detail?.children ?? []).map((c) => c.name));
    counts.forEach((_, name) => names.add(name));
    return [...names].map((name) => ({ name, count: counts.get(name) ?? 0 }));
  }, [guardianChats, detail]);

  const filtered = useMemo(() => {
    setPage(1);
    return data.filter((g) => {
      const okQ = `${g.name} ${g.id} ${g.email} ${g.phone} ${g.city}`
        .toLowerCase()
        .includes(q.toLowerCase());
      const okStatus = status === "todos" || g.status === status;
      const okCountry =
        countryFilter === "todos" || g.country === countryFilter;
      const okPlan = planFilter === "todos" || g.plan === planFilter;
      const okInsurance =
        insuranceFilter === "todos" ||
        (insuranceFilter === "sin_seguro"
          ? !g.insurance
          : g.insurance === insuranceFilter);
      return okQ && okStatus && okCountry && okPlan && okInsurance;
    });
  }, [data, q, status, countryFilter, planFilter, insuranceFilter]);

  const totalPages = Math.ceil(filtered.length / perPage);
  const paginated = filtered.slice((page - 1) * perPage, page * perPage);

  const openEdit = (g: Guardian | null) => {
    setEditing(g);
    setCountry(g?.country ?? "");
    setProvince(g?.province ?? "");
    setGender(genderToValue(g?.gender));
    onOpen();
  };

  // Deep-link: al llegar con ?edit=<id> (p. ej. desde el detalle de un chat),
  // se abre el modal de edición de ese acudiente al cargar la data. Solo Admin.
  useEffect(() => {
    const editId = searchParams.get("edit");
    if (!editId || !canEdit) return;
    const row = data.find((g) => g.id === editId);
    if (row) {
      setEditing(row);
      setCountry(row.country ?? "");
      setProvince(row.province ?? "");
      setGender(genderToValue(row?.gender));
      onOpen();
      setSearchParams({}, { replace: true });
    }
  }, [searchParams, data, canEdit, onOpen, setSearchParams]);

  const handleSave = async (form: HTMLFormElement) => {
    const fd = new FormData(form);

    if (!editing) {
      // name/phone/email son obligatorios; el resto es opcional. Si "plan"
      // es un plan pago, el backend registra el pago correspondiente.
      const insuranceIdNew = String(fd.get("insurance") || "");
      const policyNumberNew = String(fd.get("policyNumber") || "");
      const payload: GuardianCreatePayload = {
        name: String(fd.get("name")),
        phone: String(fd.get("phone")),
        email: String(fd.get("email")),
        relationship: relationToApi[fd.get("relationship") as Relationship],
        idNumber: String(fd.get("idNumber") || "") || undefined,
        country: countryEsToApi[country] ?? (country || undefined),
        city: String(fd.get("city") || "") || undefined,
        province: province || undefined,
        address: String(fd.get("address") || "") || undefined,
        status: statusToApi[fd.get("status") as AccountStatus],
        plan: (String(fd.get("plan") || "") || undefined) as
          | PlanApi
          | undefined,
        gender: gender || undefined,
        insuranceId: insuranceIdNew ? Number(insuranceIdNew) : undefined,
        policyNumber: policyNumberNew || undefined,
      };

      setSaving(true);
      try {
        const freshToken = await getValidToken();
        await apiFetch<GuardianApi>("/api/guardians", freshToken, {
          method: "POST",
          body: JSON.stringify(payload),
        });
        toast.success("Acudiente creado");
        onClose();
        setEditing(null);
        refetchGuardians();
      } catch (err) {
        const isDuplicate =
          err instanceof Error && err.message.startsWith("Error 409");
        toast.error("No se pudo crear el acudiente", {
          description: isDuplicate
            ? "Ya existe un acudiente con ese correo o teléfono."
            : err instanceof Error
            ? err.message
            : undefined,
        });
      } finally {
        setSaving(false);
      }
      return;
    }

    // El PATCH manda todos los campos que tenemos, tal como los acepta el
    // backend (no incluye "phone": no es editable vía API).
    const insuranceId = String(fd.get("insurance") || "");
    const policyNumber = String(fd.get("policyNumber") || "");
    // El email no se puede editar → no viaja en el PATCH.
    const payload: GuardianPatchPayload = {
      name: String(fd.get("name")),
      country: countryEsToApi[country] ?? (country || undefined),
      city: String(fd.get("city")),
      province: province || undefined,
      address: String(fd.get("address") || "") || undefined,
      idNumber: String(fd.get("idNumber") || "") || undefined,
      relationship: relationToApi[fd.get("relationship") as Relationship],
      status: statusToApi[fd.get("status") as AccountStatus],
      plan: (String(fd.get("plan") || "") || undefined) as PlanApi | undefined,
      insuranceId: insuranceId ? Number(insuranceId) : undefined,
      policyNumber: policyNumber || undefined,
      gender: gender || undefined,
    };

    setSaving(true);
    try {
      const freshToken = await getValidToken();
      await apiFetch<GuardianApi>(`/api/guardians/${editing.id}`, freshToken, {
        method: "PATCH",
        body: JSON.stringify(payload),
      });
      toast.success("Acudiente actualizado");
      onClose();
      setEditing(null);
      refetchGuardians();
    } catch (err) {
      toast.error("No se pudo actualizar el acudiente", {
        description: err instanceof Error ? err.message : undefined,
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <DashboardLayout title="Acudientes (Tutores)" subtitle="Cuentas titulares">
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
                placeholder="Nombre, teléfono, ciudad…"
                value={q}
                onChange={(e) => setQ(e.target.value)}
              />
            </InputGroup>
          </Box>
          <Box>
            <Text fontSize="xs" fontWeight={600} mb={1}>
              Estado
            </Text>
            <Select
              w={{ base: "100%", md: "160px" }}
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <option value="todos">Todos los estados</option>
              <option value="activa">Activos</option>
              <option value="suspendida">Suspendidos</option>
              <option value="baja">De baja</option>
            </Select>
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
              {countryNames.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </Select>
          </Box>
          <Box>
            <Text fontSize="xs" fontWeight={600} mb={1}>
              Plan
            </Text>
            <Select
              w={{ base: "100%", md: "170px" }}
              value={planFilter}
              onChange={(e) => setPlanFilter(e.target.value)}
            >
              <option value="todos">Todos los planes</option>
              {["Gratuito", "Premium Mensual", "Premium Anual"].map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </Select>
          </Box>
          <Box>
            <Text fontSize="xs" fontWeight={600} mb={1}>
              Seguro médico
            </Text>
            <Select
              w={{ base: "100%", md: "180px" }}
              value={insuranceFilter}
              onChange={(e) => setInsuranceFilter(e.target.value)}
            >
              <option value="todos">Todos los seguros</option>
              <option value="sin_seguro">Sin seguro</option>
              {insurances.map((i) => (
                <option key={i.id} value={i.name}>
                  {i.name}
                </option>
              ))}
            </Select>
          </Box>
        </Flex>

        <Flex gap={3} mb={4} justify="flex-end" wrap="wrap">
          <ExportButton
            isDisabled={!canExport}
            filename="acudientes-lucera"
            sheetName="Acudientes"
            data={filtered.map((g) => ({
              ID: g.id,
              Nombre: g.name,
              Email: g.email,
              Teléfono: g.phone,
              Relación: g.relationship,
              País: g.country,
              Ciudad: g.city,
              Seguro: g.insurance ?? "",
              "ID Seguro": g.policyNumber ?? "",
              Plan: g.plan,
              Estado: g.status,
              Niños: g.children.length,
              Chats: chatCountOf(g),
              Registrado: g.registeredAt,
            }))}
          />
          {canEdit && (
            <Button
              colorScheme="vino"
              variant={"solid"}
              leftIcon={<Plus size={16} />}
              onClick={() => openEdit(null)}
            >
              Nuevo acudiente
            </Button>
          )}
        </Flex>

        {guardiansLoading && !guardiansData ? (
          <LoadingState label="Cargando acudientes…" />
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
                    <Th>Acudiente</Th>
                    <Th display={{ base: "none", md: "table-cell" }}>
                      Contacto
                    </Th>
                    <Th display={{ base: "none", lg: "table-cell" }}>
                      País / Ciudad
                    </Th>
                    <Th display={{ base: "none", lg: "table-cell" }}>Género</Th>
                    <Th display={{ base: "none", xl: "table-cell" }}>
                      Dirección
                    </Th>
                    <Th>Niños</Th>
                    <Th textAlign="center">Chats</Th>
                    <Th>Plan</Th>
                    <Th display={{ base: "none", md: "table-cell" }}>Seguro</Th>
                    <Th>Estado</Th>
                    <Th textAlign="right">Acciones</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {paginated.map((g) => (
                    <Tr key={g.id} _hover={{ bg: "crema.50" }}>
                      <Td>
                        <Text
                          as="button"
                          type="button"
                          onClick={() => setDetail(g)}
                          fontSize="sm"
                          fontWeight={600}
                          color="lucera.textMuted"
                          fontFamily="mono"
                          _hover={{ color: "vino.500" }}
                        >
                          {g.accountCode ?? "—"}
                        </Text>
                      </Td>
                      <Td>
                        <HStack
                          as="button"
                          type="button"
                          onClick={() => setDetail(g)}
                          _hover={{ color: "vino.500" }}
                          textAlign="left"
                        >
                          <Flex
                            h={8}
                            w={8}
                            borderRadius="full"
                            bg="vino.50"
                            align="center"
                            justify="center"
                            flexShrink={0}
                          >
                            <UsersIcon size={14} color="#6d122b" />
                          </Flex>
                          <Box>
                            <Text
                              fontSize="sm"
                              fontWeight={600}
                              textDecoration="underline"
                              textDecorationColor="lucera.border"
                              textUnderlineOffset="2px"
                            >
                              {g.name}
                            </Text>
                            <Text fontSize="xs" color="lucera.textMuted">
                              {g.relationship}
                            </Text>
                          </Box>
                        </HStack>
                      </Td>
                      <Td display={{ base: "none", md: "table-cell" }}>
                        <HStack fontSize="xs">
                          <Phone size={10} />
                          <Text>{g.phone}</Text>
                        </HStack>
                        <HStack fontSize="xs" color="lucera.textMuted">
                          <Mail size={10} />
                          <Text>{g.email}</Text>
                        </HStack>
                      </Td>
                      <Td
                        display={{ base: "none", lg: "table-cell" }}
                        fontSize="sm"
                      >
                        <Text fontSize="xs" color="lucera.textMuted">
                          {g.country}
                        </Text>
                        <Text>{g.city}</Text>
                      </Td>
                      <Td
                        display={{ base: "none", lg: "table-cell" }}
                        fontSize="sm"
                      >
                        {genderLabel(g.gender)}
                      </Td>
                      <Td
                        display={{ base: "none", xl: "table-cell" }}
                        fontSize="xs"
                        color="lucera.textMuted"
                      >
                        {g.address || "—"}
                      </Td>
                      <Td>
                        <Badge variant="outline">
                          <HStack spacing={1}>
                            <Baby size={10} />
                            <Text>{g.children.length}</Text>
                          </HStack>
                        </Badge>
                      </Td>
                      <Td textAlign="center">
                        <Badge variant="outline">
                          <HStack spacing={1}>
                            <MessageSquare size={10} />
                            <Text>{chatCountOf(g)}</Text>
                          </HStack>
                        </Badge>
                      </Td>
                      <Td>
                        <Badge variant="outline">{g.plan}</Badge>
                      </Td>
                      <Td
                        display={{ base: "none", md: "table-cell" }}
                        fontSize="xs"
                      >
                        {g.insurance ? (
                          <>
                            <Text fontWeight={600}>{g.insurance}</Text>
                          </>
                        ) : (
                          <Text color="lucera.textMuted">—</Text>
                        )}
                      </Td>
                      <Td>
                        <Badge
                          colorScheme={statusTone(g.status)}
                          textTransform="capitalize"
                        >
                          {g.status}
                        </Badge>
                      </Td>
                      <Td textAlign="right">
                        {canEdit && (
                          <IconButton
                            aria-label="Ver detalle"
                            size="sm"
                            variant="ghost"
                            icon={<Eye size={14} />}
                            onClick={() => setDetail(g)}
                          />
                        )}
                        {canEdit && (
                          <>
                            <IconButton
                              aria-label="Editar"
                              size="sm"
                              variant="ghost"
                              icon={<Pencil size={14} />}
                              onClick={() => openEdit(g)}
                            />
                            <IconButton
                              aria-label="Eliminar"
                              size="sm"
                              variant="ghost"
                              color="peligro.500"
                              icon={<Trash2 size={14} />}
                              onClick={() => setToDelete(g)}
                            />
                          </>
                        )}
                      </Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </TableContainer>
            <Text mt={3} fontSize="xs" color="lucera.textMuted">
              {filtered.length} de {data.length} acudientes
            </Text>
            <Pagination
              page={page}
              totalPages={totalPages}
              onPageChange={setPage}
            />
          </>
        )}
      </StatCard>

      {/* Detalle del acudiente + cantidad de chats (clic → ver el chat) */}
      <Modal
        isOpen={!!detail}
        onClose={() => setDetail(null)}
        size="2xl"
        scrollBehavior="inside"
      >
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            <HStack spacing={2}>
              <UsersIcon size={18} color="#6d122b" />
              <Text>{detail?.name}</Text>
            </HStack>
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            {detail && (
              <>
                <SimpleGrid columns={{ base: 2, md: 3 }} spacing={3} mb={4}>
                  <Box>
                    <Text
                      fontSize="10px"
                      textTransform="uppercase"
                      color="lucera.textMuted"
                      letterSpacing="wider"
                    >
                      Relación
                    </Text>
                    <Text fontWeight={600}>{detail.relationship}</Text>
                  </Box>
                  <Box>
                    <Text
                      fontSize="10px"
                      textTransform="uppercase"
                      color="lucera.textMuted"
                      letterSpacing="wider"
                    >
                      Teléfono
                    </Text>
                    <Text fontWeight={600}>{detail.phone}</Text>
                  </Box>
                  <Box>
                    <Text
                      fontSize="10px"
                      textTransform="uppercase"
                      color="lucera.textMuted"
                      letterSpacing="wider"
                    >
                      Email
                    </Text>
                    <Text fontWeight={600} noOfLines={1}>
                      {detail.email}
                    </Text>
                  </Box>
                  <Box>
                    <Text
                      fontSize="10px"
                      textTransform="uppercase"
                      color="lucera.textMuted"
                      letterSpacing="wider"
                    >
                      País / Ciudad
                    </Text>
                    <Text fontWeight={600}>
                      {detail.country} · {detail.city}
                    </Text>
                  </Box>
                  <Box>
                    <HStack spacing={1} color="lucera.textMuted">
                      <MapPin size={11} />
                      <Text
                        fontSize="10px"
                        textTransform="uppercase"
                        letterSpacing="wider"
                      >
                        Dirección
                      </Text>
                    </HStack>
                    <Text fontWeight={600}>{detail.address || "—"}</Text>
                  </Box>
                  <Box>
                    <Text
                      fontSize="10px"
                      textTransform="uppercase"
                      color="lucera.textMuted"
                      letterSpacing="wider"
                    >
                      Plan · Seguro
                    </Text>
                    <Text fontWeight={600}>
                      {detail.plan} · {detail.insurance || "—"}
                    </Text>
                  </Box>
                </SimpleGrid>

                <Divider mb={3} />
                <HStack mb={3} spacing={2}>
                  <MessageSquare size={15} color="#6d122b" />
                  <Text fontSize="sm" fontWeight={700}>
                    Chats{selectedChild ? ` · ${selectedChild}` : ""} (
                    {detailChats.length})
                  </Text>
                </HStack>

                {/* Tags: "Todos" + un paciente por tag (con su conteo); filtra
                    los chats por el nombre del paciente. La suma de los tags
                    cuadra con "Todos". */}
                {chatChildTags.length > 0 && (
                  <Flex gap={2} mb={3} wrap="wrap">
                    <Box
                      as="button"
                      type="button"
                      onClick={() => setSelectedChild(null)}
                      px={3}
                      py={1}
                      borderRadius="full"
                      fontSize="xs"
                      fontWeight={600}
                      borderWidth="1px"
                      bg={selectedChild === null ? "vino.500" : "white"}
                      borderColor={
                        selectedChild === null ? "vino.500" : "lucera.border"
                      }
                      color={
                        selectedChild === null ? "white" : "lucera.textMuted"
                      }
                      _hover={
                        selectedChild === null
                          ? undefined
                          : { bg: "crema.50", borderColor: "lucera.textMuted" }
                      }
                      transition="all 120ms"
                    >
                      Todos ({guardianChats.length})
                    </Box>
                    {chatChildTags.map((tag) => {
                      const active = tag.name === selectedChild;
                      return (
                        <Box
                          key={tag.name}
                          as="button"
                          type="button"
                          onClick={() => setSelectedChild(tag.name)}
                          px={3}
                          py={1}
                          borderRadius="full"
                          fontSize="xs"
                          fontWeight={600}
                          borderWidth="1px"
                          bg={active ? "vino.500" : "white"}
                          borderColor={active ? "vino.500" : "lucera.border"}
                          color={active ? "white" : "lucera.textMuted"}
                          _hover={
                            active
                              ? undefined
                              : {
                                  bg: "crema.50",
                                  borderColor: "lucera.textMuted",
                                }
                          }
                          transition="all 120ms"
                        >
                          <HStack spacing={1}>
                            <Baby size={11} />
                            <Text as="span">
                              {tag.name} ({tag.count})
                            </Text>
                          </HStack>
                        </Box>
                      );
                    })}
                  </Flex>
                )}

                {detailChats.length === 0 ? (
                  <Text fontSize="sm" color="lucera.textMuted">
                    {selectedChild
                      ? `${selectedChild} aún no tiene chats registrados.`
                      : "Este acudiente aún no tiene chats registrados."}
                  </Text>
                ) : (
                  <VStack align="stretch" spacing={2}>
                    {detailChats.map((c) => (
                      <Flex
                        key={c.id}
                        as="button"
                        type="button"
                        onClick={() => navigate(`/chats?chat=${c.id}`)}
                        align="center"
                        gap={3}
                        textAlign="left"
                        borderWidth="1px"
                        borderColor="lucera.border"
                        borderRadius="md"
                        p={3}
                        _hover={{ bg: "crema.50", borderColor: "vino.500" }}
                        transition="all 120ms"
                      >
                        <Box flex={1} minW={0}>
                          <HStack spacing={2} mb={1}>
                            <TriageBadge level={chatTriageToLevel[c.triage]} />
                            <Badge textTransform="capitalize" variant="outline">
                              {chatStatusLabel[c.status] ?? c.status}
                            </Badge>
                            <Text fontSize="xs" color="lucera.textMuted">
                              {c.patient}
                            </Text>
                          </HStack>
                          <Text fontSize="sm" noOfLines={1}>
                            {c.lastMessage}
                          </Text>
                        </Box>
                        <VStack spacing={0} align="flex-end" flexShrink={0}>
                          <Text
                            fontSize="10px"
                            color="lucera.textMuted"
                            sx={{ fontVariantNumeric: "tabular-nums" }}
                          >
                            {c.startedAt.slice(0, 10)}
                          </Text>
                          <ChevronRight size={16} color="#7b5a48" />
                        </VStack>
                      </Flex>
                    ))}
                  </VStack>
                )}
              </>
            )}
          </ModalBody>
        </ModalContent>
      </Modal>

      <Modal isOpen={isOpen} onClose={onClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            {editing ? "Editar acudiente" : "Nuevo acudiente"}
          </ModalHeader>
          <ModalCloseButton />
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSave(e.currentTarget);
            }}
          >
            <ModalBody>
              <SimpleGrid columns={2} spacing={3}>
                <FormControl gridColumn="span 2" isRequired>
                  <FormLabel>Nombre completo</FormLabel>
                  <Input name="name" defaultValue={editing?.name} />
                </FormControl>
                <FormControl isRequired>
                  <FormLabel>Teléfono (WhatsApp)</FormLabel>
                  <Input
                    name="phone"
                    defaultValue={editing?.phone}
                    isReadOnly={!!editing}
                    bg={editing ? "crema.50" : undefined}
                  />
                  {editing && (
                    <Text fontSize="xs" color="lucera.textMuted" mt={1}>
                      El teléfono no se puede editar vía API.
                    </Text>
                  )}
                </FormControl>
                <FormControl isRequired>
                  <FormLabel>Email</FormLabel>
                  <Input
                    name="email"
                    type="email"
                    defaultValue={editing?.email}
                    isReadOnly={!!editing}
                    bg={editing ? "crema.50" : undefined}
                  />
                  {editing && (
                    <Text fontSize="xs" color="lucera.textMuted" mt={1}>
                      El correo no se puede editar.
                    </Text>
                  )}
                </FormControl>
                <FormControl>
                  <FormLabel>Número de identificación</FormLabel>
                  <Input
                    name="idNumber"
                    placeholder="Documento de identidad"
                    defaultValue={editing?.idNumber ?? undefined}
                  />
                </FormControl>
                <FormControl>
                  <FormLabel>Relación</FormLabel>
                  <Select
                    name="relationship"
                    defaultValue={editing?.relationship ?? "Madre"}
                  >
                    {["Madre", "Padre", "Tutor", "Abuelo/a"].map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </Select>
                </FormControl>
                <FormControl isRequired>
                  <FormLabel>País</FormLabel>
                  <Select
                    name="country"
                    value={country}
                    onChange={(e) => {
                      setCountry(e.target.value);
                      setProvince("");
                    }}
                    placeholder="Seleccionar país"
                  >
                    {countryNames.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </Select>
                </FormControl>
                <FormControl>
                  <FormLabel>Provincia</FormLabel>
                  <Select
                    name="province"
                    value={province}
                    onChange={(e) => setProvince(e.target.value)}
                    placeholder="Seleccionar provincia"
                    isDisabled={!country}
                  >
                    {statesOf(country).map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </Select>
                </FormControl>
                <FormControl>
                  <FormLabel>Ciudad</FormLabel>
                  <Input
                    name="city"
                    placeholder="Ciudad / distrito"
                    defaultValue={editing?.city}
                  />
                </FormControl>
                <FormControl>
                  <FormLabel>Género</FormLabel>
                  <Select
                    name="gender"
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    placeholder="Seleccionar género"
                  >
                    <option value="female">Femenino</option>
                    <option value="male">Masculino</option>
                    <option value="other">Otro</option>
                  </Select>
                </FormControl>
                <FormControl gridColumn="span 2">
                  <FormLabel>Dirección</FormLabel>
                  <Input
                    name="address"
                    placeholder="Calle, edificio, referencia…"
                    defaultValue={editing?.address ?? undefined}
                  />
                </FormControl>
                <FormControl>
                  <FormLabel>Seguro médico</FormLabel>
                  <Select
                    name="insurance"
                    defaultValue={editing?.policyNumber ?? ""}
                    placeholder="Sin seguro"
                  >
                    {insurances.map((i) => (
                      <option key={i.id} value={i.id}>
                        {i.name}
                      </option>
                    ))}
                  </Select>
                </FormControl>
                <FormControl>
                  <FormLabel>Número de póliza</FormLabel>
                  <Input
                    name="policyNumber"
                    placeholder="Opcional"
                    defaultValue={editing ? undefined : ""}
                  />
                </FormControl>
                <FormControl>
                  <FormLabel>Plan</FormLabel>
                  <Select
                    name="plan"
                    defaultValue={editing ? planToApi[editing.plan] : "free"}
                  >
                    {(
                      ["free", "premium_monthly", "premium_annual"] as const
                    ).map((p) => (
                      <option key={p} value={p}>
                        {planToEs[p]}
                      </option>
                    ))}
                  </Select>
                  <Text fontSize="xs" color="lucera.textMuted" mt={1}>
                    Un plan pago registra el pago correspondiente.
                  </Text>
                </FormControl>
                <FormControl>
                  <FormLabel>Estado</FormLabel>
                  <Select
                    name="status"
                    defaultValue={editing?.status ?? "activa"}
                  >
                    <option value="activa">Activa</option>
                    <option value="suspendida">Suspendida</option>
                    <option value="baja">Baja</option>
                  </Select>
                </FormControl>
              </SimpleGrid>
            </ModalBody>
            <ModalFooter>
              <Button
                variant="outline"
                onClick={onClose}
                mr={2}
                isDisabled={saving}
              >
                Cancelar
              </Button>
              <Button type="submit" colorScheme="vino" isLoading={saving}>
                {editing ? "Actualizar" : "Crear"}
              </Button>
            </ModalFooter>
          </form>
        </ModalContent>
      </Modal>

      <ConfirmDialog
        open={!!toDelete}
        onOpenChange={(o) => !o && setToDelete(null)}
        title="Eliminar acudiente"
        description={
          <>
            ¿Seguro que deseas eliminar a <strong>{toDelete?.name}</strong>?
            Esta acción desactiva la cuenta: deja de aparecer en el listado,
            pero conserva su historial de chats y pagos.
          </>
        }
        onConfirm={async () => {
          if (!toDelete) return;
          try {
            const freshToken = await getValidToken();
            await apiFetch<DeleteResponse>(
              `/api/guardians/${toDelete.id}`,
              freshToken,
              { method: "DELETE" }
            );
            toast.success("Acudiente eliminado");
            refetchGuardians();
          } catch (err) {
            toast.error("No se pudo eliminar el acudiente", {
              description: err instanceof Error ? err.message : undefined,
            });
          }
        }}
      />
    </DashboardLayout>
  );
}
