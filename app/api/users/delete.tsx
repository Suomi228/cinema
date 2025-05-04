"use client";

import { DialogHeader } from "@/components/ui/dialog";
import { Dialog, DialogTrigger, DialogContent, DialogTitle } from "@radix-ui/react-dialog";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@radix-ui/react-dropdown-menu";
import axios from "axios";
import { MoreVertical } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { EditUserForm } from "./edit-user-form";

export function UserActions({
  user,
  onSuccess,
}: {
  user: User;
  onSuccess: () => void;
}) {
  const [editOpen, setEditOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const handleDelete = async () => {
    if (!confirm("Вы уверены, что хотите удалить этого пользователя?")) return;

    setDeleteLoading(true);
    try {
      await axios.delete("/api/users", { data: { id: user.id } });
      toast.success("Пользователь удален");
      onSuccess();
    } catch (error) {
      toast.error("Ошибка при удалении пользователя");
      console.error(error);
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <MoreVertical className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <Dialog open={editOpen} onOpenChange={setEditOpen}>
          <DialogTrigger asChild>
            <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
              Редактировать
            </DropdownMenuItem>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Редактировать пользователя</DialogTitle>
            </DialogHeader>
            <EditUserForm
              user={user}
              onSuccess={() => {
                setEditOpen(false);
                onSuccess();
              }}
            />
          </DialogContent>
        </Dialog>
        <DropdownMenuItem
          onSelect={handleDelete}
          className="text-red-600 focus:text-red-600"
        >
          {deleteLoading ? "Удаление..." : "Удалить"}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
