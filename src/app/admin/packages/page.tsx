'use client';

import React, { useState, useEffect } from 'react';
import { collection, onSnapshot, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { COLLECTIONS } from '@/lib/collections';
import { Package } from '@/types';
import toast from 'react-hot-toast';
import { Plus, Edit2, Trash2, AlertCircle, Star, Check, X, ChevronLeft, ChevronRight } from 'lucide-react';
import AdminHeader from '@/components/admin/AdminHeader';
import AddPackageModal from '@/components/admin/AddPackageModal';
import EditPackageModal from '@/components/admin/EditPackageModal';
import ConfirmDialog from '@/components/admin/ConfirmDialog';

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
      <div className="min-h-screen bg-gray-50">
        <AdminHeader title="Packages Management" />
        <div className="flex items-center justify-center h-64">
          <p className="text-gray-500">Loading packages...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminHeader title="Packages Management" />

      <div className="p-8 max-w-7xl mx-auto">
        {/* Header with Add Button */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">Manage Packages</h2>
            <p className="text-gray-600 mt-2">Create and manage rental packages</p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-6 py-3 bg-orange-500 text-white rounded-lg font-medium hover:bg-orange-600 transition-colors"
          >
            <Plus size={20} />
            Add Package
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-gray-600 text-sm font-medium">Total Packages</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">{totalPackages}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-gray-600 text-sm font-medium">Available</p>
            <p className="text-3xl font-bold text-green-600 mt-2">{availablePackages}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-gray-600 text-sm font-medium">Popular Packages</p>
            <p className="text-3xl font-bold text-orange-500 mt-2">{popularPackages}</p>
          </div>
        </div>

        {/* Packages Grid */}
        {packages.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <AlertCircle size={48} className="text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600 text-lg">No packages yet</p>
            <p className="text-gray-500 mt-2">Click "+ Add Package" to create your first package</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {packages.map((pkg) => (
              <div key={pkg.packageId} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                {/* Image Carousel */}
                <div className="relative h-48 bg-gray-200 overflow-hidden">
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
                            className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 hover:bg-opacity-75 text-white p-2 rounded-full transition-all"
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
                            className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 hover:bg-opacity-75 text-white p-2 rounded-full transition-all"
                          >
                            <ChevronRight size={20} />
                          </button>
                        </>
                      )}

                      {/* Car Info and Counter */}
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black via-black to-transparent p-3">
                        <div className="flex items-center justify-between">
                          <div className="text-white">
                            <p className="font-semibold">{pkg.cars[imageIndexes[pkg.packageId] || 0]?.carName}</p>
                            <p className="text-sm text-gray-300">Quantity: {pkg.cars[imageIndexes[pkg.packageId] || 0]?.quantity}</p>
                          </div>
                          {pkg.cars.length > 1 && (
                            <div className="bg-black bg-opacity-60 text-white px-3 py-1 rounded text-xs font-medium">
                              {(imageIndexes[pkg.packageId] || 0) + 1} / {pkg.cars.length}
                            </div>
                          )}
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">No image</div>
                  )}

                  {/* Badges */}
                  <div className="absolute top-4 left-4 flex gap-2">
                    {pkg.popular && (
                      <span className="bg-orange-500 text-white px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                        <Star size={14} />
                        Popular
                      </span>
                    )}
                    {pkg.discount > 0 && (
                      <span className="bg-red-500 text-white px-3 py-1 rounded-full text-xs font-medium">{pkg.discount}% OFF</span>
                    )}
                  </div>

                  {/* Availability Toggle */}
                  <button
                    onClick={() => handleToggleAvailability(pkg)}
                    className={`absolute top-4 right-4 p-2 rounded-lg transition-colors ${
                      pkg.available ? 'bg-green-500 text-white hover:bg-green-600' : 'bg-gray-400 text-white hover:bg-gray-500'
                    }`}
                  >
                    {pkg.available ? <Check size={18} /> : <X size={18} />}
                  </button>
                </div>

                {/* Content */}
                <div className="p-4">
                  <h3 className="text-lg font-bold text-gray-900 mb-2">{pkg.name}</h3>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">{pkg.description}</p>

                  {/* Details */}
                  <div className="grid grid-cols-2 gap-4 mb-4 pb-4 border-b border-gray-200">
                    <div>
                      <p className="text-gray-500 text-xs">Duration</p>
                      <p className="text-gray-900 font-semibold">{pkg.duration}</p>
                    </div>
                    <div>
                      <p className="text-gray-500 text-xs">Price/Day</p>
                      <p className="text-gray-900 font-semibold">Rs. {pkg.pricePerDay.toLocaleString()}</p>
                    </div>
                  </div>

                  {/* Cars Count */}
                  <div className="mb-4">
                    <p className="text-gray-500 text-xs">Cars Included</p>
                    <p className="text-gray-900 font-semibold">{pkg.cars.length} car(s)</p>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEditClick(pkg)}
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-50 text-blue-600 rounded-lg font-medium hover:bg-blue-100 transition-colors"
                    >
                      <Edit2 size={16} />
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteClick(pkg)}
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-red-50 text-red-600 rounded-lg font-medium hover:bg-red-100 transition-colors"
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
