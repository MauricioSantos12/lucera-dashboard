import {
  Box,
  Container,
  Flex,
  Heading,
  HStack,
  Icon,
  Text,
} from "@chakra-ui/react";
import { Link as RouterLink } from "react-router-dom";
import { ArrowRight, Clock } from "lucide-react";
import { Seo } from "@/components/Seo";
import { PublicHeader } from "@/components/PublicHeader";
import { articlesByDate } from "@/content/articles";
import { SITE_URL } from "@/lib/seo";

const blogJsonLd = {
  "@context": "https://schema.org",
  "@type": "Blog",
  name: "Recursos de Lucera",
  url: `${SITE_URL}/blog`,
  inLanguage: "es-PA",
  blogPost: articlesByDate.map((a) => ({
    "@type": "BlogPosting",
    headline: a.title,
    url: `${SITE_URL}/blog/${a.slug}`,
    datePublished: a.date,
    description: a.description,
  })),
};

export default function Blog() {
  return (
    <Box minH="100vh" bg="crema.50">
      <Seo
        title="Recursos y guías para padres"
        description="Guías prácticas de salud pediátrica para familias en Panamá: fiebre, señales de alarma, cuándo acudir a urgencias y más. Orientación clara, no diagnósticos."
        path="/blog"
        jsonLd={blogJsonLd}
      />
      <PublicHeader />

      {/* Encabezado */}
      <Box bgGradient="linear(180deg, crema.100 0%, crema.50 100%)" py={{ base: 12, md: 16 }}>
        <Container maxW="3xl" textAlign="center">
          <Text
            fontSize="xs"
            fontWeight={700}
            letterSpacing="widest"
            textTransform="uppercase"
            color="naranja.500"
            mb={3}
          >
            Recursos
          </Text>
          <Heading
            size={{ base: "xl", md: "2xl" }}
            fontFamily="heading"
            fontWeight={800}
            lineHeight={1.15}
            mb={4}
          >
            Guías de salud pediátrica para padres
          </Heading>
          <Text color="lucera.textMuted" fontSize={{ base: "md", md: "lg" }}>
            Información clara y orientativa para tomar mejores decisiones sobre la
            salud de tus hijos. Recuerda: Lucera orienta, no da diagnósticos.
          </Text>
        </Container>
      </Box>

      {/* Listado */}
      <Container maxW="3xl" py={{ base: 8, md: 12 }}>
        {articlesByDate.map((a) => (
          <Box
            key={a.slug}
            as={RouterLink}
            to={`/blog/${a.slug}`}
            display="block"
            bg="white"
            borderWidth="1px"
            borderColor="lucera.border"
            borderRadius="xl"
            p={{ base: 5, md: 6 }}
            mb={5}
            transition="box-shadow 200ms ease, transform 200ms ease"
            _hover={{
              boxShadow: "0 12px 28px -14px rgba(108,18,43,0.22)",
              transform: "translateY(-2px)",
              textDecoration: "none",
            }}
            style={{ textDecoration: "none" }}
          >
            <HStack spacing={3} mb={2} color="lucera.textMuted" fontSize="xs">
              <Text>
                {new Date(a.date + "T00:00:00").toLocaleDateString("es-PA", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </Text>
              <HStack spacing={1}>
                <Icon as={Clock} boxSize={3} />
                <Text>{a.readingMinutes} min de lectura</Text>
              </HStack>
            </HStack>
            <Heading as="h2" size="md" fontFamily="heading" mb={2}>
              {a.title}
            </Heading>
            <Text color="lucera.textMuted" mb={3}>
              {a.excerpt}
            </Text>
            <HStack spacing={1} color="naranja.600" fontWeight={600} fontSize="sm">
              <Text>Leer más</Text>
              <Icon as={ArrowRight} boxSize={4} />
            </HStack>
          </Box>
        ))}

        <Flex justify="center" mt={6}>
          <Text
            as={RouterLink}
            to="/"
            fontSize="sm"
            color="lucera.textMuted"
            _hover={{ color: "lucera.text" }}
          >
            ← Volver al inicio
          </Text>
        </Flex>
      </Container>
    </Box>
  );
}
