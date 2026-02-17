const toBoolean = (value: string | undefined, fallback: boolean) => {
  if (value === undefined) return fallback;
  return ['1', 'true', 'yes', 'on'].includes(value.toLowerCase());
};

export default () => ({
  port: parseInt(process.env.PORT ?? '3000', 10),
  frontendUrl: process.env.FRONTEND_URL ?? 'http://localhost:3001',
  database: {
    url: process.env.DATABASE_URL,
  },
  redis: {
    url: process.env.REDIS_URL ?? 'redis://localhost:6379',
  },
  jwt: {
    secret: process.env.JWT_SECRET ?? 'dev-secret-change-in-production',
    expiresIn: process.env.JWT_EXPIRES_IN ?? '15m',
    refreshExpiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN ?? '7d',
  },
  mail: {
    host: process.env.SMTP_HOST ?? 'localhost',
    port: parseInt(process.env.SMTP_PORT ?? '1025', 10),
    from: process.env.MAIL_FROM ?? 'noreply@alcor.com',
    fromName: process.env.MAIL_FROM_NAME ?? 'АЛЬКОР',
  },
  s3: {
    endpoint: process.env.S3_ENDPOINT ?? 'http://localhost:9000',
    region: process.env.S3_REGION ?? 'us-east-1',
    bucket: process.env.S3_BUCKET ?? 'marketplace',
    accessKeyId: process.env.S3_ACCESS_KEY_ID ?? 'minioadmin',
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY ?? 'minioadmin',
    publicUrl: process.env.S3_PUBLIC_URL ?? 'http://localhost:9000/marketplace',
    publicReadAssets: toBoolean(
      process.env.S3_PUBLIC_READ_ASSETS,
      process.env.NODE_ENV !== 'production',
    ),
  },
  upload: {
    guestTokenSecret:
      process.env.UPLOAD_GUEST_TOKEN_SECRET ??
      process.env.JWT_SECRET ??
      'dev-upload-guest-secret-change-in-production',
    guestTokenTtlSeconds: parseInt(
      process.env.UPLOAD_GUEST_TOKEN_TTL_SECONDS ?? '900',
      10,
    ),
    guestTokenRateLimitPerMinute: parseInt(
      process.env.UPLOAD_GUEST_TOKEN_RATE_LIMIT_PER_MINUTE ?? '10',
      10,
    ),
    requestLimitPerMinute: parseInt(
      process.env.UPLOAD_REQUEST_LIMIT_PER_MINUTE ?? '15',
      10,
    ),
    filesLimitPerMinute: parseInt(
      process.env.UPLOAD_FILES_LIMIT_PER_MINUTE ?? '40',
      10,
    ),
    bytesLimitPerMinute: parseInt(
      process.env.UPLOAD_BYTES_LIMIT_PER_MINUTE ?? `${80 * 1024 * 1024}`,
      10,
    ),
  },
});
