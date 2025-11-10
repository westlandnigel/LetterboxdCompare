import React, { useState, useMemo, useCallback } from 'react';
import type { SharedMovie } from '../types';
import { RatingStars } from './ResultsDisplay'; // Reusing RatingStars
import SharedMovieItem from './SharedMovieItem';

interface SharedResultsDisplayProps {
  sharedMovies: SharedMovie[];
  userA: string;
  userB: string;
}

type SortKey = 'combinedRating' | 'userARating' | 'userBRating' | 'title';

const SharedResultsDisplay: React.FC<SharedResultsDisplayProps> = ({ sharedMovies, userA, userB }) => {
  const [sortKey, setSortKey] = useState<SortKey>('combinedRating');
  // Removed sortDirection state as sorting logic now directly applies ascending/descending based on sortKey

  const handleSortChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    // For ratings, we always want 'Highest First' (descending)
    // For title, we always want 'A-Z' (ascending)
    setSortKey(value as SortKey);
  }, []);

  const sortedMovies = useMemo(() => {
    const sortableMovies = [...sharedMovies];
    sortableMovies.sort((a, b) => {
      if (sortKey === 'title') {
        // Sort by title A-Z (ascending)
        return a.title.localeCompare(b.title);
      } else {
        // Sort by combinedRating, userARating, userBRating (highest first / descending)
        return (b[sortKey] as number) - (a[sortKey] as number);
      }
    });
    return sortableMovies;
  }, [sharedMovies, sortKey]); // `sortDirection` is no longer a dependency or used in the comparator

  return (
    <section>
      <h2 className="text-2xl font-bold text-white mb-4 border-b-2 border-[#445566] pb-2">
        {sharedMovies.length} Films Both {userA} and {userB} Have Seen
      </h2>

      <div className="flex justify-end mb-4">
        <label htmlFor="sort-by" className="block text-sm font-medium mr-2 text-[#9ab] self-center">Sort by:</label>
        <select
          id="sort-by"
          value={sortKey}
          onChange={handleSortChange}
          className="bg-[#14181C] border border-[#445566] rounded-md px-3 py-2 text-white focus:ring-2 focus:ring-[#00E054] focus:outline-none appearance-none pr-8"
          aria-label="Sort movies"
        >
          <option value="combinedRating">Combined Rating (Highest First)</option>
          <option value="userARating">{userA}'s Rating (Highest First)</option>
          <option value="userBRating">{userB}'s Rating (Highest First)</option>
          <option value="title">Title (A-Z)</option>
        </select>
      </div>

      <ol className="space-y-3">
        {sortedMovies.map((movie, index) => (
          <SharedMovieItem
            key={movie.url}
            movie={movie}
            userA={userA}
            userB={userB}
            index={index}
          />
        ))}
      </ol>
    </section>
  );
};

export default SharedResultsDisplay;