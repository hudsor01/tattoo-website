import { SignJWT, jwtVerify } from 'jose';

// Environment variables for admin credentials
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'fennyg83@gmail.com';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'Fernandogovea83!';
const JWT_SECRET = process.env.JWT_SECRET || 'your-strong-secret-key-here';

const secret = new TextEncoder().encode(JWT_SECRET);

export async function login(email: string, password: string): Promise<string | null> {
  if (email === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
    const jwt = await new SignJWT({ email })
      .setProtectedHeader({ alg: 'HS256' })
      .setExpirationTime('7d')
      .setIssuedAt()
      .sign(secret);
    
    return jwt;
  }
  
  return null;
}

export async function verifyToken(token: string): Promise<boolean> {
  try {
    await jwtVerify(token, secret);
    return true;
  } catch {
    return false;
  }
}

export async function verifyAdmin(request: Request): Promise<boolean> {
  try {
    const cookieHeader = request.headers.get('cookie');
    if (!cookieHeader) return false;
    
    const cookies = cookieHeader.split(';').reduce((acc, cookie) => {
      const [key, value] = cookie.trim().split('=');
      acc[key] = value;
      return acc;
    }, {} as Record<string, string>);
    
    const token = cookies['admin-token'];
    if (!token) return false;
    
    return await verifyToken(token);
  } catch {
    return false;
  }
}