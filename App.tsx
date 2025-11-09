import React, { useState, useCallback } from 'react';
import { runComparison } from './services/letterboxdScraper';
import type { UserAMovie, ProgressUpdate } from './types';
import ComparisonForm from './components/ComparisonForm';
import ResultsDisplay from './components/ResultsDisplay';
import Header from './components/Header';
import Loader from './components/Loader';

const App: React.FC = () => {
  const [userA, setUserA] = useState<string>('');
  const [userB, setUserB] = useState<string>('');
  const [recommendations, setRecommendations] = useState<UserAMovie[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState<ProgressUpdate | null>(null);

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
    setRecommendations([]);
    setProgress({ user: userA, message: 'Starting...', currentPage: 0, totalPages: 0 });

    try {
      const results = await runComparison(userA.trim(), userB.trim(), setProgress);
      setRecommendations(results);
      if(results.length === 0) {
        setError(`No unique rated films found for ${userA} that ${userB} hasn't seen.`);
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
  }, [userA, userB]);

  return (
    <div className="min-h-screen bg-[#14181C] text-[#9ab] font-sans">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Header />
        
        <main>
          <div className="bg-[#2C3440] p-6 rounded-lg shadow-lg mb-8">
            <p className="mb-4 text-center">
              Find movies that <strong className="text-white">{userA || 'User A'}</strong> has seen and rated, but <strong className="text-white">{userB || 'User B'}</strong> has not.
            </p>
            <ComparisonForm
              userA={userA}
              setUserA={setUserA}
              userB={userB}
              setUserB={setUserB}
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

          {!isLoading && recommendations.length > 0 && (
            <ResultsDisplay recommendations={recommendations} userA={userA} />
          )}
        </main>
        
        <footer className="text-center mt-12 text-xs text-gray-500">
          <p>A recreation of the original lb-compare tool. All data is scraped from Letterboxd.</p>
        </footer>
      </div>
    </div>
  );
};

export default App;
