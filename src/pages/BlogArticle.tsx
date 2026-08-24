import {
  Box,
  Button,
  Container,
  Heading,
  HStack,
  Icon,
  ListItem,
  Text,
  UnorderedList,
} from "@chakra-ui/react";
import { Link as RouterLink, Navigate, useParams } from "react-router-dom";
import { ArrowRight, Clock } from "lucide-react";
import { Seo } from "@/components/Seo";
import { PublicHeader } from "@/components/PublicHeader";
import { getArticle, type Block } from "@/content/articles";
import { SITE_URL, absoluteUrl } from "@/lib/seo";

function BlockView({ block }: { block: Block }) {
  switch (block.type) {
    case "h2":
      return (
        <Heading as="h2" size="md" fontFamily="heading" mt={8} mb={3}>
          {block.text}
        </Heading>
      );
    case "p":
      return (
        <Text color="lucera.text" lineHeight={1.8} mb={4}>
          {block.text}
        </Text>
      );
    case "ul":
      return (
        <UnorderedList spacing={2} mb={4} pl={2} color="lucera.text">
          {block.items.map((it, i) => (
            <ListItem key={i} lineHeight={1.7}>
              {it}
            </ListItem>
          ))}
        </UnorderedList>
      );
    case "callout":
      return (
        <Box
          bg="crema.100"
          borderLeftWidth="4px"
          borderColor="naranja.500"
          borderRadius="md"
          px={4}
          py={3}
          mb={4}
        >
          <Text fontSize="sm" color="lucera.text">
            {block.text}
          </Text>
        </Box>
      );
  }
}

export default function BlogArticle() {
  const { slug } = useParams<{ slug: string }>();
  const article = slug ? getArticle(slug) : undefined;

  if (!article) return <Navigate to="/blog" replace />;

  const url = `${SITE_URL}/blog/${article.slug}`;
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    description: article.description,
    datePublished: article.date,
    dateModified: article.date,
    inLanguage: "es-PA",
    author: { "@type": "Organization", name: "Lucera" },
    publisher: {
      "@type": "Organization",
      name: "Lucera",
      logo: { "@type": "ImageObject", url: absoluteUrl("/favicon.jpg") },
    },
    mainEntityOfPage: url,
    keywords: article.keywords.join(", "),
  };

  return (
    <Box minH="100vh" bg="crema.50">
      <Seo
        title={article.title}
        description={article.description}
        path={`/blog/${article.slug}`}
        jsonLd={jsonLd}
      />
      <PublicHeader />

      <Container maxW="3xl" py={{ base: 8, md: 12 }}>
        <Text
          as={RouterLink}
          to="/blog"
          fontSize="sm"
          color="naranja.600"
          fontWeight={600}
          _hover={{ textDecoration: "underline" }}
        >
          ← Recursos
        </Text>

        <HStack spacing={3} mt={5} mb={3} color="lucera.textMuted" fontSize="xs">
          <Text>
            {new Date(article.date + "T00:00:00").toLocaleDateString("es-PA", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </Text>
          <HStack spacing={1}>
            <Icon as={Clock} boxSize={3} />
            <Text>{article.readingMinutes} min de lectura</Text>
          </HStack>
        </HStack>

        <Heading
          as="h1"
          size={{ base: "xl", md: "2xl" }}
          fontFamily="heading"
          fontWeight={800}
          lineHeight={1.15}
          mb={6}
        >
          {article.title}
        </Heading>

        <Box>
          {article.body.map((block, i) => (
            <BlockView key={i} block={block} />
          ))}
        </Box>

        {/* CTA */}
        <Box
          mt={10}
          bg="white"
          borderWidth="1px"
          borderColor="lucera.border"
          borderRadius="xl"
          p={{ base: 5, md: 6 }}
          textAlign="center"
        >
          <Heading size="sm" fontFamily="heading" mb={1}>
            ¿Dudas con la salud de tu hijo?
          </Heading>
          <Text fontSize="sm" color="lucera.textMuted" mb={4}>
            Lucera te orienta por WhatsApp, con seguimiento de un pediatra.
          </Text>
          <Button
            as={RouterLink}
            to="/register"
            colorScheme="vino"
            rightIcon={<ArrowRight size={16} />}
          >
            Registrarse
          </Button>
        </Box>
      </Container>
    </Box>
  );
}
