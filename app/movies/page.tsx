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
};

type User = {
  id: number;
  role: "USER" | "ADMIN";
  favorites: { movieId: number }[];
};

export default function MoviesPage() {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    genre: "",
    releaseDate: "",
    image: null as File | null,
  });
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [moviesRes, userRes] = await Promise.all([
          axios.get("/api/movies"),
          axios.get("/api/auth/me"),
        ]);
        setMovies(moviesRes.data);
        setUser(userRes.data);
      } catch (err) {
        console.error("Error fetching data:", err);
      }
    };

    fetchData();
  }, []);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setFormData({ ...formData, image: file });

      // Создаем превью изображения
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
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
      data.append("title", formData.title);
      data.append("description", formData.description);
      data.append("genre", formData.genre);
      data.append("releaseDate", formData.releaseDate);
      data.append("image", formData.image);

      await axios.post("/api/movies", data);
      const res = await axios.get("/api/movies");
      setMovies(res.data);

      // Сброс формы
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

  const isFavorite = (movieId: number) =>
    user?.favorites?.some((f) => f.movieId === movieId);
  //   console.log(isFavorite)
  const [loadingStates, setLoadingStates] = useState<Record<number, boolean>>(
    {}
  );
  const [error, setError] = useState<string | null>(null);

  const toggleFavorite = async (movieId: number) => {
    if (!user) return;

    try {
      setLoadingStates((prev) => ({ ...prev, [movieId]: true }));

      if (isFavorite(movieId)) {
        await axios.delete(`/api/movies/${movieId}/favorite`);
      } else {
        await axios.post(`/api/movies/${movieId}/favorite`);
      }

      const userRes = await axios.get("/api/auth/me");
      setUser((prev) =>
        prev ? { ...prev, favorites: userRes.data.favorites } : null
      );
    } catch (err) {
      setError("Ошибка при обновлении избранного");
      console.error(err);
    } finally {
      setLoadingStates((prev) => ({ ...prev, [movieId]: false }));
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Фильмы</h1>

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
        {movies?.map((movie) => (
          <div key={movie.id} className="border rounded-lg p-4">
            <img
              src={movie.imageUrl}
              alt={movie.title}
              className="w-full h-48 object-cover rounded"
            />
            <h2 className="text-xl font-semibold mt-2">{movie.title}</h2>
            <p className="text-sm">
              {movie.genre} • {new Date(movie.releaseDate).getFullYear()}
            </p>
            <p className="text-sm mt-1">{movie.description}</p>
            <button
              onClick={() => toggleFavorite(movie.id)}
              disabled={loadingStates[movie.id]}
              className={`mt-2 px-4 py-1 rounded hover:bg-yellow-500 ${
                isFavorite(movie.id)
                  ? "bg-gray-400 hover:bg-gray-500"
                  : "bg-yellow-400 hover:bg-yellow-500"
              }`}
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
