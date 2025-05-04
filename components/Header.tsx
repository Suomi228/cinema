"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useUser } from "@/context/UserContext";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
} from "@/components/ui/navigation-menu";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { LogOut, User, Film, Loader2 } from "lucide-react";
import { useState } from "react";
import axios from "axios";

export default function Header() {
  const { user, loading, refetchUser } = useUser();
  const pathname = usePathname();
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await axios.post("/api/auth/logout");
      await refetchUser();
      router.push("/sign-in");
    } catch (error) {
      console.error("Ошибка при выходе:", error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-4">
        <Link href="/" className="flex items-center space-x-2">
          <Film className="h-6 w-6 text-primary" />
          <span className="text-xl font-bold">КиноПортал</span>
        </Link>

        {loading ? (
          <div className="flex gap-4">
            <Skeleton className="w-20 h-9 rounded-md" />
            <Skeleton className="w-20 h-9 rounded-md" />
          </div>
        ) : (
          <nav className="flex items-center gap-2">
            {user ? (
              <>
                <NavigationMenu className="hidden md:block">
                  <NavigationMenuList className="gap-2">
                    <NavigationMenuItem>
                      <Link href="/movies" legacyBehavior passHref>
                        <Button
                          variant="ghost"
                          size="sm"
                          className={
                            pathname === "/movies"
                              ? "bg-black text-white hover:bg-black hover:text-white dark:bg-white dark:text-black dark:hover:bg-white dark:hover:text-black"
                              : ""
                          }
                        >
                          Фильмы
                        </Button>
                      </Link>
                    </NavigationMenuItem>
                    {user.role === "ADMIN" && (
                      <NavigationMenuItem>
                        <Link href="/users" legacyBehavior passHref>
                          <Button
                            variant="ghost"
                            size="sm"
                            className={
                              pathname === "/users"
                                ? "bg-black text-white hover:bg-black hover:text-white dark:bg-white dark:text-black dark:hover:bg-white dark:hover:text-black"
                                : ""
                            }
                          >
                            Пользователи
                          </Button>
                        </Link>
                      </NavigationMenuItem>
                    )}
                  </NavigationMenuList>
                </NavigationMenu>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="rounded-full h-9 w-9"
                    >
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={user.avatar} />
                        <AvatarFallback>
                          {user.email.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuItem asChild>
                      <Link href="/profile" className="flex items-center">
                        <User className="mr-2 h-4 w-4" />
                        <span>Профиль</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="cursor-pointer"
                      onClick={handleLogout}
                      disabled={isLoggingOut}
                    >
                      {isLoggingOut ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <LogOut className="mr-2 h-4 w-4" />
                      )}
                      <span>Выйти</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <div className="flex gap-2">
                <Link href="/sign-in">
                  <Button variant="outline" size="sm">
                    Вход
                  </Button>
                </Link>
                <Link href="/sign-up">
                  <Button size="sm">Регистрация</Button>
                </Link>
              </div>
            )}
          </nav>
        )}
      </div>
    </header>
  );
}
