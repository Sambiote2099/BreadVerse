import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt"; // Import NextAuth's getToken

export async function proxy(req: NextRequest) {
  const path = req.nextUrl.pathname;
  
  console.log("🛡️ Middleware - Path:", path);
  
  // Skip middleware for public and auth-related routes
  const publicPaths = [
    "/",
    "/login",
    "/signup",
    "/api/auth", // NextAuth routes
    "/api/public", // Any public APIs
    "/api/gifts",
    "/api/products",
    "/api/orders",
    "/api/recommendations",
    "/verify-email",
    "/products",
    "/gift-box",
    "/about",
    '/api/auth/forgot-password',  // Add this
    '/api/auth/reset-password',
    '/forgot-password',    // Add this
    '/reset-password',    
    "/location",
    "/check-out",
    "/contact",
    "/_next", // Next.js static files
    "/favicon.ico",
    "/public",
    "/api/auth/verify-email" // Public assets
  ];
  
  // Check if path is public
  const isPublicPath = publicPaths.some(publicPath => 
    path === publicPath || path.startsWith(publicPath + "/")
  );
  
  if (isPublicPath) {
    console.log("🛡️ Middleware - Public path, allowing access");
    return NextResponse.next();
  }
  
  // Use NextAuth's getToken to check authentication
  const token = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET || "your-secret-key",
  });
  
  console.log("🛡️ Middleware - NextAuth token:", token ? "Present" : "Not present");
  
  // If no token and not public path, redirect to login
  if (!token) {
    console.log("🛡️ Middleware - No token, redirecting to login");
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("callbackUrl", encodeURI(req.url));
    return NextResponse.redirect(loginUrl);
  }
  
  console.log("🛡️ Middleware - User authenticated:", token.email);
  
  // Optional: Check for admin routes
  if (path.startsWith("/admin")) {
    console.log("🛡️ Middleware - Admin route detected");
    console.log("🛡️ Middleware - User role:", (token as any).role);
    
    // Check if user has admin role
    if ((token as any).role !== "admin") {
      console.log("🛡️ Middleware - Non-admin trying to access admin area");
      return NextResponse.redirect(new URL("/", req.url));
    }
    
    console.log("🛡️ Middleware - Admin access granted");
  }
  
  // Allow access for authenticated users
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * 1. api/auth routes (NextAuth)
     * 2. _next (Next.js internals)
     * 3. static files (/_next/static, /favicon.ico, etc.)
     * 4. public folder
     */
    "/((?!api/auth|_next/static|_next/image|favicon.ico|public/).*)",
  ],
};