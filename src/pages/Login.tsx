import { useState } from "react";
import { useAuth, roleFromApi, type AuthUser } from "@/lib/auth";
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
  PinInput,
  PinInputField,
  SimpleGrid,
  Spinner,
  Text,
  VStack,
} from "@chakra-ui/react";
import { ShieldCheck, Smartphone } from "lucide-react";
import logoVertical from "@/assets/lucera-vertical.jpg";
import logoSymbol from "@/assets/lucera-symbol.jpg";
import { toast } from "@/lib/toast";
import { BACKEND_URL } from "@/lib/config";
import type { LoginResponse } from "@/lib/apiTypes";

// Paso de verificación por código oculto temporalmente (no eliminado).
// Controlado por VITE_REQUIRE_MFA_CODE en .env; cambia a "true" para reactivarlo.
const REQUIRE_MFA_CODE = import.meta.env.VITE_REQUIRE_MFA_CODE === "true";

export default function Login() {
  const { login } = useAuth();
  const [step, setStep] = useState<"creds" | "mfa">("creds");
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [pendingAuth, setPendingAuth] = useState<{
    user: AuthUser;
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
  } | null>(null);

  const handleCreds = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`${BACKEND_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      if (!res.ok) {
        throw new Error("Correo o contraseña incorrectos");
      }
      const data: LoginResponse = await res.json();
      const acc: AuthUser = {
        email: data.user.email,
        nombre: data.user.name,
        rol: roleFromApi(data.user.role),
      };
      setLoading(false);
      if (!REQUIRE_MFA_CODE) {
        login(acc, data.access_token, data.refresh_token, data.expires_in);
        toast.success(`Bienvenido(a), ${acc.nombre}`);
        return;
      }
      setPendingAuth({
        user: acc,
        accessToken: data.access_token,
        refreshToken: data.refresh_token,
        expiresIn: data.expires_in,
      });
      setStep("mfa");
      toast.success("Código de verificación enviado por mail", {
        description: `Revisa tu correo ${acc.email}`,
      });
    } catch (err) {
      setLoading(false);
      toast.error("No se pudo iniciar sesión", {
        description: err instanceof Error ? err.message : undefined,
      });
    }
  };
  const handleMfa = (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length !== 6) {
      toast.error("Ingresa los 6 dígitos del código");
      return;
    }
    if (!pendingAuth) return;
    setLoading(true);
    setTimeout(() => {
      login(
        pendingAuth.user,
        pendingAuth.accessToken,
        pendingAuth.refreshToken,
        pendingAuth.expiresIn
      );
      toast.success(`Bienvenido(a), ${pendingAuth.user.nombre}`);
    }, 500);
  };

  return (
    <SimpleGrid minH="100vh" columns={{ base: 1, lg: 2 }}>
      <Flex
        display={{ base: "none", lg: "flex" }}
        direction="column"
        justify="space-between"
        p={12}
        bgGradient="linear(135deg, vino.700 0%, vino.500 60%, naranja.800 100%)"
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
              Atención pediátrica
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
            Atención pediátrica
            <br />
            <Text as="span" color="naranja.300">
              accesible y segura
            </Text>
            <br />
            para toda Panamá.
          </Heading>
          <Text opacity={0.8} maxW="md">
            Plataforma con triaje IA e integración WhatsApp
          </Text>
        </VStack>
        <Text fontSize="xs" opacity={0.6} position="relative">
          Cumple con la Ley 81 de Protección de Datos Personales · Panamá
        </Text>
      </Flex>

      {/* Form */}
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

          {step === "creds" ? (
            <form onSubmit={handleCreds}>
              <VStack spacing={5} align="stretch">
                <Box>
                  <Heading size="lg">Iniciar sesión</Heading>
                  <Text fontSize="sm" color="lucera.textMuted" mt={1}>
                    Ingresa tus credenciales para acceder al panel.
                  </Text>
                </Box>

                <FormControl isRequired>
                  <FormLabel>Correo</FormLabel>
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </FormControl>

                <FormControl isRequired>
                  <FormLabel>Contraseña</FormLabel>
                  <Input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </FormControl>

                <Text fontSize="xs" color="lucera.textMuted" textAlign="left">
                  Al iniciar sesión aceptas nuestros{" "}
                  <Text
                    as="a"
                    href="https://pdfobject.com/pdf/sample.pdf"
                    target="_blank"
                    rel="noopener noreferrer"
                    color="vino.500"
                    fontWeight={600}
                    _hover={{ textDecoration: "underline" }}
                  >
                    términos y condiciones
                  </Text>
                  .
                </Text>

                <Button
                  type="submit"
                  colorScheme="vino"
                  isLoading={loading}
                  loadingText="Verificando…"
                >
                  Continuar
                </Button>

                <HStack
                  spacing={2}
                  fontSize="xs"
                  color="lucera.textMuted"
                  bg="crema.100"
                  borderRadius="md"
                  p={3}
                  borderWidth="1px"
                  borderColor="lucera.border"
                  align="flex-start"
                >
                  <Box color="naranja.500" mt={0.5}>
                    <ShieldCheck size={14} />
                  </Box>
                  <Text>
                    Autenticación multifactor por WhatsApp · Ley 81 de Panamá.
                  </Text>
                </HStack>
              </VStack>
            </form>
          ) : (
            <form onSubmit={handleMfa}>
              <VStack spacing={6} align="stretch">
                <Box>
                  <Flex
                    h="48px"
                    w="48px"
                    borderRadius="full"
                    bg="naranja.50"
                    align="center"
                    justify="center"
                    mb={4}
                  >
                    <Smartphone size={22} color="#ef7d54" />
                  </Flex>
                  <Heading size="lg">Verificación by Email</Heading>
                  <Text fontSize="sm" color="lucera.textMuted" mt={1}>
                    Código de 6 dígitos enviado a{" "}
                    <strong>{pendingAuth?.user.email}</strong>.
                  </Text>
                </Box>

                <Box>
                  <FormLabel>Código de verificación</FormLabel>
                  <HStack>
                    <PinInput
                      value={otp}
                      onChange={setOtp}
                      otp
                      size="lg"
                      focusBorderColor="vino.500"
                    >
                      <PinInputField />
                      <PinInputField />
                      <PinInputField />
                      <PinInputField />
                      <PinInputField />
                      <PinInputField />
                    </PinInput>
                  </HStack>
                  <Text fontSize="xs" color="lucera.textMuted" mt={2}>
                    Tip de demo: ingresa cualquier código de 6 dígitos.
                  </Text>
                </Box>

                <VStack spacing={2} align="stretch">
                  <Button
                    type="submit"
                    colorScheme="vino"
                    isLoading={loading}
                    loadingText="Validando…"
                    leftIcon={loading ? <Spinner size="sm" /> : undefined}
                  >
                    Acceder al panel
                  </Button>
                  <Button
                    variant="ghost"
                    type="button"
                    onClick={() => setStep("creds")}
                  >
                    Volver
                  </Button>
                </VStack>
              </VStack>
            </form>
          )}
        </Box>
      </Flex>
    </SimpleGrid>
  );
}
