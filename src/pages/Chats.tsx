import { useEffect, useMemo, useState, type ReactNode } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { ChatSesion } from "@/lib/mockData";
import { useAuth } from "@/lib/auth";
import { useFetchAll } from "@/hooks/useFetchAll";
import {
  chatTriageToLevel,
  chatAttentionToEs,
  chatStatusToEstado,
  chatRoleToEs,
  relationToEs,
} from "@/lib/apiMappings";
import type { ChatApi, GuardianApi, PatientApi } from "@/lib/apiTypes";
import { toast } from "@/lib/toast";
import {
  Box,
  Flex,
  HStack,
  VStack,
  Input,
  InputGroup,
  InputLeftElement,
  Text,
  Avatar,
  Badge,
  type BadgeProps,
} from "@chakra-ui/react";
import {
  Search,
  Baby,
  Phone,
  Bot,
  Clock,
  Users as UsersIcon,
  Lock,
  type LucideIcon,
} from "lucide-react";
import { TriageBadge } from "@/components/TriageBadge";
import { LoadingState } from "@/components/LoadingState";

const triageColors: Record<ChatApi["triage"], string> = {
  general: "#2f9e6b",
  urgent: "#f8cc37",
  emergency: "#b91c1c",
};

const estadoTone: Record<ChatSesion["estado"], BadgeProps["colorScheme"]> = {
  activa: "green",
  esperando: "yellow",
  cerrada: "gray",
};

function chatApiToSesion(c: ChatApi): ChatSesion {
  return {
    id: c.id,
    acudiente: c.guardian,
    paciente: c.patient,
    telefono: c.phone,
    triaje: chatTriageToLevel[c.triage],
    tipoAtencion: chatAttentionToEs[c.attentionType] ?? "Virtual",
    resumenIA: c.aiSummary ?? undefined,
    calificacion: c.rating ?? undefined,
    ultimoMensaje: c.lastMessage,
    hora: c.time,
    inicio: c.startedAt,
    cierre: c.closedAt ?? undefined,
    mensajes: c.messages.map((m) => ({
      rol: chatRoleToEs[m.role] ?? "sistema",
      texto: m.text,
      hora: m.time,
      alertas: m.alerts,
    })),
    estado: chatStatusToEstado[c.status] ?? "cerrada",
  };
}

function InfoSection({
  icon: Icon,
  title,
  children,
}: {
  icon: LucideIcon;
  title: string;
  children: ReactNode;
}) {
  return (
    <Box mb={5}>
      <HStack spacing={2} mb={2}>
        <Icon size={14} color="#6d122b" />
        <Text
          fontSize="10px"
          fontWeight={700}
          textTransform="uppercase"
          letterSpacing="wider"
          color="lucera.textMuted"
        >
          {title}
        </Text>
      </HStack>
      <VStack align="stretch" spacing={1.5}>
        {children}
      </VStack>
    </Box>
  );
}

function InfoRow({ label, value }: { label: string; value: ReactNode }) {
  return (
    <HStack justify="space-between" fontSize="xs" align="flex-start">
      <Text color="lucera.textMuted" flexShrink={0}>
        {label}
      </Text>
      <Box fontWeight={600} textAlign="right">
        {value}
      </Box>
    </HStack>
  );
}

