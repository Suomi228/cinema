"use client";

import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { StarRating } from "./StarRating";
import { Card } from "../ui/card";

type Props = {
  movie: Movie;
  user: User | null;
  isFavorite: (id: number) => boolean;
  toggleFavorite: (id: number) => void;
  handleRateMovie: (id: number, rating: number) => void;
  loadingStates: Record<number, boolean>;
  ratingLoading: Record<number, boolean>;
};

export function MovieCard({
  movie,
  user,
  isFavorite,
  toggleFavorite,
  handleRateMovie,
  loadingStates,
  ratingLoading,
}: Props) {
  return (
    <Card className="flex flex-col h-full">
      <div className="pb-2 px-5 pt-5">
        <h3 className="text-lg font-medium truncate">
          {movie.title.length > 20
            ? `${movie.title.slice(0, 20)}...`
            : movie.title}
        </h3>
        <div className="flex items-center gap-2 mt-1 text-sm text-gray-500">
          <Badge variant="outline">{movie.genre}</Badge>
          <span>{new Date(movie.releaseDate).getFullYear()}</span>
        </div>
      </div>

      <div className="px-5">
        <img
          src={movie.imageUrl}
          alt={movie.title}
          className="w-full h-48 object-contain rounded mb-4"
        />
      </div>

      <div className="px-5 space-y-4 flex-grow">
        <p className="text-sm text-gray-700 line-clamp-2">
          {movie.description.length > 30
            ? `${movie.description.slice(0, 30)}...`
            : movie.description}
        </p>

        <div className="space-y-2">
          <div className="flex items-center gap-1">
            <StarRating
              rating={Math.round(movie.averageRating || 0)}
              disabled
            />
            {movie.averageRating && (
              <span className="text-sm text-gray-600 ml-1">
                {movie.averageRating.toFixed(1)}
              </span>
            )}
          </div>

          {user && (
            <div>
              <label className="text-sm font-medium">Ваша оценка:</label>
              <StarRating
                rating={movie.userRating || 0}
                onRatingChange={(rating) => handleRateMovie(movie.id, rating)}
                disabled={ratingLoading[movie.id]}
              />
            </div>
          )}
        </div>
      </div>

      <div className="p-5">
        <Button
          onClick={() => toggleFavorite(movie.id)}
          disabled={!user || loadingStates[movie.id]}
          variant={isFavorite(movie.id) ? "secondary" : "default"}
          className="w-full"
        >
          {loadingStates[movie.id]
            ? "Загрузка..."
            : isFavorite(movie.id)
            ? "Удалить из избранного"
            : "Добавить в избранное"}
        </Button>
      </div>
    </Card>
  );
}
