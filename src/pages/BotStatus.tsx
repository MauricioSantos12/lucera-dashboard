import { useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useAuth } from "@/lib/auth";
import { useFetch } from "@/hooks/useFetch";
import type { BotStatusResponse } from "@/lib/apiTypes";
import {
  Box,
  Button,
  Flex,
  HStack,
  VStack,
  SimpleGrid,
  Text,
  Heading,
  Icon,
  Badge,
  Spinner,
} from "@chakra-ui/react";
import {
  RefreshCw,
  Bot,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Clock,
  Zap,
  Link as LinkIcon,
  Database,
  Server,
  BrainCircuit,
  type LucideIcon,
} from "lucide-react";
import { StatCard } from "@/components/StatCard";
import { LoadingState } from "@/components/LoadingState";

// Refresco automático cada 45 s (el bot puede tener cold-start; no conviene
// hacer polling más agresivo).
const POLL_MS = 45_000;

type Semaphore = "up" | "degraded" | "down";

const semaphoreConfig: Record<
  Semaphore,
  {
    label: string;
    description: string;
    color: string;
    bg: string;
    fg: string;
    Icon: LucideIcon;
  }
> = {
  up: {
    label: "Activo",
    description: "El bot respondió y todas sus dependencias están OK.",
    color: "#2f9e6b",
    bg: "exito.500",
    fg: "white",
    Icon: CheckCircle2,
  },
  degraded: {
    label: "Degradado",
    description: "El bot está arriba pero una dependencia está caída.",
    color: "#f8cc37",
    bg: "amarillo.50",
    fg: "amarillo.700",
    Icon: AlertTriangle,
  },
  down: {
    label: "Caído",
    description: "El bot no respondió (caído, cold-start o red).",
    color: "#b91c1c",
    bg: "peligro.500",
    fg: "white",
    Icon: XCircle,
  },
};

// Dependencias conocidas del bot, con etiqueta e ícono. Si el bot está caído,
// checks llega vacío → se muestran como "Sin datos".
const knownChecks: { key: string; label: string; icon: LucideIcon }[] = [
  { key: "mysql", label: "Datos", icon: Database },
  { key: "redis", label: "WhatsApp", icon: Server },
  { key: "rag", label: "Modelo IA", icon: BrainCircuit },
];

function MetaItem({
  icon,
  label,
  value,
}: {
  icon: LucideIcon;
  label: string;
  value: React.ReactNode;
}) {
  return (
    <HStack spacing={2} align="flex-start">
      <Icon as={icon} boxSize={4} color="lucera.textMuted" mt={0.5} />
      <Box minW={0}>
        <Text
          fontSize="10px"
          textTransform="uppercase"
          letterSpacing="wider"
          color="lucera.textMuted"
          fontWeight={600}
        >
          {label}
        </Text>
        <Box fontSize="sm" fontWeight={600}>
          {value}
        </Box>
      </Box>
    </HStack>
  );
}

