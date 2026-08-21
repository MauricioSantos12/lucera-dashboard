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
      transition="box-shadow 200ms ease, transform 200ms ease"
      _hover={{
        boxShadow: "0 12px 28px -14px rgba(108,18,43,0.22)",
        transform: "translateY(-2px)",
      }}
      {...rest}
    >
      {children}
    </Box>
  );
}
