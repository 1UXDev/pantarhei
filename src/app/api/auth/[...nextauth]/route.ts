import { handlers } from "@/auth";
export const { GET, POST } = handlers;

import NextAuth from "next-auth";
import Google from "next-auth/providers/google";

export const { signIn, signOut, auth } = NextAuth({
  providers: [Google],
});
