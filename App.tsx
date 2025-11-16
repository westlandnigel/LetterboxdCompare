import React, { useState, useCallback, useEffect, useRef } from 'react';
import { runComparison, runBothSeenComparison } from './services/letterboxdScraper';
import type { UserAMovie, SharedMovie, ProgressUpdate } from './types';
import ComparisonForm from './components/ComparisonForm';
import ResultsDisplay from './components/ResultsDisplay';
import SharedResultsDisplay from './components/SharedResultsDisplay'; // New import
import Header from './components/Header';
import Loader from './components/Loader';

const App: React.FC = () => {
  const [userA, setUserA] = useState<string>('');
  const [userB, setUserB] = useState<string>('');
  const [selectedGenre, setSelectedGenre] = useState<string>('any'); // New state for genre
  const [comparisonMode, setComparisonMode] = useState<'compare' | 'bothSeen'>('compare'); // New state for comparison mode
  const [recommendations, setRecommendations] = useState<UserAMovie[]>([]);
  const [sharedMovies, setSharedMovies] = useState<SharedMovie[]>([]); // New state for shared movies
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState<ProgressUpdate | null>(null);
  const initialComparisonRan = useRef(false);

  useEffect(() => {
    // This effect runs once on mount to parse usernames from the URL path.
    const path = window.location.pathname;
    const match = path.match(/^\/([\w-]+)\/vs\/([\w-]+)\/?$/);
    if (match) {
      const [, userAFromUrl, userBFromUrl] = match;
      setUserA(userAFromUrl);
      setUserB(userBFromUrl);
    }
  }, []); // Empty dependency array ensures this runs only once on mount.


  const handleCompare = useCallback(async () => {
    if (!userA || !userB) {
      setError('Please enter both usernames.');
      return;
    }
    if (userA.trim().toLowerCase() === userB.trim().toLowerCase()) {
      setError('Usernames cannot be the same.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setRecommendations([]); // Clear old results
    setSharedMovies([]);    // Clear old results
    setProgress({ user: userA, message: 'Starting...', currentPage: 0, totalPages: 0 });

    try {
      if (comparisonMode === 'compare') {
        const results = await runComparison(userA.trim(), userB.trim(), selectedGenre, setProgress);
        setRecommendations(results);
        if(results.length === 0) {
          setError(`No unique rated films found for ${userA} that ${userB} hasn't seen in the selected genre.`);
        }
      } else { // comparisonMode === 'bothSeen'
        const results = await runBothSeenComparison(userA.trim(), userB.trim(), selectedGenre, setProgress);
        setSharedMovies(results);
        if(results.length === 0) {
          setError(`No common rated films found between ${userA} and ${userB} in the selected genre.`);
        }
      }
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unknown error occurred.');
      }
    } finally {
      setIsLoading(false);
      setProgress(null);
    }
  }, [userA, userB, selectedGenre, comparisonMode]);

  useEffect(() => {
    // This effect triggers the comparison automatically if usernames were populated from the URL.
    // The ref ensures it only runs once on the initial load and not on subsequent username changes.
    if (userA && userB && !initialComparisonRan.current) {
      initialComparisonRan.current = true;
      handleCompare();
    }
  }, [userA, userB, handleCompare]);

  return (
    <div className="min-h-screen bg-[#14181C] text-[#9ab] font-sans">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Header />
        
        <main>
          <div className="bg-[#2C3440] p-6 rounded-lg shadow-lg mb-8">
            <p className="mb-4 text-center">
              {comparisonMode === 'compare'
                ? `Find movies that `
                : `Find movies that `}
              <strong className="text-white">{userA || 'User A'}</strong>
              {comparisonMode === 'compare'
                ? ` has seen and rated, but `
                : ` and `}
              <strong className="text-white">{userB || 'User B'}</strong>
              {comparisonMode === 'compare'
                ? ` has not.`
                : ` have both seen and rated.`}
            </p>
            <ComparisonForm
              userA={userA}
              setUserA={setUserA}
              userB={userB}
              setUserB={setUserB}
              selectedGenre={selectedGenre}
              setSelectedGenre={setSelectedGenre}
              comparisonMode={comparisonMode}
              setComparisonMode={setComparisonMode}
              onCompare={handleCompare}
              isLoading={isLoading}
            />
          </div>

          {isLoading && progress && <Loader progress={progress} />}
          
          {error && (
            <div className="bg-red-900 border border-red-700 text-red-200 px-4 py-3 rounded-lg relative text-center" role="alert">
              <strong className="font-bold">Error: </strong>
              <span className="block sm:inline">{error}</span>
            </div>
          )}

          {!isLoading && comparisonMode === 'compare' && recommendations.length > 0 && (
            <ResultsDisplay recommendations={recommendations} userA={userA} />
          )}

          {!isLoading && comparisonMode === 'bothSeen' && sharedMovies.length > 0 && (
            <SharedResultsDisplay sharedMovies={sharedMovies} userA={userA} userB={userB} />
          )}
        </main>
        
        <footer className="text-center mt-12 text-xs text-gray-400">
          <p className="mb-2">
            For suggestions or bug reports, email <a href="mailto:nigel@westlandj.nl" className="underline text-[#00E054] hover:text-green-400 transition-colors">
              nigel@westlandj.nl
            </a>.
          </p>
          <p>
            I would appreciate a follow on my Letterboxd account: <a href="https://letterboxd.com/nigelllj/" target="_blank" rel="noopener noreferrer" className="underline text-[#00E054] hover:text-green-400 transition-colors">
              nigelllj
            </a>.
          </p>
        </footer>
      </div>
    </div>
  );
};

export default App;