// lib/checkAdmin.ts
import { cookies } from "next/headers";
import { verifyToken } from "./auth";
import { prisma } from "./prisma";

export async function checkIsAdmin() {
  const token = (await cookies()).get("token")?.value;
  if (!token) return false;

  try {
    const decoded = verifyToken(token);
    const user = await prisma.user.findUnique({ where: { id: decoded.userId } });

    return user?.role === "ADMIN";
  } catch {
    return false;
  }
}
