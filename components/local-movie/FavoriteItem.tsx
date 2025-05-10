// components/FavoriteItem.tsx
"use client";

import { Button } from "@/components/ui/button";
import { Heart, Film } from "lucide-react";

type Props = {
  movie: {
    id: number;
    title: string;
    genre: string;
    imageUrl: string;
    averageRating?: number;
  };
  toggleFavorite: (movie: any) => void;
  loadingStates: Record<number, boolean>;
};

export function FavoriteItem({ movie, toggleFavorite, loadingStates }: Props) {
  return (
    <div
      key={movie.id}
      className="flex gap-3 items-start p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors"
    >
      <div className="relative">
        <img
          src={movie.imageUrl}
          alt={movie.title}
          className="w-16 h-16 object-cover rounded"
        />
        {movie.averageRating && (
          <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-white text-xs text-center py-0.5">
            {movie.averageRating.toFixed(1)}
          </div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="font-medium truncate">{movie.title}</h3>
        <div className="flex items-center gap-2 mt-1">
          <Film className="h-3 w-3 text-muted-foreground" />
          <span className="text-xs text-muted-foreground truncate">
            {movie.genre}
          </span>
        </div>
      </div>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => toggleFavorite(movie)}
        disabled={loadingStates[movie.id]}
        title="Удалить из избранного"
      >
        <Heart className="h-4 w-4 text-red-500 fill-red-500" />
      </Button>
    </div>
  );
}
