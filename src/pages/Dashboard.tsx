import { useEffect, useMemo } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useAuth } from "@/lib/auth";
import { useFetch } from "@/hooks/useFetch";
import { useFetchAll } from "@/hooks/useFetchAll";
import type { StatsSummaryResponse, ChatApi } from "@/lib/apiTypes";
import {
  Box,
  Flex,
  Image,
  Text,
  Heading,
  VStack,
  Button,
  SimpleGrid,
  Icon,
} from "@chakra-ui/react";
import { Link as RouterLink } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Users,
  UserX,
  Crown,
  TrendingUp,
  MessageSquare,
  DollarSign,
  Heart,
  Siren,
  Ambulance,
  CheckCircle2,
  CircleDot,
  CircleSlash,
  type LucideIcon,
} from "lucide-react";
import logoVertical from "@/assets/lucera-vertical.jpg";
import { StatCard } from "@/components/StatCard";
import { LoadingState } from "@/components/LoadingState";
import { formatNumber, formatCurrency } from "@/lib/format";
import { toast } from "@/lib/toast";

const MotionBox = motion(Box);

interface StatProps {
  icon: LucideIcon;
  label: string;
  value: string | number;
  accent: { bg: string; fg: string };
  sub?: string;
}

// Estilo de KPI por acento: chip suave = fondo tenue del color + icono en el
// color (sin gradiente ni sombra), para un look más liviano. Los semánticos
// (éxito/peligro) usan un tinte claro con el icono en su color.
const chipStyleByBg: Record<string, { bg: string; color: string }> = {
  "vino.50": { bg: "vino.50", color: "vino.500" },
  "naranja.50": { bg: "naranja.50", color: "naranja.600" },
  "amarillo.50": { bg: "amarillo.50", color: "amarillo.700" },
  "exito.500": { bg: "rgba(47,158,107,0.12)", color: "exito.500" },
  "peligro.500": { bg: "rgba(185,28,28,0.12)", color: "peligro.500" },
};

function Stat({ icon, label, value, accent, sub }: StatProps) {
  const chipProps = chipStyleByBg[accent.bg] ?? {
    bg: accent.bg,
    color: accent.fg,
  };

  return (
    <StatCard position="relative" overflow="hidden">
      <Flex justify="space-between" align="flex-start" position="relative">
        <Box>
          <Text
            fontSize="11px"
            textTransform="uppercase"
            letterSpacing="wider"
            color="lucera.textMuted"
            fontWeight={700}
          >
            {label}
          </Text>
          <Heading
            fontSize={{ base: "2xl", md: "3xl" }}
            fontWeight={700}
            mt={2}
            lineHeight={1.1}
            sx={{ fontVariantNumeric: "tabular-nums" }}
          >
            {value}
          </Heading>
          {sub && (
            <Text fontSize="xs" color="lucera.textMuted" mt={1}>
              {sub}
            </Text>
          )}
        </Box>
        <Flex
          h={11}
          w={11}
          borderRadius="xl"
          align="center"
          justify="center"
          flexShrink={0}
          {...chipProps}
        >
          <Icon as={icon} boxSize={5} />
        </Flex>
      </Flex>
    </StatCard>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <Heading size="md" fontFamily="heading" fontWeight={700} mt={6} mb={3}>
      {children}
    </Heading>
  );
}

