'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';

interface SearchBarProps {
  initialQuery?: string;
  placeholder?: string;
  showAdvanced?: boolean;
}

export default function SearchBar({ 
  initialQuery = '', 
  placeholder = 'Search our properties',
  showAdvanced = false 
}: SearchBarProps) {
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const router = useRouter();

  const handleSearch = (e: FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/listings?search=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      router.push('/listings');
    }
  };

  return (
    <form onSubmit={handleSearch} className="w-full max-w-4xl px-4">
      <div className="flex gap-3">
        <div className="flex-1 bg-white rounded-lg shadow-lg overflow-hidden">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={placeholder}
            className="w-full px-6 py-4 text-gray-900 placeholder-gray-500 outline-none"
          />
        </div>
        <button
          type="submit"
          className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-4 rounded-lg font-medium transition-colors flex items-center gap-2 whitespace-nowrap shadow-lg"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          Search
        </button>
        {showAdvanced && (
          <button
            type="button"
            onClick={() => router.push('/listings')}
            className="bg-teal-400 hover:bg-teal-500 text-white px-6 py-4 rounded-lg font-medium transition-colors whitespace-nowrap shadow-lg"
          >
            Advanced Search
          </button>
        )}
      </div>
    </form>
  );
}



