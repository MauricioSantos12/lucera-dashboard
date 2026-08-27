import { useState } from "react";
import {
  Box,
  Button,
  Divider,
  FormControl,
  FormLabel,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Text,
  VStack,
} from "@chakra-ui/react";
import { KeyRound, RefreshCw } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { apiFetch } from "@/lib/apiClient";
import { toast } from "@/lib/toast";
import type {
  PortalPasswordPayload,
  PortalPasswordResetResponse,
} from "@/lib/apiTypes";

interface GuardianPortalModalProps {
  // Cuando es distinto de null, el modal está abierto para ese acudiente.
  guardian: { id: string; name: string } | null;
  onClose: () => void;
  // Muestra un secreto (clave nueva del reset) UNA vez en el diálogo del padre.
  onSecret: (title: string, description: string, secret: string) => void;
}

const MIN_LENGTH = 8;

// Onboarding del portal del acudiente (solo admin): el admin le fija la
// contraseña con la que entrará al portal (login por teléfono + contraseña).
export function GuardianPortalModal({
  guardian,
  onClose,
  onSecret,
}: GuardianPortalModalProps) {
  const { getValidToken } = useAuth();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [savingPwd, setSavingPwd] = useState(false);
  const [resetting, setResetting] = useState(false);

  const close = () => {
    setPassword("");
    setConfirm("");
    onClose();
  };

  // Genera una clave nueva y la muestra una vez (para cuando se les olvida).
  const resetPassword = async () => {
    if (!guardian) return;
    setResetting(true);
    try {
      const token = await getValidToken();
      const res = await apiFetch<PortalPasswordResetResponse>(
        `/api/guardians/${guardian.id}/portal-password/reset`,
        token,
        { method: "POST" }
      );
      onSecret(
        "Clave del portal restablecida",
        `Comparte esta clave con ${guardian.name}. Deberá cambiarla en su primer ingreso.`,
        res.temporaryPassword
      );
      close();
    } catch (err) {
      toast.error("No se pudo restablecer la contraseña", {
        description: err instanceof Error ? err.message : undefined,
      });
    } finally {
      setResetting(false);
    }
  };

  const setPortalPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!guardian) return;
    if (password.length < MIN_LENGTH) {
      toast.error(`La contraseña debe tener al menos ${MIN_LENGTH} caracteres`);
      return;
    }
    if (password !== confirm) {
      toast.error("La confirmación no coincide");
      return;
    }
    setSavingPwd(true);
    try {
      const token = await getValidToken();
      const payload: PortalPasswordPayload = { password };
      await apiFetch(`/api/guardians/${guardian.id}/portal-password`, token, {
        method: "POST",
        body: JSON.stringify(payload),
      });
      toast.success("Contraseña del portal fijada. El acudiente ya puede entrar.");
      close();
    } catch (err) {
      toast.error("No se pudo fijar la contraseña", {
        description: err instanceof Error ? err.message : undefined,
      });
    } finally {
      setSavingPwd(false);
    }
  };

  return (
    <Modal isOpen={!!guardian} onClose={close} size="md">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Acceso al portal</ModalHeader>
        <ModalCloseButton />
        <form onSubmit={setPortalPassword}>
          <ModalBody>
            <Text fontSize="xs" color="lucera.textMuted" mb={4}>
              Habilita el ingreso de <strong>{guardian?.name}</strong> al portal
              del acudiente (login con correo o teléfono + contraseña).
              Comunícasela por un canal seguro.
            </Text>

            {/* Restablecer: genera una clave nueva (para claves olvidadas). */}
            <Box
              borderWidth="1px"
              borderColor="lucera.border"
              borderRadius="md"
              p={3}
              mb={4}
            >
              <Text fontSize="sm" fontWeight={600} mb={1}>
                Restablecer contraseña
              </Text>
              <Text fontSize="xs" color="lucera.textMuted" mb={3}>
                Genera una clave nueva y la muestra una sola vez.
              </Text>
              <Button
                size="sm"
                variant="outline"
                leftIcon={<RefreshCw size={14} />}
                onClick={resetPassword}
                isLoading={resetting}
              >
                Generar clave nueva
              </Button>
            </Box>

            <Divider mb={4} />
            <Text fontSize="sm" fontWeight={600} mb={2}>
              O fijar una clave específica
            </Text>
            <VStack spacing={3} align="stretch">
              <FormControl isRequired>
                <FormLabel>Contraseña</FormLabel>
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={`Mínimo ${MIN_LENGTH} caracteres`}
                />
              </FormControl>
              <FormControl isRequired>
                <FormLabel>Confirmar contraseña</FormLabel>
                <Input
                  type="password"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                />
              </FormControl>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="outline" mr={2} onClick={close} isDisabled={savingPwd}>
              Cancelar
            </Button>
            <Button
              type="submit"
              colorScheme="vino"
              leftIcon={<KeyRound size={16} />}
              isLoading={savingPwd}
            >
              Fijar contraseña
            </Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
}
