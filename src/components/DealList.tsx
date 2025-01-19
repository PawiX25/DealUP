'use client';

import { useEffect, useState } from 'react';
import moment from 'moment';
import { motion } from 'framer-motion';
import { detectStore } from '@/utils/stores';

interface Deal {
  id: string;
  title: string;
  description: string;
  price: number;
  link: string;
  createdAt: string;
  user: {
    name: string;
  };
  comparisonPrice?: number;
  imageUrl?: string;
}

export default function DealList() {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/deals')
      .then(res => res.json())
      .then(data => {
        setDeals(data);
        setLoading(false);
      });
  }, []);

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
    <div className="grid gap-6">
      {deals.map((deal, index) => {
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
                  <div className="text-sm text-foreground/60">
                    Posted by {deal.user.name} • {moment(deal.createdAt).fromNow()}
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
  );
}
