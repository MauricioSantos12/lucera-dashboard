import { useState } from "react";
import {
  Button,
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
import { KeyRound } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { apiFetch } from "@/lib/apiClient";
import { toast } from "@/lib/toast";
import type { PortalPasswordPayload } from "@/lib/apiTypes";

interface GuardianPortalModalProps {
  // Cuando es distinto de null, el modal está abierto para ese acudiente.
  guardian: { id: string; name: string } | null;
  onClose: () => void;
}

const MIN_LENGTH = 8;

// Onboarding del portal del acudiente (solo admin): el admin le fija la
// contraseña con la que entrará al portal (login por teléfono + contraseña).
export function GuardianPortalModal({
  guardian,
  onClose,
}: GuardianPortalModalProps) {
  const { getValidToken } = useAuth();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [savingPwd, setSavingPwd] = useState(false);

  const close = () => {
    setPassword("");
    setConfirm("");
    onClose();
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
              del acudiente (login con teléfono + contraseña). Comunícasela por un
              canal seguro.
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