// Resumen operativo (Admin/Ventas/Invitado): toma los KPIs directamente de
// /api/stats/summary (una sola llamada, cacheada ~60s en el backend), en vez de
// recalcularlos en el cliente. La página de Estadísticas sigue con su propia
// data filtrable.
function DashboardSummary() {
  const { token } = useAuth();
  const {
    data: summary,
    loading,
    error,
  } = useFetch<StatsSummaryResponse>(token ? "/api/stats/summary" : null);

  useEffect(() => {
    if (error) {
      toast.error("No se pudo cargar el resumen", { description: error });
    }
  }, [error]);

  if (loading && !summary) {
    return <LoadingState label="Cargando resumen…" />;
  }
  if (!summary) return null;

  const { accounts, revenueUsd, csat, usage, safety } = summary;
  // Los porcentajes pueden venir null cuando aún no hay datos suficientes.
  const pct = (v: number | null) => (v == null ? "—" : `${v}%`);

  return (
    <Box>
      <SectionTitle>Cuentas</SectionTitle>
      <SimpleGrid columns={{ base: 1, sm: 2, lg: 4 }} spacing={4}>
        <Stat
          icon={Users}
          label="Cuentas activas"
          value={formatNumber(accounts.active)}
          accent={{ bg: "vino.50", fg: "vino.500" }}
          sub={`de ${formatNumber(accounts.total)} totales`}
        />
        <Stat
          icon={UserX}
          label="Cuentas Free"
          value={formatNumber(accounts.free)}
          accent={{ bg: "crema.100", fg: "lucera.textMuted" }}
          sub="Plan gratuito"
        />
        <Stat
          icon={Crown}
          label="Cuentas Premium"
          value={formatNumber(accounts.premium)}
          accent={{ bg: "amarillo.50", fg: "amarillo.700" }}
          sub="Planes de pago"
        />
        <Stat
          icon={TrendingUp}
          label="Conversión a Premium"
          value={pct(accounts.conversionRate)}
          accent={{ bg: "naranja.50", fg: "naranja.500" }}
          sub="Free → Pago"
        />
      </SimpleGrid>

      <SectionTitle>Uso</SectionTitle>
      <SimpleGrid columns={{ base: 1, sm: 2, lg: 3 }} spacing={4}>
        <Stat
          icon={MessageSquare}
          label="Sesiones"
          value={formatNumber(usage.sessions)}
          accent={{ bg: "amarillo.50", fg: "amarillo.700" }}
          sub="Consultas registradas"
        />
        <Stat
          icon={CheckCircle2}
          label="Tasa de finalización"
          value={pct(usage.sessionCompletionRate)}
          accent={{ bg: "exito.500", fg: "white" }}
          sub="Sesiones completadas"
        />
        <Stat
          icon={CircleSlash}
          label="Sesiones abandonadas"
          value={formatNumber(usage.abandoned)}
          accent={{ bg: "crema.100", fg: "lucera.textMuted" }}
          sub="Sin cerrar por inactividad"
        />
      </SimpleGrid>

      <SectionTitle>Ingresos y satisfacción</SectionTitle>
      <SimpleGrid columns={{ base: 1, sm: 2 }} spacing={4}>
        <Stat
          icon={DollarSign}
          label="Ingresos del mes"
          value={formatCurrency(revenueUsd)}
          accent={{ bg: "exito.500", fg: "white" }}
          sub="Stripe + Yappy"
        />
        <Stat
          icon={Heart}
          label="CSAT"
          value={pct(csat)}
          accent={{ bg: "vino.50", fg: "vino.500" }}
          sub="Calificación ≥ 4★"
        />
      </SimpleGrid>

      <SectionTitle>Seguridad del paciente</SectionTitle>
      <SimpleGrid columns={{ base: 1, sm: 2, lg: 4 }} spacing={4}>
        <Stat
          icon={Siren}
          label="Red flags a Urgencias"
          value={formatNumber(safety.redFlagsToEmergency)}
          accent={{ bg: "peligro.500", fg: "white" }}
          sub="Triaje de emergencia (rojo)"
        />
        <Stat
          icon={CircleDot}
          label="Tasa de red flags"
          value={pct(safety.redFlagRate)}
          accent={{ bg: "naranja.50", fg: "naranja.500" }}
          sub="Red flags / sesiones"
        />
        <Stat
          icon={Ambulance}
          label="Reported ER Rate"
          value={pct(safety.reportedErRate)}
          accent={{ bg: "amarillo.50", fg: "amarillo.700" }}
          sub="Derivaciones a urgencias"
        />
        <Stat
          icon={CheckCircle2}
          label="ER confirmados"
          value={formatNumber(safety.erConfirmed)}
          accent={{ bg: "crema.100", fg: "lucera.textMuted" }}
          sub={`de ${formatNumber(safety.erAnswered)} respondidos`}
        />
      </SimpleGrid>
    </Box>
  );
}

