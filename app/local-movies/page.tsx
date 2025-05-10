// app/local-movies/page.tsx
"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";

import { FavoritesSidebar } from "@/components/local-movie/FavoritesSidebar";
import { MovieCard } from "@/components/local-movie/MovieCard";
import { AddMovieDialog } from "@/components/local-movie/AddMovieDialog";

type Movie = {
  id: number;
  title: string;
  description: string;
  genre: string;
  releaseDate: string;
  imageUrl: string;
  averageRating?: number;
};

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

export type MovieFormValues = z.infer<typeof movieFormSchema>;

export default function LocalMoviesPage() {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [favorites, setFavorites] = useState<Movie[]>([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [loadingStates, setLoadingStates] = useState<Record<number, boolean>>(
    {}
  );
  const [isLoading, setIsLoading] = useState(true);

  const form = useForm<MovieFormValues>({
    resolver: zodResolver(movieFormSchema),
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
    trigger,
  } = form;

  const fetchMovies = async () => {
    try {
      const res = await axios.get("/api/movies");
      setMovies(res.data);
    } catch (error) {
      toast.error("Не удалось загрузить фильмы");
    } finally {
      setIsLoading(false);
    }
  };
  useEffect(() => {
    fetchMovies();
  }, []);

  const handleAddMovie = async (data: MovieFormValues) => {
    try {
      const formData = new FormData();
      formData.append("title", data.title);
      formData.append("description", data.description);
      formData.append("genre", data.genre);
      formData.append("releaseDate", data.releaseDate);
      formData.append("image", data.image);

      const res = await axios.post("/api/movies", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      const newMovie = res.data;
      setMovies((prev) => [...prev, newMovie]);
      setOpenDialog(false);
      reset();
      setImagePreview(null);
      toast.success("Фильм успешно добавлен");
    } catch (error) {
      toast.error("Не удалось добавить фильм");
    }
  };

  const toggleFavorite = (movie: Movie) => {
    setLoadingStates((prev) => ({ ...prev, [movie.id]: true }));
    setTimeout(() => {
      if (favorites.some((f) => f.id === movie.id)) {
        setFavorites((prev) => prev.filter((f) => f.id !== movie.id));
      } else {
        setFavorites((prev) => [...prev, movie]);
      }
      setLoadingStates((prev) => ({ ...prev, [movie.id]: false }));
    }, 300);
  };

  const isFavorite = (id: number) => favorites.some((f) => f.id === id);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setValue("image", file);
      trigger("image");
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 p-4">
      <div className="flex-1">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Фильмы</h1>
          <AddMovieDialog
            open={openDialog}
            onOpenChange={setOpenDialog}
            onSubmit={handleSubmit(handleAddMovie)}
            handleImageChange={handleImageChange}
            imagePreview={imagePreview}
            isLoading={isSubmitting}
            errors={errors}
            register={register}
            trigger={trigger}
          />
        </div>

        {isLoading ? (
          <p>Загрузка фильмов...</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {movies.map((movie) => (
              <MovieCard
                key={movie.id}
                movie={movie}
                toggleFavorite={toggleFavorite}
                isFavorite={isFavorite}
                loadingStates={loadingStates}
              />
            ))}
          </div>
        )}
      </div>
      <FavoritesSidebar
        favorites={favorites}
        toggleFavorite={toggleFavorite}
        loadingStates={loadingStates}
      />
    </div>
  );
}
