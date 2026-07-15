/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_REQUIRE_MFA_CODE: string;
  readonly VITE_BACKEND_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
