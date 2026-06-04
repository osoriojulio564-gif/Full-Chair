import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: { slug: string } }
) {
  const { slug } = params;

  const salon = await prisma.salon.findUnique({
    where: { slug },
    include: {
      staff: {
        where: { isActive: true },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          role: true,
          bio: true,
          avatar: true,
        },
      },
      services: {
        where: { isActive: true },
        select: {
          id: true,
          name: true,
          duration: true,
          price: true,
          category: true,
          color: true,
        },
        orderBy: { name: "asc" },
      },
      reviews: {
        take: 6,
        orderBy: { createdAt: "desc" },
        include: {
          client: { select: { firstName: true, lastName: true } },
        },
      },
      _count: { select: { reviews: true, clients: true } },
    },
  });

  if (!salon) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const avgRating =
    salon.reviews.length > 0
      ? salon.reviews.reduce((sum, r) => sum + r.rating, 0) /
        salon.reviews.length
      : 0;

  return NextResponse.json({
    salon: {
      ...salon,
      avgRating: Math.round(avgRating * 10) / 10,
      password: undefined,
    },
  });
}
