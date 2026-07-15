import { Flex, Spinner, Text } from "@chakra-ui/react";

export function LoadingState({ label = "Cargando…" }: { label?: string }) {
  return (
    <Flex
      direction="column"
      align="center"
      justify="center"
      py={20}
      color="lucera.textMuted"
    >
      <Spinner size="lg" color="vino.500" thickness="3px" mb={3} />
      <Text fontSize="sm">{label}</Text>
    </Flex>
  );
}
