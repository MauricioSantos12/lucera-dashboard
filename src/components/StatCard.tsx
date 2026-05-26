import { Box, BoxProps } from "@chakra-ui/react";
import { ReactNode } from "react";

export function StatCard({ children, ...rest }: { children: ReactNode } & BoxProps) {
  return (
    <Box
      bg="lucera.surface"
      borderWidth="1px"
      borderColor="lucera.border"
      borderRadius="xl"
      p={5}
      transition="box-shadow 200ms"
      _hover={{ boxShadow: "0 8px 24px -12px rgba(109,18,43,0.18)" }}
      {...rest}
    >
      {children}
    </Box>
  );
}
