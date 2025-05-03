"use client";

import { useEffect, useState } from "react";
import axios from "axios";

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
      <button
        key={star}
        type="button"
        onClick={() => onRatingChange?.(star)}
        disabled={disabled}
        className={`text-2xl ${
          !disabled ? "cursor-pointer" : "cursor-default"
        } ${star <= rating ? "text-yellow-400" : "text-gray-300"}`}
      >
        ★
      </button>
    ))}
  </div>
);

export default function MoviesPage() {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loadingStates, setLoadingStates] = useState<Record<number, boolean>>(
    {}
  );
  const [ratingLoading, setRatingLoading] = useState<Record<number, boolean>>(
    {}
  );

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    genre: "",
    releaseDate: "",
    image: null as File | null,
  });
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const fetchMovies = async () => {
    try {
      const res = await axios.get("/api/movies");
      setMovies(res.data);
    } catch (err) {
      console.error("Error fetching movies:", err);
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
      await Promise.all([fetchMovies(), fetchUserData()]);
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
    } catch (error) {
      console.error("Error rating movie:", error);
    } finally {
      setRatingLoading((prev) => ({ ...prev, [movieId]: false }));
    }
  };

  const toggleFavorite = async (movieId: number) => {
    if (!user) {
      setError("Для добавления в избранное необходимо авторизоваться");
      return;
    }

    try {
      setLoadingStates((prev) => ({ ...prev, [movieId]: true }));

      if (isFavorite(movieId)) {
        await axios.delete(`/api/movies/${movieId}/favorite`);
      } else {
        await axios.post(`/api/movies/${movieId}/favorite`);
      }

      await fetchUserData();
    } catch (err) {
      setError("Ошибка при обновлении избранного");
      console.error(err);
    } finally {
      setLoadingStates((prev) => ({ ...prev, [movieId]: false }));
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      const file = e.target.files[0];
      setFormData({ ...formData, image: file });

      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleCreateMovie = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.image) return;

    try {
      const data = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        if (value) data.append(key, value);
      });

      await axios.post("/api/movies", data);
      await fetchMovies();

      setFormData({
        title: "",
        description: "",
        genre: "",
        releaseDate: "",
        image: null,
      });
      setImagePreview(null);
    } catch (error) {
      console.error("Error creating movie:", error);
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Фильмы</h1>

      {error && (
        <div className="mb-4 p-2 bg-red-100 text-red-700 rounded">{error}</div>
      )}

      {user?.role === "ADMIN" && (
        <form
          onSubmit={handleCreateMovie}
          className="mb-8 p-4 bg-gray-100 rounded-lg"
        >
          <h2 className="text-xl font-semibold mb-4">Добавить новый фильм</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div className="mb-4">
                <label className="block mb-2 font-medium">
                  Название фильма
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block mb-2 font-medium">Описание</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded"
                  rows={3}
                />
              </div>
              <div className="mb-4">
                <label className="block mb-2 font-medium">Жанр</label>
                <select
                  name="genre"
                  value={formData.genre}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded"
                >
                  <option value="">Выберите жанр</option>
                  <option value="Комедия">Комедия</option>
                  <option value="Драма">Драма</option>
                  <option value="Боевик">Боевик</option>
                  <option value="Фантастика">Фантастика</option>
                  <option value="Ужасы">Ужасы</option>
                </select>
              </div>
              <div className="mb-4">
                <label className="block mb-2 font-medium">Дата выхода</label>
                <input
                  type="date"
                  name="releaseDate"
                  value={formData.releaseDate}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded"
                />
              </div>
            </div>
            <div>
              <div className="mb-4">
                <label className="block mb-2 font-medium">Постер фильма</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="w-full p-2 border rounded"
                  required
                />
                {imagePreview && (
                  <div className="mt-4">
                    <p className="mb-2 font-medium">Предпросмотр:</p>
                    <img
                      src={imagePreview}
                      alt="Предпросмотр постера"
                      className="w-full h-48 object-contain border rounded"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
          <button
            type="submit"
            className="mt-4 bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
          >
            Добавить фильм
          </button>
        </form>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {movies.map((movie) => (
          <div key={movie.id} className="border rounded-lg p-4 flex flex-col">
            <img
              src={movie.imageUrl}
              alt={movie.title}
              className="w-full h-48 object-cover rounded"
            />
            <h2 className="text-xl font-semibold mt-2">{movie.title}</h2>
            <p className="text-sm">
              {movie.genre} • {new Date(movie.releaseDate).getFullYear()}
            </p>
            <p className="text-sm mt-2 text-gray-700 flex-grow">
              {movie.description}
            </p>

            <div className="flex items-center mt-2">
              <StarRating
                rating={Math.round(movie.averageRating || 0)}
                disabled
              />
              {movie.averageRating && (
                <span className="ml-2 text-sm text-gray-600">
                  {movie.averageRating.toFixed(1)}
                </span>
              )}
            </div>

            {user && (
              <div className="mt-2">
                <p className="text-sm mb-1">Ваша оценка:</p>
                <StarRating
                  rating={movie.userRating || 0}
                  onRatingChange={(rating) => handleRateMovie(movie.id, rating)}
                  disabled={ratingLoading[movie.id]}
                />
              </div>
            )}

            <button
              onClick={() => toggleFavorite(movie.id)}
              disabled={!user || loadingStates[movie.id]}
              className={`mt-2 px-4 py-1 rounded hover:bg-yellow-500 ${
                isFavorite(movie.id)
                  ? "bg-gray-400 hover:bg-gray-500"
                  : "bg-yellow-400 hover:bg-yellow-500"
              } ${!user ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              {loadingStates[movie.id]
                ? "Загрузка..."
                : isFavorite(movie.id)
                ? "Удалить из избранного"
                : "Добавить в избранное"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
