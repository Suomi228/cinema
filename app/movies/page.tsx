"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "sonner";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Star } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { zodResolver } from "@hookform/resolvers/zod";
import { Resolver, useForm } from "react-hook-form";
import * as z from "zod";

type Movie = {
  id: number;
  title: string;
  description: string;
  genre: string;
  releaseDate: string;
  imageUrl: string;
  averageRating?: number;
  userRating?: number;
};

type User = {
  id: number;
  role: "USER" | "ADMIN";
  favorites: { movieId: number }[];
};

const StarRating = ({
  rating,
  onRatingChange,
  disabled = false,
}: {
  rating: number;
  onRatingChange?: (rating: number) => void;
  disabled?: boolean;
}) => (
  <div className="flex items-center">
    {[1, 2, 3, 4, 5].map((star) => (
      <Button
        key={star}
        variant="ghost"
        size="icon"
        onClick={() => onRatingChange?.(star)}
        disabled={disabled}
        className="h-8 w-8 p-0"
      >
        <Star
          className={`h-5 w-5 ${
            star <= rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
          }`}
        />
      </Button>
    ))}
  </div>
);

const movieFormSchema = z.object({
  title: z.string().min(1, "Название обязательно").max(30),
  description: z.string().min(1, "Описание обязательно").max(100),
  genre: z.string().min(1, "Выберите жанр"),
  releaseDate: z.string().min(1, "Дата выхода обязательна"),
  image: z
    .instanceof(File, { message: "Постер обязателен" })
    .refine(
      (file) => file.size <= 5 * 1024 * 1024,
      "Максимальный размер файла 5MB"
    )
    .refine(
      (file) => ["image/jpeg", "image/png", "image/webp"].includes(file.type),
      "Только .jpg, .png или .webp форматы"
    ),
});

type MovieFormValues = z.infer<typeof movieFormSchema>;