// ⚠️ Endpoint pesado: trae todos los mensajes de cada chat en una sola llamada.
export default function Chats() {
  const { token } = useAuth();
  const {
    data: chatsData,
    loading: chatsLoading,
    error: chatsError,
  } = useFetchAll<ChatApi>(token ? "/api/chats" : null);
  const { data: guardiansData } = useFetchAll<GuardianApi>(
    token ? "/api/guardians" : null
  );
  const { data: patientsData } = useFetchAll<PatientApi>(
    token ? "/api/patients" : null
  );

  const rawChats = useMemo(() => chatsData?.items ?? [], [chatsData]);
  const chats = useMemo(() => rawChats.map(chatApiToSesion), [rawChats]);

  const guardianByPhone = useMemo(() => {
    const map = new Map<string, GuardianApi>();
    (guardiansData?.items ?? []).forEach((g) => map.set(g.phone, g));
    return map;
  }, [guardiansData]);

  const patientByKey = useMemo(() => {
    const map = new Map<string, PatientApi>();
    (patientsData?.items ?? []).forEach((p) =>
      map.set(`${p.phone}__${p.name}`, p)
    );
    return map;
  }, [patientsData]);

  useEffect(() => {
    if (chatsError) {
      toast.error("No se pudieron cargar los chats", {
        description: chatsError,
      });
    }
  }, [chatsError]);

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [q, setQ] = useState("");
  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaFin, setFechaFin] = useState("");
  const [tab, setTab] = useState<"todas" | "activas" | "cerradas">("todas");

  // Búsqueda + rango de fechas (sobre c.inicio), sin la pestaña todavía —
  // así los 3 contadores (total/activas/cerradas) reflejan el desglose real
  // dentro del filtro, sin importar qué pestaña esté seleccionada.
  const searchAndDateFiltered = chats.filter((c) => {
    const okQ = `${c.acudiente} ${c.paciente} ${c.telefono}`
      .toLowerCase()
      .includes(q.toLowerCase());
    const fecha = c.inicio.slice(0, 10);
    const okFechaInicio = !fechaInicio || fecha >= fechaInicio;
    const okFechaFin = !fechaFin || fecha <= fechaFin;
    return okQ && okFechaInicio && okFechaFin;
  });

  const conteos = {
    total: searchAndDateFiltered.length,
    activas: searchAndDateFiltered.filter((c) => c.estado !== "cerrada").length,
    cerradas: searchAndDateFiltered.filter((c) => c.estado === "cerrada")
      .length,
  };

  const filtered = searchAndDateFiltered.filter((c) => {
    return (
      tab === "todas" ||
      (tab === "activas" ? c.estado !== "cerrada" : c.estado === "cerrada")
    );
  });

  const selected = chats.find((c) => c.id === selectedId) ?? null;
  const selectedRaw = rawChats.find((c) => c.id === selectedId) ?? null;
  const selectedGuardian = selectedRaw
    ? guardianByPhone.get(selectedRaw.phone)
    : undefined;
  const selectedPatient = selectedRaw
    ? patientByKey.get(`${selectedRaw.phone}__${selectedRaw.patient}`)
    : undefined;

  return (
    <DashboardLayout
      title="Monitoreo de chats"
      subtitle="Conversaciones de WhatsApp"
    >
      <Flex
        direction={{ base: "column", lg: "row" }}
        h={{ base: "auto", lg: "calc(100vh - 220px)" }}
        minH={{ lg: "600px" }}
        borderWidth="1px"
        borderColor="lucera.border"
        borderRadius="xl"
        overflow="hidden"
        bg="lucera.surface"
      >
        {/* Columna izquierda: lista de chats */}
        <Flex
          direction="column"
          w={{ base: "100%", lg: "300px" }}
          flexShrink={0}
          borderRightWidth={{ base: 0, lg: "1px" }}
          borderBottomWidth={{ base: "1px", lg: 0 }}
          borderColor="lucera.border"
          maxH={{ base: "360px", lg: "none" }}
        >
          <Box p={3} borderBottomWidth="1px" borderColor="lucera.border">
            <Text fontSize="xs" fontWeight={600} mb={1}>
              Buscar
            </Text>
            <InputGroup size="sm">
              <InputLeftElement pointerEvents="none">
                <Search size={14} />
              </InputLeftElement>
              <Input
                placeholder="Acudiente, paciente o teléfono…"
                value={q}
                onChange={(e) => setQ(e.target.value)}
              />
            </InputGroup>
            <HStack
              mt={3}
              spacing={2}
              flexDir={"column"}
              alignItems={"flex-start"}
            >
              <Box flex={1}>
                <Text
                  fontSize="10px"
                  fontWeight={600}
                  mb={1}
                  color="lucera.textMuted"
                >
                  Desde
                </Text>
                <Input
                  type="date"
                  size="sm"
                  value={fechaInicio}
                  max={fechaFin || undefined}
                  onChange={(e) => setFechaInicio(e.target.value)}
                />
              </Box>
              <Box flex={1}>
                <Text
                  fontSize="10px"
                  fontWeight={600}
                  mb={1}
                  color="lucera.textMuted"
                >
                  Hasta
                </Text>
                <Input
                  type="date"
                  size="sm"
                  value={fechaFin}
                  min={fechaInicio || undefined}
                  onChange={(e) => setFechaFin(e.target.value)}
                />
              </Box>
            </HStack>
            <HStack mt={3} spacing={1} wrap="wrap">
              {(
                [
                  { key: "todas", label: "Todas", count: conteos.total },
                  { key: "activas", label: "Activas", count: conteos.activas },
                  {
                    key: "cerradas",
                    label: "Cerradas",
                    count: conteos.cerradas,
                  },
                ] as const
              ).map((t) => (
                <Box
                  key={t.key}
                  as="button"
                  type="button"
                  onClick={() => setTab(t.key)}
                  px={3}
                  py={1.5}
                  borderRadius="full"
                  fontSize="xs"
                  fontWeight={600}
                  bg={tab === t.key ? "exito.500" : "crema.100"}
                  color={tab === t.key ? "white" : "lucera.textMuted"}
                  transition="all 120ms"
                >
                  {t.label} ({t.count})
                </Box>
              ))}
            </HStack>
          </Box>

          <VStack align="stretch" spacing={0} overflowY="auto" flex={1}>
            {chatsLoading && !chatsData ? (
              <LoadingState label="Cargando chats…" />
            ) : (
              filtered.map((c) => {
                const raw = rawChats.find((r) => r.id === c.id);
                const active = c.id === selectedId;
                return (
                  <Box
                    key={c.id}
                    as="button"
                    type="button"
                    onClick={() => setSelectedId(c.id)}
                    textAlign="left"
                    p={3}
                    borderBottomWidth="1px"
                    borderColor="lucera.borderSoft"
                    bg={active ? "crema.100" : "white"}
                    _hover={{ bg: "crema.50" }}
                  >
                    <HStack justify="space-between" align="flex-start" mb={1}>
                      <HStack spacing={2} minW={0}>
                        <Avatar
                          size="sm"
                          name={c.acudiente}
                          bg="vino.500"
                          color="white"
                        />
                        <Text fontSize="sm" fontWeight={700} noOfLines={1}>
                          {c.acudiente}
                        </Text>
                      </HStack>
                      <VStack spacing={1} align="flex-end" flexShrink={0}>
                        <Text fontSize="10px" color="lucera.textMuted">
                          {c.hora}
                        </Text>
                        <Box
                          h="8px"
                          w="8px"
                          borderRadius="full"
                          bg={raw ? triageColors[raw.triage] : "gray.300"}
                        />
                      </VStack>
                    </HStack>
                    <HStack
                      fontSize="xs"
                      color="lucera.textMuted"
                      spacing={1}
                      mb={1.5}
                    >
                      <Baby size={11} />
                      <Text noOfLines={1}>
                        {c.paciente} · {c.ultimoMensaje}
                      </Text>
                    </HStack>
                    <HStack justify="space-between">
                      <Badge
                        fontSize="10px"
                        colorScheme={estadoTone[c.estado]}
                        textTransform="capitalize"
                      >
                        {c.estado}
                      </Badge>
                      <Text fontSize="10px" color="lucera.textMuted">
                        {c.mensajes.length} msj
                      </Text>
                    </HStack>
                  </Box>
                );
              })
            )}
            {!chatsLoading && filtered.length === 0 && (
              <Text
                p={4}
                fontSize="sm"
                color="lucera.textMuted"
                textAlign="center"
              >
                No hay chats que coincidan.
              </Text>
            )}
          </VStack>
        </Flex>

        {/* Columna central: conversación */}
        <Flex direction="column" flex={1} minW={0} bg="crema.50">
          {selected ? (
            <>
              <Flex
                p={4}
                borderBottomWidth="1px"
                borderColor="lucera.border"
                bg="white"
                align="center"
                justify="space-between"
              >
                <HStack spacing={3} minW={0}>
                  <Avatar
                    size="sm"
                    name={selected.acudiente}
                    bg="vino.500"
                    color="white"
                  />
                  <Box minW={0}>
                    <Text fontWeight={700} fontSize="sm" noOfLines={1}>
                      {selected.acudiente}
                    </Text>
                    <HStack fontSize="xs" color="lucera.textMuted" spacing={1}>
                      <Phone size={10} />
                      <Text noOfLines={1}>
                        {selected.telefono} · {selected.paciente} ·{" "}
                        {selected.estado}
                      </Text>
                    </HStack>
                  </Box>
                </HStack>
                <TriageBadge level={selected.triaje} />
              </Flex>

              <Box flex={1} overflowY="auto" p={4}>
                <VStack spacing={3} maxW="2xl" mx="auto" align="stretch">
                  {selected.mensajes.map((m, i) => {
                    const isUser = m.rol === "acudiente";
                    return (
                      <Flex
                        key={i}
                        justify={isUser ? "flex-end" : "flex-start"}
                      >
                        <Box
                          maxW="75%"
                          px={4}
                          py={2.5}
                          borderRadius="2xl"
                          boxShadow="sm"
                          fontSize="sm"
                          bg={isUser ? "exito.500" : "white"}
                          color={isUser ? "white" : "lucera.text"}
                          borderWidth={!isUser ? "1px" : 0}
                          borderColor="lucera.border"
                          borderBottomRightRadius={isUser ? "sm" : "2xl"}
                          borderBottomLeftRadius={!isUser ? "sm" : "2xl"}
                        >
                          <Text>{m.texto}</Text>
                          <Text
                            fontSize="10px"
                            mt={1}
                            opacity={0.7}
                            sx={{ fontVariantNumeric: "tabular-nums" }}
                          >
                            {m.hora}
                          </Text>
                        </Box>
                      </Flex>
                    );
                  })}
                </VStack>
              </Box>

              <HStack
                justify="center"
                p={3}
                borderTopWidth="1px"
                borderColor="lucera.border"
                bg="white"
                fontSize="xs"
                color="lucera.textMuted"
                spacing={2}
              >
                <Lock size={12} />
                <Text>
                  Vista de monitoreo en solo lectura. Las respuestas las
                  gestiona Lucera IA por WhatsApp.
                </Text>
              </HStack>
            </>
          ) : (
            <Flex
              flex={1}
              align="center"
              justify="center"
              color="lucera.textMuted"
              fontSize="sm"
            >
              Selecciona un chat para ver el detalle.
            </Flex>
          )}
        </Flex>

        {/* Columna derecha: información del chat */}
        {selected && (
          <Box
            w={{ base: "100%", lg: "280px" }}
            flexShrink={0}
            borderLeftWidth={{ base: 0, lg: "1px" }}
            borderTopWidth={{ base: "1px", lg: 0 }}
            borderColor="lucera.border"
            overflowY="auto"
            bg="white"
            p={4}
          >
            <InfoSection icon={Clock} title="Sesión">
              <InfoRow
                label="Estado"
                value={
                  <Badge
                    colorScheme={estadoTone[selected.estado]}
                    textTransform="capitalize"
                  >
                    {selected.estado}
                  </Badge>
                }
              />
              <InfoRow
                label="Clasificación"
                value={<TriageBadge level={selected.triaje} />}
              />
              <InfoRow label="Tipo de atención" value={selected.tipoAtencion} />
              <InfoRow label="Abierta" value={selected.inicio} />
              <InfoRow label="Actualizada" value={selected.hora} />
              <InfoRow label="Cerrada" value={selected.cierre ?? "—"} />
            </InfoSection>

            <InfoSection icon={UsersIcon} title="Acudiente">
              <InfoRow label="Nombre" value={selected.acudiente} />
              <InfoRow label="Teléfono" value={selected.telefono} />
              <InfoRow
                label="Relación"
                value={
                  selectedGuardian
                    ? relationToEs[selectedGuardian.relationship]
                    : "—"
                }
              />
              <InfoRow label="Ciudad" value={selectedGuardian?.city ?? "—"} />
            </InfoSection>

            <InfoSection icon={Baby} title="Paciente">
              <InfoRow label="Nombre" value={selected.paciente} />
              <InfoRow
                label="Edad"
                value={selectedPatient ? `${selectedPatient.age} años` : "—"}
              />
              <InfoRow
                label="Nacimiento"
                value={selectedPatient?.birthDate ?? "—"}
              />
              <InfoRow
                label="Peso"
                value={
                  selectedPatient?.weightKg
                    ? `${selectedPatient.weightKg} kg`
                    : "—"
                }
              />
              <InfoRow
                label="Alergias"
                value={
                  selectedPatient?.allergies?.length
                    ? selectedPatient.allergies.join(", ")
                    : "Ninguna"
                }
              />
            </InfoSection>

            {selected.resumenIA && (
              <InfoSection icon={Bot} title="Resumen IA">
                <Text fontSize="xs" color="lucera.textMuted">
                  {selected.resumenIA}
                </Text>
              </InfoSection>
            )}
          </Box>
        )}
      </Flex>
    </DashboardLayout>
  );
}
