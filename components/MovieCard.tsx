
import React from 'react';
import type { MovieRecommendation } from '../types';

interface MovieCardProps {
  movie: MovieRecommendation;
}

const StarIcon: React.FC<{ filled: boolean, half: boolean }> = ({ filled, half }) => (
  <svg className={`w-4 h-4 ${filled || half ? 'text-orange-400' : 'text-gray-600'}`} fill="currentColor" viewBox="0 0 20 20">
    {half ? (
      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
    ) : (
      <path fillRule="evenodd" d="M10 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" clipRule="evenodd" />
    )}
  </svg>
);


const RatingStars: React.FC<{ rating: number }> = ({ rating }) => {
  const stars = [];
  for (let i = 1; i <= 5; i++) {
    if (rating >= i) {
      stars.push(<StarIcon key={i} filled={true} half={false} />);
    } else if (rating >= i - 0.5) {
      stars.push(<StarIcon key={i} filled={false} half={true} />);
    } else {
      stars.push(<StarIcon key={i} filled={false} half={false} />);
    }
  }
  return <div className="flex items-center">{stars}</div>;
};

const MovieCard: React.FC<MovieCardProps> = ({ movie }) => (
  <div className="group relative">
    <a href={movie.url} target="_blank" rel="noopener noreferrer" className="block">
      <div className="aspect-[2/3] bg-[#2C3440] rounded-md overflow-hidden border-2 border-transparent group-hover:border-[#00E054] transition-all duration-200">
        <img 
          src={movie.posterUrl.replace(/-\d+-\d+-\d+-/, '-0-230-0-345-')} 
          alt={movie.title} 
          className="w-full h-full object-cover" 
          loading="lazy"
        />
      </div>
      <div className="absolute inset-0 bg-black bg-opacity-75 flex flex-col items-center justify-center p-2 text-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-md">
        <h3 className="text-white font-bold text-sm">{movie.title}</h3>
        <div className="mt-1">
          <RatingStars rating={movie.rating} />
        </div>
      </div>
    </a>
  </div>
);

export default MovieCard;
