'use client';

import React, { useState, useEffect } from 'react';
import { collection, onSnapshot, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { COLLECTIONS } from '@/lib/collections';
import { Car } from '@/types';
import toast from 'react-hot-toast';
import { Plus, Edit2, Trash2, AlertCircle } from 'lucide-react';
import AddCarModal from '@/components/admin/AddCarModal';
import EditCarModal from '@/components/admin/EditCarModal';
import ConfirmDialog from '@/components/admin/ConfirmDialog';

const CATEGORIES = ['All', 'Sedan', 'SUV', 'Luxury', 'Van', 'Coaster'];

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
    <div className="min-h-screen bg-gray-50 p-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-bold text-slate-900">Cars Management</h1>
          <p className="text-gray-600 mt-2">Manage your vehicle inventory</p>
        </div>
        <button
          onClick={handleAddCar}
          className="flex items-center gap-2 px-6 py-3 bg-orange-500 text-white font-semibold rounded-lg hover:bg-orange-600 transition-colors shadow-sm"
        >
          <Plus size={20} />
          Add Car
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <p className="text-gray-600 text-sm font-medium">Total Cars</p>
          <p className="text-4xl font-bold text-slate-900 mt-2">{totalCars}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <p className="text-gray-600 text-sm font-medium">Available</p>
          <p className="text-4xl font-bold text-green-600 mt-2">{availableCars}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <p className="text-gray-600 text-sm font-medium">Unavailable</p>
          <p className="text-4xl font-bold text-red-600 mt-2">{unavailableCars}</p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
        {CATEGORIES.map((category) => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            className={`px-6 py-2 rounded-full font-medium transition-all whitespace-nowrap ${
              selectedCategory === category
                ? 'bg-orange-500 text-white shadow-md'
                : 'bg-white text-gray-700 border border-gray-200 hover:border-orange-500 hover:text-orange-500'
            }`}
          >
            {category}
          </button>
        ))}
      </div>

      {/* Cars Grid */}
      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block w-12 h-12 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin"></div>
          <p className="text-gray-600 mt-4">Loading cars...</p>
        </div>
      ) : filteredCars.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl border border-gray-100">
          <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">No cars found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCars.map((car) => (
            <div key={car.carId} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-shadow">
              {/* Car Image */}
              <div className="relative w-full h-48 bg-gray-200 overflow-hidden">
                {car.images && car.images.length > 0 ? (
                  <img 
                    src={car.images[0]} 
                    alt={car.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-300">
                    <span className="text-gray-500">No image</span>
                  </div>
                )}
                <div className="absolute top-3 right-3 bg-orange-500 text-white px-3 py-1 rounded-full text-xs font-semibold capitalize">
                  {car.category}
                </div>
              </div>

              {/* Car Details */}
              <div className="p-6">
                <h3 className="text-xl font-bold text-slate-900 mb-1">
                  {car.brand} {car.name}
                </h3>
                <p className="text-sm text-gray-600 mb-4">{car.model} • {car.year}</p>

                {/* Price */}
                <div className="mb-4 pb-4 border-b border-gray-100">
                  <p className="text-orange-600 font-bold text-2xl">
                    PKR {car.price.toLocaleString()}
                    <span className="text-sm text-gray-500 font-normal">/day</span>
                  </p>
                </div>

                {/* Specs Row */}
                <div className="grid grid-cols-3 gap-3 mb-6 pb-6 border-b border-gray-100">
                  <div className="text-center">
                    <p className="text-gray-600 text-xs font-medium">Seats</p>
                    <p className="text-lg font-bold text-slate-900">{car.seats}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-gray-600 text-xs font-medium">Transmission</p>
                    <p className="text-xs font-semibold text-slate-900 capitalize">{car.transmission}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-gray-600 text-xs font-medium">Fuel</p>
                    <p className="text-xs font-semibold text-slate-900 capitalize">{car.fuel}</p>
                  </div>
                </div>

                {/* Available Toggle */}
                <div className="flex items-center gap-3 mb-6 pb-6 border-b border-gray-100">
                  <button
                    onClick={() => handleToggleAvailability(car)}
                    className={`flex-1 px-4 py-2 rounded-lg font-semibold transition-colors ${
                      car.available
                        ? 'bg-green-100 text-green-700 hover:bg-green-200'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    {car.available ? 'Available' : 'Unavailable'}
                  </button>
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                  <button
                    onClick={() => handleEditClick(car)}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-100 text-blue-700 rounded-lg font-medium hover:bg-blue-200 transition-colors"
                  >
                    <Edit2 size={16} />
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteClick(car)}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-red-100 text-red-700 rounded-lg font-medium hover:bg-red-200 transition-colors"
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
  );
}
