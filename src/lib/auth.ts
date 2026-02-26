import { SignJWT, jwtVerify } from "jose";

export const AUTH_COOKIE_NAME = "goldwatch_sid";

// Use a distinct secret for signing if available, otherwise fallback to ADMIN_PASS or a default (not recommended for prod)
// In a real scenario, use a dedicated random secret.
function getSecretKey() {
  const secret = process.env.JWT_SECRET || process.env.ADMIN_PASS || "default-insecure-secret";
  return new TextEncoder().encode(secret);
}

export async function signSession(payload: { username: string }) {
  const secret = getSecretKey();
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d") // 7 days session
    .sign(secret);
}

export async function verifySession(token: string) {
  try {
    const secret = getSecretKey();
    const { payload } = await jwtVerify(token, secret);
    return payload;
  } catch (e) {
    return null;
  }
}

export function verifyCredentials(username: string, password: string) {
  const expectedUser = process.env.ADMIN_USER;
  const expectedPass = process.env.ADMIN_PASS;

  if (!expectedUser || !expectedPass) {
    console.error("ADMIN_USER or ADMIN_PASS not set");
    // Fallback if not in production
    if (process.env.NODE_ENV !== "production") {
      // Allow default credentials in development if env vars missing
      return username === "admin" && password === "password";
    }
    return false;
  }

  // Use simple string comparison for now, but timingSafeEqual is better if using Node crypto
  // Since we are in edge, we can use crypto.subtle or just simple compare for this MVP
  // For better security, avoid timing attacks by comparing hashes
  return username === expectedUser && password === expectedPass;
}
