"use client";

import React, { useState, useEffect } from "react";
import {
  collection,
  query,
  where,
  getDocs,
  onSnapshot,
  orderBy,
  limit,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { COLLECTIONS } from "@/lib/collections";
import { Car, Package, Booking } from "@/types";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  Car as CarIcon,
  Package as PackageIcon,
  CalendarCheck,
  TrendingUp,
  Clock,
  DollarSign,
  AlertCircle,
} from "lucide-react";
import {
  format,
  startOfDay,
  endOfDay,
  startOfMonth,
  endOfMonth,
  subDays,
} from "date-fns";
import AdminHeader from "@/components/admin/AdminHeader";

interface StatCard {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  subtext: string;
  color: string;
}

interface ChartData {
  date: string;
  bookings: number;
  revenue: number;
}

interface BookingRow {
  bookingId: string;
  customerName: string;
  carName: string;
  packageName?: string;
  startDate: Date;
  endDate: Date;
  totalAmount: number;
  paymentStatus: string;
  bookingStatus: string;
}

export default function DashboardPage() {
  const [stats, setStats] = useState({
    totalCars: 0,
    availableCars: 0,
    totalPackages: 0,
    activePackages: 0,
    totalBookings: 0,
    bookingsToday: 0,
    revenueThisMonth: 0,
  });

  const [recentBookings, setRecentBookings] = useState<BookingRow[]>([]);
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [quickStats, setQuickStats] = useState({
    bookingsToday: 0,
    weekRevenue: 0,
    pendingPayments: 0,
    cancelledThisMonth: 0,
  });

  const today = new Date();
  const formattedDate = format(today, "EEEE, MMMM d, yyyy");

  // Fetch stats with real-time updates
  useEffect(() => {
    const unsubscribeCars = onSnapshot(
      collection(db, COLLECTIONS.CARS),
      (snapshot) => {
        const total = snapshot.size;
        const available = snapshot.docs.filter(
          (doc) => doc.data().available,
        ).length;
        setStats((prev) => ({
          ...prev,
          totalCars: total,
          availableCars: available,
        }));
      },
    );

    const unsubscribePackages = onSnapshot(
      collection(db, COLLECTIONS.PACKAGES),
      (snapshot) => {
        const total = snapshot.size;
        const active = snapshot.docs.filter(
          (doc) => doc.data().available,
        ).length;
        setStats((prev) => ({
          ...prev,
          totalPackages: total,
          activePackages: active,
        }));
      },
    );

    const unsubscribeBookings = onSnapshot(
      collection(db, COLLECTIONS.BOOKINGS),
      (snapshot) => {
        const total = snapshot.size;
        const today = new Date();
        const todayStart = startOfDay(today);
        const todayEnd = endOfDay(today);

        const todayCount = snapshot.docs.filter((doc) => {
          const createdAt =
            doc.data().createdAt?.toDate?.() || new Date(doc.data().createdAt);
          return createdAt >= todayStart && createdAt <= todayEnd;
        }).length;

        setStats((prev) => ({
          ...prev,
          totalBookings: total,
          bookingsToday: todayCount,
        }));
      },
    );

    return () => {
      unsubscribeCars();
      unsubscribePackages();
      unsubscribeBookings();
    };
  }, []);

  // Fetch revenue this month
  useEffect(() => {
    const fetchMonthRevenue = async () => {
      const monthStart = startOfMonth(today);
      const monthEnd = endOfMonth(today);

      const q = query(
        collection(db, COLLECTIONS.BOOKINGS),
        where("paymentStatus", "==", "paid"),
      );

      const snapshot = await getDocs(q);
      let revenue = 0;

      snapshot.forEach((doc) => {
        const createdAt =
          doc.data().createdAt?.toDate?.() || new Date(doc.data().createdAt);
        if (createdAt >= monthStart && createdAt <= monthEnd) {
          revenue += doc.data().totalAmount || 0;
        }
      });

      setStats((prev) => ({ ...prev, revenueThisMonth: revenue }));
    };

    fetchMonthRevenue();
  }, []);

  // Fetch recent bookings
  useEffect(() => {
    const fetchRecentBookings = async () => {
      const q = query(
        collection(db, COLLECTIONS.BOOKINGS),
        orderBy("createdAt", "desc"),
        limit(5),
      );

      const snapshot = await getDocs(q);
      const bookings: BookingRow[] = [];

      snapshot.forEach((doc) => {
        const data = doc.data();
        bookings.push({
          bookingId: doc.id,
          customerName: data.customerName,
          carName: data.carName,
          packageName: data.packageName,
          startDate: data.startDate?.toDate?.() || new Date(data.startDate),
          endDate: data.endDate?.toDate?.() || new Date(data.endDate),
          totalAmount: data.totalAmount,
          paymentStatus: data.paymentStatus,
          bookingStatus: data.bookingStatus,
        });
      });

      setRecentBookings(bookings);
    };

    fetchRecentBookings();
  }, []);

  // Fetch chart data (last 7 days)
  useEffect(() => {
    const fetchChartData = async () => {
      const data: ChartData[] = [];
      const snapshot = await getDocs(collection(db, COLLECTIONS.BOOKINGS));

      const bookingsByDate: Record<string, { count: number; revenue: number }> =
        {};

      snapshot.forEach((doc) => {
        const booking = doc.data();
        const createdAt =
          booking.createdAt?.toDate?.() || new Date(booking.createdAt);
        const dateKey = format(createdAt, "MMM d");

        if (!bookingsByDate[dateKey]) {
          bookingsByDate[dateKey] = { count: 0, revenue: 0 };
        }

        bookingsByDate[dateKey].count += 1;
        if (booking.paymentStatus === "paid") {
          bookingsByDate[dateKey].revenue += booking.totalAmount || 0;
        }
      });

      // Generate last 7 days
      for (let i = 6; i >= 0; i--) {
        const date = subDays(today, i);
        const dateKey = format(date, "MMM d");
        data.push({
          date: format(date, "ddd"),
          bookings: bookingsByDate[dateKey]?.count || 0,
          revenue: bookingsByDate[dateKey]?.revenue || 0,
        });
      }

      setChartData(data);
    };

    fetchChartData();
  }, []);

  // Fetch quick stats
  useEffect(() => {
    const fetchQuickStats = async () => {
      const snapshot = await getDocs(collection(db, COLLECTIONS.BOOKINGS));
      let bookingsToday = 0;
      let weekRevenue = 0;
      let pendingPayments = 0;
      let cancelledThisMonth = 0;

      const weekAgo = subDays(today, 7);
      const monthStart = startOfMonth(today);

      snapshot.forEach((doc) => {
        const booking = doc.data();
        const createdAt =
          booking.createdAt?.toDate?.() || new Date(booking.createdAt);

        // Bookings today
        const todayStart = startOfDay(today);
        const todayEnd = endOfDay(today);
        if (createdAt >= todayStart && createdAt <= todayEnd) {
          bookingsToday += 1;
        }

        // Week revenue
        if (createdAt >= weekAgo && booking.paymentStatus === "paid") {
          weekRevenue += booking.totalAmount || 0;
        }

        // Pending payments
        if (booking.paymentStatus === "pending") {
          pendingPayments += 1;
        }

        // Cancelled this month
        if (createdAt >= monthStart && booking.bookingStatus === "cancelled") {
          cancelledThisMonth += 1;
        }
      });

      setQuickStats({
        bookingsToday,
        weekRevenue,
        pendingPayments,
        cancelledThisMonth,
      });
    };

    fetchQuickStats();
  }, []);

  const statCards: StatCard[] = [
    {
      title: "Total Cars",
      value: stats.totalCars,
      icon: <CarIcon className="w-8 h-8 text-orange-500" />,
      subtext: `${stats.availableCars} available`,
      color: "#10b981",
    },
    {
      title: "Total Packages",
      value: stats.totalPackages,
      icon: <PackageIcon className="w-8 h-8 text-blue-500" />,
      subtext: `${stats.activePackages} active`,
      color: "#3b82f6",
    },
    {
      title: "Total Bookings",
      value: stats.totalBookings,
      icon: <CalendarCheck className="w-8 h-8 text-purple-500" />,
      subtext: `${stats.bookingsToday} today`,
      color: "#a855f7",
    },
    {
      title: "Revenue This Month",
      value: `PKR ${stats.revenueThisMonth.toLocaleString()}`,
      icon: <TrendingUp className="w-8 h-8 text-green-500" />,
      subtext: "Paid bookings",
      color: "#10b981",
    },
  ];

  const getPaymentBadgeClass = (status: string) => {
    switch (status) {
      case "paid":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-orange-100 text-orange-800";
      case "failed":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case "confirmed":
        return "bg-blue-100 text-blue-800";
      case "active":
        return "bg-green-100 text-green-800";
      case "completed":
        return "bg-gray-100 text-gray-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminHeader title="Dashboard" />
      <div className="p-8">
        {/* Header Info */}

        {/* Stats Cards Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-lg transition-shadow duration-300 relative min-h-[160px] flex flex-col justify-between group">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-gray-500 text-sm font-medium mb-1">
                  Total Cars
                </p>
                <p className="text-3xl font-bold text-slate-900">
                  {stats.totalCars}
                </p>
              </div>
              <div className="w-12 h-12 bg-orange-50 rounded-lg flex items-center justify-center group-hover:bg-orange-100 transition-colors">
                <CarIcon className="w-6 h-6 text-orange-500" />
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-gray-50">
              <p className="text-sm text-green-600 font-medium flex items-center gap-1">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                {stats.availableCars} available now
              </p>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-lg transition-shadow duration-300 relative min-h-[160px] flex flex-col justify-between group">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-gray-500 text-sm font-medium mb-1">
                  Total Packages
                </p>
                <p className="text-3xl font-bold text-slate-900">
                  {stats.totalPackages}
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center group-hover:bg-blue-100 transition-colors">
                <PackageIcon className="w-6 h-6 text-blue-500" />
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-gray-50">
              <p className="text-sm text-green-600 font-medium flex items-center gap-1">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                {stats.activePackages} active
              </p>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-lg transition-shadow duration-300 relative min-h-[160px] flex flex-col justify-between group">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-gray-500 text-sm font-medium mb-1">
                  Total Bookings
                </p>
                <p className="text-3xl font-bold text-slate-900">
                  {stats.totalBookings}
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-50 rounded-lg flex items-center justify-center group-hover:bg-purple-100 transition-colors">
                <CalendarCheck className="w-6 h-6 text-purple-500" />
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-gray-50">
              <p className="text-sm text-green-600 font-medium">
                {stats.bookingsToday} today
              </p>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-lg transition-shadow duration-300 relative min-h-[160px] flex flex-col justify-between group">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-gray-500 text-sm font-medium mb-1">
                  Revenue This Month
                </p>
                <p className="text-2xl font-bold text-slate-900">
                  PKR {stats.revenueThisMonth.toLocaleString()}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center group-hover:bg-green-100 transition-colors">
                <TrendingUp className="w-6 h-6 text-green-500" />
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-gray-50">
              <p className="text-sm text-green-600 font-medium">
                Paid bookings
              </p>
            </div>
          </div>
        </div>

        {/* Quick Stats Row - Enhanced with larger cards and hover effects */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-lg transition-shadow duration-300 relative min-h-[160px] flex flex-col justify-between group">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-gray-500 text-sm font-medium mb-1">
                  Today's Bookings
                </p>
                <p className="text-3xl font-bold text-slate-900">
                  {quickStats.bookingsToday}
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center group-hover:bg-blue-100 transition-colors">
                <CalendarCheck className="w-6 h-6 text-blue-500" />
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-gray-50">
              <p className="text-sm text-blue-600 font-medium">
                Active bookings
              </p>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-lg transition-shadow duration-300 relative min-h-[160px] flex flex-col justify-between group">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-gray-500 text-sm font-medium mb-1">
                  This Week Revenue
                </p>
                <p className="text-2xl font-bold text-slate-900">
                  PKR {(quickStats.weekRevenue / 1000).toFixed(0)}k
                </p>
              </div>
              <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center group-hover:bg-green-100 transition-colors">
                <DollarSign className="w-6 h-6 text-green-500" />
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-gray-50">
              <p className="text-sm text-green-600 font-medium">Week total</p>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-lg transition-shadow duration-300 relative min-h-[160px] flex flex-col justify-between group">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-gray-500 text-sm font-medium mb-1">
                  Pending Payments
                </p>
                <p
                  className={`text-3xl font-bold ${quickStats.pendingPayments > 0 ? "text-orange-600" : "text-slate-900"}`}
                >
                  {quickStats.pendingPayments}
                </p>
              </div>
              <div className="w-12 h-12 bg-orange-50 rounded-lg flex items-center justify-center group-hover:bg-orange-100 transition-colors">
                <Clock
                  className={`w-6 h-6 ${quickStats.pendingPayments > 0 ? "text-orange-500" : "text-gray-400"}`}
                />
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-gray-50">
              <p
                className={`text-sm font-medium ${quickStats.pendingPayments > 0 ? "text-orange-600" : "text-green-600"}`}
              >
                {quickStats.pendingPayments > 0
                  ? "Awaiting payment"
                  : "All paid"}
              </p>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-lg transition-shadow duration-300 relative min-h-[160px] flex flex-col justify-between group">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-gray-500 text-sm font-medium mb-1">
                  Cancelled This Month
                </p>
                <p className="text-3xl font-bold text-slate-900">
                  {quickStats.cancelledThisMonth}
                </p>
              </div>
              <div className="w-12 h-12 bg-red-50 rounded-lg flex items-center justify-center group-hover:bg-red-100 transition-colors">
                <AlertCircle className="w-6 h-6 text-red-500" />
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-gray-50">
              <p className="text-sm text-red-600 font-medium">Month total</p>
            </div>
          </div>
        </div>

        {/* Recent Bookings Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-slate-900">
              Recent Bookings
            </h2>
            <a
              href="/admin/bookings"
              className="text-orange-500 hover:text-orange-600 font-medium"
            >
              View All →
            </a>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">
                    Customer
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">
                    Car / Package
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">
                    Dates
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">
                    Amount
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">
                    Payment
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {recentBookings.length > 0 ? (
                  recentBookings.map((booking) => (
                    <tr
                      key={booking.bookingId}
                      className="border-b border-gray-100 hover:bg-gray-50"
                    >
                      <td className="py-4 px-4 text-gray-900 font-medium">
                        {booking.customerName}
                      </td>
                      <td className="py-4 px-4 text-gray-700">
                        {booking.carName}
                        {booking.packageName && ` / ${booking.packageName}`}
                      </td>
                      <td className="py-4 px-4 text-gray-700">
                        {format(booking.startDate, "dd MMM yyyy")} -{" "}
                        {format(booking.endDate, "dd MMM yyyy")}
                      </td>
                      <td className="py-4 px-4 font-medium text-gray-900">
                        PKR {booking.totalAmount.toLocaleString()}
                      </td>
                      <td className="py-4 px-4">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${getPaymentBadgeClass(booking.paymentStatus)}`}
                        >
                          {booking.paymentStatus.charAt(0).toUpperCase() +
                            booking.paymentStatus.slice(1)}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadgeClass(booking.bookingStatus)}`}
                        >
                          {booking.bookingStatus.charAt(0).toUpperCase() +
                            booking.bookingStatus.slice(1)}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="py-6 text-center text-gray-500">
                      No bookings yet
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Revenue Chart */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mt-8 mb-8">
          <h2 className="text-xl font-bold text-slate-900 mb-6">
            Last 7 Days Revenue
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={chartData}
              margin={{ left: 60, right: 0, top: 0, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="date" stroke="#6b7280" />
              <YAxis stroke="#6b7280" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#fff",
                  border: "1px solid #e5e7eb",
                  borderRadius: "8px",
                }}
                formatter={(value) =>
                  value ? (value as number).toLocaleString() : "0"
                }
              />
              <Legend />
              <Bar
                dataKey="bookings"
                fill="#3b82f6"
                name="Bookings Count"
                radius={[8, 8, 0, 0]}
              />
              <Bar
                dataKey="revenue"
                fill="#f5a623"
                name="Revenue (PKR)"
                radius={[8, 8, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
