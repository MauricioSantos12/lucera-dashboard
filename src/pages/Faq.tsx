import {
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
  Box,
  Button,
  Container,
  Flex,
  Heading,
  HStack,
  Image,
  Text,
} from "@chakra-ui/react";
import { Link as RouterLink } from "react-router-dom";
import { ArrowLeft, ArrowRight } from "lucide-react";
import logoSymbol from "@/assets/lucera-symbol.jpg";
import { Seo } from "@/components/Seo";

// Preguntas frecuentes. Una sola fuente para renderizar y para el JSON-LD
// (FAQPage), de modo que el contenido visible y los datos estructurados
// coincidan exactamente (requisito de Google para rich results).
const faqs: { q: string; a: string }[] = [
  {
    q: "¿Qué es Lucera?",
    a: "Lucera es un servicio de teleorientación pediátrica por WhatsApp. Con un triaje asistido por inteligencia artificial y el seguimiento de un pediatra, te ayuda a entender qué nivel de atención necesita tu hijo cuando tienes dudas de salud.",
  },
  {
    q: "¿Lucera da diagnósticos o receta medicamentos?",
    a: "No. Lucera no da diagnósticos, no receta medicamentos y no reemplaza a tu pediatra ni a una sala de urgencias. Orienta sobre el nivel de atención recomendado (general, urgente o de emergencia) para que tomes mejores decisiones.",
  },
  {
    q: "¿Cómo funciona el triaje por inteligencia artificial?",
    a: "Describes los síntomas de tu hijo en lenguaje natural por WhatsApp. El sistema analiza el caso con base en guías clínicas y lo clasifica en tres niveles: general, urgente o emergencia. Un pediatra monitorea, valida y da seguimiento; el criterio médico final siempre es humano.",
  },
  {
    q: "¿Necesito descargar una aplicación?",
    a: "No. Todo funciona directamente desde tu WhatsApp, sin instalar aplicaciones adicionales.",
  },
  {
    q: "¿Qué pasa si es una emergencia?",
    a: "Si el triaje detecta señales de alarma, te recomienda acudir de inmediato a un servicio de urgencias. Lucera no sustituye a los servicios de emergencia: ante una situación grave, acude al hospital o llama a los servicios de emergencia de tu zona.",
  },
  {
    q: "¿Quién responde, una IA o un médico?",
    a: "La inteligencia artificial orienta y prioriza cada caso, y un pediatra monitorea, valida y da seguimiento. No es un chatbot que responde y desaparece: hay acompañamiento médico real detrás.",
  },
  {
    q: "¿Cuánto cuesta? ¿Hay un plan gratuito?",
    a: "Lucera ofrece un plan gratuito para empezar y planes premium (mensual y anual) con seguimiento médico prioritario, historial para toda la familia y derivación a especialistas.",
  },
  {
    q: "¿Mis datos están protegidos?",
    a: "Sí. Lucera es un servicio de teleorientación en salud conforme a la Ley 203 de 2021 y protege los datos personales de acuerdo con la Ley 81 de 2019 de Protección de Datos de Panamá, con privacidad desde el diseño.",
  },
  {
    q: "¿Atienden en toda Panamá?",
    a: "Sí. Lucera está pensado para acompañar a las familias en todo Panamá a través de WhatsApp.",
  },
  {
    q: "¿Cómo me registro?",
    a: "Puedes crear tu cuenta desde el formulario de registro en la web y comenzar a usar Lucera por WhatsApp.",
  },
];

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqs.map((f) => ({
    "@type": "Question",
    name: f.q,
    acceptedAnswer: { "@type": "Answer", text: f.a },
  })),
};

