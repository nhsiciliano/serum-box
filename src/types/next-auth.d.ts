import 'next-auth';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { JWT } from 'next-auth/jwt';

declare module 'next-auth' {
    interface Session {
        user: {
            id: string;
            email?: string | null;
            name?: string | null;
            planType: string;
            planStartDate: string;
            emailVerified: boolean;
        }
    }

    interface User {
        id: string;
        email: string;
        name?: string;
        planType: string;
        planStartDate: Date;
        emailVerified: boolean;
    }
}

declare module 'next-auth/jwt' {
    interface JWT {
        id: string;
        planType: string;
        planStartDate: string;
        emailVerified: boolean;
    }
}
