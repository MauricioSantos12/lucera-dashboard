import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useAuth } from "@/lib/auth";
import {
  Avatar,
  Box,
  Button,
  Flex,
  FormControl,
  FormLabel,
  HStack,
  Input,
  SimpleGrid,
  Text,
  VStack,
  Badge,
  Heading,
} from "@chakra-ui/react";
import { ShieldCheck, Save } from "lucide-react";
import { StatCard } from "@/components/StatCard";
import { MultiSelect } from "@/components/MultiSelect";
import { centros } from "@/lib/mockData";
import { toast } from "@/lib/toast";

export default function Profile() {
  const { user, updateProfile } = useAuth();
  const [nombre, setNombre] = useState(user?.nombre ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [telefono, setTelefono] = useState(user?.telefono ?? "");
  const [selectedCentros, setSelectedCentros] = useState<string[]>([]);

  const showCentros = user?.rol === "Admin" || user?.rol === "Médico";
  const centrosOptions = centros.map(c => ({ value: c.id, label: c.nombre }));

  if (!user) return null;
  const initials = user.nombre
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("");

  const onSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile({ nombre, email, telefono });
    toast.success("Perfil actualizado");
  };
  console.log({ user });
  return (
    <DashboardLayout
      title="Mi perfil"
      subtitle="Gestiona tu información personal y de seguridad"
    >
      <SimpleGrid columns={{ base: 1, lg: 3 }} spacing={4}>
        <StatCard>
          <VStack spacing={2} textAlign="center">
            <Avatar
              size="xl"
              name={initials}
              bg="vino.500"
              color="white"
              mb={2}
            />
            <Heading size="md" fontFamily="heading">
              {user.nombre}
            </Heading>
            <Text fontSize="xs" color="lucera.textMuted">
              {user.email}
            </Text>
            <Badge colorScheme="vino">{user.rol}</Badge>
            {user.refId && (
              <Text
                fontSize="10px"
                fontFamily="mono"
                color="lucera.textMuted"
                pt={2}
              >
                ID: {user.refId}
              </Text>
            )}
          </VStack>
          <VStack
            mt={6}
            pt={4}
            borderTopWidth="1px"
            borderColor="lucera.borderSoft"
            align="flex-start"
            spacing={2}
            fontSize="xs"
            color="lucera.textMuted"
          >
            <HStack>
              <ShieldCheck size={14} color="#2f9e6b" />
              <Text>Verificación por email</Text>
            </HStack>
            <HStack>
              <ShieldCheck size={14} color="#2f9e6b" />
              <Text>Última sesión: hoy</Text>
            </HStack>
          </VStack>
        </StatCard>

        <StatCard gridColumn={{ lg: "span 2" }}>
          <Heading size="sm" fontFamily="heading" mb={1}>
            Datos personales
          </Heading>
          <Text fontSize="xs" color="lucera.textMuted" mb={4}>
            {user.rol === "Admin"
              ? "Como administrador, puedes editar tu perfil aquí. Para gestionar otras cuentas usa los módulos de Acudientes y Médicos."
              : "Solo puedes editar tu propio perfil. Los administradores no pueden cambiar estos datos sin tu consentimiento (Ley 81)."}
          </Text>

          <Box as="form" onSubmit={onSave} maxW="xl">
            <VStack spacing={4} align="stretch">
              <FormControl isRequired>
                <FormLabel>Nombre completo</FormLabel>
                <Input
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                />
              </FormControl>
              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                <FormControl isRequired>
                  <FormLabel>Correo electrónico</FormLabel>
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </FormControl>
                <FormControl>
                  <FormLabel>Teléfono (WhatsApp · MFA)</FormLabel>
                  <Input
                    value={telefono}
                    onChange={(e) => setTelefono(e.target.value)}
                  />
                </FormControl>
              </SimpleGrid>
              {showCentros && (
                <FormControl>
                  <FormLabel>Centros de atención</FormLabel>
                  <MultiSelect
                    options={centrosOptions}
                    value={selectedCentros}
                    onChange={setSelectedCentros}
                    placeholder="Seleccionar centros…"
                  />
                </FormControl>
              )}
              <HStack pt={2}>
                <Button
                  type="submit"
                  colorScheme="vino"
                  leftIcon={<Save size={14} />}
                >
                  Guardar cambios
                </Button>
                <Button
                  variant="outline"
                  onClick={() =>
                    toast.info(
                      "Enlace de cambio de contraseña enviado por email"
                    )
                  }
                >
                  Cambiar contraseña
                </Button>
              </HStack>
            </VStack>
          </Box>
        </StatCard>
      </SimpleGrid>
    </DashboardLayout>
  );
}
