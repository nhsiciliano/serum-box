import 'next-auth';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { JWT } from 'next-auth/jwt';

declare module 'next-auth' {
    interface Session {
        user: {
            id: string;
            email?: string | null;
            name?: string | null;
            emailVerified: boolean;
            isMainUser: boolean;
        }
    }

    interface User {
        id: string;
        email: string;
        name?: string;
        emailVerified: boolean;
        isMainUser: boolean;
    }
}

declare module 'next-auth/jwt' {
    interface JWT {
        id: string;
        emailVerified: boolean;
        isMainUser?: boolean;
    }
}
