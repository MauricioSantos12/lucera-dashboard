import { ReactNode, useRef, useState } from "react";
import {
  AlertDialog, AlertDialogBody, AlertDialogContent, AlertDialogFooter,
  AlertDialogHeader, AlertDialogOverlay, Button, HStack, Box, Text,
} from "@chakra-ui/react";
import { AlertTriangle } from "lucide-react";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  description?: ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
  onConfirm: () => void | Promise<void>;
};

export function ConfirmDialog({
  open, onOpenChange, title = "¿Estás seguro?", description,
  confirmLabel = "Eliminar", cancelLabel = "Cancelar",
  destructive = true, onConfirm,
}: Props) {
  const cancelRef = useRef<HTMLButtonElement>(null);
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    setLoading(true);
    try {
      await onConfirm();
    } finally {
      setLoading(false);
      onOpenChange(false);
    }
  };

  return (
    <AlertDialog
      isOpen={open}
      onClose={() => !loading && onOpenChange(false)}
      leastDestructiveRef={cancelRef}
      isCentered
      motionPreset="slideInBottom"
    >
      <AlertDialogOverlay bg="blackAlpha.600">
        <AlertDialogContent borderRadius="xl">
          <AlertDialogHeader pb={2}>
            <HStack align="flex-start" spacing={3}>
              <Box
                h={10} w={10} borderRadius="lg" display="grid" placeItems="center"
                bg={destructive ? "vino.50" : "naranja.50"}
                color={destructive ? "vino.500" : "naranja.500"}
              >
                <AlertTriangle size={20} />
              </Box>
              <Text fontFamily="heading" fontSize="lg" fontWeight={700}>{title}</Text>
            </HStack>
          </AlertDialogHeader>
          {description && (
            <AlertDialogBody pt={0} color="lucera.textMuted" fontSize="sm">
              {description}
            </AlertDialogBody>
          )}
          <AlertDialogFooter>
            <Button
              ref={cancelRef}
              variant="outline"
              size="sm"
              isDisabled={loading}
              onClick={() => onOpenChange(false)}
            >
              {cancelLabel}
            </Button>
            <Button
              ml={2} size="sm"
              colorScheme={destructive ? "vino" : "naranja"}
              isLoading={loading}
              onClick={handleConfirm}
            >
              {confirmLabel}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialogOverlay>
    </AlertDialog>
  );
}
