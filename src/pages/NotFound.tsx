import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Box, Flex, Heading, Link, Text } from "@chakra-ui/react";

const NotFound = () => {
  const location = useLocation();
  useEffect(() => {
    console.error("404 Error: Ruta no existente:", location.pathname);
  }, [location.pathname]);

  return (
    <Flex minH="100vh" align="center" justify="center" bg="lucera.bg">
      <Box textAlign="center">
        <Heading size="2xl" fontFamily="heading" mb={2}>404</Heading>
        <Text fontSize="lg" color="lucera.textMuted" mb={4}>Oops! Página no encontrada</Text>
        <Link href="/" color="vino.500" textDecor="underline">Volver al inicio</Link>
      </Box>
    </Flex>
  );
};

export default NotFound;
