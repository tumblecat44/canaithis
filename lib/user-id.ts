const CUID_RE = /^c[a-z0-9]{20,}$/i;
/** seed-demo.mjs: randomBytes(12).toString("hex") */
const HEX_ID_RE = /^[a-f0-9]{24}$/;
const DEMO_USER_ID = "demo-seed-user-canaithis";

export function isValidUserId(userId: string) {
  return (
    CUID_RE.test(userId) ||
    HEX_ID_RE.test(userId) ||
    userId === DEMO_USER_ID
  );
}