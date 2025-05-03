import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";

export async function POST(
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

  const movieId = parseInt(params.id);
  if (isNaN(movieId)) {
    return NextResponse.json({ error: "Invalid movie ID" }, { status: 400 });
  }

  const { value } = await req.json();

  if (typeof value !== "number" || value < 1 || value > 5) {
    return NextResponse.json(
      { error: "Rating must be between 1 and 5" },
      { status: 400 }
    );
  }

  try {
    const existingRating = await prisma.rating.findUnique({
      where: {
        userId_movieId: {
          userId,
          movieId,
        },
      },
    });

    let rating;
    if (existingRating) {
      rating = await prisma.rating.update({
        where: {
          userId_movieId: {
            userId,
            movieId,
          },
        },
        data: {
          value,
        },
      });
    } else {
      rating = await prisma.rating.create({
        data: {
          userId,
          movieId,
          value,
        },
      });
    }

    const movieRatings = await prisma.rating.findMany({
      where: { movieId },
    });
    const averageRating =
      movieRatings.reduce((sum, r) => sum + r.value, 0) / movieRatings.length;

    return NextResponse.json(
      {
        ...rating,
        averageRating,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error saving rating:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
