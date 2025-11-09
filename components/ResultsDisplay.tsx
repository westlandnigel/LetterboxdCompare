import React from 'react';
import type { UserAMovie } from '../types';

interface ResultsDisplayProps {
  recommendations: UserAMovie[];
  userA: string;
}

const StarIcon: React.FC<{ fill: 'full' | 'half' | 'none' }> = ({ fill }) => (
    <div className="relative w-5 h-5">
        {/* Background star (empty) */}
        <svg className="w-5 h-5 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
        {/* Foreground star (filled part) */}
        {fill !== 'none' && (
             <div className="absolute top-0 left-0 h-full overflow-hidden" style={{ width: fill === 'full' ? '100%' : '50%' }}>
                <svg className="w-5 h-5 text-[#FF8000]" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
             </div>
        )}
    </div>
);

const RatingStars: React.FC<{ rating: number }> = ({ rating }) => {
  const stars = [];
  for (let i = 1; i <= 5; i++) {
    if (rating >= i) {
      stars.push(<StarIcon key={i} fill='full' />);
    } else if (rating >= i - 0.5) {
      stars.push(<StarIcon key={i} fill='half' />);
    } else {
      stars.push(<StarIcon key={i} fill='none' />);
    }
  }
  return <div className="flex items-center space-x-0.5">{stars}</div>;
};


const ResultsDisplay: React.FC<ResultsDisplayProps> = ({ recommendations, userA }) => (
  <section>
    <h2 className="text-2xl font-bold text-white mb-6 border-b-2 border-[#445566] pb-2">
      {recommendations.length} Recommendation{recommendations.length !== 1 ? 's' : ''} from {userA}
    </h2>
    <ol className="space-y-3">
      {recommendations.map((movie, index) => (
        <li
          key={movie.url}
          className="bg-[#2C3440] p-4 rounded-lg flex items-center justify-between hover:bg-[#445566] transition-colors duration-200 shadow-md"
        >
          <div className="flex items-center space-x-4 overflow-hidden">
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
          <div className="flex items-center space-x-2 flex-shrink-0 ml-4">
            <RatingStars rating={movie.rating} />
            <span className="text-sm font-bold text-white w-8 text-left">({movie.rating.toFixed(1)})</span>
          </div>
        </li>
      ))}
    </ol>
  </section>
);

export default ResultsDisplay;
