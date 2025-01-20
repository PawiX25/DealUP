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
      <div className="grid gap-6">
        {filteredDeals.map((deal, index) => {
          const savings = calculateSavings(deal.price, deal.comparisonPrice);
          const storeName = detectStore(deal.link);
          
          return (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              key={deal.id}
              className="bg-background p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow border border-border overflow-hidden"
            >
              <div className="flex gap-6">
                {deal.imageUrl && (
                  <div className="flex-shrink-0 w-48 h-32 rounded-lg overflow-hidden">
                    <img
                      src={deal.imageUrl}
                      alt={deal.title}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = 'https://placehold.co/192x128?text=No+Image';
                      }}
                    />
                  </div>
                )}
                <div className="flex-grow">
                  <div className="flex justify-between items-start">
                    <div>
                      <h2 className="text-xl font-semibold text-foreground">{deal.title}</h2>
                      {storeName && (
                        <span className="inline-block mt-1 text-sm px-2 py-1 bg-secondary rounded-full text-foreground/70">
                          {storeName}
                        </span>
                      )}
                      <p className="mt-2 text-foreground/70">{deal.description}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-2xl font-bold text-primary">
                        ${deal.price.toFixed(2)}
                      </span>
                      {deal.comparisonPrice && (
                        <div className="mt-1">
                          <span className="text-sm line-through text-foreground/60">
                            ${deal.comparisonPrice.toFixed(2)}
                          </span>
                          {savings && (
                            <span className="ml-2 text-sm text-green-600">
                              Save {savings.percentage}%
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="mt-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Link href={`/profile/${deal.user.id}`} className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                        {deal.user.image ? (
                          <div className="relative w-8 h-8 rounded-full overflow-hidden bg-secondary">
                            <Image
                              src={deal.user.image}
                              alt={deal.user.name}
                              fill
                              className="object-cover"
                            />
                          </div>
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                            <span className="text-primary text-sm font-medium">
                              {deal.user.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                        )}
                        <div className="flex flex-col">
                          <span className="text-sm font-medium text-foreground">
                            {deal.user.name}
                          </span>
                          <span className="text-xs text-foreground/60">
                            {moment(deal.createdAt).fromNow()}
                          </span>
                        </div>
                      </Link>
                    </div>
                    <a
                      href={deal.link}
                      className="inline-flex items-center px-4 py-2 bg-primary hover:bg-primary-hover text-white rounded-md transition-colors"
                      target="_blank"
                      rel="noopener noreferrer"
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
