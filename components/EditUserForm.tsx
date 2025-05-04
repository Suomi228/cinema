"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useState } from "react";
import Image from "next/image";

const userFormSchema = z.object({
  email: z.string().email({ message: "Неверный email" }),
  password: z
    .string()
    .min(6, { message: "Минимум 6 символов" })
    .or(z.literal(""))
    .optional(),
  role: z.enum(["ADMIN", "USER"]),
  avatar: z.any().optional(),
});

export function EditUserForm({
  user,
  onSuccess,
}: {
  user: User;
  onSuccess: () => void;
}) {
  const [preview, setPreview] = useState(user.avatar);
  const form = useForm<z.infer<typeof userFormSchema>>({
    resolver: zodResolver(userFormSchema),
    defaultValues: {
      email: user.email,
      password: "",
      role: user.role,
      avatar: undefined,
    },
  });

  const onSubmit = async (values: z.infer<typeof userFormSchema>) => {
    try {
      const formData = new FormData();
      formData.append("id", user.id.toString());
      formData.append("email", values.email);
      formData.append("role", values.role);

      if (values.password && values.password.trim() !== "") {
        formData.append("password", values.password);
      }

      if (values.avatar && values.avatar[0]) {
        formData.append("file", values.avatar[0]);
      }

      await axios.put("/api/users", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      toast.success("Пользователь обновлен");
      onSuccess();
    } catch (error) {
      toast.error("Ошибка при обновлении пользователя");
      console.error(error);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="flex flex-col items-center">
          <div className="relative group mb-4">
            {preview ? (
              <Image
                src={preview}
                alt="Avatar Preview"
                width={96}
                height={96}
                className="rounded-full h-24 w-24 object-cover border-2 border-primary"
              />
            ) : (
              <Avatar className="h-24 w-24">
                <AvatarImage src={user.avatar} />
                <AvatarFallback>
                  {user.email.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            )}
          </div>

          <FormField
            control={form.control}
            name="avatar"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel>Аватар</FormLabel>
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
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input placeholder="Email" {...field} />
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
              <FormLabel>Пароль</FormLabel>
              <FormControl>
                <Input
                  type="password"
                  placeholder="Оставьте пустым, чтобы не менять"
                  {...field}
                  value={field.value || ""}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="role"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Роль</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Выберите роль" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="USER">Пользователь</SelectItem>
                  <SelectItem value="ADMIN">Администратор</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full">
          Сохранить
        </Button>
      </form>
    </Form>
  );
}
