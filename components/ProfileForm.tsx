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
import { useState } from "react";
import Image from "next/image";
import axios from "axios";
import LogoutButton from "./LogoutButton";

const profileSchema = z.object({
  email: z.string().email(),
  password: z
    .string()
    .min(6, "Минимум 6 символов")
    .or(z.literal(""))
    .optional(),
  avatar: z.any().optional(),
});

export default function ProfileForm({ user }: { user: any }) {
  const router = useRouter();
  const [preview, setPreview] = useState(user.avatar);
  const [loading, setLoading] = useState(false);

  const form = useForm<z.infer<typeof profileSchema>>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      email: user.email,
      password: "",
      avatar: undefined,
    },
  });

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

      router.refresh();
    } catch (err) {
      console.error(err);
      alert("Ошибка обновления профиля");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
              {preview && (
                <Image
                  src={preview}
                  alt="avatar preview"
                  width={80}
                  height={80}
                  className="mt-2 rounded-full"
                />
              )}
            </FormItem>
          )}
        />

        <Button type="submit" disabled={loading}>
          {loading ? "Сохраняем..." : "Сохранить изменения"}
        </Button>
        <LogoutButton />
      </form>
    </Form>
  );
}
