import { verifyToken } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const token = (await cookies()).get("token")?.value;
    let userId: number | null = null;

    if (token) {
      try {
        const payload = verifyToken(token) as { userId: number };
        userId = payload.userId;
      } catch {
        userId = null;
      }
    }

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const favoriteMovies = await prisma.movie.findMany({
      where: {
        favorites: {
          some: {
            userId: userId,
          },
        },
      },
      include: {
        ratings: true,
        favorites: true,
      },
    });

    const result = favoriteMovies.map((movie) => {
      const averageRating =
        movie.ratings.length > 0
          ? movie.ratings.reduce((sum, r) => sum + r.value, 0) /
            movie.ratings.length
          : null;

      const userRating =
        movie.ratings.find((r) => r.userId === userId)?.value ?? null;

      return {
        id: movie.id,
        title: movie.title,
        description: movie.description,
        genre: movie.genre,
        releaseDate: movie.releaseDate,
        imageUrl: movie.imageUrl,
        averageRating,
        userRating,
        favoritesCount: movie.favorites.length,
      };
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error fetching favorite movies:", error);
    return NextResponse.json(
      { error: "Failed to fetch favorite movies" },
      { status: 500 }
    );
  }
}
