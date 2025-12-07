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
  const [shouldAutoRun, setShouldAutoRun] = useState(false);
  const hasAutoRun = useRef(false);


  useEffect(() => {
    // This effect runs once on mount to parse usernames from the URL path.
    const path = window.location.pathname;
    const match = path.match(/^\/([\w-]+)\/vs\/([\w-]+)\/?$/);
    if (match) {
      const [, userAFromUrl, userBFromUrl] = match;
      setUserA(userAFromUrl);
      setUserB(userBFromUrl);
      setShouldAutoRun(true); // Signal that we should run the comparison automatically.
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
    // This effect triggers the comparison automatically only if the flag is set from the URL load.
    // The ref ensures it only runs once and not on subsequent username changes.
    if (shouldAutoRun && !hasAutoRun.current) {
      hasAutoRun.current = true;
      handleCompare();
    }
  }, [shouldAutoRun, handleCompare]);

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
        
        <footer className="text-center mt-12 text-xs text-gray-400 pb-8">
          <p className="mb-3">
            For suggestions or bug reports, <a href="mailto:nigel@westlandj.nl" className="underline text-[#00E054] hover:text-green-400 transition-colors">
              nigel@westlandj.nl
            </a>.
          </p>
          <a
            href="https://www.paypal.com/donate/?hosted_button_id=MBWEGPZNWN7JL"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center space-x-2 bg-[#2C3440] hover:bg-[#3e4a5b] text-gray-300 hover:text-white px-3 py-1.5 rounded-full text-xs font-medium transition-colors border border-[#445566]"
          >
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3 text-[#00E054]">
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
            </svg>
            <span>Donate via PayPal</span>
          </a>
        </footer>
      </div>
    </div>
  );
};

export default App;