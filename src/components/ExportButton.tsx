import {
  Button,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  Text,
  VStack,
  useDisclosure,
  type ButtonProps,
} from "@chakra-ui/react";
import { Download, FileSpreadsheet, FileText } from "lucide-react";
import { exportToExcel, exportToCsv } from "@/lib/exportToExcel";

type ExportButtonProps<T extends Record<string, unknown>> = {
  data: T[];
  filename: string;
  sheetName?: string;
  isDisabled?: boolean;
  size?: ButtonProps["size"];
};

export function ExportButton<T extends Record<string, unknown>>({
  data,
  filename,
  sheetName = "Datos",
  isDisabled,
  size,
}: ExportButtonProps<T>) {
  const { isOpen, onOpen, onClose } = useDisclosure();

  const handleExport = (format: "xlsx" | "csv") => {
    if (format === "xlsx") exportToExcel(data, filename, sheetName);
    else exportToCsv(data, filename);
    onClose();
  };

  return (
    <>
      <Button
        variant="solid"
        size={size}
        leftIcon={<Download size={16} />}
        isDisabled={isDisabled}
        onClick={onOpen}
      >
        Exportar
      </Button>

      <Modal isOpen={isOpen} onClose={onClose} isCentered size="sm">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader fontSize="md">Exportar datos</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <Text fontSize="sm" color="lucera.textMuted" mb={4}>
              Elige el formato de descarga.
            </Text>
            <VStack spacing={3} align="stretch">
              <Button
                colorScheme="vino"
                leftIcon={<FileSpreadsheet size={16} />}
                onClick={() => handleExport("xlsx")}
              >
                Excel (.xlsx)
              </Button>
              <Button
                variant="outline"
                leftIcon={<FileText size={16} />}
                onClick={() => handleExport("csv")}
              >
                CSV (.csv)
              </Button>
            </VStack>
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
}
