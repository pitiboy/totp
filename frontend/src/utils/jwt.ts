/**
 * Decode JWT token and extract payload
 * Note: This only decodes the token, it does NOT verify the signature
 * For production, always verify tokens on the backend
 */
export const decodeJWT = (token: string): any => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('Error decoding JWT:', error);
    return null;
  }
};

/**
 * Extract user info from JWT token
 */
export const getUserFromToken = (token: string): { id: number; username: string; email: string } | null => {
  const decoded = decodeJWT(token);
  if (!decoded) {
    return null;
  }

  return {
    id: decoded.userId || decoded.id || 0,
    username: decoded.username || '',
    email: decoded.email || '',
  };
};

