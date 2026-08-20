export type OrderRuntimeConfig = {
  googleSheetId: string | undefined;
  googleSheetTabName: string | undefined;
  googleServiceAccountJsonBase64: string | undefined;
  googleServiceAccountJsonPath: string | undefined;
  googleServiceAccountEmail: string | undefined;
  googlePrivateKey: string | undefined;
  smtpHost: string | undefined;
  smtpPort: string | undefined;
  smtpUser: string | undefined;
  smtpPass: string | undefined;
  emailFrom: string | undefined;
  businessEmail: string | undefined;
};

export function getOrderRuntimeConfig(): OrderRuntimeConfig {
  return {
    googleSheetId: process.env.GOOGLE_SHEET_ID,
    googleSheetTabName: process.env.GOOGLE_SHEET_TAB_NAME,
    googleServiceAccountJsonBase64: process.env.GOOGLE_SERVICE_ACCOUNT_JSON_BASE64,
    googleServiceAccountJsonPath: process.env.GOOGLE_SERVICE_ACCOUNT_JSON_PATH,
    googleServiceAccountEmail: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    googlePrivateKey: process.env.GOOGLE_PRIVATE_KEY,
    smtpHost: process.env.SMTP_HOST,
    smtpPort: process.env.SMTP_PORT,
    smtpUser: process.env.SMTP_USER,
    smtpPass: process.env.SMTP_PASS,
    emailFrom: process.env.EMAIL_FROM,
    businessEmail: process.env.BUSINESS_EMAIL,
  };
}

export function getMissingOrderConfig(config: OrderRuntimeConfig): string[] {
  const missing: string[] = [];
  if (!config.googleSheetId) missing.push('GOOGLE_SHEET_ID');
  if (!config.googleSheetTabName) missing.push('GOOGLE_SHEET_TAB_NAME');
  if (!config.smtpHost) missing.push('SMTP_HOST');
  if (!config.smtpPort) missing.push('SMTP_PORT');
  if (!config.smtpUser) missing.push('SMTP_USER');
  if (!config.smtpPass) missing.push('SMTP_PASS');
  if (!config.emailFrom) missing.push('EMAIL_FROM');
  if (!config.businessEmail) missing.push('BUSINESS_EMAIL');
  const hasJsonCredential = Boolean(config.googleServiceAccountJsonBase64 || config.googleServiceAccountJsonPath);
  const hasLegacyCredential = Boolean(config.googleServiceAccountEmail && config.googlePrivateKey);
  if (!hasJsonCredential && !hasLegacyCredential) missing.push('GOOGLE_SERVICE_ACCOUNT_JSON_BASE64 or GOOGLE_SERVICE_ACCOUNT_JSON_PATH or GOOGLE_SERVICE_ACCOUNT_EMAIL and GOOGLE_PRIVATE_KEY');
  return missing;
}

export function getOrderConfigPresence(config: OrderRuntimeConfig): Record<string, boolean> {
  return {
    GOOGLE_SHEET_ID: Boolean(config.googleSheetId),
    GOOGLE_SHEET_TAB_NAME: Boolean(config.googleSheetTabName),
    GOOGLE_SERVICE_ACCOUNT_JSON_BASE64: Boolean(config.googleServiceAccountJsonBase64),
    GOOGLE_SERVICE_ACCOUNT_JSON_PATH: Boolean(config.googleServiceAccountJsonPath),
    GOOGLE_SERVICE_ACCOUNT_EMAIL: Boolean(config.googleServiceAccountEmail),
    GOOGLE_PRIVATE_KEY: Boolean(config.googlePrivateKey),
    SMTP_HOST: Boolean(config.smtpHost),
    SMTP_PORT: Boolean(config.smtpPort),
    SMTP_USER: Boolean(config.smtpUser),
    SMTP_PASS: Boolean(config.smtpPass),
    EMAIL_FROM: Boolean(config.emailFrom),
    BUSINESS_EMAIL: Boolean(config.businessEmail),
  };
}
