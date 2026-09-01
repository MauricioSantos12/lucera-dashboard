import { useState } from "react";
import {
  Box,
  Button,
  Flex,
  FormControl,
  FormLabel,
  Heading,
  HStack,
  Image,
  Input,
  SimpleGrid,
  Text,
  VStack,
} from "@chakra-ui/react";
import { KeyRound, ShieldCheck } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { changePassword, changePortalPassword } from "@/lib/passwordApi";
import { toast } from "@/lib/toast";
import logoSymbol from "@/assets/lucera-symbol.jpg";
import logoVertical from "@/assets/lucera-vertical.jpg";

const MIN_LENGTH = 8;

// Pantalla de cambio de contraseña obligatorio en el primer ingreso. Se muestra
// (vía ProtectedRoute) mientras user.mustChangePassword sea true y no deja
// navegar a ninguna otra ruta del panel.
export default function ChangePassword() {
  const { user, getValidToken, applyPasswordChanged, logout } = useAuth();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < MIN_LENGTH) {
      toast.error(
        `La nueva contraseña debe tener al menos ${MIN_LENGTH} caracteres`
      );
      return;
    }
    if (newPassword !== confirm) {
      toast.error("La confirmación no coincide con la nueva contraseña");
      return;
    }
    if (newPassword === currentPassword) {
      toast.error("La nueva contraseña debe ser distinta a la actual");
      return;
    }
    setLoading(true);
    try {
      const token = await getValidToken();
      // Acudiente (portal) → /portal/password; operador → /api/users/me/password.
      const res = user?.isPortal
        ? await changePortalPassword(currentPassword, newPassword, token)
        : await changePassword(currentPassword, newPassword, token);
      applyPasswordChanged(res.access_token, res.refresh_token);
      toast.success("Contraseña actualizada. ¡Bienvenido(a) a Lucera!");
      // Al bajar mustChangePassword, ProtectedRoute renderiza el panel.
    } catch (err) {
      toast.error("No se pudo cambiar la contraseña", {
        description: err instanceof Error ? err.message : undefined,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <SimpleGrid minH="100vh" columns={{ base: 1, lg: 2 }}>
      <Flex
        display={{ base: "none", lg: "flex" }}
        direction="column"
        justify="space-between"
        p={12}
        bgGradient="linear(135deg, brand.700 0%, brand.500 60%, accent.800 100%)"
        color="white"
        position="relative"
        overflow="hidden"
      >
        <HStack spacing={3} position="relative">
          <Box
            h="56px"
            w="56px"
            borderRadius="xl"
            bg="white"
            overflow="hidden"
            display="grid"
            placeItems="center"
          >
            <Image
              src={logoSymbol}
              alt="Lucera icon"
              boxSize="48px"
              objectFit="contain"
            />
          </Box>
          <Box>
            <Heading size="lg" fontFamily="heading" color="white">
              Lucera
            </Heading>
            <Text
              fontSize="xs"
              letterSpacing="widest"
              textTransform="uppercase"
              opacity={0.75}
            >
              Teleorientación pediátrica
            </Text>
          </Box>
        </HStack>

        <VStack align="flex-start" spacing={6} position="relative">
          <Heading
            size="2xl"
            fontFamily="heading"
            lineHeight={1.1}
            color="white"
          >
            Un paso más
            <br />
            <Text as="span" color="accent.300">
              para asegurar tu cuenta.
            </Text>
          </Heading>
          <Text opacity={0.8} maxW="md">
            Por seguridad, define una contraseña propia antes de entrar al
            panel.
          </Text>
        </VStack>
        <Text fontSize="xs" opacity={0.6} position="relative">
          Lucera es un servicio de teleorientación en salud, conforma a la Ley
          203 de 2021. Protegemos los datos de acuerdo a la Ley 81 de 2019 de
          Protección de Datos Personales
        </Text>
      </Flex>

      <Flex
        align="center"
        justify="center"
        p={{ base: 6, sm: 12 }}
        bg="lucera.bg"
      >
        <Box w="100%" maxW="md">
          <Flex display={{ base: "flex", lg: "none" }} justify="center" mb={6}>
            <Image
              src={logoVertical}
              alt="Lucera"
              h="96px"
              objectFit="contain"
            />
          </Flex>

          <form onSubmit={handleSubmit}>
            <VStack spacing={5} align="stretch">
              <Box>
                <Flex
                  h="48px"
                  w="48px"
                  borderRadius="full"
                  bg="accent.50"
                  align="center"
                  justify="center"
                  mb={4}
                >
                  <KeyRound size={22} color="#f08159" />
                </Flex>
                <Heading size="lg">Cambia tu contraseña</Heading>
                <Text fontSize="sm" color="lucera.textMuted" mt={1}>
                  {user?.name ? `Hola, ${user.name.split(" ")[0]}. ` : ""}
                  Es tu primer ingreso: define una contraseña nueva para
                  continuar.
                </Text>
              </Box>

              <FormControl isRequired>
                <FormLabel>Contraseña actual</FormLabel>
                <Input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="La que usaste para entrar"
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Nueva contraseña</FormLabel>
                <Input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder={`Mínimo ${MIN_LENGTH} caracteres`}
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Confirmar nueva contraseña</FormLabel>
                <Input
                  type="password"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  placeholder="Repite la nueva contraseña"
                />
              </FormControl>

              <Button
                type="submit"
                colorScheme="brand"
                isLoading={loading}
                loadingText="Guardando…"
              >
                Guardar y continuar
              </Button>

              <Button variant="ghost" type="button" onClick={logout}>
                Cerrar sesión
              </Button>

              <HStack
                spacing={2}
                fontSize="xs"
                color="lucera.textMuted"
                bg="cream.100"
                borderRadius="md"
                p={3}
                borderWidth="1px"
                borderColor="lucera.border"
                align="flex-start"
              >
                <Box color="accent.500" mt={0.5}>
                  <ShieldCheck size={14} />
                </Box>
                <Text>
                  No compartas tu contraseña. Podrás cambiarla luego desde Mi
                  perfil.
                </Text>
              </HStack>
            </VStack>
          </form>
        </Box>
      </Flex>
    </SimpleGrid>
  );
}
