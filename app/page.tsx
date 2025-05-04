"use client";
import Image from "next/image";
import { useEffect } from "react";

export default function Home() {
  const original = document.body.style.overflow;
  useEffect(() => {
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = original;
    };
  }, [original]);
  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0 bg-black/60 z-10" />
      <Image
        src="https://myhotposters.com/cdn/shop/products/mL0619_grande.jpg?v=1745745701"
        alt="Кинофон"
        fill
        className="object-cover"
        priority
      />
      <div className="relative z-20 text-center px-4 max-w-4xl mx-auto">
        <h1 className="text-4xl sm:text-6xl font-bold text-white mb-6 animate-fade-in">
          Откройте мир кино
        </h1>
        <div className="animate-fade-in-delayed">
          <p className="text-xl text-white/90 max-w-lg mx-auto">
            Исследуйте бескрайнюю вселенную кинематографа
          </p>
        </div>
      </div>
    </div>
  );
}
