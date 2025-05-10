// components/MovieCard.tsx
"use client";

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Star } from "lucide-react";

type Movie = {
  id: number;
  title: string;
  description: string;
  genre: string;
  releaseDate: string;
  imageUrl: string;
  averageRating?: number;
};

type Props = {
  movie: Movie;
  toggleFavorite: (movie: Movie) => void;
  isFavorite: (id: number) => boolean;
  loadingStates: Record<number, boolean>;
};

export function MovieCard({
  movie,
  toggleFavorite,
  isFavorite,
  loadingStates,
}: Props) {
  return (
    <Card key={movie.id} className="flex flex-col h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">{movie.title}</CardTitle>
        <CardDescription className="flex items-center gap-2">
          <Badge variant="outline">{movie.genre}</Badge>
          <span>{new Date(movie.releaseDate).getFullYear()}</span>
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-grow space-y-4">
        <img
          src={movie.imageUrl}
          alt={movie.title}
          className="w-full h-48 object-contain rounded"
        />
        <p className="text-sm text-gray-700 line-clamp-2">
          {movie.description}
        </p>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
            <span className="text-sm text-gray-600">
              {movie.averageRating?.toFixed(1) || "-"}
            </span>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button
          onClick={() => toggleFavorite(movie)}
          disabled={loadingStates[movie.id]}
          variant={isFavorite(movie.id) ? "secondary" : "default"}
          className="w-full"
        >
          {loadingStates[movie.id]
            ? "Загрузка..."
            : isFavorite(movie.id)
            ? "Удалить из избранного"
            : "Добавить в избранное"}
        </Button>
      </CardFooter>
    </Card>
  );
}
