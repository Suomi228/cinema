"use client";
import { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "sonner";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "@/components/ui/card";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { UserActions } from "../../components/UserActions";
import { AddUserDialog } from "../../components/AddUserDialog";

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      const res = await axios.get("/api/users");
      if (res.status === 200) {
        setIsAdmin(true);
        setUsers(res.data);
      } else if (res.status === 403) {
        setIsAdmin(false);
        toast.error("Только администраторы могут просматривать пользователей");
      }
    } catch (err) {
      console.error("Ошибка загрузки пользователей:", err);
      toast.error("Ошибка загрузки пользователей");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  if (isLoading) {
    return (
      <div className="p-6 space-y-4">
        <Skeleton className="h-8 w-32 mb-6" />
        <div className="grid gap-6">
          <Skeleton className="h-[400px] w-full" />
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">Пользователи</h1>
        <Card>
          <CardHeader>
            <CardTitle>Доступ запрещен</CardTitle>
          </CardHeader>
          <CardContent>
            <p>У вас нет прав для просмотра этой страницы.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Пользователи</h1>
        <AddUserDialog onSuccess={fetchUsers} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Список на ликвидацию</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Пользователь</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Роль</TableHead>
                <TableHead className="text-right">Действия</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div className="flex items-center space-x-4">
                      <Avatar>
                        <AvatarImage src={user.avatar} />
                        <AvatarFallback>
                          {user.email.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    </div>
                  </TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <Badge
                      variant={user.role === "ADMIN" ? "default" : "secondary"}
                    >
                      {user.role === "ADMIN" ? "Администратор" : "Пользователь"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <UserActions user={user} onSuccess={fetchUsers} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
