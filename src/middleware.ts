import { NextResponse, NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

// Extender el tipo JWT si necesitas propiedades adicionales
declare module 'next-auth/jwt' {
    interface JWT {
        emailVerified: boolean;
        email?: string;
    }
}

export async function middleware(request: NextRequest) {
    const token = await getToken({ 
        req: request,
        secret: process.env.NEXTAUTH_SECRET 
    });
    
    if (token && !(token.emailVerified)) {
        const verifyEmailUrl = new URL('/verify-email', request.url);
        verifyEmailUrl.searchParams.set('email', token.email || '');
        return NextResponse.redirect(verifyEmailUrl);
    }

    if (!token) {
        const signInUrl = new URL('/login', request.url);
        signInUrl.searchParams.set('callbackUrl', request.url);
        return NextResponse.redirect(signInUrl);
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        '/dashboard/:path*',
        // Agregar otras rutas protegidas aquí
    ]
};

