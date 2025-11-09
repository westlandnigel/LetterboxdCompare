
import React from 'react';

interface ComparisonFormProps {
  userA: string;
  setUserA: (value: string) => void;
  userB: string;
  setUserB: (value: string) => void;
  onCompare: () => void;
  isLoading: boolean;
}

const ComparisonForm: React.FC<ComparisonFormProps> = ({ userA, setUserA, userB, setUserB, onCompare, isLoading }) => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onCompare();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 md:space-y-0 md:flex md:space-x-4 md:items-end">
      <div className="flex-1">
        <label htmlFor="userA" className="block text-sm font-medium mb-1 text-[#9ab]">User A (has seen)</label>
        <input
          id="userA"
          type="text"
          value={userA}
          onChange={(e) => setUserA(e.target.value)}
          placeholder="username"
          className="w-full bg-[#14181C] border border-[#445566] rounded-md px-3 py-2 text-white focus:ring-2 focus:ring-[#00E054] focus:outline-none"
          disabled={isLoading}
        />
      </div>
      <div className="flex-1">
        <label htmlFor="userB" className="block text-sm font-medium mb-1 text-[#9ab]">User B (has not seen)</label>
        <input
          id="userB"
          type="text"
          value={userB}
          onChange={(e) => setUserB(e.target.value)}
          placeholder="username"
          className="w-full bg-[#14181C] border border-[#445566] rounded-md px-3 py-2 text-white focus:ring-2 focus:ring-[#00E054] focus:outline-none"
          disabled={isLoading}
        />
      </div>
      <button
        type="submit"
        disabled={isLoading}
        className="w-full md:w-auto px-6 py-2 bg-[#00E054] text-[#14181C] font-bold rounded-md hover:bg-green-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#2C3440] focus:ring-green-400 transition-colors duration-200 disabled:bg-gray-600 disabled:cursor-not-allowed"
      >
        {isLoading ? 'Comparing...' : 'Compare'}
      </button>
    </form>
  );
};

export default ComparisonForm;
