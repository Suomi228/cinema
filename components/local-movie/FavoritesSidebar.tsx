// components/FavoritesSidebar.tsx
"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Heart } from "lucide-react";
import { FavoriteItem } from "./FavoriteItem";

type Props = {
  favorites: Array<{
    id: number;
    title: string;
    genre: string;
    imageUrl: string;
    averageRating?: number;
  }>;
  toggleFavorite: (movie: any) => void;
  loadingStates: Record<number, boolean>;
};

export function FavoritesSidebar({
  favorites,
  toggleFavorite,
  loadingStates,
}: Props) {
  return (
    <div className="lg:w-80 space-y-4">
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
                  <FavoriteItem
                    key={movie.id}
                    movie={movie}
                    toggleFavorite={toggleFavorite}
                    loadingStates={loadingStates}
                  />
                ))}
              </div>
            </ScrollArea>
          ) : (
            <div className="flex flex-col items-center justify-center text-center">
              <Heart className="h-8 w-8 text-gray-400" />
              <p className="text-gray-500">Нет избранных фильмов</p>
              <p className="text-sm text-gray-400">
                Добавляйте фильмы, нажимая на кнопку ниже
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
