import { jwtVerify } from 'jose';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error('Please define the JWT_SECRET environment variable inside .env.local');
}
const secret = new TextEncoder().encode(JWT_SECRET);

export async function middleware(req: NextRequest) {
  const token = req.headers.get('authorization')?.split(' ')[1];

  if (!token) {
    return NextResponse.json({ message: 'Authentication token is missing' }, { status: 401 });
  }

  try {
    const { payload } = await jwtVerify(token, secret);
    
    const requestHeaders = new Headers(req.headers);
    requestHeaders.set('X-User-Id', payload.userId as string);
    requestHeaders.set('X-User-Role', payload.role as string);

    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });

  } catch (error) {
    return NextResponse.json({ message: 'Invalid or expired token' }, { status: 401 });
  }
}

export const config = {
  matcher: [
    '/api/events', // POST requests
    '/api/proposals', // POST requests
    '/api/proposals/:path*/vote',
    '/api/events/:path*/join',
    '/api/auth/me'
  ],
}
