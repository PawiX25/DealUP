import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import UserProfile from '@/components/UserProfile';

export default async function ProfilePage({ params }: { params: { userId: string } }) {
  const user = await prisma.user.findUnique({
    where: { id: params.userId },
    include: {
      deals: {
        orderBy: { createdAt: 'desc' },
        include: { user: true }
      },
      _count: {
        select: { deals: true }
      }
    }
  });

  if (!user) {
    notFound();
  }

  return <UserProfile user={user} />;
}
