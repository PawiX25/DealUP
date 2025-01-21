import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import moment from 'moment';
import Image from 'next/image';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { detectStore } from '@/utils/stores';
import Comments from '@/components/Comments';

export async function generateMetadata({ params }: { params: { id: string } }) {
  const deal = await prisma.deal.findUnique({
    where: { id: params.id },
    include: { user: true }
  });

  if (!deal) return { title: 'Deal not found' };

  return {
    title: `${deal.title} - DealUp`,
    description: deal.description
  };
}

export default async function DealPage({ params }: { params: { id: string } }) {
  const deal = await prisma.deal.findUnique({
    where: { id: params.id },
    include: { user: true }
  });

  const session = await getServerSession(authOptions);

  if (!deal) notFound();

  const storeName = detectStore(deal.link);
  const savings = deal.comparisonPrice 
    ? ((deal.comparisonPrice - deal.price) / deal.comparisonPrice * 100).toFixed(0)
    : null;

  return (
    <div className="min-h-screen p-8">
      <main className="max-w-4xl mx-auto">
        <div className="bg-background p-6 rounded-lg shadow-sm border border-border">
          <div className="flex gap-6 flex-col md:flex-row">
            {deal.imageUrl && (
              <div className="w-full md:w-1/3">
                <div className="aspect-square rounded-lg overflow-hidden">
                  <img
                    src={deal.imageUrl}
                    alt={deal.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            )}
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-foreground mb-2">{deal.title}</h1>
              {storeName && (
                <span className="inline-block mb-4 text-sm px-2 py-1 bg-secondary rounded-full text-foreground/70">
                  {storeName}
                </span>
              )}
              <p className="text-foreground/70 mb-4 whitespace-pre-line">{deal.description}</p>
              <div className="flex items-end gap-4 mb-6">
                <div>
                  <span className="text-3xl font-bold text-primary">
                    ${deal.price.toFixed(2)}
                  </span>
                  {deal.comparisonPrice && (
                    <div className="mt-1">
                      <span className="text-sm line-through text-foreground/60">
                        ${deal.comparisonPrice.toFixed(2)}
                      </span>
                      {savings && (
                        <span className="ml-2 text-sm text-green-600">
                          Save {savings}%
                        </span>
                      )}
                    </div>
                  )}
                </div>
                <a
                  href={deal.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
                >
                  Get This Deal
                </a>
              </div>
              <div className="flex items-center gap-2 border-t border-border pt-4">
                {deal.user.image ? (
                  <Image
                    src={deal.user.image}
                    alt={deal.user.name || ''}
                    width={32}
                    height={32}
                    className="rounded-full"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-primary text-sm font-medium">
                      {deal.user.name?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
                <div>
                  <p className="text-sm font-medium">{deal.user.name}</p>
                  <p className="text-xs text-foreground/60">
                    Posted {moment(deal.createdAt).fromNow()}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <Comments dealId={deal.id} session={session} />
      </main>
    </div>
  );
}
