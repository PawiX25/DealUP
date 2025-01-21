'use client';

import { useEffect, useState, useCallback } from 'react';
import moment from 'moment';
import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { detectStore } from '@/utils/stores';
import SearchBar from '@/components/SearchBar';

interface User {
  id: string;
  name: string;
  image: string | null;
}

interface Deal {
  id: string;
  title: string;
  description: string;
  price: number;
  link: string;
  createdAt: string;
  user: User;
  comparisonPrice?: number;
  imageUrl?: string;
}

interface DealListProps {
  initialDeals?: Deal[];
  userId?: string;
}

export default function DealList({ initialDeals, userId }: DealListProps) {
  const [deals, setDeals] = useState<Deal[]>(initialDeals || []);
  const [filteredDeals, setFilteredDeals] = useState<Deal[]>(initialDeals || []);
  const [loading, setLoading] = useState(!initialDeals);

  useEffect(() => {
    if (!initialDeals) {
      fetch('/api/deals' + (userId ? `?userId=${userId}` : ''))
        .then(res => res.json())
        .then(data => {
          setDeals(data);
          setFilteredDeals(data);
          setLoading(false);
        });
    }
  }, [userId, initialDeals]);

  const handleSearch = useCallback((query: string, store: string | null) => {
    const searchLower = query.toLowerCase();
    const filtered = deals.filter(deal => {
      const matchesSearch = !query || 
        deal.title.toLowerCase().includes(searchLower) ||
        deal.description.toLowerCase().includes(searchLower);
      
      const matchesStore = !store || detectStore(deal.link) === store;
      
      return matchesSearch && matchesStore;
    });
    setFilteredDeals(filtered);
  }, [deals]);

  const calculateSavings = (price: number, comparisonPrice?: number) => {
    if (!comparisonPrice) return null;
    const savings = comparisonPrice - price;
    const percentage = (savings / comparisonPrice) * 100;
    return {
      amount: savings.toFixed(2),
      percentage: percentage.toFixed(0)
    };
  };

  if (loading) {
    return <div className="grid gap-4 animate-pulse">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-4"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full mb-4"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
        </div>
      ))}
    </div>;
  }

  return (
    <div className="space-y-6">
      {!userId && <SearchBar onSearch={handleSearch} />}
      <div className="grid gap-8">
        {filteredDeals.map((deal, index) => {
          const savings = calculateSavings(deal.price, deal.comparisonPrice);
          const storeName = detectStore(deal.link);
          
          return (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              key={deal.id}
              className="bg-white dark:bg-gray-800/90 p-6 rounded-xl shadow-[0_4px_20px_-4px_rgba(0,0,0,0.1)] hover:shadow-[0_8px_30px_-4px_rgba(0,0,0,0.2)] transition-all duration-300 border border-gray-100 dark:border-gray-700 overflow-hidden cursor-pointer backdrop-blur-sm"
              onClick={() => {
                window.location.href = `/deal/${deal.id}`;
              }}
            >
              <div className="flex gap-8">
                {deal.imageUrl && (
                  <div className="flex-shrink-0 w-52 h-52 bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 rounded-xl overflow-hidden flex items-center justify-center shadow-inner">
                    <div className="p-2 w-full h-full flex items-center justify-center">
                      <img
                        src={deal.imageUrl}
                        alt={deal.title}
                        className="max-w-full max-h-full object-contain filter drop-shadow-sm"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = 'https://placehold.co/208x208?text=No+Image';
                        }}
                      />
                    </div>
                  </div>
                )}
                <div className="flex-grow">
                  <div className="flex justify-between items-start gap-4">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-800 dark:text-white tracking-tight">{deal.title}</h2>
                      {storeName && (
                        <span className="inline-block mt-2 text-sm px-3 py-1 bg-primary/10 text-primary rounded-full font-medium">
                          {storeName}
                        </span>
                      )}
                      <p className="mt-3 text-gray-600 dark:text-gray-300 leading-relaxed">{deal.description}</p>
                    </div>
                    <div className="text-right">
                      <div className="bg-primary/5 rounded-lg p-3">
                        <span className="text-3xl font-bold text-primary">
                          ${deal.price.toFixed(2)}
                        </span>
                        {deal.comparisonPrice && (
                          <div className="mt-1 space-y-1">
                            <span className="text-sm line-through text-gray-400">
                              ${deal.comparisonPrice.toFixed(2)}
                            </span>
                            {savings && (
                              <div className="text-sm font-medium text-green-600 dark:text-green-500 bg-green-50 dark:bg-green-900/20 px-2 py-1 rounded-md">
                                Save {savings.percentage}%
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="mt-6 flex items-center justify-between border-t border-gray-100 dark:border-gray-700 pt-4">
                    <Link 
                      href={`/profile/${deal.user.id}`} 
                      className="flex items-center gap-3 hover:opacity-80 transition-opacity group"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {deal.user.image ? (
                        <div className="relative w-10 h-10 rounded-full overflow-hidden ring-2 ring-primary/10 group-hover:ring-primary/20 transition-all">
                          <Image
                            src={deal.user.image}
                            alt={deal.user.name}
                            fill
                            className="object-cover"
                          />
                        </div>
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center ring-2 ring-primary/10 group-hover:ring-primary/20 transition-all">
                          <span className="text-primary text-sm font-semibold">
                            {deal.user.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      )}
                      <div className="flex flex-col">
                        <span className="text-sm font-semibold text-gray-800 dark:text-white">
                          {deal.user.name}
                        </span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {moment(deal.createdAt).fromNow()}
                        </span>
                      </div>
                    </Link>
                    <a
                      href={deal.link}
                      className="inline-flex items-center px-5 py-2.5 bg-primary hover:bg-primary/90 text-white rounded-lg transition-colors shadow-sm hover:shadow font-medium"
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                    >
                      View Deal
                    </a>
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
      {filteredDeals.length === 0 && !loading && (
        <div className="text-center py-8 text-foreground/70">
          No deals found matching your search.
        </div>
      )}
    </div>
  );
}
