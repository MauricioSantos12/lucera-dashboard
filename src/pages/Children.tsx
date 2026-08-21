import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Child } from "@/lib/mockData";
import { useFetchAll } from "@/hooks/useFetchAll";
import { apiFetch } from "@/lib/apiClient";
import {
  relationToEs,
  chatTriageToLevel,
  genderToValue,
  genderLabel,
} from "@/lib/apiMappings";
import type {
  PatientApi,
  PatientCreatePayload,
  PatientPatchPayload,
  GuardianApi,
  InsuranceRef,
  ChatApi,
  DeleteResponse,
  BloodType,
} from "@/lib/apiTypes";
import {
  Box,
  Button,
  Flex,
  HStack,
  VStack,
  IconButton,
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
  Wrap,
  WrapItem,
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
  useDisclosure,
} from "@chakra-ui/react";
import {
  Search,
  Baby,
  Droplet,
  AlertTriangle,
  Plus,
  Pencil,
  Trash2,
  MessageSquare,
  ChevronRight,
  Eye,
  Users as UsersIcon,
} from "lucide-react";
import { StatCard } from "@/components/StatCard";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { Pagination } from "@/components/Pagination";
import { LoadingState } from "@/components/LoadingState";
import { ExportButton } from "@/components/ExportButton";
import { TriageBadge } from "@/components/TriageBadge";
import { toast } from "@/lib/toast";
import { useAuth } from "@/lib/auth";

type Row = Child & {
  age: number;
  guardianId: string;
  guardianName: string;
  relationship: string;
  phone: string;
  country: string;
  insurance: string;
  chatCount: number;
  address: string;
  school: string;
  accountCode: string;
};

export const chatStatusLabel: Record<string, string> = {
  active: "activa",
  waiting: "esperando",
  closed: "cerrada",
};

function patientToRow(
  p: PatientApi,
  relationshipByGuardianId: Record<string, string>,
  countryByGuardianId: Record<string, string>,
  chatsByPatient: Map<string, ChatApi[]>
): Row {
  return {
    id: p.id,
    name: p.name,
    birthDate: p.birthDate,
    bloodType: p.bloodType ?? undefined,
    weightKg: p.weightKg ?? undefined,
    conditions: p.conditions,
    allergies: p.allergies,
    gender: p.gender,
    age: p.age,
    guardianId: p.guardianId,
    guardianName: p.guardian,
    relationship: relationshipByGuardianId[p.guardianId] ?? "",
    phone: p.phone,
    country: countryByGuardianId[p.guardianId] ?? "",
    insurance: p.insurance?.name ?? "",
    // Se cuenta desde los chats reales (teléfono + nombre), la misma fuente que
    // usa el modal de detalle, para que la columna y el modal siempre coincidan.
    // El `p.chats` del backend queda mal atribuido cuando hay pacientes con el
    // mismo nombre en distintas familias.
    chatCount: chatsByPatient.get(`${p.phone}__${p.name}`)?.length ?? 0,
    address: p.address ?? "",
    school: p.school ?? "",
    accountCode: p.accountCode ?? "",
  };
}

