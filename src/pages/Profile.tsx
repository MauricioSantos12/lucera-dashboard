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
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  SimpleGrid,
  Text,
  VStack,
  Badge,
  Heading,
  useDisclosure,
} from "@chakra-ui/react";
import { ShieldCheck, Save } from "lucide-react";
import { StatCard } from "@/components/StatCard";
import { MultiSelect } from "@/components/MultiSelect";
import { centers } from "@/lib/mockData";
import { toast } from "@/lib/toast";
import { changePassword } from "@/lib/passwordApi";

const MIN_LENGTH = 8;

export default function Profile() {
  const { user, updateProfile, getValidToken, applyPasswordChanged } = useAuth();
  const [name, setName] = useState(user?.name ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [phone, setPhone] = useState(user?.phone ?? "");
  const [selectedCenters, setSelectedCenters] = useState<string[]>([]);

  // Modal de cambio de contraseña voluntario.
  const pwd = useDisclosure();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [savingPwd, setSavingPwd] = useState(false);

  const submitPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < MIN_LENGTH) {
      toast.error(`La nueva contraseña debe tener al menos ${MIN_LENGTH} caracteres`);
      return;
    }
    if (newPassword !== confirm) {
      toast.error("La confirmación no coincide con la nueva contraseña");
      return;
    }
    setSavingPwd(true);
    try {
      const token = await getValidToken();
      const res = await changePassword(currentPassword, newPassword, token);
      applyPasswordChanged(res.access_token, res.refresh_token);
      toast.success("Contraseña actualizada");
      setCurrentPassword("");
      setNewPassword("");
      setConfirm("");
      pwd.onClose();
    } catch (err) {
      toast.error("No se pudo cambiar la contraseña", {
        description: err instanceof Error ? err.message : undefined,
      });
    } finally {
      setSavingPwd(false);
    }
  };

  const showCenters = user?.role === "Admin" || user?.role === "Médico";
  const centerOptions = centers.map((c) => ({ value: c.id, label: c.name }));

  if (!user) return null;
  const initials = user.name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("");

  const onSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile({ name, email, phone });
    toast.success("Perfil actualizado");
  };

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
              {user.name}
            </Heading>
            <Text fontSize="xs" color="lucera.textMuted">
              {user.email}
            </Text>
            <Badge colorScheme="vino">{user.role}</Badge>
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
            {user.role === "Admin"
              ? "Como administrador, puedes editar tu perfil aquí. Para gestionar otras cuentas usa los módulos de Acudientes y Médicos."
              : "Solo puedes editar tu propio perfil. Los administradores no pueden cambiar estos datos sin tu consentimiento (Ley 81)."}
          </Text>

          <Box as="form" onSubmit={onSave} maxW="xl">
            <VStack spacing={4} align="stretch">
              <FormControl isRequired>
                <FormLabel>Nombre completo</FormLabel>
                <Input value={name} onChange={(e) => setName(e.target.value)} />
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
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </FormControl>
              </SimpleGrid>
              {showCenters && (
                <FormControl>
                  <FormLabel>Centros de atención</FormLabel>
                  <MultiSelect
                    options={centerOptions}
                    value={selectedCenters}
                    onChange={setSelectedCenters}
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
                <Button variant="outline" onClick={pwd.onOpen}>
                  Cambiar contraseña
                </Button>
              </HStack>
            </VStack>
          </Box>
        </StatCard>
      </SimpleGrid>

      <Modal isOpen={pwd.isOpen} onClose={pwd.onClose} size="md">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Cambiar contraseña</ModalHeader>
          <ModalCloseButton />
          <form onSubmit={submitPassword}>
            <ModalBody>
              <VStack spacing={4} align="stretch">
                <FormControl isRequired>
                  <FormLabel>Contraseña actual</FormLabel>
                  <Input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
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
                  />
                </FormControl>
              </VStack>
            </ModalBody>
            <ModalFooter>
              <Button
                variant="outline"
                mr={2}
                onClick={pwd.onClose}
                isDisabled={savingPwd}
              >
                Cancelar
              </Button>
              <Button type="submit" colorScheme="vino" isLoading={savingPwd}>
                Guardar
              </Button>
            </ModalFooter>
          </form>
        </ModalContent>
      </Modal>
    </DashboardLayout>
  );
}
