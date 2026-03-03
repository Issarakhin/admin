import crypto from "crypto";

// Expected format:
// pbkdf2_sha256$<iterations>$<salt_base64>$<hash_base64>
export const verifyAdminPassword = (plainPassword: string, passwordHash: string) => {
  const parts = passwordHash.split("$");
  if (parts.length !== 4) return false;

  const [algorithm, iterationsRaw, saltBase64, hashBase64] = parts;
  if (algorithm !== "pbkdf2_sha256") return false;

  const iterations = Number(iterationsRaw);
  if (!Number.isInteger(iterations) || iterations < 100_000) return false;

  const salt = Buffer.from(saltBase64, "base64");
  const expectedHash = Buffer.from(hashBase64, "base64");
  const derivedHash = crypto.pbkdf2Sync(plainPassword, salt, iterations, expectedHash.length, "sha256");

  if (derivedHash.length !== expectedHash.length) return false;
  return crypto.timingSafeEqual(derivedHash, expectedHash);
};
