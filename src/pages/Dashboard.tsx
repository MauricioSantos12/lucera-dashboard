import { useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useAuth } from "@/lib/auth";
import { useFetch } from "@/hooks/useFetch";
import type { KpisResponse, PlanStatApi } from "@/lib/apiTypes";
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
  Baby,
  TrendingUp,
  MessageSquare,
  DollarSign,
  Heart,
  Siren,
  Ambulance,
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

function Stat({ icon, label, value, accent, sub }: StatProps) {
  return (
    <StatCard>
      <Flex justify="space-between" align="flex-start">
        <Box>
          <Text
            fontSize="11px"
            textTransform="uppercase"
            letterSpacing="wider"
            color="lucera.textMuted"
            fontWeight={600}
          >
            {label}
          </Text>
          <Heading
            size="lg"
            mt={2}
            fontFamily="heading"
            sx={{ fontVariantNumeric: "tabular-nums" }}
          >
            {value}
          </Heading>
          {sub && (
            <Text fontSize="xs" color="lucera.textMuted" mt={0.5}>
              {sub}
            </Text>
          )}
        </Box>
        <Flex
          h={10}
          w={10}
          borderRadius="lg"
          align="center"
          justify="center"
          bg={accent.bg}
          color={accent.fg}
        >
          <Icon as={icon} boxSize={5} />
        </Flex>
      </Flex>
    </StatCard>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <Heading size="sm" fontFamily="heading" mt={6} mb={3}>
      {children}
    </Heading>
  );
}

// Resumen operativo (Admin/Ventas/Invitado): toma los KPIs directamente de
// /api/stats/kpis (una sola llamada, cacheada ~60s en el backend), en vez de
// recalcularlos en el cliente. La página de Estadísticas sigue con su propia
// data filtrable.
function DashboardSummary() {
  const { token } = useAuth();
  const {
    data: kpis,
    loading,
    error,
  } = useFetch<KpisResponse>(token ? "/api/stats/kpis" : null);
  // /api/stats/plans → { plan, users, color }[]. Los KPIs no traen el desglose
  // Free/Premium, así que ese conteo sale de aquí.
  const {
    data: plans,
    loading: plansLoading,
    error: plansError,
  } = useFetch<PlanStatApi[]>(token ? "/api/stats/plans" : null);

  useEffect(() => {
    const err = error || plansError;
    if (err) {
      toast.error("No se pudo cargar el resumen", { description: err });
    }
  }, [error, plansError]);

  if ((loading && !kpis) || (plansLoading && !plans)) {
    return <LoadingState label="Cargando resumen…" />;
  }
  if (!kpis) return null;

  const freeAccounts =
    plans?.find((p) => p.plan === "free")?.users ?? 0;
  const premiumAccounts =
    plans
      ?.filter((p) => p.plan !== "free")
      .reduce((sum, p) => sum + p.users, 0) ?? 0;

  return (
    <Box>
      <SectionTitle>Flujo básico de pacientes</SectionTitle>
      <SimpleGrid columns={{ base: 1, sm: 2, lg: 4 }} spacing={4}>
        <Stat
          icon={Users}
          label="Cuentas activas"
          value={formatNumber(kpis.activeGuardians)}
          accent={{ bg: "vino.50", fg: "vino.500" }}
          sub="Estado activo en la plataforma"
        />
        <Stat
          icon={UserX}
          label="Cuentas Free"
          value={formatNumber(freeAccounts)}
          accent={{ bg: "crema.100", fg: "lucera.textMuted" }}
          sub="Plan gratuito"
        />
        <Stat
          icon={Crown}
          label="Cuentas Premium"
          value={formatNumber(premiumAccounts)}
          accent={{ bg: "amarillo.50", fg: "amarillo.700" }}
          sub="Planes de pago"
        />
        <Stat
          icon={TrendingUp}
          label="Conversión a Premium"
          value={`${kpis.premiumConversion}%`}
          accent={{ bg: "naranja.50", fg: "naranja.500" }}
          sub="Free → Pago"
        />
        <Stat
          icon={Baby}
          label="Niños registrados"
          value={formatNumber(kpis.registeredChildren)}
          accent={{ bg: "naranja.50", fg: "naranja.500" }}
          sub="Pacientes pediátricos"
        />
        <Stat
          icon={MessageSquare}
          label="Sesiones del mes"
          value={formatNumber(kpis.sessionsThisMonth)}
          accent={{ bg: "amarillo.50", fg: "amarillo.700" }}
          sub="Consultas del mes en curso"
        />
      </SimpleGrid>

      <SectionTitle>Ingresos y satisfacción</SectionTitle>
      <SimpleGrid columns={{ base: 1, sm: 2 }} spacing={4}>
        <Stat
          icon={DollarSign}
          label="Ingresos del mes"
          value={formatCurrency(kpis.revenueThisMonth)}
          accent={{ bg: "exito.500", fg: "white" }}
          sub="Stripe + Yappy"
        />
        <Stat
          icon={Heart}
          label="CSAT"
          value={`${kpis.csat}%`}
          accent={{ bg: "vino.50", fg: "vino.500" }}
          sub="Calificación ≥ 4★"
        />
      </SimpleGrid>

      <SectionTitle>Seguridad del paciente</SectionTitle>
      <SimpleGrid columns={{ base: 1, sm: 2 }} spacing={4}>
        <Stat
          icon={Siren}
          label="Red flags a Urgencias"
          value={formatNumber(kpis.emergenciesDetected)}
          accent={{ bg: "peligro.500", fg: "white" }}
          sub="Triaje de emergencia (rojo)"
        />
        <Stat
          icon={Ambulance}
          label="Derivaciones presenciales"
          value={formatNumber(kpis.inPersonReferrals)}
          accent={{ bg: "amarillo.50", fg: "amarillo.700" }}
          sub="Sesiones → atención presencial"
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

  // El resumen operativo (ingresos, conversión, etc.) se muestra a los mismos
  // roles que pueden ver Estadísticas. Médico y Acudiente ven la bienvenida.
  const canSeeSummary = ["Admin", "Ventas", "Invitado"].includes(user.role);

  // CTA según lo que cada rol puede ver: Médico no accede a estadísticas.
  const cta =
    user.role === "Médico"
      ? { to: "/chats", label: "Ver chats" }
      : user.role === "Ventas"
      ? { to: "/payments", label: "Ver pagos" }
      : { to: "/statistics", label: "Ver estadísticas" };

  return (
    <DashboardLayout
      title={`Hola, ${user.name.split(" ")[0]}`}
      subtitle={canSeeSummary ? "Resumen general" : "Bienvenido a Lucera"}
    >
      {canSeeSummary ? (
        <DashboardSummary />
      ) : (
        <WelcomeHero cta={user.role !== "Acudiente" ? cta : null} />
      )}
    </DashboardLayout>
  );
}
