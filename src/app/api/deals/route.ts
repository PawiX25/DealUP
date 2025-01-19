import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';

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
    const data = await request.json();
    
    if (!data.title || !data.description || !data.price || !data.link || !data.userId) {
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

    let user = await prisma.user.findFirst({
      where: { id: data.userId }
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          id: data.userId,
          email: `temp-${data.userId}@example.com`,
          name: 'Anonymous User'
        }
      });
    }

    const deal = await prisma.deal.create({
      data: {
        title: data.title,
        description: data.description,
        price: data.price,
        comparisonPrice: data.comparisonPrice ? parseFloat(data.comparisonPrice) : null,
        imageUrl: data.imageUrl || null,
        link: data.link,
        userId: user.id,
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