export default function BotStatus() {
  const { user, token } = useAuth();
  const { data, loading, error, refetch } = useFetch<BotStatusResponse>(
    token ? "/api/bot-status" : null
  );

  // Polling: refresca cada POLL_MS mientras la vista está montada.
  useEffect(() => {
    if (!token) return;
    const id = setInterval(() => refetch(), POLL_MS);
    return () => clearInterval(id);
  }, [token, refetch]);

  if (!user) return null;

  const semaphore: Semaphore | null = data
    ? data.bot === "down"
      ? "down"
      : data.ready
      ? "up"
      : "degraded"
    : null;

  const cfg = semaphore ? semaphoreConfig[semaphore] : null;

  const formatCheckedAt = (iso: string) => {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return iso;
    return d.toLocaleString("es-PA", {
      dateStyle: "medium",
      timeStyle: "medium",
    });
  };

  return (
    <DashboardLayout
      title="Estado del chatbot"
      subtitle="Sistema · Estado del bot de WhatsApp"
    >
      <Flex justify="flex-end" mb={4}>
        <HStack spacing={3}>
          <Text fontSize="xs" color="lucera.textMuted">
            Se actualiza automáticamente cada 45 s
          </Text>
          <Button
            size="sm"
            variant="outline"
            leftIcon={<RefreshCw size={14} />}
            onClick={() => refetch()}
            isLoading={loading && !!data}
            loadingText="Actualizando"
          >
            Actualizar
          </Button>
        </HStack>
      </Flex>

      {loading && !data ? (
        <LoadingState label="Consultando estado del bot…" />
      ) : error ? (
        <StatCard>
          <HStack spacing={3} color="peligro.500">
            <Icon as={XCircle} boxSize={5} />
            <Box>
              <Text fontWeight={700}>No se pudo consultar el estado</Text>
              <Text fontSize="sm" color="lucera.textMuted">
                {error}
              </Text>
            </Box>
          </HStack>
        </StatCard>
      ) : data && cfg && semaphore ? (
        <VStack align="stretch" spacing={4}>
          {/* Semáforo principal */}
          <StatCard>
            <Flex
              direction={{ base: "column", md: "row" }}
              align={{ md: "center" }}
              gap={4}
            >
              <Flex
                h={16}
                w={16}
                borderRadius="2xl"
                align="center"
                justify="center"
                bg={cfg.bg}
                color={cfg.fg}
                flexShrink={0}
              >
                <Icon as={cfg.Icon} boxSize={8} />
              </Flex>
              <Box flex={1} minW={0}>
                <HStack spacing={3} mb={1} wrap="wrap">
                  <HStack spacing={2}>
                    <Bot size={18} color="#6d122b" />
                    <Heading size="md" fontFamily="heading">
                      {cfg.label}
                    </Heading>
                  </HStack>
                  <Box
                    h="12px"
                    w="12px"
                    borderRadius="full"
                    bg={cfg.color}
                    boxShadow={`0 0 0 4px ${cfg.color}22`}
                  />
                  <Badge
                    colorScheme={
                      semaphore === "up"
                        ? "green"
                        : semaphore === "degraded"
                        ? "yellow"
                        : "red"
                    }
                    textTransform="none"
                  >
                    bot: {data.bot} · ready: {String(data.ready)}
                  </Badge>
                </HStack>
                <Text fontSize="sm" color="lucera.textMuted">
                  {cfg.description}
                </Text>
                {data.error && (
                  <Text fontSize="sm" color="peligro.500" mt={1}>
                    Detalle del fallo: <strong>{data.error}</strong>
                  </Text>
                )}
              </Box>
            </Flex>

            <Box
              mt={5}
              pt={4}
              borderTopWidth="1px"
              borderColor="lucera.borderSoft"
            >
              <SimpleGrid columns={{ base: 1, sm: 3 }} spacing={4}>
                <MetaItem
                  icon={Zap}
                  label="Latencia del chequeo"
                  value={`${data.latency_ms} ms`}
                />
                <MetaItem
                  icon={Clock}
                  label="Último chequeo"
                  value={formatCheckedAt(data.checked_at)}
                />
              </SimpleGrid>
            </Box>
          </StatCard>

          {/* Dependencias (checks) */}
          <StatCard>
            <Heading size="sm" fontFamily="heading" mb={1}>
              Dependencias del bot
            </Heading>
            <Text fontSize="xs" color="lucera.textMuted" mb={4}>
              {semaphore === "down"
                ? "El bot no respondió, así que no reportó el estado de sus dependencias."
                : "Estado individual de cada dependencia del bot."}
            </Text>
            <SimpleGrid columns={{ base: 1, sm: 3 }} spacing={3}>
              {knownChecks.map(({ key, label, icon }) => {
                const hasData = key in data.checks;
                const ok = data.checks[key] === true;
                const tone = !hasData
                  ? {
                      bg: "crema.100",
                      fg: "lucera.textMuted",
                      text: "Sin datos",
                      Ico: null as LucideIcon | null,
                    }
                  : ok
                  ? {
                      bg: "exito.500",
                      fg: "white",
                      text: "OK",
                      Ico: CheckCircle2,
                    }
                  : {
                      bg: "peligro.500",
                      fg: "white",
                      text: "Caído",
                      Ico: XCircle,
                    };
                return (
                  <Flex
                    key={key}
                    align="center"
                    gap={3}
                    borderWidth="1px"
                    borderColor="lucera.border"
                    borderRadius="lg"
                    p={3}
                  >
                    <Flex
                      h={9}
                      w={9}
                      flexShrink={0}
                      borderRadius="lg"
                      align="center"
                      justify="center"
                      bg="crema.100"
                      color="lucera.text"
                    >
                      <Icon as={icon} boxSize={4} />
                    </Flex>
                    <Box flex={1} minW={0}>
                      <Text fontSize="sm" fontWeight={700}>
                        {label}
                      </Text>
                    </Box>
                    <Badge
                      display="flex"
                      alignItems="center"
                      gap={1}
                      bg={tone.bg}
                      color={tone.fg}
                    >
                      {tone.Ico && <Icon as={tone.Ico} boxSize={3} />}
                      {tone.text}
                    </Badge>
                  </Flex>
                );
              })}
            </SimpleGrid>
          </StatCard>
        </VStack>
      ) : (
        <StatCard>
          <HStack color="lucera.textMuted">
            <Spinner size="sm" />
            <Text fontSize="sm">Sin datos de estado todavía.</Text>
          </HStack>
        </StatCard>
      )}
    </DashboardLayout>
  );
}
