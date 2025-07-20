import { NextAuthOptions, DefaultSession, User } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import bcrypt from "bcryptjs"
import prisma from '@/lib/prisma'
import { PlanType } from "@/types/plans"

// Extender los tipos de NextAuth
declare module "next-auth" {
    interface Session {
        user: {
            id: string;
            planType?: PlanType;
            trialEndsAt?: string | null;
            paypalSubscriptionId?: string | null;
            isMainUser?: boolean;
            planStartDate?: string;
            emailVerified?: boolean;
        } & DefaultSession["user"]
    }
    interface User {
        planType: PlanType;
        trialEndsAt?: string | null;
        paypalSubscriptionId?: string | null;
        isMainUser: boolean;
        planStartDate: string;
        emailVerified: boolean;
    }

    interface JWT {
        id?: string;
        planType?: PlanType;
        trialEndsAt?: string | null;
        paypalSubscriptionId?: string | null;
        isMainUser?: boolean;
        planStartDate?: string;
        emailVerified?: boolean;
    }
}

export const authOptions: NextAuthOptions = {
    providers: [
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "text" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials): Promise<User | null> {
                if (!credentials?.email || !credentials?.password) {
                    throw new Error('Invalid credentials');
                }

                const user = await prisma.user.findUnique({
                    where: { email: credentials.email }
                });

                if (!user || !user.emailVerified) {
                    throw new Error('Please verify your email');
                }

                const isPasswordValid = await bcrypt.compare(credentials.password, user.password || '')
                if (!isPasswordValid) {
                    return null;
                }

                return {
                    id: user.id,
                    email: user.email || '',
                    name: user.name || '',
                    planType: (user.planType as PlanType) || 'free',
                    trialEndsAt: user.trialEndsAt?.toISOString() || null,
                    paypalSubscriptionId: user.paypalSubscriptionId || null,
                    isMainUser: user.isMainUser || false,
                    planStartDate: user.planStartDate?.toISOString() || '',
                    emailVerified: !!user.emailVerified, // Corregido a booleano
                };
            }
        }),
    ],
    pages: {
        signIn: '/login',
        error: '/auth/error',
    },
    session: {
        strategy: 'jwt',
        maxAge: 30 * 24 * 60 * 60, // 30 días
    },
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id;
                token.isMainUser = user.isMainUser;
                token.planType = user.planType;
                token.trialEndsAt = user.trialEndsAt;
                token.paypalSubscriptionId = user.paypalSubscriptionId;
                token.planStartDate = user.planStartDate;
                token.emailVerified = !!user.emailVerified; // Asegurar que siempre sea booleano
            }
            return token;
        },
        async session({ session, token }) {
            if (session.user && token) {
                session.user.id = token.id as string;
                session.user.isMainUser = token.isMainUser as boolean;
                session.user.planType = token.planType as PlanType;
                session.user.trialEndsAt = token.trialEndsAt as string | null;
                session.user.paypalSubscriptionId = token.paypalSubscriptionId as string | null;
                session.user.planStartDate = token.planStartDate as string;
                session.user.emailVerified = token.emailVerified as boolean;
            }
            return session;
        }
    },
    secret: process.env.NEXTAUTH_SECRET,
};
