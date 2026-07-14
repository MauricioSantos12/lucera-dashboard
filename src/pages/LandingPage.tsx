import {
  Box,
  Button,
  Container,
  Flex,
  Heading,
  HStack,
  Icon,
  Image,
  SimpleGrid,
  Text,
  VStack,
} from "@chakra-ui/react";
import { Link as RouterLink } from "react-router-dom";
import {
  MessageSquare,
  ShieldCheck,
  Baby,
  Stethoscope,
  Building2,
  Smartphone,
  ArrowRight,
} from "lucide-react";
import logoSymbol from "@/assets/lucera-symbol.jpg";

const features = [
  {
    icon: MessageSquare,
    title: "Triaje IA por WhatsApp",
    desc: "Clasificación automática en 3 niveles (General, Urgente, Emergencia) con recomendaciones inmediatas.",
  },
  {
    icon: Baby,
    title: "Pacientes pediátricos",
    desc: "Registro completo de niños con peso, alergias, condiciones y tipo de sangre.",
  },
  {
    icon: Stethoscope,
    title: "Red de especialistas",
    desc: "Pediatras certificados disponibles en modalidad virtual y presencial.",
  },
  {
    icon: Building2,
    title: "Centros de atención",
    desc: "Directorio de hospitales, clínicas y farmacias recomendadas por la IA.",
  },
  {
    icon: ShieldCheck,
    title: "Cumplimiento Ley 81",
    desc: "Privacidad por diseño conforme a la Ley de Protección de Datos de Panamá.",
  },
  {
    icon: Smartphone,
    title: "Acceso desde cualquier lugar",
    desc: "Dashboard responsivo y atención vía WhatsApp sin descargar apps adicionales.",
  },
];

const stats = [
  { value: "3,400+", label: "Familias activas" },
  { value: "4,100+", label: "Niños registrados" },
  { value: "1,000+", label: "Sesiones/mes" },
  { value: "92%", label: "Satisfacción (CSAT)" },
];

const year = new Date().getFullYear();

