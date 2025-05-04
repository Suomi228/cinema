"use client";

import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { updateUser } from "@/lib/actions/user.actions";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Image from "next/image";
import axios from "axios";
import LogoutButton from "./LogoutButton";
import { toast } from "sonner";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

const profileSchema = z.object({
  email: z.string().email(),
  password: z
    .string()
    .min(6, "Минимум 6 символов")
    .or(z.literal(""))
    .optional(),
  avatar: z.any().optional(),
});

export default function ProfileForm({ user }: { user: User }) {
  const router = useRouter();
  const [preview, setPreview] = useState(user.avatar);
  const [loading, setLoading] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const form = useForm<z.infer<typeof profileSchema>>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      email: user.email,
      password: "",
      avatar: undefined,
    },
  });
  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 500);
    return () => {
      clearTimeout(timer);
    };
  }, []);

  const onSubmit = async (values: z.infer<typeof profileSchema>) => {
    setLoading(true);
    try {
      let avatarUrl = user.avatar;

      if (values.avatar && values.avatar[0]) {
        const formData = new FormData();
        formData.append("file", values.avatar[0]);

        const response = await axios.post("/api/upload", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });

        avatarUrl = response.data.url;
      }

      await updateUser(user.id, {
        email: values.email,
        ...(values.password?.length ? { password: values.password } : {}),
        avatar: avatarUrl,
      });
      toast.success("Профиль успешно обновлён");
      router.refresh();
    } catch (err) {
      console.error(err);
      toast.error("Ошибка обновления профиля");
    } finally {
      setLoading(false);
    }
  };

  if (isLoading) {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <Skeleton className="h-8 w-32 mb-4" />
          <div className="space-y-6">
            <div className="flex items-center space-x-4">
              <Skeleton className="h-12 w-12 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-[200px]" />
                <Skeleton className="h-4 w-[150px]" />
              </div>
            </div>
            {[...Array(3)].map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-4 w-[100px]" />
                <Skeleton className="h-10 w-full" />
              </div>
            ))}
            <div className="flex space-x-4">
              <Skeleton className="h-10 w-[200px]" />
              <Skeleton className="h-10 w-[200px]" />
            </div>
          </div>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">Профиль</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="flex flex-col items-center space-y-4">
              <div className="relative group">
                {preview ? (
                  <Image
                    src={preview}
                    alt="avatar preview"
                    width={96}
                    height={96}
                    className="rounded-full h-24 w-24 object-cover border-2 border-primary"
                  />
                ) : (
                  <div className="rounded-full h-24 w-24 bg-muted flex items-center justify-center text-2xl font-bold">
                    {user.email.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>

              {user.role && (
                <Badge variant="secondary" className="text-sm">
                  {user.role === "ADMIN" ? "Администратор" : "Пользователь"}
                </Badge>
              )}
            </div>

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Пароль{" "}
                    <span className="text-sm text-muted-foreground">
                      (оставьте пустым, если не хотите менять)
                    </span>
                  </FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="******" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="avatar"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Фото профиля</FormLabel>
                  <FormControl>
                    <Input
                      type="file"
                      accept="image/*"
                      className="cursor-pointer"
                      onChange={(e) => {
                        field.onChange(e.target.files);
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onloadend = () => {
                            setPreview(reader.result as string);
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex flex-col sm:flex-row gap-4">
              <Button type="submit" disabled={loading} className="flex-1">
                {loading ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Сохранение...
                  </>
                ) : (
                  "Сохранить изменения"
                )}
              </Button>
              <LogoutButton />
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
