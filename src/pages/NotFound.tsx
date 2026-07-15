import { useLocation, Link as RouterLink } from "react-router-dom";
import { useEffect } from "react";
import { Box, Button, Flex, Heading, Icon, Text } from "@chakra-ui/react";
import { Compass, Home } from "lucide-react";

const NotFound = () => {
  const location = useLocation();
  useEffect(() => {
    console.error("404 Error: Ruta no existente:", location.pathname);
  }, [location.pathname]);

  return (
    <Flex minH="100vh" align="center" justify="center" bg="lucera.bg" px={4}>
      <Box textAlign="center" maxW="sm">
        <Flex
          h="72px"
          w="72px"
          borderRadius="full"
          bg="vino.50"
          color="vino.500"
          align="center"
          justify="center"
          mx="auto"
          mb={5}
        >
          <Icon as={Compass} boxSize={8} />
        </Flex>
        <Heading size="2xl" fontFamily="heading" mb={2}>
          404
        </Heading>
        <Heading size="md" fontFamily="heading" mb={2}>
          ¡Ups! Sitio no encontrado.
        </Heading>
        <Text fontSize="sm" color="lucera.textMuted" mb={6}>
          La página que buscas no existe o fue movida.
        </Text>
        <Button
          as={RouterLink}
          to="/"
          colorScheme="vino"
          leftIcon={<Home size={16} />}
        >
          Volver al inicio
        </Button>
      </Box>
    </Flex>
  );
};

export default NotFound;
