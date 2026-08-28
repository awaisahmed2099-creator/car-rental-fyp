'use client';

import React, { useState, useEffect } from 'react';
import { collection, onSnapshot, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { COLLECTIONS } from '@/lib/collections';
import { Car } from '@/types';
import toast from 'react-hot-toast';
import { Plus, Edit2, Trash2, AlertCircle, ChevronLeft, ChevronRight, Car as CarIcon, CheckCircle, Calendar } from 'lucide-react';
import AdminHeader from '@/components/admin/AdminHeader';
import AddCarModal from '@/components/admin/AddCarModal';
import EditCarModal from '@/components/admin/EditCarModal';
import ConfirmDialog from '@/components/admin/ConfirmDialog';
import SkeletonCard from '@/components/ui/SkeletonCard';

const CATEGORIES = ['All', 'Sedan', 'SUV', 'Luxury', 'Van', 'Coaster'];

// Car Card Component with Image Carousel
function CarCard({ car, onEdit, onDelete, onToggleAvailability }: { car: Car; onEdit: (car: Car) => void; onDelete: (car: Car) => void; onToggleAvailability: (car: Car) => void }) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const totalImages = car.images?.length || 0;
  const currentImage = totalImages > 0 ? car.images[currentImageIndex] : null;

  const handlePrevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev === 0 ? totalImages - 1 : prev - 1));
  };

  const handleNextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev === totalImages - 1 ? 0 : prev + 1));
  };

  return (
    <div className="bg-white dark:bg-[#1a1a24] rounded-xl shadow-sm border border-gray-200 dark:border-[#2a2a3a] overflow-hidden hover:-translate-y-2 hover:border-orange-500 dark:hover:border-orange-500 hover:shadow-lg transition-all duration-300">
      {/* Car Image with Navigation */}
      <div className="relative w-full h-48 bg-gray-50 dark:bg-[#0a0a0f] overflow-hidden group border-b border-gray-200 dark:border-[#2a2a3a]">
        {currentImage ? (
          <img 
            src={currentImage} 
            alt={car.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-white dark:bg-[#111118]">
            <span className="text-gray-500 dark:text-gray-500">No image</span>
          </div>
        )}

        {/* Previous Button */}
        {totalImages > 1 && (
          <button
            onClick={handlePrevImage}
            className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black/80 hover:bg-orange-500 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-all z-10 cursor-pointer"
          >
            <ChevronLeft size={20} />
          </button>
        )}

        {/* Next Button */}
        {totalImages > 1 && (
          <button
            onClick={handleNextImage}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black/80 hover:bg-orange-500 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-all z-10 cursor-pointer"
          >
            <ChevronRight size={20} />
          </button>
        )}

        {/* Image Counter */}
        {totalImages > 1 && (
          <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 bg-black/80 text-white px-3 py-1 rounded-full text-xs font-medium border border-white/20">
            {currentImageIndex + 1} / {totalImages}
          </div>
        )}

        {/* Category Badge */}
        <div className="absolute top-3 right-3 bg-orange-500 text-white px-3 py-1 rounded-full text-xs font-semibold uppercase shadow-lg shadow-orange-500/20">
          {car.category}
        </div>
      </div>

      {/* Car Details */}
      <div className="p-6">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
          {car.brand} {car.name}
        </h3>
        <div className="mb-4">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-orange-50 dark:bg-[#1a1a24] text-orange-600 dark:text-orange-500 border border-orange-200 dark:border-orange-500/30 whitespace-nowrap shadow-sm">
            <Calendar size={12} className="text-orange-500" />
            {car.model}
          </span>
        </div>

        {/* Price */}
        <div className="mb-4 pb-4 border-b border-gray-200 dark:border-[#2a2a3a]">
          <p className="text-orange-500 font-bold text-2xl">
            PKR {car.price.toLocaleString()}
            <span className="text-sm text-gray-500 dark:text-gray-500 font-normal">/day</span>
          </p>
        </div>

        {/* Description */}
        {car.description && (
          <div className="mb-4 pb-4 border-b border-gray-200 dark:border-[#2a2a3a] relative group/desc">
            <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-3 cursor-help">
              {car.description}
            </p>
            
            {/* Custom Tooltip */}
            <div className="absolute left-0 bottom-full mb-2 opacity-0 group-hover/desc:opacity-100 invisible group-hover/desc:visible transition-all duration-200 w-[110%] p-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-xl rounded-lg z-50 pointer-events-none">
              <p className="text-xs text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed">
                {car.description}
              </p>
              {/* Tooltip Arrow */}
              <div className="absolute -bottom-2 left-4 w-4 h-4 bg-white dark:bg-gray-800 border-b border-r border-gray-200 dark:border-gray-700 transform rotate-45"></div>
            </div>
          </div>
        )}

        {/* Features */}
        {car.features && car.features.length > 0 && (
          <div className="mb-4 pb-4 border-b border-gray-200 dark:border-[#2a2a3a]">
            <p className="text-xs font-semibold text-gray-900 dark:text-white uppercase tracking-wider mb-2">Features</p>
            <div className="flex flex-wrap gap-2">
              {car.features.map((feature, idx) => (
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

        {/* Specs Row */}
        <div className="grid grid-cols-3 gap-3 mb-6 pb-6 border-b border-gray-200 dark:border-[#2a2a3a]">
          <div className="text-center">
            <p className="text-gray-500 dark:text-gray-500 text-xs font-medium">Seats</p>
            <p className="text-lg font-bold text-gray-700 dark:text-gray-300">{car.seats}</p>
          </div>
          <div className="text-center">
            <p className="text-gray-500 dark:text-gray-500 text-xs font-medium">Transmission</p>
            <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 capitalize">{car.transmission}</p>
          </div>
          <div className="text-center">
            <p className="text-gray-500 dark:text-gray-500 text-xs font-medium">Fuel</p>
            <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 capitalize">{car.fuel}</p>
          </div>
        </div>

        {/* Available Toggle */}
        <div className="flex items-center gap-3 mb-6 pb-6 border-b border-gray-200 dark:border-[#2a2a3a]">
          <button
            onClick={() => onToggleAvailability(car)}
            className={`flex-1 px-4 py-2 rounded-lg font-semibold transition-colors border cursor-pointer ${
              car.available
                ? 'bg-green-500/10 text-green-500 hover:bg-green-500/20 border-green-500/20'
                : 'bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-700 border-gray-700'
            }`}
          >
            {car.available ? 'Available' : 'Unavailable'}
          </button>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={() => onEdit(car)}
            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-orange-500/10 text-orange-500 border border-orange-500/20 rounded-lg font-medium hover:bg-orange-500/20 transition-colors cursor-pointer"
          >
            <Edit2 size={16} />
            Edit
          </button>
          <button
            onClick={() => onDelete(car)}
            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-red-500/10 text-red-500 border border-red-500/20 rounded-lg font-medium hover:bg-red-500/20 transition-colors cursor-pointer"
          >
            <Trash2 size={16} />
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

export default function CarsPage() {
  const [cars, setCars] = useState<Car[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedCar, setSelectedCar] = useState<Car | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [carToDelete, setCarToDelete] = useState<Car | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch cars with real-time updates
  useEffect(() => {
    setLoading(true);
    const unsubscribe = onSnapshot(collection(db, COLLECTIONS.CARS), (snapshot) => {
      const carsData: Car[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        carsData.push({
          carId: doc.id,
          name: data.name || '',
          brand: data.brand || '',
          model: data.model || '',
          year: data.year || new Date().getFullYear(),
          price: data.price || 0,
          images: (Array.isArray(data.images) ? data.images : []).filter((img: any) => img && typeof img === 'string'),
          category: data.category || 'sedan',
          seats: data.seats || 5,
          transmission: data.transmission || 'automatic',
          fuel: data.fuel || 'petrol',
          features: Array.isArray(data.features) ? data.features : [],
          available: data.available ?? true,
          description: data.description || '',
          createdAt: data.createdAt?.toDate?.() || new Date(data.createdAt),
        } as Car);
      });
      setCars(carsData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const filteredCars = selectedCategory === 'All' 
    ? cars 
    : cars.filter((car) => car.category.toLowerCase() === selectedCategory.toLowerCase());

  const totalCars = cars.length;
  const availableCars = cars.filter((car) => car.available).length;
  const unavailableCars = totalCars - availableCars;

  const handleToggleAvailability = async (car: Car) => {
    try {
      const carRef = doc(db, COLLECTIONS.CARS, car.carId);
      await updateDoc(carRef, { available: !car.available });
      toast.success(`Car marked as ${!car.available ? 'available' : 'unavailable'}`);
    } catch (error) {
      console.error('Error updating car:', error);
      toast.error('Failed to update car availability');
    }
  };

  const handleDeleteClick = (car: Car) => {
    setCarToDelete(car);
    setShowDeleteDialog(true);
  };

  const handleConfirmDelete = async () => {
    if (!carToDelete) return;

    try {
      await deleteDoc(doc(db, COLLECTIONS.CARS, carToDelete.carId));
      toast.success('Car deleted successfully');
      setShowDeleteDialog(false);
      setCarToDelete(null);
    } catch (error) {
      console.error('Error deleting car:', error);
      toast.error('Failed to delete car');
    }
  };

  const handleEditClick = (car: Car) => {
    setSelectedCar(car);
    setShowEditModal(true);
  };

  const handleAddCar = () => {
    setShowAddModal(true);
  };

  const handleModalClose = () => {
    setShowAddModal(false);
    setShowEditModal(false);
    setSelectedCar(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0a0a0f]">
      <AdminHeader title="Cars Management" />
      <div className="p-8">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Manage Cars</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Add, edit, and manage your vehicle fleet</p>
          </div>
          <button
            onClick={handleAddCar}
            className="flex items-center gap-2 px-6 py-3 bg-orange-500 text-white font-semibold rounded-lg hover:bg-orange-600 transition-colors shadow-lg shadow-orange-500/20 cursor-pointer"
          >
            <Plus size={20} />
            Add Car
          </button>
        </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white dark:bg-[#1a1a24] p-6 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm rounded-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-orange-500/10 hover:border-orange-500/50 cursor-default group">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-gray-500 dark:text-gray-400 text-sm font-medium mb-2">Total Cars</p>
              <h3 className="text-3xl font-bold text-gray-900 dark:text-white">{totalCars}</h3>
            </div>
            <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-orange-500/10 border border-orange-500/20 group-hover:bg-orange-500/20 transition-colors">
              <CarIcon className="w-5 h-5 text-orange-500" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-[#1a1a24] p-6 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm rounded-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-green-500/10 hover:border-green-500/50 cursor-default group">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-gray-500 dark:text-gray-400 text-sm font-medium mb-2">Available</p>
              <h3 className="text-3xl font-bold text-gray-900 dark:text-white">{availableCars}</h3>
            </div>
            <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-green-500/10 border border-green-500/20 group-hover:bg-green-500/20 transition-colors">
              <CheckCircle className="w-5 h-5 text-green-500" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-[#1a1a24] p-6 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm rounded-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-red-500/10 hover:border-red-500/50 cursor-default group">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-gray-500 dark:text-gray-400 text-sm font-medium mb-2">Unavailable</p>
              <h3 className="text-3xl font-bold text-gray-900 dark:text-white">{unavailableCars}</h3>
            </div>
            <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-red-500/10 border border-red-500/20 group-hover:bg-red-500/20 transition-colors">
              <AlertCircle className="w-5 h-5 text-red-500" />
            </div>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-8 overflow-x-auto pb-2 scrollbar-hide">
        {CATEGORIES.map((category) => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            className={`px-6 py-2 rounded-full font-medium transition-all whitespace-nowrap border cursor-pointer ${
              selectedCategory === category
                ? 'bg-orange-500/10 text-orange-500 border-orange-500/20 shadow-md'
                : 'bg-white dark:bg-[#1a1a24] text-gray-600 dark:text-gray-400 border-gray-200 dark:border-[#2a2a3a] hover:border-orange-500/50 hover:text-orange-500'
            }`}
          >
            {category}
          </button>
        ))}
      </div>

      {/* Cars Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <SkeletonCard key={i} variant="car" />
          ))}
        </div>
      ) : filteredCars.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-[#1a1a24] rounded-xl border border-gray-200 dark:border-[#2a2a3a]">
          <AlertCircle className="w-12 h-12 text-gray-500 dark:text-gray-500 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">No cars found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCars.map((car) => (
            <CarCard key={car.carId} car={car} onEdit={handleEditClick} onDelete={handleDeleteClick} onToggleAvailability={handleToggleAvailability} />
          ))}
        </div>
      )}

      {/* Modals */}
      {showAddModal && <AddCarModal onClose={handleModalClose} />}
      {showEditModal && selectedCar && <EditCarModal car={selectedCar} onClose={handleModalClose} />}

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showDeleteDialog}
        title="Delete Car"
        message={`Delete ${carToDelete?.name}? This action cannot be undone.`}
        onConfirm={handleConfirmDelete}
        onCancel={() => {
          setShowDeleteDialog(false);
          setCarToDelete(null);
        }}
        confirmText="Delete"
        cancelText="Cancel"
        isDangerous={true}
      />
    </div>
    </div>
  );
}
