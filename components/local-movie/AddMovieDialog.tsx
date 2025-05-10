"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
import { MovieFormValues } from "@/app/local-movies/page";
import { UseFormTrigger } from "react-hook-form";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: () => void;
  handleImageChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  imagePreview: string | null;
  isLoading?: boolean;
  errors: Record<string, any>;
  register: any;
  trigger: UseFormTrigger<MovieFormValues>;
};

export function AddMovieDialog({
  open,
  onOpenChange,
  onSubmit,
  handleImageChange,
  imagePreview,
  isLoading = false,
  errors,
  register,
  trigger,
}: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button>Добавить фильм</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Добавить новый фильм</DialogTitle>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4">
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
                  onValueChange={(value) => {
                    register("genre").onChange({
                      target: { name: "genre", value },
                    });
                    trigger("genre");
                  }}
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
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Добавление..." : "Добавить фильм"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
