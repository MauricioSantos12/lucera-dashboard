import { useState } from "react";
import { useAuth, UserRole, demoAccounts } from "@/lib/auth";
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
import {
  ShieldCheck,
  Smartphone,
  Shield,
  Stethoscope,
  Users,
  CreditCard,
  Eye,
  type LucideIcon,
} from "lucide-react";
import logoVertical from "@/assets/lucera-vertical.jpg";
import logoSymbol from "@/assets/lucera-symbol.jpg";
import { toast } from "@/lib/toast";

const roleMeta: Record<
  UserRole,
  { Icon: LucideIcon; label: string; desc: string }
> = {
  Admin: {
    Icon: Shield,
    label: "Administrador",
    desc: "Gestión completa de la plataforma",
  },
  Médico: {
    Icon: Stethoscope,
    label: "Médico / Pediatra",
    desc: "Agenda, sesiones y derivaciones",
  },
  Acudiente: {
    Icon: Users,
    label: "Acudiente",
    desc: "Mis hijos, consultas y plan",
  },
  Ventas: {
    Icon: CreditCard,
    label: "Ventas",
    desc: "Solo módulo de pagos",
  },
  Invitado: {
    Icon: Eye,
    label: "Invitado",
    desc: "Solo lectura, sin edición",
  },
};

export default function Login() {
  const { login } = useAuth();
  const [step, setStep] = useState<"creds" | "mfa">("creds");
  const [loading, setLoading] = useState(false);
  const [rol, setRol] = useState<UserRole>("Admin");
  const [email, setEmail] = useState(demoAccounts.Admin.email);
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");

  const onChangeRol = (r: UserRole) => {
    setRol(r);
    setEmail(demoAccounts[r].email);
  };

  const handleCreds = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setStep("mfa");
      toast.success("Código de verificación enviado por mail", {
        description: `Revisa tu correo ${demoAccounts[rol].email}`,
      });
    }, 600);
  };
  const handleMfa = (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length !== 6) {
      toast.error("Ingresa los 6 dígitos del código");
      return;
    }
    setLoading(true);
    setTimeout(() => {
      const acc = { ...demoAccounts[rol], email };
      login(acc);
      toast.success(`Bienvenido(a), ${acc.nombre}`);
    }, 500);
  };

  console.log({ roleMeta });

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
                    Selecciona tu rol para probar la experiencia.
                  </Text>
                </Box>

                <Box>
                  <FormLabel mb={2}>Tipo de cuenta</FormLabel>
                  <SimpleGrid columns={{ base: 2, sm: 4 }} spacing={2}>
                    {(Object.keys(roleMeta) as UserRole[]).map((r) => {
                      const M = roleMeta[r];
                      const active = rol === r;
                      return (
                        <Box
                          as="button"
                          type="button"
                          key={r}
                          onClick={() => onChangeRol(r)}
                          textAlign="left"
                          borderWidth="1px"
                          borderRadius="lg"
                          p={3}
                          borderColor={active ? "vino.500" : "lucera.border"}
                          bg={active ? "vino.50" : "white"}
                          _hover={{ bg: active ? "vino.50" : "crema.100" }}
                          transition="all 120ms"
                        >
                          <M.Icon
                            size={16}
                            color={active ? "#6d122b" : "#7b5a48"}
                          />
                          <Text fontSize="xs" fontWeight={700} mt={1.5}>
                            {M.label}
                          </Text>
                          <Text
                            fontSize="10px"
                            color="lucera.textMuted"
                            mt={0.5}
                            lineHeight={1.2}
                          >
                            {M.desc}
                          </Text>
                        </Box>
                      );
                    })}
                  </SimpleGrid>
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
                    <strong>{demoAccounts[rol].email}</strong>.
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
