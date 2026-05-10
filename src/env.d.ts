/// <reference types="astro/client" />

interface ImportMetaEnv {
  readonly PUBLIC_API_URL: string
  readonly PUBLIC_COMMENT_API_URL: string
  readonly PUBLIC_ENV: string
  readonly DEV: boolean
  readonly R2_BUCKET_NAME?: string
  readonly R2_ACCESS_KEY_ID?: string
  readonly R2_SECRET_ACCESS_KEY?: string
  readonly R2_ACCOUNT_ID?: string
  readonly DISABLE_REMOTE_GALLERY?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
