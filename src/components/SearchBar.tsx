'use client';

import { useState, useCallback, useMemo } from 'react';
import stores from '../../sklepy.json';

interface SearchBarProps {
  onSearch: (query: string, store: string | null) => void;
}

export default function SearchBar({ onSearch }: SearchBarProps) {
  const [query, setQuery] = useState('');
  const [selectedStore, setSelectedStore] = useState<string | null>(null);

  const filteredStores = useMemo(() => {
    if (!query) return [];
    const searchLower = query.toLowerCase();
    return Object.entries(stores)
      .filter(([_, name]) => 
        name.toLowerCase().includes(searchLower)
      )
      .slice(0, 5);
  }, [query]);

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    onSearch(query, selectedStore);
  }, [query, selectedStore, onSearch]);

  const handleStoreClick = useCallback((store: string | null) => {
    setSelectedStore(store);
    onSearch(query, store);
  }, [query, onSearch]);

  return (
    <div className="mb-8 space-y-4 relative">
      <form onSubmit={handleSubmit} className="flex gap-2">
        <div className="flex-1 relative">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search deals..."
            className="w-full p-2 border rounded-lg"
          />
          {filteredStores.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-background border rounded-lg shadow-lg z-10">
              {filteredStores.map(([domain, name]) => (
                <button
                  key={domain}
                  type="button"
                  onClick={() => {
                    handleStoreClick(name);
                    setQuery('');
                  }}
                  className="w-full text-left px-4 py-2 hover:bg-secondary transition-colors first:rounded-t-lg last:rounded-b-lg"
                >
                  {name}
                </button>
              ))}
            </div>
          )}
        </div>
        <button
          type="submit"
          className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover"
        >
          Search
        </button>
      </form>
      {selectedStore && (
        <div className="flex items-center gap-2">
          <span className="text-sm text-foreground/70">Filtered by:</span>
          <button
            onClick={() => handleStoreClick(null)}
            className="inline-flex items-center gap-1 px-3 py-1 bg-primary text-white rounded-full text-sm"
          >
            {selectedStore}
            <span className="text-xs">×</span>
          </button>
        </div>
      )}
    </div>
  );
}
