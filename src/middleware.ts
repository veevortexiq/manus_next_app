import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Check for basic authentication
  const authHeader = request.headers.get('authorization');
  
  // Read credentials from environment variables
  // Provide fallbacks for development
  const username = process.env.AUTH_USERNAME 
  const password = process.env.AUTH_PASSWORD 
  
  if (authHeader) {
    // Authorization header exists, check if it's valid
    const authValue = authHeader.split(' ')[1];
    const [authUser, authPass] = Buffer.from(authValue, 'base64').toString().split(':');
    
    if (authUser === username && authPass === password) {
      // Authentication successful
      return NextResponse.next();
    }
  }
  
  // If we reach here, authentication failed or wasn't provided
  // Send a 401 response with WWW-Authenticate header to trigger the browser's login prompt
  return new NextResponse('Authentication required', {
    status: 401,
    headers: {
      'WWW-Authenticate': 'Basic realm="Secure Area", charset="UTF-8"'
    }
  });
}

// Configure middleware to run on all paths except static files
export const config = {
  matcher: [
    // Match all paths except for:
    // - API routes
    // - Static files (/_next/, /images/, etc)
    // - favicon.ico
    '/((?!api|_next/static|_next/image|images|favicon.ico|_next/data).*)',
  ],
};