export default function Children() {
  const { user, token, getValidToken } = useAuth();
  const navigate = useNavigate();
  // Solo Admin crea/edita/elimina; el resto (Ventas, Médico) es solo lectura.
  const canEdit = user?.role === "Admin";
  const canExport = user?.role !== "Invitado";
  const perPage = 10;

  const {
    data: patientsData,
    loading: patientsLoading,
    error: patientsError,
    refetch: refetchPatients,
  } = useFetchAll<PatientApi>(token ? "/api/patients" : null);
  const {
    data: guardiansData,
    loading: guardiansLoading,
    error: guardiansError,
  } = useFetchAll<GuardianApi>(token ? "/api/guardians" : null);
  const {
    data: insurancesData,
    loading: insurancesLoading,
    error: insurancesError,
  } = useFetchAll<InsuranceRef>(token ? "/api/insurances" : null);
  const { data: chatsData, error: chatsError } = useFetchAll<ChatApi>(
    token ? "/api/chats" : null
  );

  // Los chats de cada niño se cruzan por teléfono + nombre del paciente
  // (el chat no trae el id del paciente, solo su nombre y el teléfono).
  const chatsByPatient = useMemo(() => {
    const map = new Map<string, ChatApi[]>();
    (chatsData?.items ?? []).forEach((c) => {
      const key = `${c.phone}__${c.patient}`;
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(c);
    });
    return map;
  }, [chatsData]);

  const guardians = useMemo(() => guardiansData?.items ?? [], [guardiansData]);
  const relationshipByGuardianId = useMemo(
    () =>
      Object.fromEntries(
        guardians.map((g) => [g.id, relationToEs[g.relationship] ?? ""])
      ),
    [guardians]
  );
  const countryByGuardianId = useMemo(
    () => Object.fromEntries(guardians.map((g) => [g.id, g.country])),
    [guardians]
  );
  const data = useMemo(
    () =>
      (patientsData?.items ?? []).map((p) =>
        patientToRow(
          p,
          relationshipByGuardianId,
          countryByGuardianId,
          chatsByPatient
        )
      ),
    [patientsData, relationshipByGuardianId, countryByGuardianId, chatsByPatient]
  );
  const insurances = useMemo(
    () => insurancesData?.items ?? [],
    [insurancesData]
  );
  const countryOptions = useMemo(
    () => [...new Set(guardians.map((g) => g.country))].sort(),
    [guardians]
  );

  useEffect(() => {
    const err =
      patientsError || guardiansError || insurancesError || chatsError;
    if (err) {
      toast.error("No se pudieron cargar los niños", { description: err });
    }
  }, [patientsError, guardiansError, insurancesError, chatsError]);

  const [page, setPage] = useState(1);
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState("todos");
  const [bloodTypeFilter, setBloodTypeFilter] = useState("todos");
  const [weightFilter, setWeightFilter] = useState("todos");
  const [allergiesFilter, setAllergiesFilter] = useState("todos");
  const [conditionsFilter, setConditionsFilter] = useState("todos");
  const [countryFilter, setCountryFilter] = useState("todos");
  const [insuranceFilter, setInsuranceFilter] = useState("todos");
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [editing, setEditing] = useState<Row | null>(null);
  const [toDelete, setToDelete] = useState<Row | null>(null);
  const [detail, setDetail] = useState<Row | null>(null);
  const [saving, setSaving] = useState(false);
  // Loading breve para dar feedback al cambiar filtros o tras crear/editar/eliminar.
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
  // Filtro por acudiente dentro del detalle del niño (null = "Todos").
  const [selectedGuardian, setSelectedGuardian] = useState<string | null>(null);

  // Al abrir el detalle de un niño, se reinicia el filtro a "Todos".
  useEffect(() => {
    setSelectedGuardian(null);
  }, [detail]);

  // Todos los chats del niño (por teléfono + nombre), ordenados por fecha.
  const childChats = useMemo(
    () =>
      detail
        ? (chatsByPatient.get(`${detail.phone}__${detail.name}`) ?? [])
            .slice()
            .sort((a, b) => b.startedAt.localeCompare(a.startedAt))
        : [],
    [detail, chatsByPatient]
  );

  // Acudientes distintos asociados a los chats del niño, con su conteo (para
  // los tags). La suma de los conteos cuadra con el total ("Todos").
  const childGuardians = useMemo(() => {
    const counts = new Map<string, number>();
    childChats.forEach((c) => {
      const name = c.guardian || "Sin acudiente";
      counts.set(name, (counts.get(name) ?? 0) + 1);
    });
    return [...counts.entries()].map(([name, count]) => ({ name, count }));
  }, [childChats]);

  // Chats mostrados, filtrados por el acudiente seleccionado.
  const detailChats = useMemo(
    () =>
      selectedGuardian
        ? childChats.filter(
            (c) => (c.guardian || "Sin acudiente") === selectedGuardian
          )
        : childChats,
    [childChats, selectedGuardian]
  );

  const filtered = useMemo(() => {
    return data.filter((r) => {
      const okQ = `${r.name} ${r.guardianName} ${r.id}`
        .toLowerCase()
        .includes(q.toLowerCase());
      const okF =
        filter === "todos" ||
        (filter === "lactantes" && r.age < 2) ||
        (filter === "preescolar" && r.age >= 2 && r.age < 6) ||
        (filter === "escolar" && r.age >= 6);
      const okBloodType =
        bloodTypeFilter === "todos" || r.bloodType === bloodTypeFilter;
      const okWeight =
        weightFilter === "todos" ||
        (r.weightKg == null
          ? false
          : weightFilter === "menos10"
          ? r.weightKg < 10
          : weightFilter === "10a20"
          ? r.weightKg >= 10 && r.weightKg <= 20
          : r.weightKg > 20);
      const okAllergies =
        allergiesFilter === "todos" ||
        (allergiesFilter === "con"
          ? (r.allergies?.length ?? 0) > 0
          : (r.allergies?.length ?? 0) === 0);
      const okConditions =
        conditionsFilter === "todos" ||
        (conditionsFilter === "con"
          ? (r.conditions?.length ?? 0) > 0
          : (r.conditions?.length ?? 0) === 0);
      const okCountry =
        countryFilter === "todos" || r.country === countryFilter;
      const okInsurance =
        insuranceFilter === "todos" ||
        (insuranceFilter === "sin_seguro"
          ? !r.insurance
          : r.insurance === insuranceFilter);
      return (
        okQ &&
        okF &&
        okBloodType &&
        okWeight &&
        okAllergies &&
        okConditions &&
        okCountry &&
        okInsurance
      );
    });
  }, [
    data,
    q,
    filter,
    bloodTypeFilter,
    weightFilter,
    allergiesFilter,
    conditionsFilter,
    countryFilter,
    insuranceFilter,
  ]);

  // Al cambiar filtros: volver a la primera página y mostrar loading breve.
  useEffect(() => {
    setPage(1);
    flashLoading();
  }, [
    q,
    filter,
    bloodTypeFilter,
    weightFilter,
    allergiesFilter,
    conditionsFilter,
    countryFilter,
    insuranceFilter,
    flashLoading,
  ]);

  const totalPages = Math.ceil(filtered.length / perPage);
  const paginated = filtered.slice((page - 1) * perPage, page * perPage);

  const openEdit = (r: Row | null) => {
    setEditing(r);
    onOpen();
  };

  const handleSave = async (form: HTMLFormElement) => {
    const fd = new FormData(form);
    const allergies = String(fd.get("allergies") || "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    const conditions = String(fd.get("conditions") || "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    const birthDate = String(fd.get("birthDate"));
    const weightKg = Number(fd.get("weightKg")) || undefined;
    const bloodType = (fd.get("bloodType") as Child["bloodType"]) || undefined;
    const address = String(fd.get("address") || "") || undefined;
    const school = String(fd.get("school") || "") || undefined;
    const gender = String(fd.get("gender") || "") || undefined;

    setSaving(true);
    try {
      const freshToken = await getValidToken();
      if (editing) {
        const payload: PatientPatchPayload = {
          name: String(fd.get("name")),
          birthDate: birthDate,
          weightKg: weightKg,
          bloodType: bloodType as BloodType | undefined,
          conditions: conditions,
          allergies: allergies,
          address: address,
          school: school,
          gender: gender,
        };
        await apiFetch<PatientApi>(`/api/patients/${editing.id}`, freshToken, {
          method: "PATCH",
          body: JSON.stringify(payload),
        });
        toast.success("Niño actualizado");
      } else {
        const payload: PatientCreatePayload = {
          guardianId: String(fd.get("guardianId")),
          name: String(fd.get("name")),
          birthDate: birthDate,
          weightKg: weightKg,
          bloodType: bloodType as BloodType | undefined,
          conditions: conditions,
          allergies: allergies,
          address: address,
          school: school,
          gender: gender,
        };
        await apiFetch<PatientApi>("/api/patients", freshToken, {
          method: "POST",
          body: JSON.stringify(payload),
        });
        toast.success("Niño registrado");
      }
      onClose();
      setEditing(null);
      refetchPatients();
      flashLoading();
    } catch (err) {
      toast.error(
        editing
          ? "No se pudo actualizar el niño"
          : "No se pudo registrar el niño",
        { description: err instanceof Error ? err.message : undefined }
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <DashboardLayout
      title="Niños (Pacientes pediátricos)"
      subtitle="Pacientes registrados"
    >
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
                placeholder="Nombre del niño o acudiente…"
                value={q}
                onChange={(e) => setQ(e.target.value)}
              />
            </InputGroup>
          </Box>
          <Box>
            <Text fontSize="xs" fontWeight={600} mb={1}>
              Edad
            </Text>
            <Select
              w={{ base: "100%", md: "200px" }}
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            >
              <option value="todos">Todos los niños</option>
              <option value="lactantes">Lactantes (0-1)</option>
              <option value="preescolar">Preescolar (2-5)</option>
              <option value="escolar">Escolar (6+)</option>
            </Select>
          </Box>
          <Box>
            <Text fontSize="xs" fontWeight={600} mb={1}>
              Tipo de sangre
            </Text>
            <Select
              w={{ base: "100%", md: "160px" }}
              value={bloodTypeFilter}
              onChange={(e) => setBloodTypeFilter(e.target.value)}
            >
              <option value="todos">Todos los tipos de sangre</option>
              {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </Select>
          </Box>
          <Box>
            <Text fontSize="xs" fontWeight={600} mb={1}>
              Peso
            </Text>
            <Select
              w={{ base: "100%", md: "160px" }}
              value={weightFilter}
              onChange={(e) => setWeightFilter(e.target.value)}
            >
              <option value="todos">Todos los pesos</option>
              <option value="menos10">Menos de 10 kg</option>
              <option value="10a20">10 - 20 kg</option>
              <option value="mas20">Más de 20 kg</option>
            </Select>
          </Box>
          <Box>
            <Text fontSize="xs" fontWeight={600} mb={1}>
              Alergias
            </Text>
            <Select
              w={{ base: "100%", md: "160px" }}
              value={allergiesFilter}
              onChange={(e) => setAllergiesFilter(e.target.value)}
            >
              <option value="todos">Todos</option>
              <option value="con">Con alergias</option>
              <option value="sin">Sin alergias</option>
            </Select>
          </Box>
          <Box>
            <Text fontSize="xs" fontWeight={600} mb={1}>
              Condiciones
            </Text>
            <Select
              w={{ base: "100%", md: "160px" }}
              value={conditionsFilter}
              onChange={(e) => setConditionsFilter(e.target.value)}
            >
              <option value="todos">Todos</option>
              <option value="con">Con condiciones</option>
              <option value="sin">Sin condiciones</option>
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
              {countryOptions.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
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
              <option value="todos">Todos los seguros</option>
              <option value="sin_seguro">Sin seguro</option>
              {insurances.map((s) => (
                <option key={s.id} value={s.name}>
                  {s.name}
                </option>
              ))}
            </Select>
          </Box>
        </Flex>

        <Flex gap={3} mb={4} justify="flex-end" wrap="wrap">
          <ExportButton
            isDisabled={!canExport}
            filename="ninos-lucera"
            sheetName="Niños"
            data={filtered.map((r) => ({
              ID: r.id,
              Nombre: r.name,
              "F. Nacimiento": r.birthDate,
              Edad: r.age,
              "Peso (kg)": r.weightKg ?? "",
              "Tipo Sangre": r.bloodType ?? "",
              Seguro: r.insurance,
              Chats: r.chatCount,
              Alergias: (r.allergies ?? []).join(", "),
              Condiciones: (r.conditions ?? []).join(", "),
              País: r.country,
              Acudiente: r.guardianName,
              Teléfono: r.phone,
            }))}
          />
          {canEdit && (
            <Button
              colorScheme="vino"
              variant="solid"
              leftIcon={<Plus size={16} />}
              onClick={() => openEdit(null)}
            >
              Nuevo niño
            </Button>
          )}
        </Flex>

        {(patientsLoading && !patientsData) ||
        (guardiansLoading && !guardiansData) ||
        searching ? (
          <LoadingState label="Cargando niños…" />
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
                    <Th>#</Th>
                    <Th>Niño/a</Th>
                    <Th display={{ base: "none", md: "table-cell" }}>
                      F. nacimiento
                    </Th>
                    <Th>Edad</Th>
                    <Th display={{ base: "none", lg: "table-cell" }}>Género</Th>
                    <Th display={{ base: "none", md: "table-cell" }}>Peso</Th>
                    <Th display={{ base: "none", md: "table-cell" }}>Sangre</Th>
                    <Th display={{ base: "none", lg: "table-cell" }}>Seguro</Th>
                    <Th textAlign="center">Chats</Th>
                    <Th display={{ base: "none", xl: "table-cell" }}>
                      Dirección
                    </Th>
                    <Th display={{ base: "none", xl: "table-cell" }}>
                      Centro educativo
                    </Th>
                    <Th display={{ base: "none", lg: "table-cell" }}>
                      Alergias / Condiciones
                    </Th>
                    <Th>Acudiente</Th>
                    <Th textAlign="right">Acciones</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {paginated.map((r) => {
                    const guard = guardians.find(
                      (guardian) => guardian?.id === r.guardianId
                    );
                    return (
                      <Tr key={r.id} _hover={{ bg: "crema.50" }}>
                        <Td>
                          <Text
                            as="button"
                            type="button"
                            onClick={() => setDetail(r)}
                            fontSize="sm"
                            fontWeight={600}
                            color="lucera.textMuted"
                            _hover={{ color: "vino.500" }}
                          >
                            {guard?.accountCode}
                          </Text>
                        </Td>
                        <Td>
                          <HStack
                            as="button"
                            type="button"
                            onClick={() => setDetail(r)}
                            _hover={{ color: "vino.500" }}
                            textAlign="left"
                          >
                            <Flex
                              h={8}
                              w={8}
                              borderRadius="full"
                              bg="naranja.50"
                              align="center"
                              justify="center"
                              flexShrink={0}
                            >
                              <Baby size={14} color="#f08159" />
                            </Flex>
                            <Text
                              fontSize="sm"
                              fontWeight={600}
                              textDecoration="underline"
                              textDecorationColor="lucera.border"
                              textUnderlineOffset="2px"
                            >
                              {r.name}
                            </Text>
                          </HStack>
                        </Td>
                        <Td
                          display={{ base: "none", md: "table-cell" }}
                          fontSize="xs"
                        >
                          {r.birthDate}
                        </Td>
                        <Td fontSize="sm" textAlign="center">
                          {r.age}
                        </Td>
                        <Td
                          display={{ base: "none", lg: "table-cell" }}
                          fontSize="sm"
                        >
                          {genderLabel(r.gender)}
                        </Td>
                        <Td
                          display={{ base: "none", md: "table-cell" }}
                          fontSize="sm"
                          textAlign="center"
                        >
                          {r.weightKg ? `${r.weightKg}` : "—"}
                        </Td>
                        <Td display={{ base: "none", md: "table-cell" }}>
                          {r.bloodType ? (
                            <Badge variant="outline">
                              <HStack spacing={1}>
                                <Droplet size={10} color="#b91c1c" />
                                <Text fontFamily="mono">{r.bloodType}</Text>
                              </HStack>
                            </Badge>
                          ) : (
                            <Text fontSize="xs" color="lucera.textMuted">
                              —
                            </Text>
                          )}
                        </Td>
                        <Td
                          display={{ base: "none", lg: "table-cell" }}
                          fontSize="xs"
                        >
                          {r.insurance || (
                            <Text as="span" color="lucera.textMuted">
                              —
                            </Text>
                          )}
                        </Td>
                        <Td textAlign="center">
                          <Badge variant="outline">
                            <HStack spacing={1}>
                              <MessageSquare size={10} />
                              <Text>{r.chatCount}</Text>
                            </HStack>
                          </Badge>
                        </Td>
                        <Td
                          display={{ base: "none", xl: "table-cell" }}
                          fontSize="xs"
                          color="lucera.textMuted"
                        >
                          {r.address || "—"}
                        </Td>
                        <Td
                          display={{ base: "none", xl: "table-cell" }}
                          fontSize="xs"
                          color="lucera.textMuted"
                        >
                          {r.school || "—"}
                        </Td>
                        <Td display={{ base: "none", lg: "table-cell" }}>
                          <Wrap spacing={1}>
                            {(r.allergies ?? []).map((a) => (
                              <WrapItem key={a}>
                                <Badge colorScheme="amarillo">
                                  <HStack spacing={1}>
                                    <AlertTriangle size={10} />
                                    <Text>{a}</Text>
                                  </HStack>
                                </Badge>
                              </WrapItem>
                            ))}
                            {(r.conditions ?? []).map((c) => (
                              <WrapItem key={c}>
                                <Badge colorScheme="blue">{c}</Badge>
                              </WrapItem>
                            ))}
                            {(r.allergies?.length ?? 0) === 0 &&
                              (r.conditions?.length ?? 0) === 0 && (
                                <Text fontSize="xs" color="lucera.textMuted">
                                  Sin antecedentes
                                </Text>
                              )}
                          </Wrap>
                        </Td>
                        <Td fontSize="xs">
                          <Text fontWeight={600}>{r.guardianName}</Text>
                          <Text color="lucera.textMuted">
                            {r.relationship} · {r.phone}
                          </Text>
                        </Td>
                        <Td textAlign="right">
                          {canEdit && (
                            <IconButton
                              aria-label="Ver detalle"
                              size="sm"
                              variant="ghost"
                              icon={<Eye size={14} />}
                              onClick={() => setDetail(r)}
                            />
                          )}
                          {canEdit && (
                            <>
                              <IconButton
                                aria-label="Editar"
                                size="sm"
                                variant="ghost"
                                icon={<Pencil size={14} />}
                                onClick={() => openEdit(r)}
                              />
                              <IconButton
                                aria-label="Eliminar"
                                size="sm"
                                variant="ghost"
                                color="peligro.500"
                                icon={<Trash2 size={14} />}
                                onClick={() => setToDelete(r)}
                              />
                            </>
                          )}
                        </Td>
                      </Tr>
                    );
                  })}
                </Tbody>
              </Table>
            </TableContainer>
            <Text mt={3} fontSize="xs" color="lucera.textMuted">
              {filtered.length} de {data.length} niños registrados
            </Text>
            <Pagination
              page={page}
              totalPages={totalPages}
              onPageChange={setPage}
            />
          </>
        )}
      </StatCard>

      {/* Detalle del niño + historial de chats */}
      <Modal
        isOpen={!!detail}
        onClose={() => setDetail(null)}
        size="xl"
        scrollBehavior="inside"
      >
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            <HStack spacing={2}>
              <Baby size={18} color="#f08159" />
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
                      Edad
                    </Text>
                    <Text fontWeight={600}>{detail.age} años</Text>
                  </Box>
                  <Box>
                    <Text
                      fontSize="10px"
                      textTransform="uppercase"
                      color="lucera.textMuted"
                      letterSpacing="wider"
                    >
                      Nacimiento
                    </Text>
                    <Text fontWeight={600}>{detail.birthDate}</Text>
                  </Box>
                  <Box>
                    <Text
                      fontSize="10px"
                      textTransform="uppercase"
                      color="lucera.textMuted"
                      letterSpacing="wider"
                    >
                      Peso
                    </Text>
                    <Text fontWeight={600}>
                      {detail.weightKg ? `${detail.weightKg} kg` : "—"}
                    </Text>
                  </Box>
                  <Box>
                    <Text
                      fontSize="10px"
                      textTransform="uppercase"
                      color="lucera.textMuted"
                      letterSpacing="wider"
                    >
                      Sangre
                    </Text>
                    <Text fontWeight={600}>{detail.bloodType ?? "—"}</Text>
                  </Box>
                  <Box>
                    <Text
                      fontSize="10px"
                      textTransform="uppercase"
                      color="lucera.textMuted"
                      letterSpacing="wider"
                    >
                      Seguro
                    </Text>
                    <Text fontWeight={600}>{detail.insurance || "—"}</Text>
                  </Box>
                  <Box>
                    <Text
                      fontSize="10px"
                      textTransform="uppercase"
                      color="lucera.textMuted"
                      letterSpacing="wider"
                    >
                      Acudiente
                    </Text>
                    <Text fontWeight={600}>{detail.guardianName}</Text>
                  </Box>
                </SimpleGrid>

                {((detail.allergies?.length ?? 0) > 0 ||
                  (detail.conditions?.length ?? 0) > 0) && (
                  <Wrap spacing={1} mb={4}>
                    {(detail.allergies ?? []).map((a) => (
                      <WrapItem key={a}>
                        <Badge colorScheme="amarillo">
                          <HStack spacing={1}>
                            <AlertTriangle size={10} />
                            <Text>{a}</Text>
                          </HStack>
                        </Badge>
                      </WrapItem>
                    ))}
                    {(detail.conditions ?? []).map((c) => (
                      <WrapItem key={c}>
                        <Badge colorScheme="blue">{c}</Badge>
                      </WrapItem>
                    ))}
                  </Wrap>
                )}

                <Divider mb={3} />
                <HStack mb={3} spacing={2}>
                  <MessageSquare size={15} color="#6c122b" />
                  <Text fontSize="sm" fontWeight={700}>
                    Historial de chats
                    {selectedGuardian ? ` · ${selectedGuardian}` : ""} (
                    {detailChats.length})
                  </Text>
                </HStack>

                {/* Tags: "Todos" + un acudiente por tag; filtra los chats por acudiente. */}
                {childGuardians.length > 0 && (
                  <Flex gap={2} mb={3} wrap="wrap">
                    <Box
                      as="button"
                      type="button"
                      onClick={() => setSelectedGuardian(null)}
                      px={3}
                      py={1}
                      borderRadius="full"
                      fontSize="xs"
                      fontWeight={600}
                      borderWidth="1px"
                      bg={selectedGuardian === null ? "vino.500" : "white"}
                      borderColor={
                        selectedGuardian === null ? "vino.500" : "lucera.border"
                      }
                      color={
                        selectedGuardian === null ? "white" : "lucera.textMuted"
                      }
                      _hover={
                        selectedGuardian === null
                          ? undefined
                          : { bg: "crema.50", borderColor: "lucera.textMuted" }
                      }
                      transition="all 120ms"
                    >
                      Todos ({childChats.length})
                    </Box>
                    {childGuardians.map((tag) => {
                      const active = tag.name === selectedGuardian;
                      return (
                        <Box
                          key={tag.name}
                          as="button"
                          type="button"
                          onClick={() => setSelectedGuardian(tag.name)}
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
                            <UsersIcon size={11} />
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
                    {selectedGuardian
                      ? `${selectedGuardian} aún no tiene chats registrados con este niño.`
                      : "Este niño aún no tiene chats registrados."}
                  </Text>
                ) : (
                  <VStack align="stretch" spacing={2}>
                    {detailChats.map((c) => (
                      <Flex
                        key={c.id}
                        as="button"
                        type="button"
                        onClick={() => navigate(`/chats?chat=${c.id}`)}
                        align="stretch"
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
                          <Flex
                            justify="space-between"
                            align="center"
                            mb={1}
                            gap={2}
                          >
                            <HStack spacing={2}>
                              <TriageBadge
                                level={chatTriageToLevel[c.triage]}
                              />
                              <Badge
                                textTransform="capitalize"
                                variant="outline"
                              >
                                {chatStatusLabel[c.status] ?? c.status}
                              </Badge>
                            </HStack>
                            <Text
                              fontSize="xs"
                              color="lucera.textMuted"
                              sx={{ fontVariantNumeric: "tabular-nums" }}
                            >
                              {c.startedAt}
                            </Text>
                          </Flex>
                          <Text fontSize="sm" noOfLines={2}>
                            {c.lastMessage}
                          </Text>
                          {c.aiSummary && (
                            <Text
                              fontSize="xs"
                              color="lucera.textMuted"
                              mt={1}
                              noOfLines={2}
                            >
                              IA: {c.aiSummary}
                            </Text>
                          )}
                        </Box>
                        <Flex align="center" flexShrink={0}>
                          <ChevronRight size={16} color="#7b5a48" />
                        </Flex>
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
          <ModalHeader>{editing ? "Editar niño" : "Nuevo niño"}</ModalHeader>
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
                  <FormLabel>Fecha de nacimiento</FormLabel>
                  <Input
                    name="birthDate"
                    type="date"
                    defaultValue={editing?.birthDate}
                  />
                </FormControl>
                <FormControl>
                  <FormLabel>Peso (kg)</FormLabel>
                  <Input
                    name="weightKg"
                    type="number"
                    step="0.1"
                    min="0"
                    defaultValue={editing?.weightKg}
                  />
                </FormControl>
                <FormControl>
                  <FormLabel>Tipo de sangre</FormLabel>
                  <Select
                    name="bloodType"
                    defaultValue={editing?.bloodType ?? ""}
                    placeholder="Sin especificar"
                  >
                    {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map(
                      (t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      )
                    )}
                  </Select>
                </FormControl>
                <FormControl>
                  <FormLabel>Género</FormLabel>
                  <Select
                    name="gender"
                    defaultValue={genderToValue(editing?.gender)}
                    placeholder="Seleccionar género"
                  >
                    <option value="female">Femenino</option>
                    <option value="male">Masculino</option>
                    <option value="other">Otro</option>
                  </Select>
                </FormControl>
                {!editing && (
                  <FormControl isRequired>
                    <FormLabel>Acudiente</FormLabel>
                    <Select
                      name="guardianId"
                      placeholder="Seleccionar acudiente"
                    >
                      {guardians.map((g) => (
                        <option key={g.id} value={g.id}>
                          {g.name}
                        </option>
                      ))}
                    </Select>
                  </FormControl>
                )}
                <FormControl gridColumn="span 2">
                  <FormLabel>Alergias (separadas por coma)</FormLabel>
                  <Input
                    name="allergies"
                    placeholder="Penicilina, Maní…"
                    defaultValue={editing?.allergies?.join(", ")}
                  />
                </FormControl>
                <FormControl gridColumn="span 2">
                  <FormLabel>
                    Condiciones médicas (separadas por coma)
                  </FormLabel>
                  <Input
                    name="conditions"
                    placeholder="Asma leve…"
                    defaultValue={editing?.conditions?.join(", ")}
                  />
                </FormControl>
                <FormControl gridColumn="span 2">
                  <FormLabel>Dirección</FormLabel>
                  <Input
                    name="address"
                    placeholder="Calle, edificio, referencia…"
                    defaultValue={editing?.address || undefined}
                  />
                </FormControl>
                <FormControl gridColumn="span 2">
                  <FormLabel>Centro educativo</FormLabel>
                  <Input
                    name="school"
                    placeholder="Nombre del colegio / escuela"
                    defaultValue={editing?.school || undefined}
                  />
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
        title="Eliminar niño"
        description={
          <>
            ¿Seguro que deseas eliminar a <strong>{toDelete?.name}</strong>? Se
            perderá su historial clínico vinculado y no se puede deshacer.
          </>
        }
        onConfirm={async () => {
          if (!toDelete) return;
          try {
            const freshToken = await getValidToken();
            await apiFetch<DeleteResponse>(
              `/api/patients/${toDelete.id}`,
              freshToken,
              { method: "DELETE" }
            );
            toast.success("Niño eliminado");
            refetchPatients();
            flashLoading();
          } catch (err) {
            toast.error("No se pudo eliminar el niño", {
              description: err instanceof Error ? err.message : undefined,
            });
          }
        }}
      />
    </DashboardLayout>
  );
}
