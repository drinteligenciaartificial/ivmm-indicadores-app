import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";

const KEY_LENGTH = 64;
const PREFIX = "scrypt";

export function hashPassword(password: string) {
  if (password.length < 8) throw new Error("A senha deve ter pelo menos 8 caracteres.");
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, KEY_LENGTH).toString("hex");
  return `${PREFIX}$${salt}$${hash}`;
}

export function verifyPassword(password: string, storedPassword: string) {
  const [prefix, salt, storedHash] = storedPassword.split("$");
  if (prefix !== PREFIX || !salt || !storedHash) return password === storedPassword;

  const candidate = scryptSync(password, salt, KEY_LENGTH);
  const expected = Buffer.from(storedHash, "hex");
  return candidate.length === expected.length && timingSafeEqual(candidate, expected);
}

export function passwordNeedsUpgrade(storedPassword: string) {
  return !storedPassword.startsWith(`${PREFIX}$`);
}
