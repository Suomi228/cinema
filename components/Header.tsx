"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useUser } from "@/context/UserContext";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

export default function Header() {
  const { user, loading } = useUser();
  const pathname = usePathname();

  return (
    <header className="border-b shadow-sm bg-white px-6 py-4 flex justify-between items-center">
      <Link href="/" className="text-xl font-semibold">
        🎬 КиноПортал
      </Link>

      {loading ? (
        <div className="flex gap-4">
          <Skeleton className="w-[80px] h-[36px] rounded-md" />
          <Skeleton className="w-[80px] h-[36px] rounded-md" />
        </div>
      ) : (
        <nav className="flex gap-2">
          {user ? (
            <>
              <NavLink href="/movies" active={pathname === "/movies"}>
                Фильмы
              </NavLink>
              <NavLink href="/profile" active={pathname === "/profile"}>
                Профиль
              </NavLink>
              {user.role === "ADMIN" && (
                <NavLink href="/users" active={pathname === "/users"}>
                  Пользователи
                </NavLink>
              )}
            </>
          ) : (
            <>
              <Link href="/sign-in">
                <Button variant="outline" size="sm">
                  Вход
                </Button>
              </Link>
              <Link href="/sign-up">
                <Button size="sm">Регистрация</Button>
              </Link>
            </>
          )}
        </nav>
      )}
    </header>
  );
}

function NavLink({
  href,
  children,
  active,
}: {
  href: string;
  children: React.ReactNode;
  active?: boolean;
}) {
  return (
    <Link href={href}>
      <Button
        variant={active ? "default" : "ghost"}
        size="sm"
        className={active ? "font-semibold" : ""}
      >
        {children}
      </Button>
    </Link>
  );
}
