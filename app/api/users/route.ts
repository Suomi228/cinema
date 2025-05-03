// app/api/users/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import cloudinary from "@/lib/cloudinary";
import { checkIsAdmin } from "@/lib/chekIsAdmin";

const defaultAvatarUrl = await cloudinary.uploader.upload(
  "https://greekherald.com.au/wp-content/uploads/2020/07/default-avatar.png",
  {
    folder: "avatars",
    public_id: `user_${Date.now()}`,
    overwrite: true,
  }
);

export async function DELETE(req: Request) {
  const isAdmin = await checkIsAdmin();
  if (!isAdmin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  try {
    const { id } = await req.json();

    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (user.avatar && user.avatar.includes("res.cloudinary.com")) {
      const matches = user.avatar.match(/\/avatars\/([^/.]+)\./);
      if (matches) {
        const publicId = `avatars/${matches[1]}`;
        await cloudinary.uploader.destroy(publicId);
      }
    }

    await prisma.user.delete({ where: { id } });

    return NextResponse.json({ message: "User deleted" });
  } catch (error) {
    console.error("Error deleting user:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { id, email, password, role, avatar } = body;

    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        email,
        password,
        role,
        avatar,
      },
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to update user" },
      { status: 500 }
    );
  }
}

export async function GET() {
  const users = await prisma.user.findMany();
  return NextResponse.json(users);
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, password, role } = body;
    const hashedPassword = await bcrypt.hash(password, 10);
    if (!email || !password || !role) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        role,
        avatar: defaultAvatarUrl.secure_url,
      },
    });

    return NextResponse.json(user, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
