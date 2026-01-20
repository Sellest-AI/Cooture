export const env = {
  S3_ENDPOINT: process.env.S3_ENDPOINT!,
  S3_APP_KEY_ID: process.env.S3_APP_KEY_ID!,
  S3_APP_KEY: process.env.S3_APP_KEY!,
  S3_DEFAULT_BUCKET: process.env.S3_DEFAULT_BUCKET!,
}

if (!env.S3_ENDPOINT) throw new Error("S3_ENDPOINT is not defined in environment variables");
if (!env.S3_APP_KEY_ID) throw new Error("S3_APP_KEY_ID is not defined in environment variables");
if (!env.S3_APP_KEY) throw new Error("S3_APP_KEY is not defined in environment variables");
if (!env.S3_DEFAULT_BUCKET) throw new Error("S3_DEFAULT_BUCKET is not defined in environment variables");