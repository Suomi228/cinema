import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt, { hash } from "bcryptjs";
import cloudinary from "@/lib/cloudinary";
import { checkIsAdmin, getCurrentUser } from "@/lib/actions/user.actions";
import axios from "axios";

const defaultAvatarUrl = await cloudinary.uploader.upload(
  "https://greekherald.com.au/wp-content/uploads/2020/07/default-avatar.png",
  {
    folder: "avatars",
    public_id: `user_${Date.now()}`,
    overwrite: true,
  }
);

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

export async function PUT(req: Request) {
  const isAdmin = await checkIsAdmin();
  if (!isAdmin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const formData = await req.formData();
    const id = Number(formData.get("id"));
    const email = formData.get("email") as string;
    const role = formData.get("role") as "ADMIN" | "USER";
    const password = formData.get("password") as string | null;
    const file = formData.get("file") as File | null;

    const existingUser = await prisma.user.findUnique({ where: { id } });
    if (!existingUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    let avatarUrl = existingUser.avatar;

    if (file) {
      const uploadResponse = await axios.post("http://localhost:3000/api/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      avatarUrl = uploadResponse.data.url;
    }

    const updateData: {
      email: string;
      role: "ADMIN" | "USER";
      avatar?: string;
      password?: string;
    } = {
      email,
      role,
      avatar: avatarUrl,
    };
    if (password && password.trim() !== "") {
      updateData.password = await hash(password, 10);
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: updateData,
    });

    const { password: _, ...userWithoutPassword } = updatedUser;

    return NextResponse.json(userWithoutPassword);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to update user" },
      { status: 500 }
    );
  }
}

export async function GET() {
  const isAdmin = await checkIsAdmin();
  if (!isAdmin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const users = await prisma.user.findMany({
    where: {
      isDeleted: false,
    },
  });
  return NextResponse.json(users);
}

export async function DELETE(req: Request) {
  const isAdmin = await checkIsAdmin();
  if (!isAdmin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  try {
    const { id } = await req.json();
    const currentUser = await getCurrentUser();
    if (currentUser?.id === id) {
      return NextResponse.json(
        { error: "You cannot delete yourself" },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    await prisma.user.update({
      where: { id },
      data: {
        isDeleted: true,
        email: `deleted_${Date.now()}_${user.email}`,
        avatar: "",
      },
    });

    if (user.avatar && user.avatar.includes("res.cloudinary.com")) {
      const matches = user.avatar.match(/\/avatars\/([^/.]+)\./);
      if (matches) {
        const publicId = `avatars/${matches[1]}`;
        await cloudinary.uploader.destroy(publicId);
      }
    }

    return NextResponse.json({ message: "User marked as deleted" });
  } catch (error) {
    console.error("Error deleting user:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
