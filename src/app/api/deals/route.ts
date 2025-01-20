import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';

export async function GET() {
  try {
    const deals = await prisma.deal.findMany({
      include: {
        user: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
    
    return NextResponse.json(deals);
  } catch (error) {
    console.error('Failed to fetch deals:', error);
    return NextResponse.json(
      { error: 'Failed to fetch deals' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'You must be logged in to create a deal' },
        { status: 401 }
      );
    }

    const data = await request.json();
    
    if (!data.title || !data.description || !data.price || !data.link) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    if (typeof data.price !== 'number' || isNaN(data.price)) {
      return NextResponse.json(
        { error: 'Price must be a valid number' },
        { status: 400 }
      );
    }

    const deal = await prisma.deal.create({
      data: {
        title: data.title,
        description: data.description,
        price: data.price,
        comparisonPrice: data.comparisonPrice ? parseFloat(data.comparisonPrice) : null,
        imageUrl: data.imageUrl || null,
        link: data.link,
        userId: session.user.id,
      }
    });
    
    return NextResponse.json({ success: true, data: deal });
  } catch (error) {
    console.error('Failed to create deal:', error);
    
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      return NextResponse.json(
        { error: 'Database error', details: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to create deal' },
      { status: 500 }
    );
  }
}
