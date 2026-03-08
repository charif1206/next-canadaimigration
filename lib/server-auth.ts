/**
 * Server-side JWT utilities using `jose` (works in Node.js and Edge runtimes).
 * This replaces NestJS JWT + Passport-JWT for API Routes.
 */
import { SignJWT, jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'canada-immigration-secret-key-change-in-production'
);

const JWT_EXPIRES_IN = '7d';

export interface AdminJwtPayload {
  adminId: string;
  username: string;
  role: string;
  type: 'admin';
  sub: string;
}

export interface ClientJwtPayload {
  clientId: string;
  email: string;
  type: 'client';
  sub: string;
}

export type JwtPayload = AdminJwtPayload | ClientJwtPayload;

/**
 * Sign a JWT token with the given payload
 */
export async function signToken(payload: Record<string, unknown>): Promise<string> {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(JWT_EXPIRES_IN)
    .sign(JWT_SECRET);
}

/**
 * Verify JWT token and return its payload (throws if invalid/expired)
 */
export async function verifyToken(token: string): Promise<JwtPayload> {
  const { payload } = await jwtVerify(token, JWT_SECRET);
  return payload as unknown as JwtPayload;
}

/**
 * Extract and verify JWT from Authorization header.
 * Returns null if missing or invalid — never throws.
 */
export async function getAuthFromRequest(request: Request): Promise<JwtPayload | null> {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) return null;
  const token = authHeader.slice(7);
  try {
    return await verifyToken(token);
  } catch {
    return null;
  }
}

/**
 * Verify JWT directly from a cookie string value.
 * Used by Next.js middleware which reads from cookies.
 */
export async function verifyTokenSafe(token: string): Promise<JwtPayload | null> {
  try {
    return await verifyToken(token);
  } catch {
    return null;
  }
}
