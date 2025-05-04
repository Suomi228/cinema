"use server";
import { cookies } from "next/headers";
import { verifyToken } from "../auth";
import { prisma } from "../prisma";

export async function updateUser(
  id: number,
  data: Partial<{ email: string; password?: string; avatar?: string }>
) {
  const currentUser = await getCurrentUser();

  if (!currentUser || currentUser.id !== id) {
    throw new Error("Нет прав для обновления этого пользователя");
  }

  return await prisma.user.update({
    where: { id },
    data: {
      email: data.email,
      password: data.password,
      avatar: data.avatar,
    },
  });
}
export async function checkIsAdmin() {
  const token = (await cookies()).get("token")?.value;
  if (!token) return false;

  try {
    const decoded = verifyToken(token);
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
    });

    return user?.role === "ADMIN";
  } catch {
    return false;
  }
}

export async function getCurrentUser(): Promise<User | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) return null;

  try {
    const payload = verifyToken(token) as { userId: number };
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
    });

    return user;
  } catch {
    return null;
  }
}
