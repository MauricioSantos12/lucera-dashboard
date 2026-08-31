/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_REQUIRE_MFA_CODE: string;
  readonly VITE_BACKEND_URL: string;
  readonly VITE_WHATSAPP_PHONE: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