// Resumen del rol Médico: enfocado en satisfacción, seguridad del paciente y
// el desglose de consultas. Todo se calcula sobre /api/chats.
function DoctorSummary() {
  const { token } = useAuth();
  const {
    data: chatsData,
    loading,
    error,
  } = useFetchAll<ChatApi>(token ? "/api/chats" : null);

  useEffect(() => {
    if (error) {
      toast.error("No se pudo cargar el resumen", { description: error });
    }
  }, [error]);

  const chats = useMemo(() => chatsData?.items ?? [], [chatsData]);

  const metrics = useMemo(() => {
    const total = chats.length;
    const closed = chats.filter((c) => c.status === "closed").length;
    const active = chats.filter((c) => c.status === "active").length;
    const waiting = chats.filter((c) => c.status === "waiting").length;

    const sessionCompletionRate =
      total > 0 ? Math.round((closed / total) * 100) : 0;

    // Red flags a Urgencias: sesiones con triaje de emergencia (rojo).
    const redFlagsToER = chats.filter((c) => c.triage === "emergency").length;

    // Reported ER Rate: derivaciones presenciales sobre el total.
    const inPersonReferrals = chats.filter(
      (c) => c.attentionType === "in_person"
    ).length;
    const reportedERRate =
      total > 0 ? Math.round((inPersonReferrals / total) * 100) : 0;

    // CSAT: de las sesiones con calificación, % con 4★ o más.
    const rated = chats.filter((c) => c.rating != null);
    const csat =
      rated.length > 0
        ? Math.round(
            (rated.filter((c) => (c.rating ?? 0) >= 4).length / rated.length) *
              100
          )
        : 0;

    return {
      total,
      closed,
      active,
      waiting,
      sessionCompletionRate,
      redFlagsToER,
      reportedERRate,
      csat,
    };
  }, [chats]);

  if (loading && !chatsData) {
    return <LoadingState label="Cargando resumen…" />;
  }

  return (
    <Box>
      <SectionTitle>Satisfacción y uso</SectionTitle>
      <SimpleGrid columns={{ base: 1, sm: 2 }} spacing={4}>
        <Stat
          icon={Heart}
          label="CSAT"
          value={`${metrics.csat}%`}
          accent={{ bg: "vino.50", fg: "vino.500" }}
          sub="Calificación ≥ 4★"
        />
        <Stat
          icon={CheckCircle2}
          label="Session Completion Rate"
          value={`${metrics.sessionCompletionRate}%`}
          accent={{ bg: "exito.500", fg: "white" }}
          sub="Sesiones cerradas / total"
        />
      </SimpleGrid>

      <SectionTitle>Seguridad del paciente</SectionTitle>
      <SimpleGrid columns={{ base: 1, sm: 2 }} spacing={4}>
        <Stat
          icon={Siren}
          label="Red flags a Urgencias"
          value={formatNumber(metrics.redFlagsToER)}
          accent={{ bg: "peligro.500", fg: "white" }}
          sub="Triaje de emergencia (rojo)"
        />
        <Stat
          icon={Ambulance}
          label="Reported ER Rate"
          value={`${metrics.reportedERRate}%`}
          accent={{ bg: "amarillo.50", fg: "amarillo.700" }}
          sub="Derivaciones presenciales / total"
        />
      </SimpleGrid>

      <SectionTitle>Consultas</SectionTitle>
      <SimpleGrid columns={{ base: 2, lg: 4 }} spacing={4}>
        <Stat
          icon={CheckCircle2}
          label="Cerradas"
          value={formatNumber(metrics.closed)}
          accent={{ bg: "exito.500", fg: "white" }}
        />
        <Stat
          icon={CircleDot}
          label="Abiertas"
          value={formatNumber(metrics.active)}
          accent={{ bg: "vino.50", fg: "vino.500" }}
        />
        <Stat
          icon={CircleSlash}
          label="Abandonadas"
          value={formatNumber(metrics.waiting)}
          accent={{ bg: "amarillo.50", fg: "amarillo.700" }}
        />
        <Stat
          icon={MessageSquare}
          label="Total"
          value={formatNumber(metrics.total)}
          accent={{ bg: "crema.100", fg: "lucera.textMuted" }}
        />
      </SimpleGrid>
    </Box>
  );
}

function WelcomeHero({ cta }: { cta: { to: string; label: string } | null }) {
  return (
    <Flex minH="70vh" align="center" justify="center">
      <VStack spacing={8} textAlign="center">
        <MotionBox
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <Image
            src={logoVertical}
            alt="Lucera"
            maxH="320px"
            objectFit="contain"
            mx="auto"
          />
        </MotionBox>

        <MotionBox
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <Heading size="md" fontFamily="heading" color="vino.500">
            Lucera
          </Heading>
          <Text
            fontSize="sm"
            color="lucera.textMuted"
            mt={1}
            letterSpacing="wider"
            textTransform="uppercase"
          >
            Panamá
          </Text>
        </MotionBox>

        {cta && (
          <Button
            as={RouterLink}
            to={cta.to}
            colorScheme="vino"
            variant="solid"
          >
            {cta.label}
          </Button>
        )}
      </VStack>
    </Flex>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  if (!user) return null;

  // El Médico ve un resumen propio (satisfacción, seguridad y consultas). El
  // resumen operativo (ingresos, conversión, etc.) es para Admin/Ventas/
  // Invitado. El Acudiente ve la bienvenida.
  const isDoctor = user.role === "Médico";
  const canSeeSummary = ["Admin", "Ventas", "Invitado"].includes(user.role);
  const showSummary = isDoctor || canSeeSummary;

  // CTA según lo que cada rol puede ver: Médico no accede a estadísticas.
  const cta =
    user.role === "Ventas"
      ? { to: "/payments", label: "Ver pagos" }
      : { to: "/statistics", label: "Ver estadísticas" };

  return (
    <DashboardLayout
      title={`Hola, ${user.name.split(" ")[0]}`}
      subtitle={showSummary ? "Resumen general" : "Bienvenido a Lucera"}
    >
      {isDoctor ? (
        <DoctorSummary />
      ) : canSeeSummary ? (
        <DashboardSummary />
      ) : (
        <WelcomeHero cta={user.role !== "Acudiente" ? cta : null} />
      )}
    </DashboardLayout>
  );
}
