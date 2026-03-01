import { NextAuthOptions, DefaultSession, User } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import prisma from '@/lib/prisma'
import { createSupabaseServerClient } from '@/lib/supabase'

// Extender los tipos de NextAuth
declare module "next-auth" {
    interface Session {
        user: {
            id: string;
            isMainUser?: boolean;
            emailVerified?: boolean;
        } & DefaultSession["user"]
    }
    interface User {
        isMainUser: boolean;
        emailVerified: boolean;
    }

    interface JWT {
        id?: string;
        isMainUser?: boolean;
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

                const supabase = createSupabaseServerClient();
                const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
                    email: credentials.email,
                    password: credentials.password,
                });

                if (signInError || !signInData.user) {
                    const message = signInError?.message?.toLowerCase() || '';
                    if (message.includes('email not confirmed')) {
                        throw new Error('Please verify your email');
                    }
                    throw new Error('Invalid credentials');
                }

                if (!signInData.user.email_confirmed_at) {
                    throw new Error('Please verify your email');
                }

                const authUser = signInData.user;
                const authEmail = authUser.email;

                if (!authEmail) {
                    throw new Error('Invalid credentials');
                }

                const dbUserByAuthId = await prisma.user.findUnique({
                    where: { supabaseAuthId: authUser.id },
                });

                const dbUserByEmail = await prisma.user.findUnique({
                    where: { email: authEmail },
                });

                const existingUser = dbUserByAuthId || dbUserByEmail;

                const user = existingUser
                    ? await prisma.user.update({
                        where: { id: existingUser.id },
                        data: {
                            email: authEmail,
                            supabaseAuthId: authUser.id,
                            emailVerified: true,
                            name:
                                existingUser.name ||
                                (typeof authUser.user_metadata?.name === 'string'
                                    ? authUser.user_metadata.name
                                    : null),
                        },
                    })
                    : await prisma.user.create({
                        data: {
                            email: authEmail,
                            supabaseAuthId: authUser.id,
                            name:
                                typeof authUser.user_metadata?.name === 'string'
                                    ? authUser.user_metadata.name
                                    : null,
                            isMainUser: true,
                            emailVerified: true,
                        },
                    });

                return {
                    id: user.id,
                    email: user.email || '',
                    name: user.name || '',
                    isMainUser: user.isMainUser || false,
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
                token.emailVerified = !!user.emailVerified; // Asegurar que siempre sea booleano
            }
            return token;
        },
        async session({ session, token }) {
            if (session.user && token) {
                session.user.id = token.id as string;
                session.user.isMainUser = token.isMainUser as boolean;
                session.user.emailVerified = token.emailVerified as boolean;
            }
            return session;
        }
    },
    secret: process.env.NEXTAUTH_SECRET,
};
