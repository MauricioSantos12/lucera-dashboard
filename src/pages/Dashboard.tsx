import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useAuth } from "@/lib/auth";
import {
  Box,
  Flex,
  Image,
  Text,
  Heading,
  VStack,
  Button,
} from "@chakra-ui/react";
import { Link as RouterLink } from "react-router-dom";
import { motion } from "framer-motion";
import logoVertical from "@/assets/lucera-vertical.jpg";

const MotionBox = motion(Box);

export default function Dashboard() {
  const { user } = useAuth();
  if (!user) return null;

  // CTA según lo que cada rol puede ver: Médico no accede a estadísticas.
  const cta =
    user.rol === "Médico"
      ? { to: "/chats", label: "Ver chats" }
      : user.rol === "Ventas"
      ? { to: "/payments", label: "Ver pagos" }
      : { to: "/statistics", label: "Ver estadísticas" };

  return (
    <DashboardLayout
      title={`Hola, ${user.nombre.split(" ")[0]}`}
      subtitle="Bienvenido a Lucera"
    >
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

          {user.rol !== "Acudiente" && (
            <Button as={RouterLink} to={cta.to} colorScheme="vino" variant="solid">
              {cta.label}
            </Button>
          )}
        </VStack>
      </Flex>
    </DashboardLayout>
  );
}
