"use client";

import { useRouter } from "next/navigation";
import axios from "axios";
import { toast } from "sonner";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

const formSchema = z.object({
  email: z.string().email({ message: "Неверный email" }),
  password: z.string().min(6, { message: "Минимум 6 символов" }),
  role: z.enum(["ADMIN", "USER"], {
    errorMap: () => ({ message: "Выберите роль: ADMIN или USER" }),
  }),
});

type FormData = z.infer<typeof formSchema>;

export default function AddUserForm({
  onUserAdded,
}: {
  onUserAdded?: () => void;
}) {
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
      role: "USER",
    },
  });

  const {
    handleSubmit,
    control,
    reset,
    formState: { isSubmitting },
  } = form;

  const onSubmit = async (data: FormData) => {
    try {
      await axios.post("/api/users", data);
      toast.success("Пользователь успешно создан");
      reset({
        email: "",
        password: "",
        role: "USER",
      });
      onUserAdded?.();
    } catch (error) {
      toast.error("Ошибка при создании пользователя");
      console.error(error);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 max-w-md">
        <FormField
          control={control}
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
          control={control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <Input type="password" placeholder="Password" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="role"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Role</FormLabel>
              <FormControl>
                <Select
                  value={field.value}
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Выберите роль" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ADMIN">ADMIN</SelectItem>
                    <SelectItem value="USER">USER</SelectItem>
                  </SelectContent>
                </Select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={isSubmitting} className="w-full">
          {isSubmitting ? "Добавление..." : "Добавить пользователя"}
        </Button>
      </form>
    </Form>
  );
}
