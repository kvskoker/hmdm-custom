export const REGEX = {
  hasUppercase: '^(?=.*[A-Z]).+$',
  hasLowercase: '^(?=.*[a-z]).+$',
  hasDigit: '^(?=.*\\d).+$',
  specialChar: '^(?=.*[!@#$%^&*(),.?":{}|<>])[A-Za-z0-9!@#$%^&*(),.?":{}|<>]+$',
  filePath: '^(https?|file)://.+',
  apkUrl: '^(https?|file|market)://.+',
};
