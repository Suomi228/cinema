import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";
import { getCurrentUser } from "@/lib/actions/user.actions";
// Импортируйте функцию для получения текущего пользователя.

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  const user = await getCurrentUser(); // Получаем текущего пользователя.

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const movieId = parseInt(id); // Преобразуем id в число.
  if (isNaN(movieId)) {
    return NextResponse.json({ error: "Invalid movie ID" }, { status: 400 });
  }

  // Проверяем, есть ли фильм в избранном
  const existingFavorite = await prisma.favorite.findUnique({
    where: {
      userId_movieId: {
        userId: user.id,
        movieId: movieId,
      },
    },
  });

  if (existingFavorite) {
    return NextResponse.json(
      { error: "Movie already in favorites" },
      { status: 400 }
    );
  }

  // Добавляем фильм в избранное
  const favorite = await prisma.favorite.create({
    data: {
      userId: user.id,
      movieId: movieId,
    },
  });

  return NextResponse.json(favorite, { status: 201 });
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  const token = (await cookies()).get("token")?.value;

  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let userId: number;
  try {
    const payload = verifyToken(token) as { userId: number };
    userId = payload.userId;
  } catch {
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }

  const { id } = await params; // ✅ Разрешаем Promise
  const movieId = parseInt(id); // ✅ Без await для parseInt
  if (isNaN(movieId)) {
    return NextResponse.json({ error: "Invalid movie ID" }, { status: 400 });
  }

  try {
    const favorite = await prisma.favorite.findUnique({
      where: {
        userId_movieId: {
          userId,
          movieId,
        },
      },
    });

    if (!favorite) {
      return NextResponse.json({ error: "Not in favorites" }, { status: 404 });
    }

    await prisma.favorite.delete({
      where: {
        userId_movieId: {
          userId,
          movieId,
        },
      },
    });

    return NextResponse.json(
      { message: "Removed from favorites" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error removing from favorites:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
