import { useState } from "react";
import {
  Box,
  Button,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Text,
} from "@chakra-ui/react";
import { Link2, RefreshCw } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { apiFetch } from "@/lib/apiClient";
import { toast } from "@/lib/toast";
import { SITE_URL } from "@/lib/seo";
import type {
  PortalLinkResponse,
  PortalPasswordResetResponse,
} from "@/lib/apiTypes";

interface GuardianPortalModalProps {
  // Cuando es distinto de null, el modal está abierto para ese acudiente.
  guardian: { id: string; name: string } | null;
  onClose: () => void;
  // Muestra un secreto (link de registro / clave temporal) UNA vez en el diálogo
  // del padre.
  onSecret: (
    title: string,
    description: string,
    secret: string,
    warning?: string
  ) => void;
}

// Acceso al portal (solo admin): genera/reenvía el link de registro con el que
// el acudiente activa su cuenta, define su contraseña y agrega a sus hijos.
// Como el link no re-activa una cuenta ya activa (lleva a "cuenta ya activada"),
// se mantiene "restablecer contraseña" como fallback para cuentas activas que
// olvidaron su clave.
export function GuardianPortalModal({
  guardian,
  onClose,
  onSecret,
}: GuardianPortalModalProps) {
  const { getValidToken } = useAuth();
  const [generating, setGenerating] = useState(false);
  const [resetting, setResetting] = useState(false);

  // Genera un link de registro nuevo y lo muestra una sola vez para compartir.
  const generateLink = async () => {
    if (!guardian) return;
    setGenerating(true);
    try {
      const token = await getValidToken();
      const link = await apiFetch<PortalLinkResponse>(
        `/api/guardians/${guardian.id}/portal-link`,
        token,
        { method: "POST" }
      );
      const url = `${SITE_URL}/register#token=${link.token}`;
      const expiry = link.expiresInHours ?? 72;
      onSecret(
        "Link de registro creado",
        `Comparte este link con ${guardian.name} para que active su cuenta y defina su contraseña.`,
        url,
        `Válido ${expiry} horas · un solo uso.`
      );
      onClose();
    } catch (err) {
      toast.error("No se pudo generar el link de registro", {
        description: err instanceof Error ? err.message : undefined,
      });
    } finally {
      setGenerating(false);
    }
  };

  // Fallback para cuentas YA activas que olvidaron su clave: genera una clave
  // temporal (el link de registro no sirve porque la cuenta ya tiene contraseña).
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
      onClose();
    } catch (err) {
      toast.error("No se pudo restablecer la contraseña", {
        description: err instanceof Error ? err.message : undefined,
      });
    } finally {
      setResetting(false);
    }
  };

  return (
    <Modal isOpen={!!guardian} onClose={onClose} size="md">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Acceso al portal</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Text fontSize="sm" color="lucera.textMuted" mb={4}>
            Genera un <strong>link de registro</strong> para{" "}
            <strong>{guardian?.name}</strong>. Con él, la persona activa su
            cuenta, define su contraseña y agrega a sus hijos. Compártelo por un
            canal seguro (p. ej. WhatsApp).
          </Text>

          <Box
            borderWidth="1px"
            borderColor="lucera.border"
            borderRadius="md"
            bg="crema.50"
            p={3}
            mb={4}
          >
            <Text fontSize="xs" color="lucera.textMuted">
              El link es de un solo uso y caduca a las 72 horas. Si el acudiente
              lo perdió o expiró, genera uno nuevo aquí.
            </Text>
          </Box>

          {/* Fallback: la cuenta ya está activa y la persona olvidó su clave.
              El link no aplica (lleva a "cuenta ya activada"), así que se genera
              una clave temporal. */}
          <Text fontSize="xs" color="lucera.textMuted">
            ¿La cuenta ya está activa y olvidó su contraseña?{" "}
            <Button
              variant="link"
              size="xs"
              colorScheme="vino"
              leftIcon={<RefreshCw size={12} />}
              onClick={resetPassword}
              isLoading={resetting}
            >
              Restablecer contraseña
            </Button>
          </Text>
        </ModalBody>
        <ModalFooter>
          <Button variant="outline" mr={2} onClick={onClose} isDisabled={generating}>
            Cancelar
          </Button>
          <Button
            colorScheme="vino"
            leftIcon={<Link2 size={16} />}
            onClick={generateLink}
            isLoading={generating}
          >
            Generar link de registro
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
