import { prisma } from "@/lib/prisma";
import cloudinary from "@/lib/cloudinary";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";

export async function GET() {
  try {
    const movies = await prisma.movie.findMany({
      include: {
        ratings: true,
        favorites: true,
      },
    });

    const moviesWithAverageRating = movies.map((movie) => {
      const averageRating =
        movie.ratings.length > 0
          ? movie.ratings.reduce((sum, r) => sum + r.value, 0) /
            movie.ratings.length
          : null;

      return {
        id: movie.id,
        title: movie.title,
        description: movie.description,
        genre: movie.genre,
        releaseDate: movie.releaseDate,
        imageUrl: movie.imageUrl,
        averageRating,
        favoritesCount: movie.favorites.length,
      };
    });

    return NextResponse.json(moviesWithAverageRating);
  } catch (error) {
    console.error("Error fetching movies:", error);
    return NextResponse.json(
      { error: "Failed to fetch movies" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  const cookieStore = cookies();
  const token = (await cookieStore).get("token")?.value;

  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let payload: { userId: number };
  try {
    payload = verifyToken(token) as { userId: number };
  } catch {
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: payload.userId },
  });

  if (!user || user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const formData = await req.formData();

  const title = formData.get("title")?.toString();
  const description = formData.get("description")?.toString();
  const genre = formData.get("genre")?.toString();
  const releaseDateStr = formData.get("releaseDate")?.toString();
  const image = formData.get("image") as File | null;

  if (!title || !description || !genre || !releaseDateStr || !image) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  const releaseDate = new Date(releaseDateStr);
  if (isNaN(releaseDate.getTime())) {
    return NextResponse.json({ error: "Invalid date" }, { status: 400 });
  }

  try {
    const arrayBuffer = await image.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const uploadResult = await new Promise<{ secure_url: string }>(
      (resolve, reject) => {
        cloudinary.uploader
          .upload_stream({ folder: "movies" }, (error, result) => {
            if (error || !result) return reject(error);
            resolve(result as { secure_url: string });
          })
          .end(buffer);
      }
    );

    const movie = await prisma.movie.create({
      data: {
        title,
        description,
        genre,
        releaseDate,
        imageUrl: uploadResult.secure_url,
      },
    });

    return NextResponse.json(movie);
  } catch (err) {
    console.error("Movie creation error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
