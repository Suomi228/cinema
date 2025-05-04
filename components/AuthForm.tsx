"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import axios from "axios";

import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useUser } from "@/context/UserContext";

type FormType = "sign-in" | "sign-up";

const formSchema = (formType: FormType) =>
  z.object({
    email:
      formType === "sign-up"
        ? z.string().email("Введите корректный email")
        : z.string(),
    password:
      formType === "sign-up"
        ? z
            .string()
            .min(6, "Пароль должен быть не менее 6 символов")
            .max(50, "Пароль слишком длинный")
        : z.string(),
  });

interface AuthFormProps {
  type: FormType;
}

export default function AuthForm({ type }: AuthFormProps) {
  const router = useRouter();
  const [errorMessage, setErrorMessage] = useState("");
  const { refetchUser } = useUser();

  const schema = formSchema(type);
  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const isLogin = type === "sign-in";

  const onSubmit = async (values: z.infer<typeof schema>) => {
    setErrorMessage("");
    try {
      if (isLogin) {
        await axios.post("/api/auth/login", values);
        await refetchUser();
        router.push("/movies");
      } else {
        await axios.post("/api/auth/register", values);
        router.push("/sign-in");
      }
    } catch (error: unknown) {
      const message =
        (error as { response?: { data?: { message?: string } } })?.response
          ?.data?.message || (isLogin ? "Ошибка входа" : "Ошибка регистрации");
      setErrorMessage(message);
    }
  };
  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-4 w-full min-w-[300px]"
      >
        <h2 className="text-xl font-semibold text-center">
          {isLogin ? "Вход в аккаунт" : "Создание аккаунта"}
        </h2>

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input placeholder="Введите email" {...field} />
              </FormControl>
              <FormMessage className="text-red-500 text-sm" />
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
                  placeholder="Введите пароль"
                  {...field}
                />
              </FormControl>
              <FormMessage className="text-red-500 text-sm" />
            </FormItem>
          )}
        />

        {errorMessage && (
          <p className="text-red-500 text-sm text-center">{errorMessage}</p>
        )}

        <Button type="submit" className="w-full">
          {isLogin ? "Войти" : "Зарегистрироваться"}
        </Button>

        <div className="text-center text-sm text-gray-600">
          {isLogin ? (
            <>
              Нет аккаунта?{" "}
              <Link href="/sign-up" className="text-blue-600 underline">
                Зарегистрироваться
              </Link>
            </>
          ) : (
            <>
              Уже есть аккаунт?{" "}
              <Link href="/sign-in" className="text-blue-600 underline">
                Войти
              </Link>
            </>
          )}
        </div>
      </form>
    </Form>
  );
}
