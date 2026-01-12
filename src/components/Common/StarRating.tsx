'use client';

import { FaStar, FaStarHalfAlt, FaRegStar } from 'react-icons/fa';
import { generateStars } from '@/utils/helpers';
import styles from './StarRating.module.css';

interface StarRatingProps {
  rating: number;
  showNumber?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const StarRating = ({ rating, showNumber = true, size = 'md' }: StarRatingProps) => {
  const stars = generateStars(rating || 0);

  const sizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-xl',
  };

  return (
    <div className="flex items-center gap-1">
      <div className={`flex gap-0.5 ${sizeClasses[size]}`}>
        {[...Array(stars.full)].map((_, i) => (
          <FaStar key={`full-${i}`} className="text-yellow-400" />
        ))}
        {stars.half === 1 && <FaStarHalfAlt className="text-yellow-400" />}
        {[...Array(stars.empty)].map((_, i) => (
          <FaRegStar key={`empty-${i}`} className="text-gray-300" />
        ))}
      </div>
      {showNumber && (
        <span className="text-gray-600 font-medium mr-1">
          {rating ? rating.toFixed(1) : '0.0'}
        </span>
      )}
    </div>
  );
};

export default StarRating;

