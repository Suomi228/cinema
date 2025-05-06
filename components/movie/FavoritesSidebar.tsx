"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Heart, Film } from "lucide-react";
import { Badge } from "../ui/badge";
import { FavoriteMovieItem } from "./FavoriteMovieItem";

type Props = {
  favorites: Movie[];
  user: User;
  toggleFavorite: (id: number) => void;
  loadingStates: Record<number, boolean>;
};

export function FavoritesSidebar({
  favorites,
  user,
  toggleFavorite,
  loadingStates,
}: Props) {
  return (
    <div className="lg:w-96 space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5 text-red-500 fill-red-500" />
            <span>Избранное</span>
            <Badge variant="secondary" className="ml-auto">
              {favorites.length}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {favorites.length > 0 ? (
            <ScrollArea className="lg:h-[calc(100vh-200px)] pr-4">
              <div className="space-y-3">
                {favorites.map((movie) => (
                  <FavoriteMovieItem
                    key={movie.id}
                    movie={movie}
                    user={user}
                    toggleFavorite={toggleFavorite}
                    loadingStates={loadingStates}
                  />
                ))}
              </div>
            </ScrollArea>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 gap-2 text-center">
              <Heart className="h-8 w-8 text-gray-400" />
              <p className="text-gray-500">Нет избранных фильмов</p>
              <p className="text-sm text-gray-400">
                Добавляйте фильмы, нажимая на кнопку В избранное
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
