import { useEffect, useRef, useState } from "react";
import {
  Badge,
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
import { motion } from "framer-motion";
import {
  MessageSquare,
  ShieldCheck,
  Baby,
  Stethoscope,
  Building2,
  Smartphone,
  ArrowRight,
  ChevronDown,
  Check,
} from "lucide-react";
import logoSymbol from "@/assets/lucera-symbol.jpg";
import { FadeInSection } from "@/components/landing/FadeInSection";
import { AnimatedCounter } from "@/components/landing/AnimatedCounter";

const MotionBox = motion(Box);

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
  // { value: "92%", label: "Satisfacción (CSAT)" },
];

const steps = [
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
];

const principles = [
  {
    number: "01",
    title: "La IA prioriza, no reemplaza",
    desc: "El triaje acelera la decisión, pero el criterio médico final siempre es humano.",
  },
  {
    number: "02",
    title: "Cada familia tiene seguimiento real",
    desc: "No es un chatbot genérico: el pediatra monitorea, valida y da seguimiento.",
  },
  {
    number: "03",
    title: "Privacidad desde el diseño",
    desc: "Cumplimiento con la Ley 81 de Panamá en cada paso de la conversación.",
  },
];

const pricingPlans = [
  {
    name: "Gratuito",
    tagline: "Para empezar",
    highlighted: false,
    features: [
      "Triaje IA por WhatsApp",
      "Registro de 1 niño",
      "Soporte por chat",
    ],
    cta: "Comenzar gratis",
  },
  {
    name: "Premium Mensual",
    tagline: "Para seguimiento continuo",
    highlighted: true,
    features: [
      "Todo lo de Gratuito",
      "Seguimiento médico prioritario",
      "Historial completo para toda la familia",
      "Derivación a especialistas",
    ],
    cta: "Registrarse",
  },
  {
    name: "Premium Anual",
    tagline: "Para toda la familia",
    highlighted: false,
    features: [
      "Todo lo de Premium Mensual",
      "Precio preferencial anual",
      "Prioridad en agenda con especialistas",
    ],
    cta: "Registrarse",
  },
];

const year = new Date().getFullYear();

// Formas decorativas de fondo, mismos colores de marca, solo con blur/opacidad.
function FloatingOrbs() {
  return (
    <>
      <MotionBox
        position="absolute"
        top="-10%"
        right="-5%"
        boxSize={{ base: "220px", md: "340px" }}
        borderRadius="full"
        bg="naranja.400"
        opacity={0.25}
        filter="blur(70px)"
        animate={{ y: [0, 24, 0] }}
        transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
        pointerEvents="none"
      />
      <MotionBox
        position="absolute"
        bottom="-15%"
        left="-8%"
        boxSize={{ base: "200px", md: "300px" }}
        borderRadius="full"
        bg="amarillo.400"
        opacity={0.18}
        filter="blur(80px)"
        animate={{ y: [0, -20, 0] }}
        transition={{ duration: 11, repeat: Infinity, ease: "easeInOut" }}
        pointerEvents="none"
      />
    </>
  );
}

