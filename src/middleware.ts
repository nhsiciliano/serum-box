import { NextResponse, NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(request: NextRequest) {
    const token = await getToken({ req: request });
    
    // Redirigir a verificación si el email no está verificado
    if (token?.user && !token.user.emailVerified) {
        const verifyEmailUrl = new URL('/verify-email', request.url);
        verifyEmailUrl.searchParams.set('email', token.user.email || '');
        return NextResponse.redirect(verifyEmailUrl);
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        '/dashboard/:path*',
        // Agregar otras rutas protegidas aquí
    ]
};

