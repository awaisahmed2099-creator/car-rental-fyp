'use client';

import React, { useState, useEffect } from 'react';
import { collection, onSnapshot, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { COLLECTIONS } from '@/lib/collections';
import { Package } from '@/types';
import toast from 'react-hot-toast';
import { Plus, Edit2, Trash2, AlertCircle, Star, Check, X, ChevronLeft, ChevronRight, Package as PackageIcon, CheckCircle } from 'lucide-react';
import AdminHeader from '@/components/admin/AdminHeader';
import AddPackageModal from '@/components/admin/AddPackageModal';
import EditPackageModal from '@/components/admin/EditPackageModal';
import ConfirmDialog from '@/components/admin/ConfirmDialog';
import SkeletonCard from '@/components/ui/SkeletonCard';

export default function PackagesPage() {
  const [packages, setPackages] = useState<Package[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<Package | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [packageToDelete, setPackageToDelete] = useState<Package | null>(null);
  const [loading, setLoading] = useState(true);
  const [imageIndexes, setImageIndexes] = useState<{ [key: string]: number }>({});

  // Fetch packages with real-time updates
  useEffect(() => {
    setLoading(true);
    const unsubscribe = onSnapshot(collection(db, COLLECTIONS.PACKAGES), (snapshot) => {
      const packagesData: Package[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        packagesData.push({
          packageId: doc.id,
          name: data.name || '',
          description: data.description || '',
          cars: Array.isArray(data.cars) ? data.cars : [],
          duration: data.duration || '',
          pricePerDay: data.pricePerDay || 0,
          discount: data.discount || 0,
          features: Array.isArray(data.features) ? data.features : [],
          image: data.image || '',
          popular: data.popular ?? false,
          available: data.available ?? true,
          createdAt: data.createdAt?.toDate?.() || new Date(data.createdAt),
        } as Package);
      });
      setPackages(packagesData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const totalPackages = packages.length;
  const availablePackages = packages.filter((pkg) => pkg.available).length;
  const popularPackages = packages.filter((pkg) => pkg.popular).length;

  const handleToggleAvailability = async (pkg: Package) => {
    try {
      const pkgRef = doc(db, COLLECTIONS.PACKAGES, pkg.packageId);
      await updateDoc(pkgRef, { available: !pkg.available });
      toast.success(`Package marked as ${!pkg.available ? 'available' : 'unavailable'}`);
    } catch (error) {
      console.error('Error updating package:', error);
      toast.error('Failed to update package availability');
    }
  };

  const handleDeleteClick = (pkg: Package) => {
    setPackageToDelete(pkg);
    setShowDeleteDialog(true);
  };

  const handleConfirmDelete = async () => {
    if (!packageToDelete) return;

    try {
      await deleteDoc(doc(db, COLLECTIONS.PACKAGES, packageToDelete.packageId));
      toast.success('Package deleted successfully');
      setShowDeleteDialog(false);
      setPackageToDelete(null);
    } catch (error) {
      console.error('Error deleting package:', error);
      toast.error('Failed to delete package');
    }
  };

  const handleEditClick = (pkg: Package) => {
    setSelectedPackage(pkg);
    setShowEditModal(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-[#0a0a0f]">
        <AdminHeader title="Packages Management" />
        <div className="p-8 max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <SkeletonCard key={i} variant="package" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0a0a0f]">
      <AdminHeader title="Packages Management" />

      <div className="p-8 max-w-7xl mx-auto">
        {/* Header with Add Button */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Manage Packages</h2>
            <p className="text-gray-600 dark:text-gray-400 mt-2">Create and manage rental packages</p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-6 py-3 bg-orange-500 text-white rounded-lg font-medium hover:bg-orange-600 transition-colors shadow-lg shadow-orange-500/20 cursor-pointer"
          >
            <Plus size={20} />
            Add Package
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white dark:bg-[#1a1a24] p-6 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm rounded-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-blue-500/10 hover:border-blue-500/50 cursor-default group">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-gray-500 dark:text-gray-400 text-sm font-medium mb-2">Total Packages</p>
                <h3 className="text-3xl font-bold text-gray-900 dark:text-white">{totalPackages}</h3>
              </div>
              <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-blue-500/10 border border-blue-500/20 group-hover:bg-blue-500/20 transition-colors">
                <PackageIcon className="w-5 h-5 text-blue-500" />
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-[#1a1a24] p-6 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm rounded-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-green-500/10 hover:border-green-500/50 cursor-default group">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-gray-500 dark:text-gray-400 text-sm font-medium mb-2">Available</p>
                <h3 className="text-3xl font-bold text-gray-900 dark:text-white">{availablePackages}</h3>
              </div>
              <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-green-500/10 border border-green-500/20 group-hover:bg-green-500/20 transition-colors">
                <CheckCircle className="w-5 h-5 text-green-500" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-[#1a1a24] p-6 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm rounded-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-orange-500/10 hover:border-orange-500/50 cursor-default group">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-gray-500 dark:text-gray-400 text-sm font-medium mb-2">Popular Packages</p>
                <h3 className="text-3xl font-bold text-gray-900 dark:text-white">{popularPackages}</h3>
              </div>
              <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-orange-500/10 border border-orange-500/20 group-hover:bg-orange-500/20 transition-colors">
                <Star className="w-5 h-5 text-orange-500" />
              </div>
            </div>
          </div>
        </div>

        {/* Packages Grid */}
        {packages.length === 0 ? (
          <div className="bg-white dark:bg-[#1a1a24] rounded-lg border border-gray-200 dark:border-[#2a2a3a] p-12 text-center">
            <AlertCircle size={48} className="text-gray-500 dark:text-gray-500 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400 text-lg">No packages yet</p>
            <p className="text-gray-500 dark:text-gray-500 mt-2">Click "+ Add Package" to create your first package</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {packages.map((pkg) => (
              <div key={pkg.packageId} className="bg-white dark:bg-[#1a1a24] rounded-lg border border-gray-200 dark:border-[#2a2a3a] overflow-hidden hover:-translate-y-2 hover:border-orange-500 dark:hover:border-orange-500 hover:shadow-lg transition-all duration-300 shadow-sm">
                {/* Image Carousel */}
                <div className="relative h-48 bg-gray-50 dark:bg-[#0a0a0f] overflow-hidden border-b border-gray-200 dark:border-[#2a2a3a]">
                  {pkg.cars && pkg.cars.length > 0 ? (
                    <>
                      {/* Current Image */}
                      <img
                        src={pkg.cars[imageIndexes[pkg.packageId] || 0]?.image || pkg.image}
                        alt={pkg.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.src = 'https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=500&h=300&fit=crop';
                        }}
                      />

                      {/* Navigation Buttons (only show if more than 1 car) */}
                      {pkg.cars.length > 1 && (
                        <>
                          <button
                            onClick={() => {
                              const newIndex = (imageIndexes[pkg.packageId] || 0) - 1;
                              setImageIndexes({
                                ...imageIndexes,
                                [pkg.packageId]: newIndex < 0 ? pkg.cars.length - 1 : newIndex,
                              });
                            }}
                            className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black/80 hover:bg-orange-500 text-white p-2 rounded-full transition-all cursor-pointer"
                          >
                            <ChevronLeft size={20} />
                          </button>
                          <button
                            onClick={() => {
                              const newIndex = (imageIndexes[pkg.packageId] || 0) + 1;
                              setImageIndexes({
                                ...imageIndexes,
                                [pkg.packageId]: newIndex >= pkg.cars.length ? 0 : newIndex,
                              });
                            }}
                            className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black/80 hover:bg-orange-500 text-white p-2 rounded-full transition-all cursor-pointer"
                          >
                            <ChevronRight size={20} />
                          </button>
                        </>
                      )}

                      {/* Car Info and Counter */}
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black via-black/80 to-transparent p-3">
                        <div className="flex items-center justify-between">
                          <div className="text-white">
                            <p className="font-semibold">{pkg.cars[imageIndexes[pkg.packageId] || 0]?.carName}</p>
                            <p className="text-sm text-gray-300">Quantity: {pkg.cars[imageIndexes[pkg.packageId] || 0]?.quantity}</p>
                          </div>
                          {pkg.cars.length > 1 && (
                            <div className="bg-black/60 text-white px-3 py-1 rounded text-xs font-medium border border-white/20">
                              {(imageIndexes[pkg.packageId] || 0) + 1} / {pkg.cars.length}
                            </div>
                          )}
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-500 dark:text-gray-500 bg-white dark:bg-[#111118]">No image</div>
                  )}

                  {/* Badges */}
                  <div className="absolute top-4 left-4 flex gap-2">
                    {pkg.popular && (
                      <span className="bg-orange-500 text-white px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 shadow-lg shadow-orange-500/20">
                        <Star size={14} />
                        Popular
                      </span>
                    )}
                    {pkg.discount > 0 && (
                      <span className="bg-red-500 text-white px-3 py-1 rounded-full text-xs font-medium">{pkg.discount}% OFF</span>
                    )}
                  </div>
                </div>

                {/* Content */}
                <div className="p-4">
                  {/* Name */}
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">{pkg.name}</h3>

                  {/* Cars Included (Details) */}
                  <div className="mb-4">
                    <p className="text-gray-500 dark:text-gray-400 text-sm mb-2">Cars Included</p>
                    <div className="flex flex-wrap gap-2">
                      {pkg.cars.map((car, idx) => (
                        <span
                          key={idx}
                          className="inline-flex items-center px-2 py-1 rounded text-[11px] font-medium bg-orange-50 dark:bg-orange-500/10 text-orange-600 dark:text-orange-500 border border-orange-200 dark:border-orange-500/20 whitespace-nowrap"
                        >
                          {car.quantity}x {car.carName}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Price */}
                  <div className="mb-4 pb-4 border-b border-gray-200 dark:border-[#2a2a3a]">
                    <p className="text-gray-500 dark:text-gray-500 text-xs font-medium mb-1">Price/Day</p>
                    <p className="text-orange-500 font-bold text-2xl">
                      PKR {pkg.pricePerDay.toLocaleString()}
                    </p>
                  </div>

                  {/* Description */}
                  {pkg.description && (
                    <div className="mb-4 pb-4 border-b border-gray-200 dark:border-[#2a2a3a] relative group/desc">
                      <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-3 cursor-help">
                        {pkg.description}
                      </p>
                      
                      {/* Custom Tooltip */}
                      <div className="absolute left-0 bottom-full mb-2 opacity-0 group-hover/desc:opacity-100 invisible group-hover/desc:visible transition-all duration-200 w-[110%] p-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-xl rounded-lg z-50 pointer-events-none">
                        <p className="text-xs text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed">
                          {pkg.description}
                        </p>
                        {/* Tooltip Arrow */}
                        <div className="absolute -bottom-2 left-4 w-4 h-4 bg-white dark:bg-gray-800 border-b border-r border-gray-200 dark:border-gray-700 transform rotate-45"></div>
                      </div>
                    </div>
                  )}

                  {/* Features */}
                  {pkg.features && pkg.features.length > 0 && (
                    <div className="mb-6 pb-6 border-b border-gray-200 dark:border-[#2a2a3a]">
                      <p className="text-xs font-semibold text-gray-900 dark:text-white uppercase tracking-wider mb-2">Features</p>
                      <div className="flex flex-wrap gap-2">
                        {pkg.features.map((feature, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-1 bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-500/20 rounded-md text-xs font-medium"
                          >
                            {feature}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Available Toggle */}
                  <div className="flex items-center gap-3 mb-6 pb-6 border-b border-gray-200 dark:border-[#2a2a3a]">
                    <button
                      onClick={() => handleToggleAvailability(pkg)}
                      className={`flex-1 px-4 py-2 rounded-lg font-semibold transition-colors border cursor-pointer ${
                        pkg.available
                          ? 'bg-green-500/10 text-green-500 hover:bg-green-500/20 border-green-500/20'
                          : 'bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-700 border-gray-700'
                      }`}
                    >
                      {pkg.available ? 'Available' : 'Unavailable'}
                    </button>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEditClick(pkg)}
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-orange-500/10 text-orange-500 border border-orange-500/20 rounded-lg font-medium hover:bg-orange-500/20 transition-colors cursor-pointer"
                    >
                      <Edit2 size={16} />
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteClick(pkg)}
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-red-500/10 text-red-500 border border-red-500/20 rounded-lg font-medium hover:bg-red-500/20 transition-colors cursor-pointer"
                    >
                      <Trash2 size={16} />
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modals */}
      {showAddModal && <AddPackageModal onClose={() => setShowAddModal(false)} />}
      {showEditModal && selectedPackage && (
        <EditPackageModal package={selectedPackage} onClose={() => setShowEditModal(false)} />
      )}
      <ConfirmDialog
        isOpen={showDeleteDialog}
        title="Delete Package"
        message={`Are you sure you want to delete "${packageToDelete?.name}"? This action cannot be undone.`}
        onConfirm={handleConfirmDelete}
        onCancel={() => setShowDeleteDialog(false)}
        confirmText="Delete"
        cancelText="Cancel"
        isDangerous={true}
      />
    </div>
  );
}
