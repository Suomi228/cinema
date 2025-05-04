import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useUser } from "@/context/UserContext";
import axios from "axios";
import { Loader2, MoreVertical } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { EditUserForm } from "./EditUserForm";

export function UserActions({
  user,
  onSuccess,
}: {
  user: User;
  onSuccess: () => void;
}) {
  const [editOpen, setEditOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false); // Состояние для диалога
  const { user: currentUser } = useUser();

  const handleDeleteClick = () => {
    if (currentUser?.id === user.id) {
      toast.error("Вы не можете удалить самого себя");
      return;
    }
    setDeleteDialogOpen(true); // Открываем диалог вместо confirm
  };

  const handleDeleteConfirm = async () => {
    setDeleteDialogOpen(false);
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
    <>
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
            onSelect={handleDeleteClick}
            className={`${
              currentUser?.id === user.id ? "cursor-not-allowed opacity-50" : ""
            } text-red-600 focus:text-red-600`}
            disabled={currentUser?.id === user.id}
          >
            Удалить
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Подтверждение удаления</AlertDialogTitle>
            <AlertDialogDescription>
              Вы уверены, что хотите удалить пользователя {user.email}? Это
              действие нельзя отменить.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Отмена</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Удаление...
                </>
              ) : (
                "Удалить"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
