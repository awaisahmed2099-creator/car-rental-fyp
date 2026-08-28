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
  doc,
  getDoc,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { COLLECTIONS } from "@/lib/collections";
import { Car, Package, Booking } from "@/types";
import {
  AreaChart,
  Area,
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
  Users,
  Mail,
  Phone,
  Calendar,
} from "lucide-react";
import {
  format,
  startOfDay,
  endOfDay,
  startOfMonth,
  endOfMonth,
  subDays,
  formatDistanceToNow,
} from "date-fns";
import AdminHeader from "@/components/admin/AdminHeader";

const getInitials = (name?: string | null, email?: string | null) => {
  const targetString = (name && name.toLowerCase() !== 'unknown user') ? name : (email || 'U');
  const words = targetString.trim().split(/\s+/);
  if (words.length === 1) return words[0].charAt(0).toUpperCase();
  return (words[0].charAt(0) + words[words.length - 1].charAt(0)).toUpperCase();
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white dark:bg-[#1a1a24] border border-gray-200 dark:border-[#2a2a3a] p-3 rounded-lg shadow-lg">
        <p className="font-semibold text-gray-900 dark:text-white mb-1">{label}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} style={{ color: entry.color }} className="text-sm">
            {entry.name}: {entry.value.toLocaleString()}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

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
  name?: string;
  userName?: string;
  customerEmail?: string;
  email?: string;
  userEmail?: string;
  customerPhone?: string;
  phone?: string;
  phoneNumber?: string;
  carName: string;
  carModel?: string;
  year?: string;
  packageName?: string;
  packageDescription?: string;
  packageDetails?: string;
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
    totalUsers: 0,
    onlineUsers: 0,
  });

  const [recentBookings, setRecentBookings] = useState<BookingRow[]>([]);
  const [onlineUsersList, setOnlineUsersList] = useState<any[]>([]);
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
      (error) => console.log("Silent error:", error)
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
      (error) => console.log("Silent error:", error)
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
      (error) => console.log("Silent error:", error)
    );

    const unsubscribeUsers = onSnapshot(
      collection(db, "users"),
      (snapshot) => {
        let onlineCount = 0;
        let totalCount = 0;
        const onlineArr: any[] = [];
        const tenMinsAgo = new Date(Date.now() - 10 * 60 * 1000);
        snapshot.forEach((doc) => {
          const data = doc.data();
          if (data?.role?.toLowerCase() === 'admin' || data?.email === 'admin@test.com') return;
          
          totalCount++;
          if (data.lastActive) {
            const lastActiveTime = data.lastActive?.toDate?.() || new Date(data.lastActive);
            if (lastActiveTime > tenMinsAgo) {
              onlineCount++;
              onlineArr.push({ id: doc.id, ...data });
            }
          }
        });
        
        onlineArr.sort((a, b) => {
          const timeA = a.lastActive?.toDate?.()?.getTime?.() || new Date(a.lastActive || 0).getTime();
          const timeB = b.lastActive?.toDate?.()?.getTime?.() || new Date(b.lastActive || 0).getTime();
          return timeB - timeA;
        });
        setOnlineUsersList(onlineArr);

        setStats((prev) => ({
          ...prev,
          totalUsers: totalCount,
          onlineUsers: onlineCount,
        }));
      },
      (error) => console.log("Silent error:", error)
    );

    return () => {
      unsubscribeCars();
      unsubscribePackages();
      unsubscribeBookings();
      unsubscribeUsers();
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
      const bookings: BookingRow[] = await Promise.all(
        snapshot.docs.map(async (docSnapshot) => {
          const data = docSnapshot.data();
          let carModel = data.carModel || data.model || "";
          let packageDescription = data.packageDescription || data.packageDetails || "";
          let packageDetails = data.packageDetails || "";

          if (!packageDescription && data.packageId) {
            try {
              const pkgRef = doc(db, COLLECTIONS.PACKAGES, data.packageId);
              const pkgSnap = await getDoc(pkgRef);
              if (pkgSnap.exists()) {
                const pkgData = pkgSnap.data();
                packageDescription = pkgData.description || pkgData.details || pkgData.includedCars || "";
                if (!packageDetails && pkgData.cars) {
                  packageDetails = pkgData.cars.map((c: any) => `${c.quantity}x ${c.carName}`).join(' and ');
                }
              }
            } catch (error) {
              console.error("Error fetching package details:", error);
            }
          }

          if (!carModel && data.carId) {
            try {
              const carRef = doc(db, COLLECTIONS.CARS, data.carId);
              const carSnap = await getDoc(carRef);
              if (carSnap.exists()) {
                const carData = carSnap.data();
                carModel = carData.model || "";
              }
            } catch (error) {
              console.error("Error fetching car details:", error);
            }
          }

          return {
            bookingId: docSnapshot.id,
            customerName: data.customerName || data.name || "",
            customerEmail: data.customerEmail || data.email || "",
            customerPhone: data.customerPhone || data.phone || "",
            carName: data.carName,
            carModel,
            packageName: data.packageName,
            packageDescription,
            packageDetails,
            startDate: data.startDate?.toDate?.() || new Date(data.startDate),
            endDate: data.endDate?.toDate?.() || new Date(data.endDate),
            totalAmount: data.totalAmount,
            paymentStatus: data.paymentStatus,
            bookingStatus: data.bookingStatus,
          };
        })
      );

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
          date: format(date, "MMM dd"),
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
        return "bg-green-500/10 text-green-500 border border-green-500/20";
      case "pending":
        return "bg-orange-500/10 text-orange-500 border border-orange-500/20";
      case "failed":
        return "bg-red-500/10 text-red-500 border border-red-500/20";
      default:
        return "bg-gray-500/10 text-gray-600 dark:text-gray-400 border border-gray-500/20";
    }
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case "confirmed":
        return "bg-blue-500/10 text-blue-500 border border-blue-500/20";
      case "active":
        return "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20";
      case "completed":
        return "bg-green-500/10 text-green-500 border border-green-500/20";
      case "cancelled":
        return "bg-red-500/10 text-red-500 border border-red-500/20";
      default:
        return "bg-gray-500/10 text-gray-600 dark:text-gray-400 border border-gray-500/20";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0a0a0f]">
      <AdminHeader title="Dashboard" />
      <div className="p-8">
        {/* Header Info */}

        {/* Stats Cards Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 mb-8">
          <div className="bg-white dark:bg-[#1a1a24] rounded-xl border border-gray-200 dark:border-[#2a2a3a] p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-orange-500/10 hover:border-orange-500/50 dark:hover:border-orange-500/50 relative h-full min-h-[175px] flex flex-col justify-between group cursor-default">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-gray-600 dark:text-gray-400 text-sm font-medium mb-1">
                  Total Cars
                </p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">
                  {stats.totalCars}
                </p>
              </div>
              <div className="w-12 h-12 bg-orange-500/10 rounded-lg flex items-center justify-center group-hover:bg-orange-500/20 transition-colors border border-orange-500/20">
                <CarIcon className="w-6 h-6 text-orange-500" />
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-[#2a2a3a]">
              <p className="text-sm text-orange-500 font-medium flex items-center gap-1">
                <span className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></span>
                {stats.availableCars} available now
              </p>
            </div>
          </div>

          <div className="bg-white dark:bg-[#1a1a24] rounded-xl border border-gray-200 dark:border-[#2a2a3a] p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-blue-500/10 hover:border-blue-500/50 dark:hover:border-blue-500/50 relative h-full min-h-[175px] flex flex-col justify-between group cursor-default">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-gray-600 dark:text-gray-400 text-sm font-medium mb-1">
                  Total Packages
                </p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">
                  {stats.totalPackages}
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-500/10 rounded-lg flex items-center justify-center group-hover:bg-blue-500/20 transition-colors border border-blue-500/20">
                <PackageIcon className="w-6 h-6 text-blue-500" />
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-[#2a2a3a]">
              <p className="text-sm text-blue-500 font-medium flex items-center gap-1">
                <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                {stats.activePackages} active
              </p>
            </div>
          </div>

          <div className="bg-white dark:bg-[#1a1a24] rounded-xl border border-gray-200 dark:border-[#2a2a3a] p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-purple-500/10 hover:border-purple-500/50 dark:hover:border-purple-500/50 relative h-full min-h-[175px] flex flex-col justify-between group cursor-default">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-gray-600 dark:text-gray-400 text-sm font-medium mb-1">
                  Total Bookings
                </p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">
                  {stats.totalBookings}
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-500/10 rounded-lg flex items-center justify-center group-hover:bg-purple-500/20 transition-colors border border-purple-500/20">
                <CalendarCheck className="w-6 h-6 text-purple-500" />
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-[#2a2a3a]">
              <p className="text-sm text-purple-500 font-medium">
                {stats.bookingsToday} today
              </p>
            </div>
          </div>

          <div className="bg-white dark:bg-[#1a1a24] rounded-xl border border-gray-200 dark:border-[#2a2a3a] p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-indigo-500/10 hover:border-indigo-500/50 dark:hover:border-indigo-500/50 relative h-full min-h-[175px] flex flex-col justify-between group cursor-default">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-gray-600 dark:text-gray-400 text-sm font-medium mb-1">
                  Revenue This Month
                </p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">
                  <span className="text-xl">PKR</span> {stats.revenueThisMonth >= 100000 ? `${(stats.revenueThisMonth / 100000).toFixed(1)}L` : stats.revenueThisMonth.toLocaleString('en-IN')}
                </p>
              </div>
              <div className="w-12 h-12 bg-indigo-500/10 rounded-lg flex items-center justify-center group-hover:bg-indigo-500/20 transition-colors border border-indigo-500/20">
                <TrendingUp className="w-6 h-6 text-indigo-500" />
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-[#2a2a3a]">
              <p className="text-sm text-indigo-500 font-medium flex items-center gap-1">
                Paid bookings
              </p>
            </div>
          </div>

          <div className="bg-white dark:bg-[#1a1a24] rounded-xl border border-gray-200 dark:border-[#2a2a3a] p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-green-500/10 hover:border-green-500/50 dark:hover:border-green-500/50 relative h-full min-h-[175px] flex flex-col justify-between group cursor-default">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-gray-600 dark:text-gray-400 text-sm font-medium mb-1">
                  Total Users
                </p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">
                  {stats.totalUsers}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-500/10 rounded-lg flex items-center justify-center group-hover:bg-green-500/20 transition-colors border border-green-500/20">
                <Users className="w-6 h-6 text-green-500" />
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-[#2a2a3a]">
              <p className="text-sm text-green-500 font-medium flex items-center gap-1">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                {stats.onlineUsers} online now
              </p>
            </div>
          </div>
        </div>

        {/* Quick Stats Row - Enhanced with larger cards and hover effects */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-[#1a1a24] rounded-xl border border-gray-200 dark:border-[#2a2a3a] p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-blue-500/10 hover:border-blue-500/50 dark:hover:border-blue-500/50 relative h-full min-h-[175px] flex flex-col justify-between group cursor-default">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-gray-600 dark:text-gray-400 text-sm font-medium mb-1">
                  Today's Bookings
                </p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">
                  {quickStats.bookingsToday}
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-500/10 rounded-lg flex items-center justify-center group-hover:bg-blue-500/20 transition-colors border border-blue-500/20">
                <CalendarCheck className="w-6 h-6 text-blue-500" />
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-[#2a2a3a]">
              <p className="text-sm text-blue-500 font-medium">
                Active bookings
              </p>
            </div>
          </div>

          <div className="bg-white dark:bg-[#1a1a24] rounded-xl border border-gray-200 dark:border-[#2a2a3a] p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-green-500/10 hover:border-green-500/50 dark:hover:border-green-500/50 relative h-full min-h-[175px] flex flex-col justify-between group cursor-default">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-gray-600 dark:text-gray-400 text-sm font-medium mb-1">
                  This Week Revenue
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  PKR {(quickStats.weekRevenue / 1000).toFixed(0)}k
                </p>
              </div>
              <div className="w-12 h-12 bg-green-500/10 rounded-lg flex items-center justify-center group-hover:bg-green-500/20 transition-colors border border-green-500/20">
                <DollarSign className="w-6 h-6 text-green-500" />
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-[#2a2a3a]">
              <p className="text-sm text-green-500 font-medium">Week total</p>
            </div>
          </div>

          <div className="bg-white dark:bg-[#1a1a24] rounded-xl border border-gray-200 dark:border-[#2a2a3a] p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-orange-500/10 hover:border-orange-500/50 dark:hover:border-orange-500/50 relative h-full min-h-[175px] flex flex-col justify-between group cursor-default">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-gray-600 dark:text-gray-400 text-sm font-medium mb-1">
                  Pending Payments
                </p>
                <p
                  className={`text-3xl font-bold ${quickStats.pendingPayments > 0 ? "text-orange-500" : "text-gray-900 dark:text-white"}`}
                >
                  {quickStats.pendingPayments}
                </p>
              </div>
              <div className="w-12 h-12 bg-orange-500/10 rounded-lg flex items-center justify-center group-hover:bg-orange-500/20 transition-colors border border-orange-500/20">
                <Clock
                  className={`w-6 h-6 ${quickStats.pendingPayments > 0 ? "text-orange-500" : "text-gray-600 dark:text-gray-400"}`}
                />
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-[#2a2a3a]">
              <p
                className={`text-sm font-medium ${quickStats.pendingPayments > 0 ? "text-orange-500" : "text-green-500"}`}
              >
                {quickStats.pendingPayments > 0
                  ? "Awaiting payment"
                  : "All paid"}
              </p>
            </div>
          </div>

          <div className="bg-white dark:bg-[#1a1a24] rounded-xl border border-gray-200 dark:border-[#2a2a3a] p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-red-500/10 hover:border-red-500/50 dark:hover:border-red-500/50 relative h-full min-h-[175px] flex flex-col justify-between group cursor-default">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-gray-600 dark:text-gray-400 text-sm font-medium mb-1">
                  Cancelled This Month
                </p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">
                  {quickStats.cancelledThisMonth}
                </p>
              </div>
              <div className="w-12 h-12 bg-red-500/10 rounded-lg flex items-center justify-center group-hover:bg-red-500/20 transition-colors border border-red-500/20">
                <AlertCircle className="w-6 h-6 text-red-500" />
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-[#2a2a3a]">
              <p className="text-sm text-red-500 font-medium">Month total</p>
            </div>
          </div>
        </div>

        {/* Recent Bookings Table */}
        <div className="bg-white dark:bg-[#1a1a24] rounded-xl border border-gray-200 dark:border-[#2a2a3a] p-6 mb-8 overflow-hidden">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
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
                <tr className="border-b border-gray-200 dark:border-[#2a2a3a] bg-gray-50 dark:bg-[#0a0a0f]">
                  <th className="text-left py-3 px-4 font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider text-xs">
                    User
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider text-xs">
                    Booking ID
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider text-xs">
                    <div className="flex flex-col">
                      <span>BOOKEDITEM</span>
                      <span>(CAR/PACKAGE)</span>
                    </div>
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider text-xs">
                    <div className="flex flex-col">
                      <span>DATES</span>
                      <span>(START - END)</span>
                    </div>
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider text-xs">
                    Amount
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider text-xs">
                    Payment
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider text-xs">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {recentBookings.length > 0 ? (
                  recentBookings.map((booking) => (
                    <tr
                      key={booking.bookingId}
                      className="border-b border-gray-200 dark:border-[#2a2a3a] hover:bg-white/5 transition-colors"
                    >
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          <div className="flex-shrink-0 flex items-center justify-center w-10 h-10 rounded-full bg-orange-100 dark:bg-orange-500/20 text-orange-600 dark:text-orange-400 font-bold tracking-wider">
                            {getInitials(booking.customerName || booking.name || booking.userName, booking.customerEmail || booking.email || booking.userEmail)}
                          </div>
                          <div className="flex flex-col gap-1">
                            <span className="font-semibold text-gray-900 dark:text-white capitalize whitespace-nowrap">
                              {booking.customerName || booking.name || booking.userName || 'Unknown User'}
                            </span>
                            <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">
                              <Mail size={12} className="text-orange-500" />
                              <span>{booking.customerEmail || booking.email || booking.userEmail || 'No email'}</span>
                            </div>
                            <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">
                              <Phone size={12} className="text-orange-500" />
                              <span>{booking.customerPhone || booking.phone || booking.phoneNumber || 'No phone'}</span>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-gray-900 dark:text-white font-medium whitespace-nowrap">
                        DR-{booking.bookingId.substring(0, 6).toUpperCase()}
                      </td>
                      <td className="py-4 px-4 text-gray-700 dark:text-gray-300">
                        <div className="flex flex-col items-start gap-1">
                          {booking.packageName ? (
                            <>
                              <span className="font-semibold text-gray-900 dark:text-white capitalize whitespace-nowrap">
                                {booking.packageName}
                              </span>
                              <div className="flex items-center gap-1.5 flex-wrap mt-1">
                                <PackageIcon size={14} className="text-orange-500" />
                                {booking.packageDetails ? (
                                  booking.packageDetails.split(' and ').map((detail, idx) => (
                                    <span key={idx} className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-orange-50 dark:bg-orange-500/10 text-orange-600 dark:text-orange-500 border border-orange-200 dark:border-orange-500/20 whitespace-nowrap">
                                      {detail}
                                    </span>
                                  ))
                                ) : (
                                  <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-orange-50 dark:bg-orange-500/10 text-orange-600 dark:text-orange-500 border border-orange-200 dark:border-orange-500/20 whitespace-nowrap">
                                    {booking.packageDescription || 'Package details unavailable'}
                                  </span>
                                )}
                              </div>
                            </>
                          ) : (
                            <>
                              <span className="font-semibold text-gray-900 dark:text-white capitalize whitespace-nowrap">
                                {booking.carName || 'Unknown Car'}
                              </span>
                              <div className="flex items-center gap-1.5">
                                <CarIcon size={14} className="text-orange-500" />
                                <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-orange-50 dark:bg-orange-500/10 text-orange-600 dark:text-orange-500 border border-orange-200 dark:border-orange-500/20 whitespace-nowrap">
                                  {booking.carModel || (booking as any).model || 'Model unavailable'}
                                </span>
                              </div>
                            </>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-4 whitespace-nowrap">
                        <div className="flex flex-col gap-1 text-sm">
                          <div className="flex items-center gap-1.5 text-gray-900 dark:text-gray-200 font-medium">
                            <Calendar size={12} className="text-orange-500" />
                            <span>{format(new Date(booking.startDate), "dd MMM yyyy")}</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-gray-900 dark:text-gray-200 font-medium">
                            <Calendar size={12} className="text-orange-500" />
                            <span>{format(new Date(booking.endDate), "dd MMM yyyy")}</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4 font-medium text-gray-900 dark:text-white">
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
                    <td colSpan={7} className="py-6 text-center text-gray-500 dark:text-gray-500">
                      No bookings yet
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Currently Online Users Table */}
        <div className="bg-white dark:bg-[#1a1a24] rounded-xl border border-gray-200 dark:border-[#2a2a3a] p-6 mb-8 overflow-hidden shadow-sm shadow-indigo-500/5">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <span className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse"></span>
              Currently Online Users
            </h2>
          </div>

          <div className="overflow-x-auto">
            {onlineUsersList.length === 0 ? (
              <div className="py-8 text-center">
                <p className="text-gray-500 dark:text-gray-400">No users are currently active on the website.</p>
              </div>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-[#2a2a3a] bg-gray-50 dark:bg-[#0a0a0f]">
                    <th className="text-left py-3 px-4 font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider text-xs">
                      User
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider text-xs">
                      Status
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider text-xs">
                      Time
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {onlineUsersList.map((user) => {
                    const lastActiveTime = user.lastActive?.toDate?.() || new Date(user.lastActive);
                    return (
                      <tr
                        key={user.id}
                        className="border-b border-gray-200 dark:border-[#2a2a3a] hover:bg-white/5 transition-colors"
                      >
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-3">
                            <div className="flex-shrink-0 flex items-center justify-center w-10 h-10 rounded-full bg-orange-100 dark:bg-orange-500/20 text-orange-600 dark:text-orange-400 font-bold tracking-wider">
                              {getInitials(user.name, user.email)}
                            </div>
                            <div className="flex flex-col gap-1">
                              <span className="font-semibold text-gray-900 dark:text-white capitalize whitespace-nowrap">
                                {user.name || (user.email ? user.email.split('@')[0] : 'Unknown User')}
                              </span>
                              <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">
                                <Mail size={12} className="text-orange-500" />
                                <span>{user.email || 'No email'}</span>
                              </div>
                              {user.phone && (
                                <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">
                                  <Phone size={12} className="text-orange-500" />
                                  <span>{user.phone}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-green-500/10 text-green-500 border border-green-500/20">
                            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                            Online
                          </span>
                        </td>
                        <td className="py-4 px-4 text-gray-500 dark:text-gray-400">
                          {formatDistanceToNow(lastActiveTime, { addSuffix: true })}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Revenue Chart */}
        <div className="bg-white dark:bg-[#1a1a24] rounded-xl border border-gray-200 dark:border-[#2a2a3a] p-6 mt-8 mb-8 shadow-sm shadow-orange-500/5">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
            Last 7 Days Revenue
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart
              data={chartData}
              margin={{ left: 10, right: 10, top: 20, bottom: 0 }}
            >
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f97316" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#f97316" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid stroke="#e5e7eb" strokeDasharray="3 3" vertical={false} className="dark:stroke-gray-800" />
              <XAxis dataKey="date" stroke="#9ca3af" tick={{ fontSize: 12 }} />
              <YAxis stroke="#9ca3af" tickFormatter={(value) => value.toLocaleString()} tick={{ fontSize: 12 }} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ color: '#9ca3af', paddingTop: '10px' }} />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="#f97316"
                strokeWidth={2}
                fill="url(#colorRevenue)"
                fillOpacity={1}
                name="Revenue (PKR)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
