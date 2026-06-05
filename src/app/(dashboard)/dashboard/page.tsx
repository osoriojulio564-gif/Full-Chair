import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatCurrency } from "@/lib/utils";
import {
  Calendar,
  Users,
  DollarSign,
  Star,
  TrendingUp,
  AlertCircle,
  Clock,
} from "lucide-react";

export default async function DashboardPage() {
  const session = await getSession();
  if (!session) return null;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

  const [
    todayAppointments,
    monthAppointments,
    totalClients,
    monthRevenue,
    avgRating,
    pendingCount,
    recentReviews,
    upcomingAppointments,
  ] = await Promise.all([
    prisma.appointment.count({
      where: {
        salonId: session.salonId,
        date: { gte: today, lt: tomorrow },
      },
    }),
    prisma.appointment.count({
      where: {
        salonId: session.salonId,
        date: { gte: startOfMonth },
      },
    }),
    prisma.client.count({
      where: { salonId: session.salonId },
    }),
    prisma.appointment.aggregate({
      where: {
        salonId: session.salonId,
        date: { gte: startOfMonth },
        status: "COMPLETED",
      },
      _sum: { price: true },
    }),
    prisma.review.aggregate({
      where: { salonId: session.salonId },
      _avg: { rating: true },
    }),
    prisma.appointment.count({
      where: {
        salonId: session.salonId,
        status: "PENDING",
      },
    }),
    prisma.review.findMany({
      where: { salonId: session.salonId },
      take: 5,
      orderBy: { createdAt: "desc" },
      include: {
        client: true,
        staff: true,
      },
    }),
    prisma.appointment.findMany({
      where: {
        salonId: session.salonId,
        date: { gte: today },
        status: { in: ["PENDING", "CONFIRMED"] },
      },
      take: 8,
      orderBy: [{ date: "asc" }, { startTime: "asc" }],
      include: {
        client: true,
        staff: true,
        service: true,
      },
    }),
  ]);

  const revenue = monthRevenue._sum.price ?? 0;
  const rating = avgRating._avg.rating ?? 0;

  const stats = [
    {
      label: "Today's Appointments",
      value: todayAppointments,
      icon: Calendar,
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      label: "Monthly Appointments",
      value: monthAppointments,
      icon: TrendingUp,
      color: "text-brand-600",
      bg: "bg-brand-50",
    },
    {
      label: "Total Clients",
      value: totalClients,
      icon: Users,
      color: "text-green-600",
      bg: "bg-green-50",
    },
    {
      label: "Monthly Revenue",
      value: formatCurrency(Number(revenue)),
      icon: DollarSign,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
    },
    {
      label: "Average Rating",
      value: rating ? rating.toFixed(1) : "N/A",
      icon: Star,
      color: "text-yellow-600",
      bg: "bg-yellow-50",
    },
    {
      label: "Pending Appointments",
      value: pendingCount,
      icon: AlertCircle,
      color: "text-orange-600",
      bg: "bg-orange-50",
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-heading font-medium text-charcoal">Dashboard</h1>
        <p className="text-gray-500 mt-1">
          Welcome back! Here&apos;s an overview of your salon.
        </p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="card p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">{stat.label}</p>
                  <p className="text-2xl font-heading font-medium text-charcoal mt-1">
                    {stat.value}
                  </p>
                </div>
                <div className={`${stat.bg} p-3 rounded-full`}>
                  <Icon className={`w-6 h-6 ${stat.color}`} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Upcoming Appointments & Recent Reviews */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Appointments */}
        <div className="card p-6">
          <div className="flex items-center gap-2 mb-4">
            <Clock className="w-5 h-5 text-gray-500" />
            <h2 className="text-lg font-heading font-medium text-charcoal">
              Upcoming Appointments
            </h2>
          </div>
          {upcomingAppointments.length === 0 ? (
            <p className="text-gray-500 text-sm">
              No upcoming appointments scheduled.
            </p>
          ) : (
            <div className="space-y-3">
              {upcomingAppointments.map((appointment) => (
                <div
                  key={appointment.id}
                  className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {appointment.client.firstName} {appointment.client.lastName}
                    </p>
                    <p className="text-xs text-gray-500">
                      {appointment.service.name} with{" "}
                      {appointment.staff.firstName}
                    </p>
                  </div>
                  <div className="text-right ml-4">
                    <p className="text-sm text-gray-900">
                      {new Date(appointment.date).toLocaleDateString()}
                    </p>
                    <p className="text-xs text-gray-500">
                      {appointment.startTime}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Reviews */}
        <div className="card p-6">
          <div className="flex items-center gap-2 mb-4">
            <Star className="w-5 h-5 text-gray-500" />
            <h2 className="text-lg font-heading font-medium text-charcoal">
              Recent Reviews
            </h2>
          </div>
          {recentReviews.length === 0 ? (
            <p className="text-gray-500 text-sm">No reviews yet.</p>
          ) : (
            <div className="space-y-3">
              {recentReviews.map((review) => (
                <div
                  key={review.id}
                  className="py-3 border-b border-gray-100 last:border-0"
                >
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-sm font-medium text-gray-900">
                      {review.client.firstName} {review.client.lastName}
                    </p>
                    <div className="flex items-center gap-0.5">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`w-4 h-4 ${
                            star <= review.rating
                              ? "fill-yellow-400 text-yellow-400"
                              : "text-gray-200"
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                  {review.comment && (
                    <p className="text-xs text-gray-500 line-clamp-2">
                      {review.comment}
                    </p>
                  )}
                  <p className="text-xs text-gray-400 mt-1">
                    Staff: {review.staff.firstName}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