export default function Faq() {
  return (
    <Box minH="100vh" bg="cream.50">
      <Seo
        title="Preguntas frecuentes"
        description="Resolvemos las dudas más comunes sobre Lucera: cómo funciona la teleorientación pediátrica por WhatsApp, el triaje con IA, planes, privacidad y más."
        path="/faq"
        jsonLd={faqJsonLd}
      />

      {/* Navbar simple */}
      <Flex
        as="nav"
        position="sticky"
        top={0}
        zIndex={50}
        bg="whiteAlpha.900"
        backdropFilter="blur(10px)"
        borderBottomWidth="1px"
        borderColor="lucera.border"
        px={{ base: 4, md: 8 }}
        py={3}
        align="center"
        justify="space-between"
      >
        <HStack as={RouterLink} to="/" spacing={3} style={{ textDecoration: "none" }}>
          <Box
            h={9}
            w={9}
            borderRadius="lg"
            bg="white"
            overflow="hidden"
            display="grid"
            placeItems="center"
            borderWidth="1px"
            borderColor="lucera.border"
          >
            <Image src={logoSymbol} alt="Lucera" boxSize="32px" objectFit="contain" />
          </Box>
          <Heading size="md" fontFamily="heading" color="brand.500">
            Lucera
          </Heading>
        </HStack>
        <Button
          as={RouterLink}
          to="/register"
          size="sm"
          colorScheme="brand"
          rightIcon={<ArrowRight size={14} />}
        >
          Registrarse
        </Button>
      </Flex>

      {/* Encabezado */}
      <Box bgGradient="linear(180deg, cream.100 0%, cream.50 100%)" py={{ base: 12, md: 16 }}>
        <Container maxW="3xl" textAlign="center">
          <Text
            fontSize="xs"
            fontWeight={700}
            letterSpacing="widest"
            textTransform="uppercase"
            color="accent.500"
            mb={3}
          >
            Preguntas frecuentes
          </Text>
          <Heading
            size={{ base: "xl", md: "2xl" }}
            fontFamily="heading"
            fontWeight={800}
            lineHeight={1.15}
            mb={4}
          >
            Todo lo que necesitas saber sobre Lucera
          </Heading>
          <Text color="lucera.textMuted" fontSize={{ base: "md", md: "lg" }}>
            Resolvemos las dudas más comunes sobre la teleorientación pediátrica
            por WhatsApp, el triaje con IA, la privacidad y los planes.
          </Text>
        </Container>
      </Box>

      {/* Acordeón de FAQs */}
      <Container maxW="3xl" py={{ base: 8, md: 12 }}>
        <Accordion allowMultiple defaultIndex={[0]}>
          {faqs.map((f) => (
            <AccordionItem
              key={f.q}
              border="1px solid"
              borderColor="lucera.border"
              borderRadius="xl"
              bg="white"
              mb={4}
              overflow="hidden"
            >
              <AccordionButton
                py={5}
                px={{ base: 4, md: 6 }}
                _hover={{ bg: "cream.50" }}
                _expanded={{ bg: "cream.50" }}
              >
                <Box flex="1" textAlign="left">
                  <Heading as="h2" size="sm" fontFamily="heading">
                    {f.q}
                  </Heading>
                </Box>
                <AccordionIcon color="accent.500" />
              </AccordionButton>
              <AccordionPanel px={{ base: 4, md: 6 }} pb={5} pt={0}>
                <Text color="lucera.textMuted" lineHeight={1.7}>
                  {f.a}
                </Text>
              </AccordionPanel>
            </AccordionItem>
          ))}
        </Accordion>

        {/* CTA */}
        <Flex
          mt={10}
          direction={{ base: "column", sm: "row" }}
          align="center"
          justify="space-between"
          gap={4}
          bg="white"
          borderWidth="1px"
          borderColor="lucera.border"
          borderRadius="xl"
          p={{ base: 5, md: 6 }}
        >
          <Box>
            <Heading size="sm" fontFamily="heading" mb={1}>
              ¿Aún tienes dudas?
            </Heading>
            <Text fontSize="sm" color="lucera.textMuted">
              Regístrate y comienza a usar Lucera hoy.
            </Text>
          </Box>
          <Button
            as={RouterLink}
            to="/register"
            colorScheme="brand"
            rightIcon={<ArrowRight size={16} />}
            flexShrink={0}
          >
            Registrarse
          </Button>
        </Flex>

        <Button
          as={RouterLink}
          to="/"
          variant="ghost"
          size="sm"
          mt={8}
          leftIcon={<ArrowLeft size={14} />}
        >
          Volver al inicio
        </Button>
      </Container>
    </Box>
  );
}
