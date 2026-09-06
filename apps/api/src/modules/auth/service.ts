import { betterAuth } from "better-auth";
import { prismaAdapter } from "@better-auth/prisma-adapter";
import { env } from "../../env.js";
import { prisma } from "../../lib/prisma.js";

export const auth = betterAuth({
  applicationName: "Superassistant",
  secret: env.betterAuthSecret,
  baseURL: env.betterAuthUrl,
  trustedOrigins: [env.webOrigin],
  database: prismaAdapter(prisma, { provider: "postgresql" }),
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
  },
  advanced: {
    database: {
      joins: true,
    },
  },
});

export type AuthUser = {
  id: string;
  name: string;
  email: string;
};

function toPublicUser(user: { id: string; name: string; email: string }): AuthUser {
  return { id: user.id, name: user.name, email: user.email };
}

export async function register(input: {
  name: string;
  email: string;
  password: string;
}): Promise<{ user: AuthUser; headers: Headers }> {
  const result = await auth.api.signUpEmail({
    body: {
      name: input.name,
      email: input.email,
      password: input.password,
    },
    returnHeaders: true,
  });

  return { user: toPublicUser(result.response.user), headers: result.headers };
}

export async function login(input: {
  email: string;
  password: string;
}): Promise<{ user: AuthUser | null; headers: Headers }> {
  const result = await auth.api.signInEmail({
    body: {
      email: input.email,
      password: input.password,
    },
    returnHeaders: true,
  });

  return {
    user: result.response.user ? toPublicUser(result.response.user) : null,
    headers: result.headers,
  };
}
