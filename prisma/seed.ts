import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  // 1. Хэш паролей
  const adminPassword = await bcrypt.hash("admin@gmail.com", 10);
  const userPassword = await bcrypt.hash("password123", 10);

  // 2. Пользователи
  const users = await prisma.user.createMany({
    data: [
      {
        email: "admin@gmail.com",
        password: adminPassword,
        role: "ADMIN",
      },
      {
        email: "user1@gmail.com",
        password: userPassword,
      },
      {
        email: "user2@gmail.com",
        password: userPassword,
      },
      {
        email: "user3@gmail.com",
        password: userPassword,
      },
      {
        email: "user4@gmail.com",
        password: userPassword,
      },
    ],
  });

  // 3. Фильмы
  const movies = await prisma.movie.createMany({
    data: [
      {
        title: "Интерстеллар",
        description: "Космическая экспедиция сквозь червоточину.",
        genre: "Sci-Fi",
        releaseDate: new Date("2014-11-07"),
        imageUrl:
          "https://greekherald.com.au/wp-content/uploads/2020/07/default-avatar.png",
      },
      {
        title: "Начало",
        description: "Погружение в мир снов и реальности.",
        genre: "Action",
        releaseDate: new Date("2010-07-16"),
        imageUrl:
          "https://greekherald.com.au/wp-content/uploads/2020/07/default-avatar.png",
      },
      {
        title: "Матрица",
        description: "Выбор между синим и красным.",
        genre: "Sci-Fi",
        releaseDate: new Date("1999-03-31"),
        imageUrl:
          "https://greekherald.com.au/wp-content/uploads/2020/07/default-avatar.png",
      },
      {
        title: "Темный рыцарь",
        description: "Бэтмен против Джокера.",
        genre: "Action",
        releaseDate: new Date("2008-07-18"),
        imageUrl:
          "https://greekherald.com.au/wp-content/uploads/2020/07/default-avatar.png",
      },
      {
        title: "Аватар",
        description: "Мир Пандоры и слияние культур.",
        genre: "Fantasy",
        releaseDate: new Date("2009-12-18"),
        imageUrl:
          "https://greekherald.com.au/wp-content/uploads/2020/07/default-avatar.png",
      },
    ],
  });

  // Получаем пользователей и фильмы для связи
  const allUsers = await prisma.user.findMany();
  const allMovies = await prisma.movie.findMany();

  // 4. Избранное (каждому юзеру по одному фильму)
  for (let i = 0; i < allUsers.length; i++) {
    await prisma.favorite.create({
      data: {
        userId: allUsers[i].id,
        movieId: allMovies[i % allMovies.length].id,
      },
    });
  }

  // 5. Оценки
  for (let i = 0; i < allUsers.length; i++) {
    await prisma.rating.create({
      data: {
        userId: allUsers[i].id,
        movieId: allMovies[(i + 1) % allMovies.length].id,
        value: Math.floor(Math.random() * 5) + 1,
      },
    });
  }

  console.log("✅ Seed completed");
}

main()
  .catch((e) => {
    console.error("❌ Seed error:", e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