export default function LandingPage() {
  return (
    <Box>
      {/* Navbar */}
      <Flex
        as="nav"
        position="sticky"
        top={0}
        zIndex={50}
        bg="white"
        borderBottomWidth="1px"
        borderColor="lucera.border"
        px={{ base: 4, md: 8 }}
        py={3}
        align="center"
        justify="space-between"
      >
        <HStack as={RouterLink} to="/" spacing={3} style={{ textDecoration: "none" }}>
          <Box
            h={10}
            w={10}
            borderRadius="lg"
            bg="white"
            overflow="hidden"
            display="grid"
            placeItems="center"
            borderWidth="1px"
            borderColor="lucera.border"
          >
            <Image
              src={logoSymbol}
              alt="Lucera"
              boxSize="36px"
              objectFit="contain"
            />
          </Box>
          <Heading size="md" fontFamily="heading" color="vino.500">
            Lucera
          </Heading>
        </HStack>
        <HStack spacing={3}>
          <Button
            as={RouterLink}
            to="/register"
            variant="outline"
            size="sm"
          >
            Registrarse
          </Button>
          <Button
            as={RouterLink}
            to="/dashboard"
            colorScheme="vino"
            size="sm"
            rightIcon={<ArrowRight size={14} />}
          >
            Ir al Dashboard
          </Button>
        </HStack>
      </Flex>

      {/* Hero */}
      <Box
        bgGradient="linear(135deg, vino.700 0%, vino.500 60%, naranja.800 100%)"
        color="white"
        py={{ base: 16, md: 24 }}
      >
        <Container maxW="4xl" textAlign="center">
          <Heading
            size="2xl"
            fontFamily="heading"
            lineHeight={1.1}
            mb={6}
            color="white"
          >
            Atención pediátrica{" "}
            <Text as="span" color="naranja.300">
              accesible y segura
            </Text>{" "}
            para toda Panamá
          </Heading>
          <Text fontSize="lg" opacity={0.85} maxW="2xl" mx="auto" mb={8}>
            Plataforma de telemedicina con triaje inteligente vía WhatsApp. Los
            acudientes reciben orientación inmediata y los médicos monitorean en
            tiempo real.
          </Text>
          <HStack justify="center" spacing={4}>
            <Button
              as={RouterLink}
              to="/dashboard"
              colorScheme="naranja"
              size="lg"
              rightIcon={<ArrowRight size={16} />}
            >
              Acceder al panel
            </Button>
          </HStack>
        </Container>
      </Box>

      {/* Stats */}
      <Box bg="crema.50" py={12}>
        <Container maxW="4xl">
          <SimpleGrid columns={{ base: 2, md: 4 }} spacing={6}>
            {stats.map((s) => (
              <VStack key={s.label} spacing={1}>
                <Heading size="xl" fontFamily="heading" color="vino.500">
                  {s.value}
                </Heading>
                <Text fontSize="sm" color="lucera.textMuted">
                  {s.label}
                </Text>
              </VStack>
            ))}
          </SimpleGrid>
        </Container>
      </Box>

      {/* Features */}
      <Box py={{ base: 12, md: 20 }}>
        <Container maxW="5xl">
          <VStack spacing={3} mb={12} textAlign="center">
            <Heading size="lg" fontFamily="heading">
              ¿Qué ofrece Lucera?
            </Heading>
            <Text color="lucera.textMuted" maxW="lg">
              Una plataforma integral que conecta familias con atención
              pediátrica de calidad, potenciada por inteligencia artificial.
            </Text>
          </VStack>
          <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
            {features.map((f) => (
              <Box
                key={f.title}
                p={6}
                borderWidth="1px"
                borderColor="lucera.border"
                borderRadius="xl"
                _hover={{ borderColor: "naranja.300", shadow: "md" }}
                transition="all 0.2s"
              >
                <Flex
                  h={10}
                  w={10}
                  borderRadius="lg"
                  bg="vino.50"
                  align="center"
                  justify="center"
                  mb={4}
                >
                  <Icon as={f.icon} boxSize={5} color="vino.500" />
                </Flex>
                <Heading size="sm" fontFamily="heading" mb={2}>
                  {f.title}
                </Heading>
                <Text fontSize="sm" color="lucera.textMuted">
                  {f.desc}
                </Text>
              </Box>
            ))}
          </SimpleGrid>
        </Container>
      </Box>

      {/* How it works */}
      <Box bg="vino.50" py={{ base: 12, md: 20 }}>
        <Container maxW="4xl">
          <VStack spacing={3} mb={12} textAlign="center">
            <Heading size="lg" fontFamily="heading">
              ¿Cómo funciona?
            </Heading>
          </VStack>
          <SimpleGrid columns={{ base: 1, md: 3 }} spacing={8}>
            {[
              {
                step: "1",
                title: "El acudiente escribe por WhatsApp",
                desc: "Describe los síntomas del niño en lenguaje natural.",
              },
              {
                step: "2",
                title: "La IA clasifica el triaje",
                desc: "General (verde), Urgente (amarillo) o Emergencia (rojo) con recomendaciones.",
              },
              {
                step: "3",
                title: "Seguimiento médico",
                desc: "El pediatra monitorea, valida y deriva si es necesario.",
              },
            ].map((item) => (
              <VStack key={item.step} spacing={3} textAlign="center">
                <Flex
                  h={12}
                  w={12}
                  borderRadius="full"
                  bg="vino.500"
                  color="white"
                  align="center"
                  justify="center"
                  fontFamily="heading"
                  fontSize="xl"
                  fontWeight={700}
                >
                  {item.step}
                </Flex>
                <Heading size="sm" fontFamily="heading">
                  {item.title}
                </Heading>
                <Text fontSize="sm" color="lucera.textMuted">
                  {item.desc}
                </Text>
              </VStack>
            ))}
          </SimpleGrid>
        </Container>
      </Box>

      {/* CTA */}
      <Box py={{ base: 12, md: 20 }} textAlign="center">
        <Container maxW="2xl">
          <Heading size="lg" fontFamily="heading" mb={4}>
            Comienza a usar Lucera hoy
          </Heading>
          <Text color="lucera.textMuted" mb={8}>
            Accede al panel de administración para gestionar pacientes,
            monitorear sesiones y optimizar la atención pediátrica.
          </Text>
          <Button
            as={RouterLink}
            to="/dashboard"
            colorScheme="vino"
            size="lg"
            rightIcon={<ArrowRight size={16} />}
          >
            Ir al Dashboard
          </Button>
        </Container>
      </Box>

      {/* Footer */}
      <Box bg="vino.700" color="white" py={8} px={{ base: 4, md: 8 }}>
        <Container maxW="5xl">
          <Flex
            direction={{ base: "column", md: "row" }}
            justify="space-between"
            align={{ base: "center", md: "flex-start" }}
            gap={6}
          >
            <VStack align={{ base: "center", md: "flex-start" }} spacing={2}>
              <HStack spacing={3}>
                <Box
                  h={8}
                  w={8}
                  borderRadius="md"
                  bg="white"
                  overflow="hidden"
                  display="grid"
                  placeItems="center"
                >
                  <Image
                    src={logoSymbol}
                    alt="Lucera"
                    boxSize="28px"
                    objectFit="contain"
                  />
                </Box>
                <Heading size="sm" color="amarillo.300" fontFamily="heading">
                  Lucera
                </Heading>
              </HStack>
              <Text fontSize="xs" opacity={0.7}>
                Atención pediátrica con IA · Panamá
              </Text>
            </VStack>
            <VStack
              align={{ base: "center", md: "flex-end" }}
              spacing={1}
              fontSize="xs"
              opacity={0.7}
            >
              <Text>© {year} Lucera — Todos los derechos reservados</Text>
              <Text>
                Cumple con la Ley 81 de 2019 de Protección de Datos Personales
              </Text>
            </VStack>
          </Flex>
        </Container>
      </Box>
    </Box>
  );
}
