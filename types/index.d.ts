declare type User = {
  id: number;
  email: string;
  role: "USER" | "ADMIN";
  avatar: string;
  favorites?: { movieId: number }[];
};

declare type Movie = {
  id: number;
  title: string;
  description: string;
  genre: string;
  releaseDate: string;
  imageUrl: string;
  averageRating?: number;
  userRating?: number;
  favoritesCount?: number;
};
