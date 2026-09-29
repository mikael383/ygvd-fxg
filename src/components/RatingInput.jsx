import React, { useState } from 'react';
import { Star } from 'lucide-react';

export default function RatingInput({ value, onChange, disabled = false }) {
  const [hoverValue, setHoverValue] = useState(0);

  const starLabels = {
    1: 'Poor',
    2: 'Fair',
    3: 'Good',
    4: 'Very Good',
    5: 'Excellent',
  };

  const activeValue = hoverValue || value || 0;

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-1 sm:gap-2">
        {[1, 2, 3, 4, 5].map((star) => {
          const isFilled = star <= activeValue;

          return (
            <button
              key={star}
              type="button"
              disabled={disabled}
              onClick={() => onChange(star)}
              onMouseEnter={() => !disabled && setHoverValue(star)}
              onMouseLeave={() => !disabled && setHoverValue(0)}
              className={`p-2 sm:p-2.5 rounded-xl transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-1 ${
                disabled ? 'cursor-not-allowed opacity-60' : 'cursor-pointer hover:bg-amber-50 hover:scale-110 active:scale-95'
              }`}
              aria-label={`Rate ${star} out of 5 stars`}
            >
              <Star
                className={`w-7 h-7 sm:w-8 sm:h-8 transition-colors ${
                  isFilled
                    ? 'text-amber-400 fill-amber-400 drop-shadow-sm'
                    : 'text-gray-300 stroke-gray-300 fill-transparent'
                }`}
              />
            </button>
          );
        })}
      </div>

      {/* Label indicating rating */}
      <div className="h-5 text-sm font-medium text-gray-500 pl-1">
        {activeValue > 0 ? (
          <span className="text-amber-600 font-semibold transition-opacity duration-200">
            {activeValue} / 5 — {starLabels[activeValue]}
          </span>
        ) : (
          <span className="text-gray-400 text-xs">Select your rating (1 to 5)</span>
        )}
      </div>
    </div>
  );
}
