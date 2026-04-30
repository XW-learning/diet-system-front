// JWT decode utility — no external library needed
interface JwtUserPayload {
  role: 'user' | 'admin';
  userId?: number;
  adminId?: number;
  iat: number;
  exp: number;
}

function base64UrlDecode(str: string): string {
  // Replace URL-safe chars and pad
  let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
  while (base64.length % 4) {
    base64 += '=';
  }
  return decodeURIComponent(
    atob(base64)
      .split('')
      .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
      .join('')
  );
}

/** Decode the payload of a JWT token (does not verify signature) */
export function decodeToken(token: string): JwtUserPayload | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    return JSON.parse(base64UrlDecode(parts[1])) as JwtUserPayload;
  } catch {
    return null;
  }
}

/** Extract user ID from a JWT token */
export function getUserIdFromToken(token: string | null): string | null {
  if (!token) return null;
  const payload = decodeToken(token);
  if (!payload) return null;
  if (payload.userId !== undefined) return String(payload.userId);
  return null;
}

/** Extract admin ID from a JWT token */
export function getAdminIdFromToken(token: string | null): string | null {
  if (!token) return null;
  const payload = decodeToken(token);
  if (!payload) return null;
  if (payload.adminId !== undefined) return String(payload.adminId);
  return null;
}
