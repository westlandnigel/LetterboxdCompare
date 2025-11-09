import React from 'react';
import type { ProgressUpdate } from '../types';

interface LoaderProps {
  progress: ProgressUpdate;
}

const Loader: React.FC<LoaderProps> = ({ progress }) => {
  const percentage = progress.totalPages > 0 ? Math.round((progress.currentPage / progress.totalPages) * 100) : 0;

  return (
    <div className="bg-[#2C3440] p-6 rounded-lg shadow-lg mb-8 text-center">
      <div className="flex justify-center items-center mb-4">
        <svg className="animate-spin -ml-1 mr-3 h-8 w-8 text-[#00E054]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <p className="text-lg text-white font-semibold">
          {progress.message}
        </p>
      </div>
      {progress.totalPages > 0 && (
        <div>
          <div className="w-full bg-gray-700 rounded-full h-2.5">
            <div className="bg-[#00E054] h-2.5 rounded-full" style={{ width: `${percentage}%` }}></div>
          </div>
          <p className="text-sm text-gray-400 mt-2">
            {percentage}%
          </p>
        </div>
      )}
    </div>
  );
};

export default Loader;
