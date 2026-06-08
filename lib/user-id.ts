const CUID_RE = /^c[a-z0-9]{20,}$/i;

export function isValidUserId(userId: string) {
  return CUID_RE.test(userId);
}