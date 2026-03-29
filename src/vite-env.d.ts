/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_ADMIN_PASSWORD_HASH: string
  readonly VITE_API_URL?: string
  readonly GEMINI_API_KEY?: string
  readonly API_KEY?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