export default function LandingPage() {
  const [scrolled, setScrolled] = useState(false);
  const [navHidden, setNavHidden] = useState(false);
  const lastScrollY = useRef(0);

  useEffect(() => {
    const onScroll = () => {
      const currentY = window.scrollY;
      setScrolled(currentY > 12);
      // Oculta el navbar al bajar, lo vuelve a mostrar al subir.
      if (currentY > lastScrollY.current && currentY > 120) {
        setNavHidden(true);
      } else {
        setNavHidden(false);
      }
      lastScrollY.current = currentY;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <Box overflowX="hidden">
      {/* Navbar */}
      <Flex
        as="nav"
        position="sticky"
        top={0}
        zIndex={50}
        bg={scrolled ? "whiteAlpha.800" : "white"}
        backdropFilter={scrolled ? "blur(10px)" : undefined}
        borderBottomWidth="1px"
        borderColor="lucera.border"
        boxShadow={scrolled ? "0 4px 20px -8px rgba(109,18,43,0.15)" : "none"}
        px={{ base: 4, md: 8 }}
        py={3}
        align="center"
        justify="space-between"
        transform={navHidden ? "translateY(-100%)" : "translateY(0)"}
        transition="all 0.25s ease"
      >
        <HStack
          as={RouterLink}
          to="/"
          spacing={3}
          style={{ textDecoration: "none" }}
        >
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
          <Button as={RouterLink} to="/register" variant="outline" size="sm">
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
        position="relative"
        overflow="hidden"
        bgGradient="linear(135deg, vino.700 0%, vino.500 60%, naranja.800 100%)"
        color="white"
        py={{ base: 16, md: 24 }}
      >
        <FloatingOrbs />
        <Container maxW="4xl" textAlign="center" position="relative">
          <MotionBox
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
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
          </MotionBox>
          <MotionBox
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15, ease: "easeOut" }}
          >
            <Text fontSize="lg" opacity={0.85} maxW="2xl" mx="auto" mb={8}>
              Plataforma de telemedicina con triaje inteligente vía WhatsApp.
              Los acudientes reciben orientación inmediata y los médicos
              monitorean en tiempo real.
            </Text>
          </MotionBox>
          <MotionBox
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3, ease: "easeOut" }}
          >
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
          </MotionBox>

          <MotionBox
            mt={{ base: 12, md: 16 }}
            display="flex"
            flexDirection="column"
            alignItems="center"
            opacity={0.75}
            fontSize="xs"
            letterSpacing="widest"
            textTransform="uppercase"
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          >
            <Text mb={1} fontSize={"md"}>
              Desliza
            </Text>
            <Icon as={ChevronDown} boxSize={4} />
          </MotionBox>
        </Container>
      </Box>

      {/* Stats */}
      <Box bg="crema.50" py={12}>
        <Container maxW="4xl">
          <SimpleGrid columns={{ base: 2, md: 3 }} spacing={6}>
            {stats.map((s, i) => (
              <FadeInSection key={s.label} delay={i * 0.1}>
                <VStack spacing={1}>
                  <AnimatedCounter
                    value={s.value}
                    size="xl"
                    fontFamily="heading"
                    color="vino.500"
                  />
                  <Text fontSize="sm" color="lucera.textMuted">
                    {s.label}
                  </Text>
                </VStack>
              </FadeInSection>
            ))}
          </SimpleGrid>
        </Container>
      </Box>

      {/* Features */}
      <Box py={{ base: 12, md: 20 }}>
        <Container maxW="5xl">
          <FadeInSection>
            <VStack spacing={3} mb={12} textAlign="center">
              <Heading size="lg" fontFamily="heading">
                ¿Qué ofrece Lucera?
              </Heading>
              <Text color="lucera.textMuted" maxW="lg">
                Una plataforma integral que conecta familias con atención
                pediátrica de calidad, potenciada por inteligencia artificial.
              </Text>
            </VStack>
          </FadeInSection>
          <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
            {features.map((f, i) => (
              <FadeInSection key={f.title} delay={(i % 3) * 0.1}>
                <MotionBox
                  p={6}
                  h="100%"
                  borderWidth="1px"
                  borderColor="lucera.border"
                  borderRadius="xl"
                  whileHover={{ y: -6, scale: 1.02 }}
                  _hover={{ borderColor: "naranja.300", shadow: "md" }}
                  transition={{ duration: 0.2 }}
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
                </MotionBox>
              </FadeInSection>
            ))}
          </SimpleGrid>
        </Container>
      </Box>

      {/* How it works */}
      <Box bg="vino.50" py={{ base: 12, md: 20 }}>
        <Container maxW="4xl">
          <FadeInSection>
            <VStack spacing={3} mb={12} textAlign="center">
              <Heading size="lg" fontFamily="heading">
                ¿Cómo funciona?
              </Heading>
            </VStack>
          </FadeInSection>
          <Box position="relative">
            <Box
              display={{ base: "none", md: "block" }}
              position="absolute"
              top="24px"
              left="16.5%"
              right="16.5%"
              height="2px"
              bg="vino.200"
              zIndex={0}
            />
            <SimpleGrid
              columns={{ base: 1, md: 3 }}
              spacing={8}
              position="relative"
              zIndex={1}
            >
              {steps.map((item, i) => (
                <FadeInSection key={item.step} delay={i * 0.2}>
                  <VStack spacing={3} textAlign="center">
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
                      boxShadow="0 0 0 6px var(--chakra-colors-vino-50)"
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
                </FadeInSection>
              ))}
            </SimpleGrid>
          </Box>
        </Container>
      </Box>

      {/* Principios */}
      <Box py={{ base: 12, md: 20 }}>
        <Container maxW="5xl">
          <FadeInSection>
            <VStack spacing={3} mb={12} textAlign="center">
              <Text
                fontSize="xs"
                fontWeight={700}
                letterSpacing="widest"
                textTransform="uppercase"
                color="naranja.500"
              >
                Nuestra mentalidad
              </Text>
              <Heading size="lg" fontFamily="heading">
                Nuestros principios
              </Heading>
            </VStack>
          </FadeInSection>
          <SimpleGrid columns={{ base: 1, md: 3 }} spacing={8}>
            {principles.map((p, i) => (
              <FadeInSection key={p.number} delay={i * 0.15}>
                <Box>
                  <Text
                    fontFamily="heading"
                    fontSize="4xl"
                    fontWeight={700}
                    color="vino.100"
                    mb={2}
                    lineHeight={1}
                  >
                    {p.number}
                  </Text>
                  <Heading size="sm" fontFamily="heading" mb={2}>
                    {p.title}
                  </Heading>
                  <Text fontSize="sm" color="lucera.textMuted">
                    {p.desc}
                  </Text>
                </Box>
              </FadeInSection>
            ))}
          </SimpleGrid>
        </Container>
      </Box>

      {/* Pricing */}
      <Box bg="crema.50" py={{ base: 12, md: 20 }}>
        <Container maxW="5xl">
          <FadeInSection>
            <VStack spacing={3} mb={12} textAlign="center">
              <Heading size="lg" fontFamily="heading">
                Planes para cada familia
              </Heading>
              <Text color="lucera.textMuted" maxW="lg">
                Elige el plan que mejor se adapte al seguimiento que necesita
                tu familia.
              </Text>
            </VStack>
          </FadeInSection>
          <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6} alignItems="stretch">
            {pricingPlans.map((plan, i) => (
              <FadeInSection key={plan.name} delay={i * 0.1} h="100%">
                <MotionBox
                  h="100%"
                  display="flex"
                  flexDirection="column"
                  p={6}
                  bg="white"
                  borderWidth={plan.highlighted ? "2px" : "1px"}
                  borderColor={plan.highlighted ? "vino.500" : "lucera.border"}
                  borderRadius="xl"
                  position="relative"
                  boxShadow={plan.highlighted ? "0 12px 30px -12px rgba(109,18,43,0.25)" : "none"}
                  whileHover={{ y: -6 }}
                  transition={{ duration: 0.2 }}
                >
                  {plan.highlighted && (
                    <Badge
                      position="absolute"
                      top={-3}
                      left="50%"
                      transform="translateX(-50%)"
                      colorScheme="naranja"
                      borderRadius="full"
                      px={3}
                      py={0.5}
                    >
                      Más popular
                    </Badge>
                  )}
                  <Text fontSize="xs" color="lucera.textMuted" mb={1}>
                    {plan.tagline}
                  </Text>
                  <Heading size="md" fontFamily="heading" mb={3}>
                    {plan.name}
                  </Heading>
                  <Badge
                    alignSelf="flex-start"
                    colorScheme="amarillo"
                    variant="subtle"
                    borderRadius="full"
                    px={3}
                    py={1}
                    mb={5}
                    fontSize="xs"
                  >
                    Precio próximamente
                  </Badge>
                  <VStack align="stretch" spacing={2.5} mb={6} flex={1}>
                    {plan.features.map((f) => (
                      <HStack key={f} align="flex-start" spacing={2}>
                        <Icon as={Check} boxSize={4} color="exito.500" mt={0.5} flexShrink={0} />
                        <Text fontSize="sm" color="lucera.textMuted">
                          {f}
                        </Text>
                      </HStack>
                    ))}
                  </VStack>
                  <Button
                    as={RouterLink}
                    to="/register"
                    colorScheme={plan.highlighted ? "vino" : undefined}
                    variant={plan.highlighted ? "solid" : "outline"}
                    size="sm"
                  >
                    {plan.cta}
                  </Button>
                </MotionBox>
              </FadeInSection>
            ))}
          </SimpleGrid>
        </Container>
      </Box>

      {/* CTA */}
      <Box
        position="relative"
        overflow="hidden"
        py={{ base: 12, md: 20 }}
        textAlign="center"
      >
        <Box
          position="absolute"
          top="50%"
          left="50%"
          transform="translate(-50%, -50%)"
          boxSize="500px"
          borderRadius="full"
          bg="naranja.50"
          opacity={0.6}
          filter="blur(60px)"
          pointerEvents="none"
        />
        <Container maxW="2xl" position="relative">
          <FadeInSection>
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
          </FadeInSection>
        </Container>
      </Box>

      {/* Footer */}
      <Box bg="vino.700" color="white" py={10} px={{ base: 4, md: 8 }}>
        <Container maxW="5xl">
          <SimpleGrid columns={{ base: 1, md: 3 }} spacing={8} mb={8}>
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
              <Text
                fontSize="xs"
                opacity={0.7}
                textAlign={{ base: "center", md: "left" }}
              >
                Atención pediátrica con IA · Panamá
              </Text>
            </VStack>

            <VStack align={{ base: "center", md: "flex-start" }} spacing={2}>
              <Text
                fontSize="xs"
                fontWeight={700}
                letterSpacing="wide"
                textTransform="uppercase"
                opacity={0.6}
              >
                Accesos
              </Text>
              <Text
                as={RouterLink}
                to="/register"
                fontSize="sm"
                opacity={0.85}
                _hover={{ opacity: 1, textDecoration: "underline" }}
              >
                Registrarse
              </Text>
              <Text
                as={RouterLink}
                to="/dashboard"
                fontSize="sm"
                opacity={0.85}
                _hover={{ opacity: 1, textDecoration: "underline" }}
              >
                Ir al Dashboard
              </Text>
            </VStack>

            <VStack
              align={{ base: "center", md: "flex-start" }}
              spacing={1}
              fontSize="xs"
              opacity={0.7}
            >
              <Text
                fontWeight={700}
                letterSpacing="wide"
                textTransform="uppercase"
                opacity={0.6}
                mb={1}
              >
                Cumplimiento
              </Text>
              <Text>© {year} Lucera — Todos los derechos reservados</Text>
              <Text>
                Cumple con la Ley 81 de 2019 de Protección de Datos Personales
              </Text>
            </VStack>
          </SimpleGrid>
        </Container>
      </Box>
    </Box>
  );
}
