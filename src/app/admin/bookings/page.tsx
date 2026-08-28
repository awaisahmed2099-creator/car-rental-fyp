"use client";

import React, { useState, useEffect } from "react";
import {
  collection,
  onSnapshot,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { COLLECTIONS } from "@/lib/collections";
import { Booking } from "@/types";
import toast from "react-hot-toast";
import {
  Eye,
  Edit2,
  Download,
  Trash2,
  AlertCircle,
  Search,
  Filter,
  Calendar,
  ChevronDown,
  CheckCircle,
  Activity,
  CheckCheck,
  XCircle,
  TrendingUp,
  MapPin,
  Mail,
  Phone,
  Package as PackageIcon,
  Car as CarIcon,
} from "lucide-react";
import AdminHeader from "@/components/admin/AdminHeader";
import ConfirmDialog from "@/components/admin/ConfirmDialog";
import BookingDetailModal from "@/components/admin/BookingDetailModal";
import ViewLocationModal from "@/components/admin/ViewLocationModal";
import { generateInvoice } from "@/lib/pdfGenerator";
import { format } from "date-fns";
import SkeletonTable from "@/components/ui/SkeletonTable";

const ITEMS_PER_PAGE = 20;

const getInitials = (name?: string | null, email?: string | null) => {
  const targetString = (name && name.toLowerCase() !== 'unknown user') ? name : (email || 'U');
  const words = targetString.trim().split(/\s+/);
  if (words.length === 1) return words[0].charAt(0).toUpperCase();
  return (words[0].charAt(0) + words[words.length - 1].charAt(0)).toUpperCase();
};

export default function BookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [filteredBookings, setFilteredBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  // Filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [paymentFilter, setPaymentFilter] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);

  // Modal states
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [bookingToDelete, setBookingToDelete] = useState<Booking | null>(null);
  const [viewLocation, setViewLocation] = useState<{ lat: number, lng: number, address: string } | null>(null);

  // Fetch bookings with real-time updates
  useEffect(() => {
    setLoading(true);
    let unsubscribeBookings: () => void;

    const initializeData = async () => {
      try {
        // Fetch Cars and Packages first to cross-reference
        const { getDocs } = await import("firebase/firestore");
        const carsSnap = await getDocs(collection(db, COLLECTIONS.CARS));
        const carsMap = new Map();
        carsSnap.forEach(doc => carsMap.set(doc.id, doc.data()));

        const packagesSnap = await getDocs(collection(db, COLLECTIONS.PACKAGES));
        const packagesMap = new Map();
        packagesSnap.forEach(doc => packagesMap.set(doc.id, doc.data()));

        unsubscribeBookings = onSnapshot(
          collection(db, COLLECTIONS.BOOKINGS),
          (snapshot) => {
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
            setBookings(
              bookingsData.sort(
                (a, b) =>
                  new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
              ),
            );
            setLoading(false);
          },
          (error) => console.log("Silent error:", error)
        );
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
          (b.customerPhone && b.customerPhone.includes(searchQuery)) ||
          b.bookingId.toLowerCase().includes(lowerQuery)
      );
    }

    // Date range filter
    if (startDate) {
      const start = new Date(startDate);
      filtered = filtered.filter((b) => new Date(b.startDate) >= start);
    }
    if (endDate) {
      const end = new Date(endDate);
      filtered = filtered.filter((b) => new Date(b.endDate) <= end);
    }

    // Status filter
    if (statusFilter !== "All") {
      filtered = filtered.filter(
        (b) => b.bookingStatus === statusFilter.toLowerCase(),
      );
    }

    // Payment filter
    if (paymentFilter !== "All") {
      if (paymentFilter === "Paid") {
        filtered = filtered.filter((b) => b.paymentStatus === "paid");
      } else if (paymentFilter === "Pending") {
        filtered = filtered.filter((b) => b.paymentStatus === "pending");
      } else {
        filtered = filtered.filter(
          (b) => b.paymentMethod === paymentFilter.toLowerCase(),
        );
      }
    }

    setFilteredBookings(filtered);
    setCurrentPage(1);
  }, [searchQuery, startDate, endDate, statusFilter, paymentFilter, bookings]);

  // Stats
  const totalBookings = bookings.length;
  const confirmedCount = bookings.filter(
    (b) => b.bookingStatus === "confirmed",
  ).length;
  const activeCount = bookings.filter(
    (b) => b.bookingStatus === "active",
  ).length;
  const completedCount = bookings.filter(
    (b) => b.bookingStatus === "completed",
  ).length;
  const cancelledCount = bookings.filter(
    (b) => b.bookingStatus === "cancelled",
  ).length;
  const thisMonthRevenue = bookings
    .filter((b) => {
      const bookingMonth = new Date(b.createdAt).getMonth();
      const bookingYear = new Date(b.createdAt).getFullYear();
      const today = new Date();
      return (
        bookingMonth === today.getMonth() && bookingYear === today.getFullYear()
      );
    })
    .reduce((sum, b) => sum + b.totalAmount, 0);

  // Pagination
  const totalPages = Math.ceil(filteredBookings.length / ITEMS_PER_PAGE);
  const paginatedBookings = filteredBookings.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE,
  );

  const handleViewClick = (booking: Booking) => {
    setSelectedBooking(booking);
    setShowDetailModal(true);
  };

  const handleDeleteClick = (booking: Booking) => {
    setBookingToDelete(booking);
    setShowDeleteDialog(true);
  };

  const handleConfirmDelete = async () => {
    if (!bookingToDelete) return;

    setIsDeleting(true);
    try {
      await deleteDoc(doc(db, COLLECTIONS.BOOKINGS, bookingToDelete.bookingId));
      toast.success("Booking deleted successfully");
      setShowDeleteDialog(false);
      setBookingToDelete(null);
    } catch (error) {
      console.error("Error deleting booking:", error);
      toast.error("Failed to delete booking");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDownloadInvoice = (booking: Booking) => {
    try {
      generateInvoice(booking);
    } catch (error) {
      console.error("Error generating invoice:", error);
      toast.error("Failed to generate invoice");
    }
  };

  const handleExportCSV = () => {
    try {
      // Helper function to safely format date
      const getDateString = (date: any): string => {
        try {
          const d = date instanceof Date ? date : new Date(date);
          if (isNaN(d.getTime())) return "";

          const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
          const day = String(d.getDate()).padStart(2, "0");
          const month = months[d.getMonth()];
          const year = d.getFullYear();

          return `${day} ${month} ${year}`;
        } catch {
          return "";
        }
      };

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
      let csv = "Booking ID,Customer,Car,Start Date,End Date,Days,Amount,Method,Payment Status,Booking Status,Created\n";

      filteredBookings.forEach((b) => {
        const startDateText = getDateString(b.startDate);
        const endDateText = getDateString(b.endDate);
        const createdAtText = getDateTimeString(b.createdAt);

        const row = [
          escapeField(b.bookingId),
          escapeField(b.customerName),
          escapeField(b.carName),
          asExcelText(startDateText),
          asExcelText(endDateText),
          escapeField(b.totalDays),
          escapeField(b.totalAmount),
          escapeField(
            b.paymentMethod === "jazzcash"
              ? "JazzCash"
              : b.paymentMethod === "paddle"
                ? "Paddle"
                : "Cash",
          ),
          escapeField(b.paymentStatus.charAt(0).toUpperCase() + b.paymentStatus.slice(1)),
          escapeField(b.bookingStatus.charAt(0).toUpperCase() + b.bookingStatus.slice(1)),
          asExcelText(createdAtText),
        ];
        csv += row.join(",") + "\n";
      });

      const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);

      const today = new Date();
      const dateStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
      link.download = `bookings-${dateStr}.csv`;

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

  const getStatusBadgeColor = (status: string) => {
    const base = "inline-flex items-center justify-center px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap";
    switch (status) {
      case "confirmed":
        return `${base} bg-blue-500/10 text-blue-500 border border-blue-500/20`;
      case "active":
        return `${base} bg-emerald-500/10 text-emerald-500 border border-emerald-500/20`;
      case "completed":
        return `${base} bg-green-500/10 text-green-500 border border-green-500/20`;
      case "cancelled":
        return `${base} bg-red-500/10 text-red-500 border border-red-500/20`;
      default:
        return `${base} bg-gray-500/10 text-gray-600 dark:text-gray-400 border border-gray-500/20`;
    }
  };

  const getPaymentBadgeColor = (status: string) => {
    const base = "inline-flex items-center justify-center px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap";
    switch (status) {
      case "paid":
        return `${base} bg-green-500/10 text-green-500 border border-green-500/20`;
      case "pending":
        return `${base} bg-orange-500/10 text-orange-500 border border-orange-500/20`;
      case "failed":
        return `${base} bg-red-500/10 text-red-500 border border-red-500/20`;
      case "refunded":
        return `${base} bg-gray-500/10 text-gray-600 dark:text-gray-400 border border-gray-500/20`;
      default:
        return `${base} bg-gray-500/10 text-gray-600 dark:text-gray-400 border border-gray-500/20`;
    }
  };

  const formatRevenue = (amount: number) => {
    if (amount >= 100000) {
      return `Rs. ${(amount / 100000).toFixed(1)}L`;
    }
    return `Rs. ${amount.toLocaleString('en-IN')}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-[#0a0a0f]">
        <AdminHeader title="Bookings Management" />
        <div className="p-8 w-full">
          <SkeletonTable rows={8} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[120vh] pb-[500px] bg-gray-50 dark:bg-[#0a0a0f]">
      <AdminHeader title="Bookings Management" />

      <div className="p-8 w-full">
        {/* Header */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Manage Bookings</h2>
          <p className="text-gray-600 mt-2">
            View and manage all customer bookings
          </p>
        </div>

        {/* Stats Cards (MOVED BACK ABOVE FILTERS) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
          <div className="bg-white dark:bg-[#1a1a24] p-6 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-purple-500/10 hover:border-purple-500/50 cursor-default flex flex-col justify-between h-full group">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-gray-500 dark:text-gray-400 text-sm font-medium mb-2">Total</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">
                  {totalBookings}
                </p>
              </div>
              <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-purple-500/10 border border-purple-500/20 group-hover:bg-purple-500/20 transition-colors">
                <Calendar className="w-5 h-5 text-purple-500" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-[#1a1a24] p-6 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-blue-500/10 hover:border-blue-500/50 cursor-default flex flex-col justify-between h-full group">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-gray-500 dark:text-gray-400 text-sm font-medium mb-2">Confirmed</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">
                  {confirmedCount}
                </p>
              </div>
              <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-blue-500/10 border border-blue-500/20 group-hover:bg-blue-500/20 transition-colors">
                <CheckCircle className="w-5 h-5 text-blue-500" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-[#1a1a24] p-6 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-emerald-500/10 hover:border-emerald-500/50 cursor-default flex flex-col justify-between h-full group">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-gray-500 dark:text-gray-400 text-sm font-medium mb-2">Active</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">
                  {activeCount}
                </p>
              </div>
              <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-emerald-500/10 border border-emerald-500/20 group-hover:bg-emerald-500/20 transition-colors">
                <Activity className="w-5 h-5 text-emerald-500" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-[#1a1a24] p-6 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-green-500/10 hover:border-green-500/50 cursor-default flex flex-col justify-between h-full group">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-gray-500 dark:text-gray-400 text-sm font-medium mb-2">Completed</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">
                  {completedCount}
                </p>
              </div>
              <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-green-500/10 border border-green-500/20 group-hover:bg-green-500/20 transition-colors">
                <CheckCheck className="w-5 h-5 text-green-500" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-[#1a1a24] p-6 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-red-500/10 hover:border-red-500/50 cursor-default flex flex-col justify-between h-full group">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-gray-500 dark:text-gray-400 text-sm font-medium mb-2">Cancelled</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">
                  {cancelledCount}
                </p>
              </div>
              <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-red-500/10 border border-red-500/20 group-hover:bg-red-500/20 transition-colors">
                <XCircle className="w-5 h-5 text-red-500" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-[#1a1a24] p-6 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-orange-500/10 hover:border-orange-500/50 cursor-default flex flex-col justify-between h-full group">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-gray-500 dark:text-gray-400 text-sm font-medium mb-2">Revenue</p>
                <p className="text-xl font-bold text-gray-900 dark:text-white mt-1">
                  {formatRevenue(thisMonthRevenue)}
                </p>
              </div>
              <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-orange-500/10 border border-orange-500/20 group-hover:bg-orange-500/20 transition-colors">
                <TrendingUp className="w-5 h-5 text-orange-500" />
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
                  Search (Name/Phone/ID)
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by name, phone or ID..."
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

            {/* Status Filter */}
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                Status
              </label>
              <div className="relative group cursor-pointer">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full pl-4 pr-10 py-2 border border-gray-300 dark:border-gray-700 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none bg-white dark:bg-[#1a1b23] text-gray-900 dark:text-gray-200 cursor-pointer appearance-none transition-colors group-hover:border-orange-500/50"
                >
                  <option className="bg-white dark:bg-[#1a1b23] text-gray-900 dark:text-gray-200">All</option>
                  <option className="bg-white dark:bg-[#1a1b23] text-gray-900 dark:text-gray-200">Confirmed</option>
                  <option className="bg-white dark:bg-[#1a1b23] text-gray-900 dark:text-gray-200">Active</option>
                  <option className="bg-white dark:bg-[#1a1b23] text-gray-900 dark:text-gray-200">Completed</option>
                  <option className="bg-white dark:bg-[#1a1b23] text-gray-900 dark:text-gray-200">Cancelled</option>
                </select>
                <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 group-hover:text-orange-500 transition-colors pointer-events-none" />
              </div>
            </div>

            {/* Payment Filter */}
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                Payment
              </label>
              <div className="relative group cursor-pointer">
                <select
                  value={paymentFilter}
                  onChange={(e) => setPaymentFilter(e.target.value)}
                  className="w-full pl-4 pr-10 py-2 border border-gray-300 dark:border-gray-700 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none bg-white dark:bg-[#1a1b23] text-gray-900 dark:text-gray-200 cursor-pointer appearance-none transition-colors group-hover:border-orange-500/50"
                >
                  <option className="bg-white dark:bg-[#1a1b23] text-gray-900 dark:text-gray-200">All</option>
                  <option className="bg-white dark:bg-[#1a1b23] text-gray-900 dark:text-gray-200">Cash</option>
                  <option className="bg-white dark:bg-[#1a1b23] text-gray-900 dark:text-gray-200">JazzCash</option>
                  <option className="bg-white dark:bg-[#1a1b23] text-gray-900 dark:text-gray-200">Paddle</option>
                  <option className="bg-white dark:bg-[#1a1b23] text-gray-900 dark:text-gray-200">Paid</option>
                  <option className="bg-white dark:bg-[#1a1b23] text-gray-900 dark:text-gray-200">Pending</option>
                </select>
                <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 group-hover:text-orange-500 transition-colors pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Export Button */}
          <div className="mt-4 flex justify-end">
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

        {/* Bookings Table */}
        {filteredBookings.length === 0 ? (
          <div className="bg-white dark:bg-[#1a1a24] text-gray-900 dark:text-white border border-gray-200 dark:border-[#2a2a3a] rounded-lg shadow p-12 text-center">
            <AlertCircle size={48} className="text-gray-700 dark:text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600 text-lg">No bookings found</p>
          </div>
        ) : (
          <>
            <div className="bg-white dark:bg-[#1a1a24] text-gray-900 dark:text-white border border-gray-200 dark:border-[#2a2a3a] rounded-lg shadow overflow-x-auto min-h-[500px]">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 dark:bg-[#0a0a0f] border-b border-gray-200 dark:border-[#2a2a3a]">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                      USER
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                      Booking ID
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                      <div className="flex flex-col">
                        <span>BOOKEDITEM</span>
                        <span>(CAR/PACKAGE)</span>
                      </div>
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                      PICK-UP (LOCATION/DATE)
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                      DROP-OFF (LOCATION/DATE)
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                      DURATION
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                      Payment
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                      CREATED (DATE/TIME)
                    </th>
                    <th className="px-6 py-4 text-center text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {paginatedBookings.map((booking) => (
                    <tr key={booking.bookingId} className="dark:bg-[#111118] hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                      <td className="px-6 py-4">
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
                      <td className="px-6 py-4 text-gray-900 dark:text-white font-medium whitespace-nowrap">
                        DR-{booking.bookingId.substring(0, 6).toUpperCase()}
                      </td>
                      <td className="px-6 py-4">
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
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          {typeof booking.pickupLocation === 'string' ? (
                            <span className="text-gray-900 dark:text-white whitespace-nowrap text-sm block max-w-[150px] truncate" title={booking.pickupLocation}>{booking.pickupLocation}</span>
                          ) : (
                            <div className="flex items-center gap-2">
                              <span className="text-gray-900 dark:text-white whitespace-nowrap text-sm max-w-[150px] truncate" title={booking.pickupLocation?.address || ''}>
                                {booking.pickupLocation?.address || ''}
                              </span>
                              {booking.pickupLocation?.lat && booking.pickupLocation?.lng && (
                                <button
                                  onClick={() => setViewLocation(booking.pickupLocation as { lat: number, lng: number, address: string })}
                                  className="text-orange-500 hover:text-orange-600 transition-colors cursor-pointer"
                                >
                                  <MapPin size={16} />
                                </button>
                              )}
                            </div>
                          )}
                          <div className="flex items-center gap-1.5 mt-1">
                            <Calendar size={12} className="text-orange-500" />
                            <span className="text-xs text-gray-500 dark:text-gray-400">{format(new Date(booking.startDate), "dd MMM yyyy")}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          {typeof booking.dropoffLocation === 'string' ? (
                            <span className="text-gray-900 dark:text-white whitespace-nowrap text-sm block max-w-[150px] truncate" title={booking.dropoffLocation}>{booking.dropoffLocation}</span>
                          ) : (
                            <div className="flex items-center gap-2">
                              <span className="text-gray-900 dark:text-white whitespace-nowrap text-sm max-w-[150px] truncate" title={booking.dropoffLocation?.address || ''}>
                                {booking.dropoffLocation?.address || ''}
                              </span>
                              {booking.dropoffLocation?.lat && booking.dropoffLocation?.lng && (
                                <button
                                  onClick={() => setViewLocation(booking.dropoffLocation as { lat: number, lng: number, address: string })}
                                  className="text-orange-500 hover:text-orange-600 transition-colors cursor-pointer"
                                >
                                  <MapPin size={16} />
                                </button>
                              )}
                            </div>
                          )}
                          <div className="flex items-center gap-1.5 mt-1">
                            <Calendar size={12} className="text-orange-500" />
                            <span className="text-xs text-gray-500 dark:text-gray-400">{format(new Date(booking.endDate), "dd MMM yyyy")}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-700 dark:text-gray-300">
                        {booking.totalDays}
                      </td>
                      <td className="px-6 py-4 text-gray-900 dark:text-white font-medium whitespace-nowrap">
                        Rs. {booking.totalAmount.toLocaleString()}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-2 w-fit">
                          <span className="inline-flex items-center justify-center px-3 py-1 rounded-full text-xs font-medium bg-purple-500/10 text-purple-400 border border-purple-500/20 whitespace-nowrap">
                            {booking.paymentMethod === "cash"
                              ? "Cash"
                              : booking.paymentMethod === "paddle"
                                ? "Paddle"
                                : "JazzCash"}
                          </span>
                          <span className={getPaymentBadgeColor(booking.paymentStatus)}>
                            {booking.paymentStatus.charAt(0).toUpperCase() + booking.paymentStatus.slice(1)}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={getStatusBadgeColor(booking.bookingStatus)}>
                          {booking.bookingStatus.charAt(0).toUpperCase() + booking.bookingStatus.slice(1)}
                        </span>
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
                      <td className="px-6 py-4 text-center align-middle">
                        <div className="flex items-center justify-center gap-3">
                          <button
                            onClick={() => handleViewClick(booking)}
                            className="bg-orange-500/10 text-orange-500 p-1.5 rounded-md hover:bg-orange-500 hover:text-white transition-colors cursor-pointer"
                            title="View Details"
                          >
                            <Eye size={18} />
                          </button>
                          <button
                            onClick={() => handleDownloadInvoice(booking)}
                            className="bg-green-500/10 text-green-500 p-1.5 rounded-md hover:bg-green-500 hover:text-white transition-colors cursor-pointer"
                            title="Download Invoice"
                          >
                            <Download size={18} />
                          </button>

                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-6 flex items-center justify-center gap-2">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 border border-gray-200 dark:border-[#2a2a3a] rounded-lg hover:bg-gray-50 dark:bg-[#0a0a0f] disabled:opacity-50"
                >
                  Previous
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  (page) => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`px-4 py-2 rounded-lg ${currentPage === page
                          ? "bg-orange-500 text-white"
                          : "border border-gray-200 dark:border-[#2a2a3a] hover:bg-gray-50 dark:bg-[#0a0a0f]"
                        }`}
                    >
                      {page}
                    </button>
                  ),
                )}
                <button
                  onClick={() =>
                    setCurrentPage(Math.min(totalPages, currentPage + 1))
                  }
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 border border-gray-200 dark:border-[#2a2a3a] rounded-lg hover:bg-gray-50 dark:bg-[#0a0a0f] disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Modals */}
      {showDetailModal && selectedBooking && (
        <BookingDetailModal
          booking={selectedBooking}
          onClose={() => setShowDetailModal(false)}
        />
      )}
      <ConfirmDialog
        isOpen={showDeleteDialog}
        title="Delete Booking"
        message={`Are you sure you want to delete this booking? This action cannot be undone.`}
        onConfirm={handleConfirmDelete}
        onCancel={() => setShowDeleteDialog(false)}
        confirmText="Delete"
        cancelText="Cancel"
        isDangerous={true}
        isLoading={isDeleting}
      />
      {viewLocation && (
        <ViewLocationModal
          location={viewLocation}
          onClose={() => setViewLocation(null)}
        />
      )}
    </div>
  );
}