export default function MoviesPage() {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [loadingStates, setLoadingStates] = useState<Record<number, boolean>>(
    {}
  );
  const [ratingLoading, setRatingLoading] = useState<Record<number, boolean>>(
    {}
  );
  const [isLoading, setIsLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);

  const form = useForm<MovieFormValues>({
    resolver: zodResolver(movieFormSchema) as Resolver<MovieFormValues>,
    defaultValues: {
      title: "",
      description: "",
      genre: "",
      releaseDate: "",
      image: undefined,
    },
  });

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    setValue,
    watch,
    trigger,
  } = form;

  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const fetchMovies = async () => {
    try {
      const res = await axios.get("/api/movies");
      setMovies(res.data);
    } catch (err) {
      toast.error("Не удалось загрузить фильмы");
    }
  };

  const fetchUserData = async () => {
    try {
      const res = await axios.get("/api/auth/me");
      setUser(res.data);
    } catch {
      console.log("User not authenticated");
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      await Promise.all([fetchMovies(), fetchUserData()]);
      setIsLoading(false);
    };
    fetchData();
  }, []);

  const isFavorite = (movieId: number) =>
    user?.favorites?.some((f) => f.movieId === movieId);

  const handleRateMovie = async (movieId: number, value: number) => {
    if (!user) return;

    try {
      setRatingLoading((prev) => ({ ...prev, [movieId]: true }));
      await axios.post(`/api/movies/${movieId}/rating`, { value });
      await fetchMovies();
      toast.success("Оценка сохранена");
    } catch (error) {
      toast.error("Ошибка оценки");
    } finally {
      setRatingLoading((prev) => ({ ...prev, [movieId]: false }));
    }
  };

  const toggleFavorite = async (movieId: number) => {
    if (!user) {
      toast.error("Требуется авторизация");
      return;
    }

    try {
      setLoadingStates((prev) => ({ ...prev, [movieId]: true }));

      if (isFavorite(movieId)) {
        await axios.delete(`/api/movies/${movieId}/favorite`);
        toast.success("Фильм успешно удален из избранного");
      } else {
        await axios.post(`/api/movies/${movieId}/favorite`);
        toast.success("Фильм успешно добавлен в ваше избранное");
      }

      await fetchUserData();
    } catch (err) {
      toast.error("Не удалось обновить избранное");
    } finally {
      setLoadingStates((prev) => ({ ...prev, [movieId]: false }));
    }
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      const file = e.target.files[0];
      setValue("image", file);
      await trigger("image");

      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = async (data: MovieFormValues) => {
    try {
      const formData = new FormData();
      formData.append("title", data.title);
      formData.append("description", data.description || "");
      formData.append("genre", data.genre);
      formData.append("releaseDate", data.releaseDate);
      formData.append("image", data.image);

      await axios.post("/api/movies", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      await fetchMovies();
      setOpenDialog(false);
      reset();
      setImagePreview(null);
      toast.success("Фильм успешно добавлен");
    } catch (error) {
      toast.error("Не удалось добавить фильм");
    }
  };

  if (isLoading) {
    return (
      <div className="p-4">
        <div className="flex justify-between items-center mb-6">
          <Skeleton className="h-8 w-24" /> <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-3/4" />
              </CardHeader>
              <CardContent className="space-y-2">
                <Skeleton className="h-48 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-1/2" />
              </CardContent>
              <CardFooter className="flex justify-between">
                <Skeleton className="h-10 w-24" />
                <Skeleton className="h-10 w-24" />
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Фильмы</h1>

        {user?.role === "ADMIN" && (
          <Dialog open={openDialog} onOpenChange={setOpenDialog}>
            <DialogTrigger asChild>
              <Button>Добавить фильм</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Добавить новый фильм</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="title">Название фильма</Label>
                      <Input id="title" {...register("title")} />
                      {errors.title && (
                        <p className="text-sm text-red-500 mt-1">
                          {errors.title.message}
                        </p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="description">Описание</Label>
                      <Textarea
                        id="description"
                        {...register("description")}
                        rows={3}
                        className="resize-none"
                      />
                      {errors.description && (
                        <p className="text-sm text-red-500 mt-1">
                          {errors.description.message}
                        </p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="genre">Жанр</Label>
                      <Select
                        {...register("genre")}
                        onValueChange={(value) => setValue("genre", value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Выберите жанр" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Комедия">Комедия</SelectItem>
                          <SelectItem value="Драма">Драма</SelectItem>
                          <SelectItem value="Боевик">Боевик</SelectItem>
                          <SelectItem value="Фантастика">Фантастика</SelectItem>
                          <SelectItem value="Ужасы">Ужасы</SelectItem>
                        </SelectContent>
                      </Select>
                      {errors.genre && (
                        <p className="text-sm text-red-500 mt-1">
                          {errors.genre.message}
                        </p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="releaseDate">Дата выхода</Label>
                      <Input
                        id="releaseDate"
                        type="date"
                        {...register("releaseDate")}
                      />
                      {errors.releaseDate && (
                        <p className="text-sm text-red-500 mt-1">
                          {errors.releaseDate.message}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="image">Постер фильма</Label>
                      <Input
                        id="image"
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                      />
                      {errors.image && (
                        <p className="text-sm text-red-500 mt-1">
                          {errors.image.message}
                        </p>
                      )}
                    </div>
                    {imagePreview && (
                      <div className="mt-4">
                        <Label>Предпросмотр:</Label>
                        <img
                          src={imagePreview}
                          alt="Предпросмотр постера"
                          className="w-full h-48 object-contain border rounded mt-2"
                        />
                      </div>
                    )}
                  </div>
                </div>
                <Button
                  type="submit"
                  className="w-full"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Добавление..." : "Добавить фильм"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {movies.map((movie) => (
          <Card key={movie.id} className="flex flex-col h-full">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">
                {movie.title.length > 20
                  ? movie.title.slice(0, 20) + "..."
                  : movie.title}
              </CardTitle>
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
              <p className="text-sm text-gray-700">
                {movie.description.length > 30
                  ? movie.description.slice(0, 30) + "..."
                  : movie.description}
              </p>

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <StarRating
                    rating={Math.round(movie.averageRating || 0)}
                    disabled
                  />
                  {movie.averageRating && (
                    <span className="text-sm text-gray-600">
                      {movie.averageRating.toFixed(1)}
                    </span>
                  )}
                </div>

                {user && (
                  <div>
                    <Label>Ваша оценка:</Label>
                    <StarRating
                      rating={movie.userRating || 0}
                      onRatingChange={(rating) =>
                        handleRateMovie(movie.id, rating)
                      }
                      disabled={ratingLoading[movie.id]}
                    />
                  </div>
                )}
              </div>
            </CardContent>
            <CardFooter>
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
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
