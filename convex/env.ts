export const env = {
  NODE_ENV: process.env.NODE_ENV ?? '',
  FRONTEND_SITE_URL: process.env.FRONTEND_SITE_URL ?? '',
  CONVEX_SITE_URL: process.env.CONVEX_SITE_URL ?? '',
  // Convex Configuration
  SERVER_PRIVATE_KEY: process.env.SERVER_PRIVATE_KEY ?? '',
  BOT_DEFAULT_PASSWORD: process.env.BOT_DEFAULT_PASSWORD ?? '',
  // Optional Services
  REPLICATE_API_KEY: process.env.REPLICATE_API_KEY ?? '',
  STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY ?? '',
  STRIPE_WEBHOOK_SECRETS: process.env.STRIPE_WEBHOOK_SECRETS ?? '',
  OPENROUTER_API_KEY: process.env.OPENROUTER_API_KEY ?? '',
  VOYAGE_API_KEY: process.env.VOYAGE_API_KEY ?? '',
  BYTEPLUS_API_KEY: process.env.BYTEPLUS_API_KEY ?? '',
  // S3 Configuration
  S3_APP_KEY: process.env.S3_APP_KEY ?? '',
  S3_APP_KEY_ID: process.env.S3_APP_KEY_ID ?? '',
  S3_DEFAULT_BUCKET: process.env.S3_DEFAULT_BUCKET ?? '',
  S3_ENDPOINT: process.env.S3_ENDPOINT ?? '',
  // Runpod Configuration
  RUNPOD_API_KEY: process.env.RUNPOD_API_KEY ?? '',
  // RevenueCat
  REVENUECAT_WEBHOOK_SECRET: process.env.REVENUECAT_WEBHOOK_SECRET ?? ''
}
