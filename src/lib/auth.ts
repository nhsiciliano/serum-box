import { NextAuthOptions } from "next-auth";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import prisma from "./prisma";

export const authOptions: NextAuthOptions = {
    adapter: PrismaAdapter(prisma),
    callbacks: {
        session: async ({ session, user }) => {
            return {
                ...session,
                user: {
                    ...session.user,
                    id: user.id,
                    planType: user.planType,
                    planStartDate: user.planStartDate?.toISOString(),
                }
            };
        },
    },
    providers: []
};
