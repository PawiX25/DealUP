'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';
import moment from 'moment';
import { useSession } from 'next-auth/react';
import DealList from './DealList';

interface Deal {
  id: string;
  title: string;
  description: string;
  price: number;
  comparisonPrice?: number;
  imageUrl?: string;
  link: string;
  createdAt: string;
  user: {
    id: string;
    name: string;
    image: string | null;
  };
}

interface UserProfileProps {
  user: {
    id: string;
    name: string;
    image: string | null;
    email: string;
    deals: Deal[];
    _count: {
      deals: number;
    };
  };
}

export default function UserProfile({ user }: UserProfileProps) {
  const { data: session } = useSession();
  const isOwnProfile = session?.user?.id === user.id;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-background rounded-xl p-6 shadow-sm border border-border mb-8"
      >
        <div className="flex items-center gap-6">
          <div className="relative w-24 h-24 rounded-full overflow-hidden bg-secondary">
            {user.image ? (
              <Image
                src={user.image}
                alt={user.name}
                fill
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-primary/10">
                <span className="text-3xl font-medium text-primary">
                  {user.name.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">{user.name}</h1>
            {isOwnProfile && (
              <p className="text-foreground/60">{user.email}</p>
            )}
            <div className="mt-2 flex items-center gap-4">
              <span className="text-foreground/60">
                {user._count.deals} deals shared
              </span>
              <span className="text-foreground/60">
                Member since {moment(user.createdAt).format('MMMM YYYY')}
              </span>
            </div>
          </div>
        </div>
      </motion.div>

      <h2 className="text-xl font-semibold mb-6">Deals by {user.name}</h2>
      <DealList initialDeals={user.deals} userId={user.id} />
    </div>
  );
}
