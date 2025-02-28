import { type GetServerSidePropsContext } from "next";
import {
  getServerSession,
  type NextAuthOptions,
  type DefaultSession,
} from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { z } from "zod";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import bycrpt from "bcrypt";
import { prisma } from "~/server/db";
/**
 * Validates a CAS ticket
 * @param ticket The CAS ticket to validate
 * @param serviceUrl The URL of the service to validate the ticket against
 * @returns The username of the user if the ticket is valid, otherwise null
 */
async function validateCASTicket(ticket: string, serviceUrl: string) {
  try {
    const encodedServiceUrl = encodeURIComponent(serviceUrl);

    const validationUrl = `https://cas.sfu.ca/cas/serviceValidate?ticket=${ticket}&service=${encodedServiceUrl}`;

    const response = await fetch(validationUrl);

    if (!response.ok) {
      console.error(`[CAS] Validation failed: ${response.statusText}`);
      throw new Error(`CAS validation failed: ${response.statusText}`);
    }

    const xml = await response.text();
    console.log(`[CAS] Response XML: ${xml}`);

    // probably could improve this with a proper XML parser via a package
    if (xml.includes("<cas:authenticationSuccess>")) {
      const usernameMatch = xml.match(/<cas:user>(.*?)<\/cas:user>/);
      if (usernameMatch?.[1]) {
        const username = usernameMatch[1];
        return {
          success: true,
          username: username,
        };
      }
    }

    console.log(`[CAS] Authentication failed, no valid user found in response`);
    return { success: false };
  } catch (error) {
    console.error("[CAS] Error validating CAS ticket:", error);
    return { success: false };
  }
}
/**
 * Options for NextAuth.js used to configure adapters, providers, callbacks, etc.
 *
 * @see https://next-auth.js.org/configuration/options
 */

// Extend the session user type to include id
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
    } & DefaultSession["user"];
  }
}

export const authOptions: NextAuthOptions = {
  session: { strategy: "jwt" },
  callbacks: {
    // JWT Callback
    async jwt({ token, user }) {
      if (user) {
        console.log("[CAS] Setting JWT token with user data:", user);
        token.id = user.id;
      }
      return token;
    },
    // Session Callback
    async session({ session, token }) {
      if (token && session.user) {
        console.log("Setting session with token data:", token);
        session.user.id = token.id as string;
      }
      return session;
    },
  },
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      id: "credentials",
      name: "Credentials",
      credentials: {
        username: {
          label: "Username",
        },
        password: {
          label: "Password",
          type: "password",
        },
      },
      async authorize(credentials) {
        if (!credentials) return null;

        const user = await prisma.user.findUnique({
          where: {
            username: credentials.username,
          },
        });

        if (!user) return null;

        const hashedPassword = user.password;

        if (!hashedPassword) return null;

        const authenticated = await bycrpt.compare(
          credentials.password,
          hashedPassword,
        );

        if (!authenticated) return null;

        return user;
      },
    }),
    CredentialsProvider({
      id: "cas",
      name: "CAS",
      credentials: {
        ticket: { label: "Ticket", type: "text" },
        redirectUrl: { label: "Redirect URL", type: "text" },
      },
      async authorize(credentials) {
        try {
          const { ticket, redirectUrl } = z
            .object({
              ticket: z.string().min(1),
              redirectUrl: z.string().url(),
            })
            .parse(credentials);

          // Validate ticket with CAS server Helper Function
          const validation = await validateCASTicket(ticket, redirectUrl);

          if (validation.success) {
            const email = `${validation.username}@sfu.ca`;

            // Server logging
            console.log("[CAS] User authenticated successfully:", {
              id: validation.username,
              name: validation.username,
              email: email,
            });

            return {
              id: validation.username ?? "",
              name: validation.username,
              email: email,
            };
          }

          return null;
        } catch (error) {
          console.error("[CAS] Error during authorization:", error);
          return null;
        }
      },
    }),
  ],
  pages: {
    signIn: "/auth/signin",
  },
  debug: process.env.NODE_ENV === "development",
};

/**
 * Wrapper for `getServerSession` so that you don't need to import the `authOptions` in every file.
 *
 * @see https://next-auth.js.org/configuration/nextjs
 */
export const getServerAuthSession = (ctx: {
  req: GetServerSidePropsContext["req"];
  res: GetServerSidePropsContext["res"];
}) => {
  return getServerSession(ctx.req, ctx.res, authOptions);
};
