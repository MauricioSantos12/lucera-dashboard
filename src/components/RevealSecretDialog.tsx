import { useState } from "react";
import {
  Box,
  Button,
  HStack,
  IconButton,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Text,
} from "@chakra-ui/react";
import { Check, Copy, TriangleAlert } from "lucide-react";
import { toast } from "@/lib/toast";

interface RevealSecretDialogProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  // Código copiable (clave inicial / temporal). Si viene note en su lugar, se
  // muestra el mensaje amable (p. ej. clave derivada de la cédula).
  secret?: string | null;
  note?: string;
}

// Diálogo que muestra un secreto UNA sola vez, con botón de copiar y aviso de
// que no volverá a mostrarse. Reutilizado por el alta y el restablecimiento.
export function RevealSecretDialog({
  isOpen,
  onClose,
  title,
  description,
  secret,
  note,
}: RevealSecretDialogProps) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    if (!secret) return;
    try {
      await navigator.clipboard.writeText(secret);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      toast.error("No se pudo copiar; selecciónalo manualmente");
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md" closeOnOverlayClick={false}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>{title}</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          {description && (
            <Text fontSize="sm" color="lucera.textMuted" mb={3}>
              {description}
            </Text>
          )}

          {secret ? (
            <HStack
              borderWidth="1px"
              borderColor="lucera.border"
              borderRadius="md"
              bg="crema.50"
              px={3}
              py={2}
              justify="space-between"
            >
              <Text
                fontFamily="mono"
                fontWeight={700}
                fontSize={secret.length > 24 ? "sm" : "lg"}
                wordBreak="break-all"
              >
                {secret}
              </Text>
              <IconButton
                aria-label="Copiar"
                size="sm"
                variant="ghost"
                icon={copied ? <Check size={16} /> : <Copy size={16} />}
                onClick={copy}
              />
            </HStack>
          ) : (
            note && (
              <Box
                borderWidth="1px"
                borderColor="lucera.border"
                borderRadius="md"
                bg="crema.50"
                px={3}
                py={2}
              >
                <Text fontSize="sm" fontWeight={600}>
                  {note}
                </Text>
              </Box>
            )
          )}

          <HStack
            mt={3}
            spacing={2}
            fontSize="xs"
            color="lucera.textMuted"
            align="flex-start"
          >
            <Box color="amarillo.700" mt={0.5}>
              <TriangleAlert size={14} />
            </Box>
            <Text>
              Guárdala o compártela ahora: por seguridad no volverá a mostrarse.
              La persona deberá cambiarla en su primer ingreso.
            </Text>
          </HStack>
        </ModalBody>
        <ModalFooter>
          <Button colorScheme="vino" onClick={onClose}>
            Entendido
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
