export const LICENSE_STATUS = {
  VALID: 'valid',
  EXPIRING: 'expiring',
  EXPIRED: 'expired',
  DOMAIN: 'domain',
  ERROR: 'error',
} as const;

export function isLicenseValid(status: string): boolean {
  return status === LICENSE_STATUS.VALID || status === LICENSE_STATUS.EXPIRING;
}
