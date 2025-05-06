import { Star } from "lucide-react";
import { Button } from "../ui/button";

export const StarRating = ({
  rating,
  onRatingChange,
  disabled = false,
}: {
  rating: number;
  onRatingChange?: (rating: number) => void;
  disabled?: boolean;
}) => (
  <div className="flex items-center">
    {[1, 2, 3, 4, 5].map((star) => (
      <Button
        key={star}
        variant="ghost"
        size="icon"
        onClick={() => onRatingChange?.(star)}
        disabled={disabled}
        className="h-8 w-8 p-0"
      >
        <Star
          className={`h-5 w-5 ${
            star <= rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
          }`}
        />
      </Button>
    ))}
  </div>
);
