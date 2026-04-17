'use client';

import React, { useState, useEffect } from 'react';
import { collection, addDoc, serverTimestamp, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { COLLECTIONS } from '@/lib/collections';
import { Car, PackageCar } from '@/types';
import toast from 'react-hot-toast';
import { Plus, Trash2, X } from 'lucide-react';

interface FormData {
  name: string;
  description: string;
  pricePerDay: number;
  discount: number;
  packageCars: PackageCar[];
  features: string[];
  popular: boolean;
  available: boolean;
}

interface AddPackageModalProps {
  onClose: () => void;
  initialCars?: PackageCar[];
  initialData?: Partial<FormData>;
}

export default function AddPackageModal({ onClose, initialCars = [], initialData }: AddPackageModalProps) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [cars, setCars] = useState<Car[]>([]);
  const [featureInput, setFeatureInput] = useState('');
  const [carNameInput, setCarNameInput] = useState('');
  const [carQuantityInput, setCarQuantityInput] = useState('1');
  const [selectedFleetCar, setSelectedFleetCar] = useState<string>('');
  const [formData, setFormData] = useState<FormData>({
    name: initialData?.name || '',
    description: initialData?.description || '',
    pricePerDay: initialData?.pricePerDay || 0,
    discount: initialData?.discount || 0,
    packageCars: initialCars || [],
    features: initialData?.features || [],
    popular: initialData?.popular || false,
    available: initialData?.available ?? true,
  });

  // Fetch available cars from fleet
  useEffect(() => {
    const fetchCars = async () => {
      try {
        const snapshot = await getDocs(collection(db, COLLECTIONS.CARS));
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
            images: Array.isArray(data.images) ? data.images.filter((img: any) => img && typeof img === 'string') : [],
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
      } catch (error) {
        console.error('Error fetching cars:', error);
        toast.error('Failed to load fleet cars');
      }
    };
    fetchCars();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'number' ? Number(value) : type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const addPackageCar = async () => {
    // Fleet car selection is mandatory
    if (!selectedFleetCar) {
      toast.error('Please select a car from the fleet');
      return;
    }

    const selected = cars.find((c) => c.carId === selectedFleetCar);
    if (!selected) {
      toast.error('Selected car not found');
      return;
    }

    const quantity = parseInt(carQuantityInput) || 1;
    if (quantity < 1) {
      toast.error('Quantity must be at least 1');
      return;
    }

    // Get image from selected fleet car
    const imageUrl = selected.images.length > 0 ? selected.images[0] : '';
    
    if (!imageUrl) {
      toast.error(`${selected.name} does not have an image. Please add an image to the car first.`);
      return;
    }

    // Add to packageCars
    setFormData((prev) => ({
      ...prev,
      packageCars: [
        ...prev.packageCars,
        {
          carId: selected.carId,
          carName: selected.name,
          quantity,
          image: imageUrl,
        },
      ],
    }));

    // Reset inputs
    setCarQuantityInput('1');
    setSelectedFleetCar('');
    toast.success(`${selected.name} added to package!`);
  };

  const removePackageCar = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      packageCars: prev.packageCars.filter((_, i) => i !== index),
    }));
  };

  const updateCarQuantity = (index: number, quantity: number) => {
    if (quantity < 1) return;
    setFormData((prev) => ({
      ...prev,
      packageCars: prev.packageCars.map((car, i) =>
        i === index ? { ...car, quantity } : car
      ),
    }));
  };

  const addFeature = () => {
    if (featureInput.trim() && !formData.features.includes(featureInput.trim())) {
      setFormData((prev) => ({
        ...prev,
        features: [...prev.features, featureInput.trim()],
      }));
      setFeatureInput('');
    }
  };

  const removeFeature = (feature: string) => {
    setFormData((prev) => ({
      ...prev,
      features: prev.features.filter((f) => f !== feature),
    }));
  };

  const validateStep = (stepNum: number) => {
    if (stepNum === 1) {
      if (!formData.name || !formData.pricePerDay) {
        toast.error('Please fill in all required fields');
        return false;
      }
      if (formData.discount < 0 || formData.discount > 100) {
        toast.error('Discount must be between 0 and 100');
        return false;
      }
    } else if (stepNum === 2) {
      if (formData.packageCars.length === 0) {
        toast.error('Please add at least one car type to the package');
        return false;
      }
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateStep(2)) return;

    try {
      setLoading(true);

      const saveToastId = toast.loading('Creating package...');

      // Clean packageCars data - remove undefined values for Firestore
      const cleanPackageCars = formData.packageCars.map((car) => ({
        carId: car.carId || null,
        carName: car.carName,
        quantity: car.quantity,
        image: car.image || '',
      }));

      await addDoc(collection(db, COLLECTIONS.PACKAGES), {
        name: formData.name,
        description: formData.description,
        pricePerDay: formData.pricePerDay,
        discount: formData.discount,
        cars: cleanPackageCars,
        image: cleanPackageCars.length > 0 ? cleanPackageCars[0].image : '', // Use first car's image as package thumbnail
        features: formData.features,
        popular: formData.popular,
        available: formData.available,
        createdAt: serverTimestamp(),
      });

      toast.dismiss(saveToastId);
      toast.success('Package created successfully!');

      setTimeout(() => {
        onClose();
      }, 1000);
    } catch (error) {
      console.error('Error creating package:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      toast.error(`Error: ${errorMessage}`);
      setLoading(false);
    }
  };

  // Generate package summary text (e.g., "8 Prados & 2 Civics")
  const getPackageSummary = () => {
    if (formData.packageCars.length === 0) return '';
    return formData.packageCars
      .map((car) => `${car.quantity} ${car.carName}${car.quantity > 1 ? 's' : ''}`)
      .join(' & ');
  };

  const handleCancel = () => {
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200 sticky top-0 bg-white">
          <h2 className="text-2xl font-bold text-slate-900">Add New Package</h2>
          <button
            onClick={handleCancel}
            className="px-4 py-2 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={loading}
          >
            Cancel
          </button>
        </div>

        {/* Steps Progress */}
        <div className="px-6 pt-6 pb-4">
          <div className="flex gap-4">
            {[1, 2, 3].map((s) => (
              <div key={s} className="flex-1">
                <div className={`h-2 rounded-full ${step >= s ? 'bg-orange-500' : 'bg-gray-200'}`}></div>
                <p className="text-xs text-gray-600 mt-2 text-center">
                  {s === 1 ? 'Basic Info' : s === 2 ? 'Cars & Images' : 'Features'}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="px-6 py-6">
          {/* Step 1: Basic Info */}
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">Package Name *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="e.g., Wedding Package"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Package description..."
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">Price Per Day (PKR) *</label>
                <input
                  type="number"
                  name="pricePerDay"
                  value={formData.pricePerDay}
                  onChange={handleInputChange}
                  placeholder="5000"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">Discount (%)</label>
                  <input
                    type="number"
                    name="discount"
                    value={formData.discount}
                    onChange={handleInputChange}
                    min="0"
                    max="100"
                    placeholder="10"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none"
                  />
                </div>
                <div className="flex items-end gap-2">
                  <label className="flex items-center gap-2 cursor-pointer flex-1">
                    <input
                      type="checkbox"
                      name="popular"
                      checked={formData.popular}
                      onChange={handleInputChange}
                      className="w-5 h-5 accent-orange-500"
                    />
                    <span className="text-sm font-medium text-gray-900">Mark as Popular</span>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Package Cars with Images */}
          {step === 2 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Add Cars to Package</h3>
                
                {/* Add Car Form */}
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    {/* Fleet Car Dropdown */}
                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-2">Select Car from Fleet *</label>
                      <select
                        value={selectedFleetCar}
                        onChange={(e) => {
                          setSelectedFleetCar(e.target.value);
                        }}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none"
                      >
                        <option value="">Choose a car...</option>
                        {cars.map((car) => (
                          <option key={car.carId} value={car.carId}>
                            {car.name} ({car.brand} {car.model})
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Quantity Input */}
                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-2">Quantity *</label>
                      <input
                        type="number"
                        value={carQuantityInput}
                        onChange={(e) => setCarQuantityInput(e.target.value)}
                        min="1"
                        placeholder="1"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none"
                      />
                    </div>
                  </div>

                  <button
                    onClick={() => addPackageCar()}
                    className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium"
                  >
                    <Plus size={20} className="inline mr-2" />
                    Add This Car
                  </button>
                </div>

                {/* Package Summary */}
                {getPackageSummary() && (
                  <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-6">
                    <p className="text-sm text-gray-600">
                      <strong>Package includes:</strong> {getPackageSummary()}
                    </p>
                  </div>
                )}

                {/* Added Cars List */}
                {formData.packageCars.length > 0 && (
                  <div className="space-y-4">
                    <h4 className="font-semibold text-gray-900">Package Cars ({formData.packageCars.length})</h4>
                    {formData.packageCars.map((car, idx) => (
                      <div key={idx} className="border border-gray-200 rounded-lg p-4 bg-white">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-start">
                          {/* Car Info */}
                          <div className="md:col-span-2">
                            <p className="font-semibold text-gray-900">{car.carName}</p>
                            {car.carId && (
                              <p className="text-xs text-gray-500">From fleet (ID: {car.carId})</p>
                            )}
                          </div>

                          {/* Quantity Control */}
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Quantity</label>
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => updateCarQuantity(idx, car.quantity - 1)}
                                className="px-2 py-1 bg-gray-200 rounded hover:bg-gray-300"
                              >
                                −
                              </button>
                              <input
                                type="number"
                                value={car.quantity}
                                onChange={(e) => updateCarQuantity(idx, parseInt(e.target.value) || 1)}
                                className="w-12 text-center border border-gray-300 rounded"
                                min="1"
                              />
                              <button
                                onClick={() => updateCarQuantity(idx, car.quantity + 1)}
                                className="px-2 py-1 bg-gray-200 rounded hover:bg-gray-300"
                              >
                                +
                              </button>
                            </div>
                          </div>

                          {/* Image and Delete */}
                          <div className="flex gap-2 items-end">
                            {car.image && (
                              <img
                                src={car.image}
                                alt={car.carName}
                                className="w-16 h-16 object-cover rounded border border-gray-200"
                              />
                            )}
                            <button
                              onClick={() => removePackageCar(idx)}
                              className="px-3 py-2 bg-red-50 text-red-600 rounded hover:bg-red-100 transition-colors"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Step 3: Features */}
          {step === 3 && (
            <div className="space-y-4">
              <label className="block text-sm font-medium text-gray-900 mb-2">Package Features</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={featureInput}
                  onChange={(e) => setFeatureInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addFeature())}
                  placeholder="Add a feature..."
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none"
                />
                <button
                  onClick={addFeature}
                  className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
                >
                  <Plus size={20} />
                </button>
              </div>

              {/* Features Chips */}
              <div className="flex flex-wrap gap-2">
                {formData.features.map((feature) => (
                  <span
                    key={feature}
                    className="bg-orange-50 text-orange-700 px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2"
                  >
                    {feature}
                    <button onClick={() => removeFeature(feature)} className="hover:text-orange-900">
                      <X size={16} />
                    </button>
                  </span>
                ))}
              </div>

              <label className="flex items-center gap-2 cursor-pointer mt-4">
                <input
                  type="checkbox"
                  name="available"
                  checked={formData.available}
                  onChange={handleInputChange}
                  className="w-5 h-5 accent-orange-500"
                />
                <span className="text-sm font-medium text-gray-900">Available for booking</span>
              </label>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 p-6 flex justify-between gap-3 bg-gray-50">
          <button
            onClick={() => setStep(Math.max(1, step - 1))}
            disabled={step === 1 || loading}
            className="px-6 py-2 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          {step < 3 ? (
            <button
              onClick={() => {
                if (validateStep(step)) {
                  setStep(step + 1);
                }
              }}
              disabled={loading}
              className="px-6 py-2 bg-orange-500 text-white rounded-lg font-medium hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="px-6 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating...' : 'Create Package'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
