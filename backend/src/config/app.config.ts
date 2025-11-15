import { registerAs } from "@nestjs/config";

export const appConfig = registerAs("app", () => ({
  nodeEnv: process.env.NODE_ENV || "development",
  port: parseInt(process.env.PORT, 10) || 3000,
  url: process.env.APP_URL || "http://localhost:3000",

  // JWT configuration (for stage 2)
  jwt: {
    secret: process.env.JWT_SECRET || "dev-secret",
    expiresIn: process.env.JWT_EXPIRES_IN || "1d",
    refreshExpiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN || "7d",
  },

  // Encryption
  encryptionKey:
    process.env.ENCRYPTION_KEY || "dev-32-character-encryption-key-12",

  // External APIs
  apis: {
    solapi: {
      apiKey: process.env.SOLAPI_API_KEY,
      apiSecret: process.env.SOLAPI_API_SECRET,
      sender: process.env.SOLAPI_SENDER,
      kakaoPfid: process.env.SOLAPI_KAKAO_PFID,
    },
    openai: {
      apiKey: process.env.OPENAI_API_KEY,
    },
    aws: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      region: process.env.AWS_REGION || "ap-northeast-2",
      s3Bucket: process.env.AWS_S3_BUCKET,
    },
  },

  // Monitoring
  sentry: {
    dsn: process.env.SENTRY_DSN,
  },
}));
