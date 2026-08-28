"use client";

import React, { useState, useEffect } from "react";
import {
  collection,
  onSnapshot,
  updateDoc,
  deleteDoc,
  doc,
  query,
  orderBy,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { COLLECTIONS } from "@/lib/collections";
import { Booking } from "@/types";
import toast from "react-hot-toast";
import { generateBookingReceipt } from '@/lib/pdfGenerator';
import {
  Download,
  Eye,
  Check,
  AlertCircle,
  Search,
  Filter,
  Trash2,
  Copy,
  TrendingUp,
  CalendarDays,
  Clock,
  Smartphone,
  CreditCard,
  Banknote,
  ChevronDown,
  Calendar,
  Mail,
  Phone,
  Package as PackageIcon,
  Car as CarIcon,
} from "lucide-react";
import AdminHeader from "@/components/admin/AdminHeader";
import ConfirmDialog from "@/components/admin/ConfirmDialog";
import BookingDetailModal from "@/components/admin/BookingDetailModal";
import { format, parseISO, isWithinInterval } from "date-fns";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

interface ChartData {
  date: string;
  revenue: number;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white dark:bg-[#1a1a24] border border-gray-200 dark:border-[#2a2a3a] p-3 rounded-lg shadow-lg">
        <p className="font-semibold text-gray-900 dark:text-white mb-1">{label}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} style={{ color: entry.color }} className="text-sm font-medium">
            {entry.name}: {entry.value.toLocaleString()}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

const ITEMS_PER_PAGE = 20;

const getInitials = (name?: string | null, email?: string | null) => {
  const targetString = (name && name.toLowerCase() !== 'unknown user') ? name : (email || 'U');
  const words = targetString.trim().split(/\s+/);
  if (words.length === 1) return words[0].charAt(0).toUpperCase();
  return (words[0].charAt(0) + words[words.length - 1].charAt(0)).toUpperCase();
};

const truncateTransactionId = (id: string | undefined | null) => {
  if (!id || id === 'N/A') return 'N/A';
  if (id.length <= 12) return id;
  return `${id.substring(0, 8)}...${id.substring(id.length - 4)}`;
};

export default function PaymentsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [filteredBookings, setFilteredBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  // Filter states
  const [filterMethod, setFilterMethod] = useState("All"); // All, JazzCash, Cash
  const [filterStatus, setFilterStatus] = useState("All"); // All, Paid, Pending, Failed
  const [searchQuery, setSearchQuery] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  // Modal states
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [bookingToMark, setBookingToMark] = useState<Booking | null>(null);
  const [deleteModalConfig, setDeleteModalConfig] = useState<{ isOpen: boolean; type: 'SINGLE' | 'ALL' | null; id: string | null }>({ isOpen: false, type: null, id: null });
  const [isDeleting, setIsDeleting] = useState(false);
  const [isMarkingPaid, setIsMarkingPaid] = useState(false);

  // Fetch bookings with real-time updates
  useEffect(() => {
    setLoading(true);
    let unsubscribeBookings: () => void;

    const initializeData = async () => {
      try {
        const { getDocs } = await import("firebase/firestore");
        const carsSnap = await getDocs(collection(db, COLLECTIONS.CARS));
        const carsMap = new Map();
        carsSnap.forEach(doc => carsMap.set(doc.id, doc.data()));

        const packagesSnap = await getDocs(collection(db, COLLECTIONS.PACKAGES));
        const packagesMap = new Map();
        packagesSnap.forEach(doc => packagesMap.set(doc.id, doc.data()));

        const q = query(
          collection(db, COLLECTIONS.BOOKINGS),
          orderBy("createdAt", "desc"),
        );
        
        unsubscribeBookings = onSnapshot(q, (snapshot) => {
          const bookingsData: Booking[] = [];
          snapshot.forEach((doc) => {
            const data = doc.data();
            const fetchedCar = data.carId ? carsMap.get(data.carId) : null;
            const fetchedPackage = data.packageId ? packagesMap.get(data.packageId) : null;

            bookingsData.push({
              bookingId: doc.id,
              customerName: data.customerName || "",
              customerPhone: data.customerPhone || "",
              customerEmail: data.customerEmail || "",
              customerId: data.customerId || "",
              carId: data.carId || "",
              carName: data.carName || "",
              carImage: data.carImage || "",
              carModel: data.carModel || data.model || (fetchedCar ? fetchedCar.model : ""),
              packageId: data.packageId || "",
              packageName: data.packageName || "",
              packageDetails: data.packageDetails || (fetchedPackage && fetchedPackage.cars ? fetchedPackage.cars.map((c: any) => `${c.quantity}x ${c.carName}`).join(' and ') : ""),
              packageDescription: data.packageDescription || (fetchedPackage ? fetchedPackage.description || fetchedPackage.details || fetchedPackage.includedCars : ""),
              startDate: data.startDate?.toDate?.() || new Date(data.startDate),
              endDate: data.endDate?.toDate?.() || new Date(data.endDate),
              totalDays: data.totalDays || 0,
              totalAmount: data.totalAmount || 0,
              paymentMethod: data.paymentMethod || "cash",
              paymentStatus: data.paymentStatus || "pending",
              txnRefNo: data.txnRefNo || data.paddleTransactionId || "",
              paddleTransactionId: data.paddleTransactionId || "",
              bookingStatus: data.bookingStatus || "confirmed",
              pickupLocation: data.pickupLocation || "",
              dropoffLocation: data.dropoffLocation || "",
              notes: data.notes || "",
              createdAt: data.createdAt?.toDate?.() || new Date(data.createdAt),
            } as Booking);
          });
          setBookings(bookingsData);
          setLoading(false);
        }, (error) => console.log("Silent error:", error));
      } catch (error) {
        console.error("Error fetching data:", error);
        setLoading(false);
      }
    };

    initializeData();

    return () => {
      if (unsubscribeBookings) unsubscribeBookings();
    };
  }, []);

  // Apply filters
  useEffect(() => {
    let filtered = bookings;

    // Search filter
    if (searchQuery) {
      const lowerQuery = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (b) =>
          b.customerName.toLowerCase().includes(lowerQuery) ||
          b.bookingId.toLowerCase().includes(lowerQuery) ||
          (b.carName && b.carName.toLowerCase().includes(lowerQuery)) ||
          (b.packageName && b.packageName.toLowerCase().includes(lowerQuery)),
      );
    }

    // Payment method filter
    if (filterMethod !== "All") {
      filtered = filtered.filter(
        (b) => b.paymentMethod.toLowerCase() === filterMethod.toLowerCase(),
      );
    }

    // Payment status filter
    if (filterStatus !== "All") {
      filtered = filtered.filter(
        (b) => b.paymentStatus.toLowerCase() === filterStatus.toLowerCase(),
      );
    }

    // Date range filter
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      filtered = filtered.filter((b) =>
        isWithinInterval(new Date(b.createdAt), { start, end }),
      );
    }

    setFilteredBookings(filtered);
    setCurrentPage(1);
  }, [bookings, filterMethod, filterStatus, searchQuery, startDate, endDate]);

  // Calculate stats
  const totalRevenue = bookings
    .filter((b) => b.paymentStatus === "paid")
    .reduce((sum, b) => sum + b.totalAmount, 0);

  const thisMonthRevenue = bookings
    .filter((b) => {
      const bookingDate = new Date(b.createdAt);
      const today = new Date();
      return (
        b.paymentStatus === "paid" &&
        bookingDate.getMonth() === today.getMonth() &&
        bookingDate.getFullYear() === today.getFullYear()
      );
    })
    .reduce((sum, b) => sum + b.totalAmount, 0);

  const pendingCount = bookings.filter(
    (b) => b.paymentStatus === "pending",
  ).length;
  const jazzcashCount = bookings.filter(
    (b) => b.paymentMethod === "jazzcash",
  ).length;
  const cashCount = bookings.filter((b) => b.paymentMethod === "cash").length;
  const paddleCount = bookings.filter(
    (b) => b.paymentMethod === "paddle",
  ).length;

  // Generate chart data (last 30 days)
  const generateChartData = (): ChartData[] => {
    const data: { [key: string]: number } = {};
    const today = new Date();

    // Initialize last 30 days
    for (let i = 29; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = format(date, "MMM dd");
      data[dateStr] = 0;
    }

    // Add revenues
    bookings
      .filter((b) => b.paymentStatus === "paid")
      .forEach((b) => {
        const dateStr = format(new Date(b.createdAt), "MMM dd");
        if (dateStr in data) {
          data[dateStr] += b.totalAmount;
        }
      });

    return Object.entries(data).map(([date, revenue]) => ({
      date,
      revenue,
    }));
  };

  const chartData = generateChartData();

  // Handle mark as paid
  const handleMarkAsPaid = async () => {
    if (!bookingToMark) return;

    setIsMarkingPaid(true);
    try {
      const bookingRef = doc(db, COLLECTIONS.BOOKINGS, bookingToMark.bookingId);
      await updateDoc(bookingRef, { paymentStatus: "paid" });
      toast.success("Payment marked as paid");
      setShowConfirmDialog(false);
      setBookingToMark(null);
    } catch (error) {
      console.error("Error updating payment status:", error);
      toast.error("Failed to mark payment as paid");
    } finally {
      setIsMarkingPaid(false);
    }
  };

  // Export CSV
  const handleExportCSV = () => {
    try {
      // Helper function to safely format date
      const getDateTimeString = (date: any): string => {
        try {
          const d = date instanceof Date ? date : new Date(date);
          if (isNaN(d.getTime())) return "";

          const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
          const day = String(d.getDate()).padStart(2, "0");
          const month = months[d.getMonth()];
          const year = d.getFullYear();
          const hours = String(d.getHours()).padStart(2, "0");
          const mins = String(d.getMinutes()).padStart(2, "0");

          return `${day} ${month} ${year} ${hours}:${mins}`;
        } catch {
          return "";
        }
      };

      // Helper to escape CSV field
      const escapeField = (field: any): string => {
        const str = String(field || "");
        if (str.includes(",") || str.includes('"') || str.includes("\n")) {
          return `"${str.replace(/"/g, '""')}"`;
        }
        return str;
      };

      // Force Excel to treat date/time as text so narrow columns don't render ####.
      const asExcelText = (value: string): string => {
        if (!value) return "";
        return `="${value.replace(/"/g, '""')}"`;
      };

      // Build CSV manually
      let csv = "Booking ID,Customer,Car,Amount,Method,Status,TxnRef,Date\n";

      filteredBookings.forEach((b) => {
        const createdAtText = getDateTimeString(b.createdAt);

        const row = [
          escapeField(b.bookingId),
          escapeField(b.customerName),
          escapeField(b.carName),
          escapeField(b.totalAmount),
          escapeField(
            b.paymentMethod === "jazzcash"
              ? "JazzCash"
              : b.paymentMethod === "paddle"
                ? "Paddle"
                : "Cash",
          ),
          escapeField(b.paymentStatus.charAt(0).toUpperCase() + b.paymentStatus.slice(1)),
          escapeField(b.paddleTransactionId || b.txnRefNo || ""),
          asExcelText(createdAtText),
        ];
        csv += row.join(",") + "\n";
      });

      const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);

      const today = new Date();
      const dateStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
      link.download = `payments-${dateStr}.csv`;

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(link.href);

      toast.success("CSV exported successfully");
    } catch (error) {
      console.error("Error exporting CSV:", error);
      toast.error("Failed to export CSV");
    }
  };

  // Execute deletion from the modal
  const executeDelete = async () => {
    setIsDeleting(true);
    if (deleteModalConfig.type === 'SINGLE' && deleteModalConfig.id) {
      try {
        const bookingRef = doc(db, COLLECTIONS.BOOKINGS, deleteModalConfig.id);
        await deleteDoc(bookingRef);
        setBookings((prev) => prev.filter((b) => b.bookingId !== deleteModalConfig.id));
        toast.success("Payment deleted successfully");
      } catch (error) {
        console.error("Error deleting payment:", error);
        toast.error("Failed to delete payment");
      } finally {
        setIsDeleting(false);
        setDeleteModalConfig({ isOpen: false, type: null, id: null });
      }
    } else if (deleteModalConfig.type === 'ALL') {
      try {
        setLoading(true);
        const deletePromises = bookings.map((b) => deleteDoc(doc(db, COLLECTIONS.BOOKINGS, b.bookingId)));
        await Promise.all(deletePromises);
        setBookings([]);
        toast.success("All payment records deleted successfully");
      } catch (error) {
        console.error("Error deleting all payments:", error);
        toast.error("Failed to clear payment records");
      } finally {
        setIsDeleting(false);
        setDeleteModalConfig({ isOpen: false, type: null, id: null });
      }
    } else {
      setIsDeleting(false);
    }
  };

  // Pagination
  const totalPages = Math.ceil(filteredBookings.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedBookings = filteredBookings.slice(
    startIndex,
    startIndex + ITEMS_PER_PAGE,
  );

  const getPaymentMethodBadge = (method: string) => {
    const base = "inline-flex items-center justify-center px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap bg-purple-500/10 text-purple-400 border border-purple-500/20";
    if (method === "jazzcash") {
      return (
        <span className={base}>
          JazzCash
        </span>
      );
    }
    if (method === "paddle") {
      return (
        <span className={base}>
          Card (Paddle)
        </span>
      );
    }
    return (
      <span className={base}>
        Cash
      </span>
    );
  };

  const getPaymentStatusBadge = (status: string) => {
    const base = "inline-flex items-center justify-center px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap";
    switch (status) {
      case "paid":
        return (
          <span className={`${base} bg-green-500/10 text-green-500 border border-green-500/20`}>
            Paid
          </span>
        );
      case "pending":
        return (
          <span className={`${base} bg-orange-500/10 text-orange-500 border border-orange-500/20`}>
            Pending
          </span>
        );
      case "failed":
        return (
          <span className={`${base} bg-red-500/10 text-red-500 border border-red-500/20`}>
            Failed
          </span>
        );
      case "refunded":
        return (
          <span className={`${base} bg-gray-500/10 text-gray-600 dark:text-gray-400 border border-gray-500/20`}>
            Refunded
          </span>
        );
      default:
        return (
          <span className={`${base} bg-gray-500/10 text-gray-600 dark:text-gray-400 border border-gray-500/20`}>
            {status}
          </span>
        );
    }
  };

  return (
    <div className="min-h-[120vh] pb-[500px] bg-gray-50 dark:bg-[#0a0a0f]">
      <AdminHeader title="Payments Management" />

      <div className="w-full px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Manage Payments</h2>
          <p className="text-gray-600 mt-2">
            View and manage all customer payments
          </p>
        </div>

        {/* Stats Cards (MOVED BACK ABOVE FILTERS) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
          {/* Total Revenue */}
          <div className="bg-white dark:bg-[#1a1a24] p-6 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-green-500/10 hover:border-green-500/50 cursor-default flex flex-col justify-between h-full group">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-gray-500 dark:text-gray-400 text-sm font-medium mb-2">Total Revenue</p>
                <p className="text-xl font-bold text-gray-900 dark:text-white mt-1">
                  PKR {totalRevenue.toLocaleString()}
                </p>
              </div>
              <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-green-500/10 border border-green-500/20 group-hover:bg-green-500/20 transition-colors">
                <TrendingUp className="w-5 h-5 text-green-500" />
              </div>
            </div>
          </div>

          {/* This Month Revenue */}
          <div className="bg-white dark:bg-[#1a1a24] p-6 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-blue-500/10 hover:border-blue-500/50 cursor-default flex flex-col justify-between h-full group">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-gray-500 dark:text-gray-400 text-sm font-medium mb-2">This Month</p>
                <p className="text-xl font-bold text-gray-900 dark:text-white mt-1">
                  PKR {thisMonthRevenue.toLocaleString()}
                </p>
              </div>
              <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-blue-500/10 border border-blue-500/20 group-hover:bg-blue-500/20 transition-colors">
                <CalendarDays className="w-5 h-5 text-blue-500" />
              </div>
            </div>
          </div>

          {/* Pending Payments */}
          <div className="bg-white dark:bg-[#1a1a24] p-6 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-orange-500/10 hover:border-orange-500/50 cursor-default flex flex-col justify-between h-full group">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-gray-500 dark:text-gray-400 text-sm font-medium mb-2">Pending</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">
                  {pendingCount}
                </p>
              </div>
              <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-orange-500/10 border border-orange-500/20 group-hover:bg-orange-500/20 transition-colors">
                <Clock className="w-5 h-5 text-orange-500" />
              </div>
            </div>
          </div>

          {/* JazzCash Payments */}
          <div className="bg-white dark:bg-[#1a1a24] p-6 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-purple-500/10 hover:border-purple-500/50 cursor-default flex flex-col justify-between h-full group">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-gray-500 dark:text-gray-400 text-sm font-medium mb-2">JazzCash</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">
                  {jazzcashCount}
                </p>
              </div>
              <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-purple-500/10 border border-purple-500/20 group-hover:bg-purple-500/20 transition-colors">
                <Smartphone className="w-5 h-5 text-purple-500" />
              </div>
            </div>
          </div>

          {/* Paddle Payments */}
          <div className="bg-white dark:bg-[#1a1a24] p-6 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-blue-500/10 hover:border-blue-500/50 cursor-default flex flex-col justify-between h-full group">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-gray-500 dark:text-gray-400 text-sm font-medium mb-2">Card (Paddle)</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">
                  {paddleCount}
                </p>
              </div>
              <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-blue-500/10 border border-blue-500/20 group-hover:bg-blue-500/20 transition-colors">
                <CreditCard className="w-5 h-5 text-blue-500" />
              </div>
            </div>
          </div>

          {/* Cash Payments */}
          <div className="bg-white dark:bg-[#1a1a24] p-6 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-emerald-500/10 hover:border-emerald-500/50 cursor-default flex flex-col justify-between h-full group">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-gray-500 dark:text-gray-400 text-sm font-medium mb-2">Cash</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">
                  {cashCount}
                </p>
              </div>
              <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-emerald-500/10 border border-emerald-500/20 group-hover:bg-emerald-500/20 transition-colors">
                <Banknote className="w-5 h-5 text-emerald-500" />
              </div>
            </div>
          </div>
        </div>

        {/* Filters Section */}
        <div className="bg-white dark:bg-[#1a1b23] border border-gray-200 dark:border-gray-800 p-6 rounded-xl mb-8 shadow-sm dark:shadow-none relative z-50">
          <div className="flex items-center gap-2 mb-4">
            <Filter size={20} className="text-gray-600" />
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">Filters</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
            {/* Search */}
            <div className="lg:col-span-2">
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                Search (ID/Name/Car/Package)
              </label>
              <div className="relative">
                <Search
                  size={18}
                  className="absolute left-3 top-2.5 text-gray-600 dark:text-gray-400"
                />
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none bg-white dark:bg-[#1a1b23] text-gray-900 dark:text-gray-200"
                />
              </div>
            </div>

            {/* Start Date */}
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                Start Date
              </label>
              <div className="relative group cursor-pointer">
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full pl-4 pr-10 py-2 border border-gray-300 dark:border-gray-700 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none bg-white dark:bg-[#1a1b23] text-gray-900 dark:text-gray-200 [color-scheme:light] dark:[color-scheme:dark] cursor-pointer appearance-none transition-colors [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:right-0 [&::-webkit-calendar-picker-indicator]:w-10 [&::-webkit-calendar-picker-indicator]:h-full [&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:z-10 group-hover:border-orange-500/50"
                />
                <Calendar size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 group-hover:text-orange-500 transition-colors pointer-events-none" />
              </div>
            </div>

            {/* End Date */}
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                End Date
              </label>
              <div className="relative group cursor-pointer">
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full pl-4 pr-10 py-2 border border-gray-300 dark:border-gray-700 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none bg-white dark:bg-[#1a1b23] text-gray-900 dark:text-gray-200 [color-scheme:light] dark:[color-scheme:dark] cursor-pointer appearance-none transition-colors [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:right-0 [&::-webkit-calendar-picker-indicator]:w-10 [&::-webkit-calendar-picker-indicator]:h-full [&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:z-10 group-hover:border-orange-500/50"
                />
                <Calendar size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 group-hover:text-orange-500 transition-colors pointer-events-none" />
              </div>
            </div>

            {/* Payment Status Filter */}
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                Status
              </label>
              <div className="relative group cursor-pointer">
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="w-full pl-4 pr-10 py-2 border border-gray-300 dark:border-gray-700 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none bg-white dark:bg-[#1a1b23] text-gray-900 dark:text-gray-200 cursor-pointer appearance-none transition-colors group-hover:border-orange-500/50"
                >
                  <option className="bg-white dark:bg-[#1a1b23] text-gray-900 dark:text-gray-200" value="All">All</option>
                  <option className="bg-white dark:bg-[#1a1b23] text-gray-900 dark:text-gray-200" value="Paid">Paid</option>
                  <option className="bg-white dark:bg-[#1a1b23] text-gray-900 dark:text-gray-200" value="Pending">Pending</option>
                  <option className="bg-white dark:bg-[#1a1b23] text-gray-900 dark:text-gray-200" value="Failed">Failed</option>
                  <option className="bg-white dark:bg-[#1a1b23] text-gray-900 dark:text-gray-200" value="Refunded">Refunded</option>
                </select>
                <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 group-hover:text-orange-500 transition-colors pointer-events-none" />
              </div>
            </div>

            {/* Payment Method Filter */}
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                Method
              </label>
              <div className="relative group cursor-pointer">
                <select
                  value={filterMethod}
                  onChange={(e) => setFilterMethod(e.target.value)}
                  className="w-full pl-4 pr-10 py-2 border border-gray-300 dark:border-gray-700 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none bg-white dark:bg-[#1a1b23] text-gray-900 dark:text-gray-200 cursor-pointer appearance-none transition-colors group-hover:border-orange-500/50"
                >
                  <option className="bg-white dark:bg-[#1a1b23] text-gray-900 dark:text-gray-200" value="All">All Methods</option>
                  <option className="bg-white dark:bg-[#1a1b23] text-gray-900 dark:text-gray-200" value="JazzCash">JazzCash Only</option>
                  <option className="bg-white dark:bg-[#1a1b23] text-gray-900 dark:text-gray-200" value="Paddle">Card (Paddle)</option>
                  <option className="bg-white dark:bg-[#1a1b23] text-gray-900 dark:text-gray-200" value="Cash">Cash Only</option>
                </select>
                <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 group-hover:text-orange-500 transition-colors pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Export Button */}
          <div className="mt-4 flex justify-end gap-3">

            <button
              onClick={handleExportCSV}
              disabled={loading || filteredBookings.length === 0}
              className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium cursor-pointer"
            >
              <Download size={18} />
              Export CSV
            </button>
          </div>
        </div>

        {/* Payments Table */}
        <div className="bg-white dark:bg-[#1a1a24] rounded-lg shadow overflow-hidden min-h-[500px]">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-[#0a0a0f] border-b border-gray-200 dark:border-[#2a2a3a]">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                    Booking ID
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                    USER
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                    <div className="flex flex-col">
                      <span>BOOKEDITEM</span>
                      <span>(CAR/PACKAGE)</span>
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                    Method
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                    Transaction ID
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                    CREATED (DATE/TIME)
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan={9} className="px-6 py-8 text-center">
                      <div className="flex justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
                      </div>
                    </td>
                  </tr>
                ) : paginatedBookings.length === 0 ? (
                  <tr>
                    <td
                      colSpan={9}
                      className="px-6 py-8 text-center text-gray-500 dark:text-gray-500"
                    >
                      No payments found
                    </td>
                  </tr>
                ) : (
                  paginatedBookings.map((booking) => (
                    <tr
                      key={booking.bookingId}
                      className="dark:bg-[#111118] hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
                    >
                      <td className="px-6 py-4 text-sm text-gray-900 dark:text-white font-medium whitespace-nowrap">
                        DR-{booking.bookingId.substring(0, 6).toUpperCase()}
                      </td>
                      <td className="px-6 py-4 text-sm">
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
                      <td className="px-6 py-4 text-sm text-gray-900 dark:text-white whitespace-nowrap">
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
                      <td className="px-6 py-4 text-sm font-semibold text-gray-900 dark:text-white whitespace-nowrap">
                        PKR {booking.totalAmount.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        {getPaymentMethodBadge(booking.paymentMethod)}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        {getPaymentStatusBadge(booking.paymentStatus)}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400 whitespace-nowrap">
                        {booking.paymentMethod === "jazzcash" ||
                          booking.paymentMethod === "paddle" ? (
                          <div className="flex items-center gap-2">
                            <code className="bg-gray-50 dark:bg-[#0a0a0f] border border-gray-200 dark:border-[#2a2a3a] px-2 py-1 rounded font-mono text-xs text-gray-700 dark:text-gray-300">
                              {truncateTransactionId(
                                booking.paddleTransactionId || booking.txnRefNo
                              )}
                            </code>
                            {(booking.paddleTransactionId || booking.txnRefNo) && (
                              <button
                                onClick={() => {
                                  const fullId = booking.paddleTransactionId || booking.txnRefNo;
                                  if (fullId) {
                                    navigator.clipboard.writeText(fullId);
                                    toast.success("Transaction ID copied!");
                                  }
                                }}
                                className="bg-orange-500/10 text-orange-500 p-1.5 rounded-md hover:bg-orange-500 hover:text-white transition-colors focus:outline-none cursor-pointer"
                                title="Copy full ID"
                              >
                                <Copy size={14} />
                              </button>
                            )}
                          </div>
                        ) : (
                          "N/A"
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-col">
                          <span className="text-sm text-gray-900 dark:text-gray-200 font-medium">
                            {format(new Date(booking.createdAt), "dd MMM yyyy")}
                          </span>
                          <span className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                            {format(new Date(booking.createdAt), "hh:mm a")}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => {
                              setSelectedBooking(booking);
                              setShowDetailModal(true);
                            }}
                            className="bg-orange-500/10 text-orange-500 p-1.5 rounded-md hover:bg-orange-500 hover:text-white transition-colors cursor-pointer"
                            title="View Details"
                          >
                            <Eye size={18} />
                          </button>
                          {booking.paymentMethod === "cash" &&
                            booking.paymentStatus === "pending" && (
                              <button
                                onClick={() => {
                                  setBookingToMark(booking);
                                  setShowConfirmDialog(true);
                                }}
                                className="bg-green-500/10 text-green-500 p-1.5 rounded-md hover:bg-green-500 hover:text-white transition-colors cursor-pointer"
                                title="Mark as Paid"
                              >
                                <Check size={18} />
                              </button>
                            )}
                          <button
                            onClick={() => {
                              generateBookingReceipt(booking);
                              toast.success('Receipt downloaded successfully');
                            }}
                            className="bg-green-500/10 text-green-500 p-1.5 rounded-md hover:bg-green-500 hover:text-white transition-colors cursor-pointer"
                            title="Download Receipt"
                          >
                            <Download size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="bg-gray-50 dark:bg-[#0a0a0f] border-t border-gray-200 dark:border-[#2a2a3a] px-6 py-4 flex items-center justify-between">
              <p className="text-sm text-gray-600">
                Showing {startIndex + 1} to{" "}
                {Math.min(startIndex + ITEMS_PER_PAGE, filteredBookings.length)}{" "}
                of {filteredBookings.length} payments
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 border border-gray-200 dark:border-[#2a2a3a] rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Previous
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter(
                    (page) =>
                      Math.abs(page - currentPage) <= 1 ||
                      page === 1 ||
                      page === totalPages,
                  )
                  .map((page, index, array) => (
                    <React.Fragment key={page}>
                      {index > 0 && array[index - 1] !== page - 1 && (
                        <span className="px-2 py-2">...</span>
                      )}
                      <button
                        onClick={() => setCurrentPage(page)}
                        className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${currentPage === page
                            ? "bg-orange-500 text-white"
                            : "border border-gray-200 dark:border-[#2a2a3a] text-gray-700 dark:text-gray-300 hover:bg-gray-100"
                          }`}
                      >
                        {page}
                      </button>
                    </React.Fragment>
                  ))}
                <button
                  onClick={() =>
                    setCurrentPage(Math.min(totalPages, currentPage + 1))
                  }
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 border border-gray-200 dark:border-[#2a2a3a] rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Revenue Chart */}
        <div className="bg-white dark:bg-[#1a1a24] rounded-lg shadow p-6 mt-8">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
            Revenue Trend (Last 30 Days)
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart
              data={chartData}
              margin={{ top: 10, right: 30, left: 60, bottom: 0 }}
            >
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f97316" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis
                dataKey="date"
                stroke="#6b7280"
                style={{ fontSize: "12px" }}
              />
              <YAxis stroke="#6b7280" style={{ fontSize: "12px" }} />
              <Tooltip content={<CustomTooltip />} />
              <Legend height={36} verticalAlign="bottom" wrapperStyle={{ paddingTop: "20px" }} />
              <Area
                type="monotone"
                dataKey="revenue"
                name="Revenue (PKR)"
                stroke="#f97316"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorRevenue)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Modals */}
      {selectedBooking && (
        <BookingDetailModal
          booking={selectedBooking}
          onClose={() => {
            setShowDetailModal(false);
            setSelectedBooking(null);
          }}
        />
      )}

      <ConfirmDialog
        isOpen={showConfirmDialog}
        onCancel={() => {
          setShowConfirmDialog(false);
          setBookingToMark(null);
        }}
        onConfirm={handleMarkAsPaid}
        title="Mark Payment as Paid"
        message={`Mark payment for booking DR-${bookingToMark?.bookingId.substring(0, 6).toUpperCase()} as paid?`}
        confirmText="Mark as Paid"
        cancelText="Cancel"
        isLoading={isMarkingPaid}
        loadingText="Marking..."
      />

      {/* Custom Delete Modal */}
      {deleteModalConfig.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-[#1a1b23] border border-gray-800 p-6 rounded-lg shadow-xl w-full max-w-md m-4">
            <h3 className="text-xl font-bold text-white mb-2">
              {deleteModalConfig.type === 'SINGLE' ? 'Delete Payment Record' : 'Clear All Records'}
            </h3>
            <p className="text-gray-400 mb-6">
              {deleteModalConfig.type === 'SINGLE'
                ? 'Are you sure you want to delete this payment record? This action cannot be undone.'
                : 'WARNING: Are you sure you want to delete ALL payment records? This cannot be undone.'}
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeleteModalConfig({ isOpen: false, type: null, id: null })}
                className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-md transition-colors text-sm font-medium"
              >
                Cancel
              </button>
              <button
                onClick={executeDelete}
                disabled={isDeleting}
                className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-md transition-colors text-sm font-medium flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isDeleting ? (
                  <>
                    <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 size={16} />
                    Delete
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}