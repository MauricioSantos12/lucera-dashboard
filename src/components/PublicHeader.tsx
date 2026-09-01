import { Box, Button, Flex, Heading, HStack, Image } from "@chakra-ui/react";
import { Link as RouterLink } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import logoSymbol from "@/assets/lucera-symbol.jpg";

// Navbar simple para páginas públicas (FAQ, blog): logo → home + CTA a registro.
export function PublicHeader() {
  return (
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
  );
}
