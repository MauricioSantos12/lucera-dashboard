import { createStandaloneToast } from "@chakra-ui/react";
import { theme } from "./theme";

const { toast: chakraToast, ToastContainer } = createStandaloneToast({ theme });

const base = {
  duration: 3500,
  isClosable: true,
  position: "top-right" as const,
  variant: "subtle",
};

export const toast = {
  success: (title: string, opts?: { description?: string }) =>
    chakraToast({ ...base, status: "success", title, description: opts?.description }),
  error: (title: string, opts?: { description?: string }) =>
    chakraToast({ ...base, status: "error", title, description: opts?.description }),
  info: (title: string, opts?: { description?: string }) =>
    chakraToast({ ...base, status: "info", title, description: opts?.description }),
  warning: (title: string, opts?: { description?: string }) =>
    chakraToast({ ...base, status: "warning", title, description: opts?.description }),
};

export { ToastContainer };
