import React from 'react';
import type { SharedMovie } from '../types';
import { RatingStars } from './ResultsDisplay'; // Reusing RatingStars

interface SharedMovieItemProps {
  movie: SharedMovie;
  userA: string;
  userB: string;
  index: number;
}

const SharedMovieItem: React.FC<SharedMovieItemProps> = ({ movie, userA, userB, index }) => (
  <li
    className="bg-[#2C3440] p-4 rounded-lg flex flex-col md:flex-row items-center justify-between hover:bg-[#445566] transition-colors duration-200 shadow-md"
  >
    <div className="flex items-center space-x-4 mb-4 md:mb-0 md:flex-grow overflow-hidden">
      <span className="text-lg font-semibold text-gray-400 w-10 text-right flex-shrink-0">{index + 1}.</span>
      <a
        href={movie.url}
        target="_blank"
        rel="noopener noreferrer"
        className="text-white font-semibold text-lg hover:text-[#00E054] transition-colors truncate"
        title={movie.title}
      >
        {movie.title}
      </a>
    </div>

    <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-8 flex-shrink-0 md:ml-4">
      {/* User A's Rating */}
      <div className="flex items-center space-x-2">
        <img
          src={movie.userAPosterUrl}
          alt={`${movie.title} poster for ${userA}`}
          className="w-10 h-15 rounded object-cover flex-shrink-0"
          loading="lazy"
        />
        <div className="flex flex-col items-center">
            <span className="text-sm font-medium text-[#9ab]">{userA}</span>
            <div className="flex items-center">
                <RatingStars rating={movie.userARating} />
                <span className="text-sm font-bold text-white ml-1">({movie.userARating.toFixed(1)})</span>
            </div>
        </div>
      </div>

      {/* User B's Rating */}
      <div className="flex items-center space-x-2">
        <img
          src={movie.userBPosterUrl}
          alt={`${movie.title} poster for ${userB}`}
          className="w-10 h-15 rounded object-cover flex-shrink-0"
          loading="lazy"
        />
        <div className="flex flex-col items-center">
            <span className="text-sm font-medium text-[#9ab]">{userB}</span>
            <div className="flex items-center">
                <RatingStars rating={movie.userBRating} />
                <span className="text-sm font-bold text-white ml-1">({movie.userBRating.toFixed(1)})</span>
            </div>
        </div>
      </div>
    </div>
  </li>
);

export default SharedMovieItem;