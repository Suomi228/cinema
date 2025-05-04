"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import axios from "axios";
import { useState } from "react";
import { useUser } from "@/context/UserContext";
import { Loader2 } from "lucide-react";

export default function LogoutButton({
  className = "",
}: {
  className?: string;
}) {
  const router = useRouter();
  const { refetchUser } = useUser();
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      const response = await axios.post("/api/auth/logout");
      if (response.status === 200) {
        await refetchUser();
        router.push("/sign-in");
      } else {
        throw new Error("Сервер вернул ошибку");
      }
    } catch (error) {
      console.error("Ошибка при выходе:", error);
      alert("Не удалось выйти");
    } finally {
      setLoggingOut(false);
    }
  };

  return (
    <Button
      type="button"
      onClick={handleLogout}
      variant="outline"
      disabled={loggingOut}
      className={`w-full sm:w-auto ${className}`}
    >
      {loggingOut ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Выход...
        </>
      ) : (
        "Выйти"
      )}
    </Button>
  );
}
