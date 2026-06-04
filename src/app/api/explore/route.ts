import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const city = searchParams.get("city");
  const service = searchParams.get("service");
  const sort = searchParams.get("sort") || "rating"; // rating, name, newest

  const where: Record<string, unknown> = {};
  if (city) where.city = { contains: city };

  const salons = await prisma.salon.findMany({
    where,
    include: {
      reviews: { select: { rating: true } },
      services: { where: { isActive: true }, select: { name: true, price: true, category: true } },
      staff: { where: { isActive: true }, select: { id: true } },
      _count: { select: { appointments: true, reviews: true, clients: true } },
    },
  });

  // Calculate average ratings and format
  const formatted = salons.map((salon) => {
    const avgRating =
      salon.reviews.length > 0
        ? salon.reviews.reduce((sum, r) => sum + r.rating, 0) / salon.reviews.length
        : 0;
    const categories = [...new Set(salon.services.map((s) => s.category).filter(Boolean))];
    const priceRange =
      salon.services.length > 0
        ? {
            min: Math.min(...salon.services.map((s) => s.price)),
            max: Math.max(...salon.services.map((s) => s.price)),
          }
        : null;

    return {
      id: salon.id,
      name: salon.name,
      slug: salon.slug,
      description: salon.description,
      city: salon.city,
      country: salon.country,
      address: salon.address,
      logo: salon.logo,
      coverImage: salon.coverImage,
      avgRating: Math.round(avgRating * 10) / 10,
      reviewCount: salon._count.reviews,
      clientCount: salon._count.clients,
      staffCount: salon.staff.length,
      serviceCount: salon.services.length,
      categories,
      priceRange,
      plan: (salon as any).plan || "STARTER",
    };
  });

  // Sort
  if (sort === "rating") formatted.sort((a, b) => b.avgRating - a.avgRating);
  else if (sort === "name") formatted.sort((a, b) => a.name.localeCompare(b.name));
  else if (sort === "newest") {
    // already sorted by default
  }

  // Premium salons always appear first (boosted placement)
  formatted.sort((a, b) => {
    if (a.plan === "PREMIUM" && b.plan !== "PREMIUM") return -1;
    if (b.plan === "PREMIUM" && a.plan !== "PREMIUM") return 1;
    return 0;
  });

  return NextResponse.json({ salons: formatted });
}
