'use client';

import React, { useState, useEffect } from 'react';
import { collection, updateDoc, doc, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { COLLECTIONS } from '@/lib/collections';
import { Package, Car, PackageCar } from '@/types';
import toast from 'react-hot-toast';
import { Plus, Trash2, X, Check, ChevronDown, ChevronUp } from 'lucide-react';

const SUGGESTED_FEATURES = ['AC', 'Music System', 'GPS', 'Bluetooth', 'USB Charging', 'Leather Seats', 'Sunroof', 'Backup Camera'];

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

interface EditPackageModalProps {
  package: Package;
  onClose: () => void;
}

export default function EditPackageModal({ package: initialPackage, onClose }: EditPackageModalProps) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [cars, setCars] = useState<Car[]>([]);
  const [featureInput, setFeatureInput] = useState('');
  const [carQuantityInput, setCarQuantityInput] = useState('1');
  const [selectedFleetCar, setSelectedFleetCar] = useState<string>('');
  const [formData, setFormData] = useState<FormData>({
    name: initialPackage.name,
    description: initialPackage.description,
    pricePerDay: initialPackage.pricePerDay,
    discount: initialPackage.discount,
    packageCars: initialPackage.cars || [],
    features: initialPackage.features,
    popular: initialPackage.popular,
    available: initialPackage.available,
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

  const toggleFeature = (feature: string) => {
    setFormData((prev) => ({
      ...prev,
      features: formData.features.includes(feature)
        ? formData.features.filter((f) => f !== feature)
        : [...formData.features, feature],
    }));
  };

  const handleCancel = () => {
    onClose();
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

      const saveToastId = toast.loading('Updating package...');

      const pkgRef = doc(db, COLLECTIONS.PACKAGES, initialPackage.packageId);

      // Clean packageCars data - remove undefined values for Firestore
      const cleanPackageCars = formData.packageCars.map((car) => ({
        carId: car.carId || null,
        carName: car.carName,
        quantity: car.quantity,
        image: car.image || '',
      }));

      const updateData = {
        name: formData.name,
        description: formData.description,
        pricePerDay: formData.pricePerDay,
        discount: formData.discount,
        cars: cleanPackageCars,
        image: cleanPackageCars.length > 0 ? cleanPackageCars[0].image : '', // Use first car's image as package thumbnail
        features: formData.features,
        popular: formData.popular,
        available: formData.available,
      };

      await updateDoc(pkgRef, updateData);

      toast.dismiss(saveToastId);
      toast.success('Package updated successfully!');

      setTimeout(() => {
        onClose();
      }, 1000);
    } catch (error) {
      console.error('Error updating package:', error);
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-[#1a1a24] border border-gray-200 dark:border-[#2a2a3a] rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-[#2a2a3a] sticky top-0 bg-white dark:bg-[#1a1a24] z-10">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Edit Package</h2>
          <button
            onClick={handleCancel}
            className="p-1.5 rounded-md hover:bg-orange-500/20 cursor-pointer group transition-colors"
            disabled={loading}
          >
            <X size={20} className="text-gray-600 dark:text-gray-400 group-hover:text-orange-500 transition-colors" />
          </button>
        </div>

        {/* Steps Progress */}
        <div className="px-6 pt-6 pb-4">
          <div className="flex gap-4">
            {[1, 2, 3].map((s) => (
              <div key={s} className="flex-1">
                <div className={`h-2 rounded-full ${step >= s ? 'bg-orange-500' : 'bg-gray-200 dark:bg-gray-700'}`}></div>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-2 text-center">
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
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Package Name *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="e.g., Wedding Package"
                  required
                  className="bg-white dark:bg-[#0a0a0f] text-gray-900 dark:text-white border border-gray-300 dark:border-[#2a2a3a] rounded-lg px-4 py-2 focus:ring-2 focus:ring-orange-500 outline-none w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Package description..."
                  rows={4}
                  className="bg-white dark:bg-[#0a0a0f] text-gray-900 dark:text-white border border-gray-300 dark:border-[#2a2a3a] rounded-lg px-4 py-2 focus:ring-2 focus:ring-orange-500 outline-none w-full resize-none"
                />
              </div>

              <div className="relative group">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Price Per Day (PKR) *</label>
                <input
                  type="number"
                  name="pricePerDay"
                  value={formData.pricePerDay}
                  onChange={handleInputChange}
                  placeholder="5000"
                  className="appearance-none [&::-webkit-inner-spin-button]:appearance-none bg-white dark:bg-[#0a0a0f] text-gray-900 dark:text-white border border-gray-300 dark:border-[#2a2a3a] rounded-lg px-4 py-2 pr-10 focus:ring-2 focus:ring-orange-500 outline-none w-full group-hover:border-orange-500/50 transition-colors"
                />
                <div className="absolute right-3 top-[32px] flex flex-col gap-0.5">
                  <button type="button" onClick={() => setFormData(p => ({...p, pricePerDay: p.pricePerDay + 500}))} className="text-gray-400 hover:text-orange-500 cursor-pointer"><ChevronUp className="w-3.5 h-3.5" /></button>
                  <button type="button" onClick={() => setFormData(p => ({...p, pricePerDay: Math.max(0, p.pricePerDay - 500)}))} className="text-gray-400 hover:text-orange-500 cursor-pointer"><ChevronDown className="w-3.5 h-3.5" /></button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="relative group">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Discount (%)</label>
                  <input
                    type="number"
                    name="discount"
                    value={formData.discount}
                    onChange={handleInputChange}
                    min="0"
                    max="100"
                    placeholder="10"
                    className="appearance-none [&::-webkit-inner-spin-button]:appearance-none bg-white dark:bg-[#0a0a0f] text-gray-900 dark:text-white border border-gray-300 dark:border-[#2a2a3a] rounded-lg px-4 py-2 pr-10 focus:ring-2 focus:ring-orange-500 outline-none w-full group-hover:border-orange-500/50 transition-colors"
                  />
                  <div className="absolute right-3 top-[32px] flex flex-col gap-0.5">
                    <button type="button" onClick={() => setFormData(p => ({...p, discount: Math.min(100, p.discount + 1)}))} className="text-gray-400 hover:text-orange-500 cursor-pointer"><ChevronUp className="w-3.5 h-3.5" /></button>
                    <button type="button" onClick={() => setFormData(p => ({...p, discount: Math.max(0, p.discount - 1)}))} className="text-gray-400 hover:text-orange-500 cursor-pointer"><ChevronDown className="w-3.5 h-3.5" /></button>
                  </div>
                </div>
                <div className="flex items-end gap-2">
                  <label className="flex items-center gap-3 cursor-pointer group flex-1">
                    <div className="relative flex items-center justify-center w-5 h-5">
                      <input
                        type="checkbox"
                        name="popular"
                        checked={formData.popular}
                        onChange={handleInputChange}
                        className="appearance-none w-5 h-5 rounded border border-gray-300 dark:border-gray-600 checked:bg-orange-500 checked:border-orange-500 transition-colors cursor-pointer m-0"
                      />
                      {formData.popular && (
                        <Check className="absolute w-3.5 h-3.5 text-black pointer-events-none" strokeWidth={4} />
                      )}
                    </div>
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300 group-hover:text-orange-500 transition-colors">Mark as Popular</span>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Package Cars with Images */}
          {step === 2 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Add Cars to Package</h3>
                
                {/* Add Car Form */}
                <div className="bg-gray-50 dark:bg-[#0a0a0f] border border-gray-200 dark:border-[#2a2a3a] rounded-lg p-4 mb-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    {/* Fleet Car Dropdown */}
                    <div className="relative group">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Select Car from Fleet *</label>
                      <select
                        value={selectedFleetCar}
                        onChange={(e) => {
                          setSelectedFleetCar(e.target.value);
                        }}
                        className="appearance-none bg-white dark:bg-[#0a0a0f] text-gray-900 dark:text-white border border-gray-300 dark:border-[#2a2a3a] rounded-lg px-4 py-2 pr-10 focus:ring-2 focus:ring-orange-500 outline-none w-full cursor-pointer transition-colors group-hover:border-orange-500/50"
                      >
                        <option value="">Choose a car...</option>
                        {cars.map((car) => (
                          <option key={car.carId} value={car.carId}>
                            {car.name} ({car.brand} {car.model})
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-3 top-[38px] w-5 h-5 text-gray-400 group-hover:text-orange-500 pointer-events-none transition-colors" />
                    </div>

                    {/* Quantity Input */}
                    <div className="relative group">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Quantity *</label>
                      <input
                        type="number"
                        value={carQuantityInput}
                        onChange={(e) => setCarQuantityInput(e.target.value)}
                        min="1"
                        placeholder="1"
                        className="appearance-none [&::-webkit-inner-spin-button]:appearance-none bg-white dark:bg-[#0a0a0f] text-gray-900 dark:text-white border border-gray-300 dark:border-[#2a2a3a] rounded-lg px-4 py-2 pr-10 focus:ring-2 focus:ring-orange-500 outline-none w-full group-hover:border-orange-500/50 transition-colors"
                      />
                      <div className="absolute right-3 top-[32px] flex flex-col gap-0.5">
                        <button type="button" onClick={() => setCarQuantityInput(String(parseInt(carQuantityInput || "0") + 1))} className="text-gray-400 hover:text-orange-500 cursor-pointer"><ChevronUp className="w-3.5 h-3.5" /></button>
                        <button type="button" onClick={() => setCarQuantityInput(String(Math.max(1, parseInt(carQuantityInput || "1") - 1)))} className="text-gray-400 hover:text-orange-500 cursor-pointer"><ChevronDown className="w-3.5 h-3.5" /></button>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => addPackageCar()}
                    className="w-full px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors font-medium cursor-pointer"
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
                    <h4 className="font-semibold text-gray-900 dark:text-white">Package Cars ({formData.packageCars.length})</h4>
                    {formData.packageCars.map((car, idx) => (
                      <div key={idx} className="border border-gray-200 dark:border-[#2a2a3a] rounded-lg p-4 bg-gray-50 dark:bg-[#0a0a0f]">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-start">
                          {/* Car Info */}
                          <div className="md:col-span-2">
                            <p className="font-semibold text-gray-900 dark:text-white">{car.carName}</p>
                            {car.carId && (
                              <p className="text-xs text-gray-500 dark:text-gray-500">From fleet (ID: {car.carId})</p>
                            )}
                          </div>

                          {/* Quantity Control */}
                          <div>
                            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Quantity</label>
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => updateCarQuantity(idx, car.quantity - 1)}
                                className="px-2 py-1 bg-white dark:bg-[#1a1a24] border border-gray-200 dark:border-[#2a2a3a] text-gray-900 dark:text-white rounded cursor-pointer hover:bg-orange-500/10 hover:text-orange-500 transition-colors"
                              >
                                −
                              </button>
                              <input
                                type="number"
                                value={car.quantity}
                                onChange={(e) => updateCarQuantity(idx, parseInt(e.target.value) || 1)}
                                className="appearance-none [&::-webkit-inner-spin-button]:appearance-none bg-white dark:bg-[#0a0a0f] text-gray-900 dark:text-white border border-gray-300 dark:border-[#2a2a3a] rounded-lg focus:ring-2 focus:ring-orange-500 outline-none w-12 text-center"
                                min="1"
                              />
                              <button
                                onClick={() => updateCarQuantity(idx, car.quantity + 1)}
                                className="px-2 py-1 bg-white dark:bg-[#1a1a24] border border-gray-200 dark:border-[#2a2a3a] text-gray-900 dark:text-white rounded cursor-pointer hover:bg-orange-500/10 hover:text-orange-500 transition-colors"
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
                                className="w-16 h-16 object-cover rounded border border-gray-200 dark:border-[#2a2a3a]"
                              />
                            )}
                            <button
                              onClick={() => removePackageCar(idx)}
                              className="px-3 py-2 bg-red-500/10 text-red-500 rounded hover:bg-red-500/20 transition-colors cursor-pointer"
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
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Package Features</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={featureInput}
                  onChange={(e) => setFeatureInput(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addFeature();
                    }
                  }}
                  placeholder="Enter feature"
                  className="bg-white dark:bg-[#0a0a0f] text-gray-900 dark:text-white border border-gray-300 dark:border-[#2a2a3a] rounded-lg px-4 py-2 focus:ring-2 focus:ring-orange-500 outline-none flex-1"
                />
                <button
                  onClick={addFeature}
                  className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors flex items-center gap-2 cursor-pointer"
                >
                  <Plus size={16} />
                  Add
                </button>
              </div>

              {/* Selected Features */}
              <div className="flex flex-wrap gap-2 mb-4">
                {formData.features.map((feature) => (
                  <div
                    key={feature}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium bg-orange-100 dark:bg-orange-500/20 text-orange-700 dark:text-orange-400 border border-orange-200 dark:border-orange-500/20"
                  >
                    {feature}
                    <button onClick={() => removeFeature(feature)} className="cursor-pointer hover:text-red-500 transition-colors">
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>

              {/* Suggested Features */}
              <div>
                <p className="text-xs text-gray-600 mb-2">Suggested features:</p>
                <div className="flex flex-wrap gap-2">
                  {SUGGESTED_FEATURES.map((feature) => (
                    <button
                      key={feature}
                      onClick={() => toggleFeature(feature)}
                      className={
                        formData.features.includes(feature)
                          ? "px-3 py-1 rounded-full text-sm font-medium bg-orange-50 dark:bg-orange-500/10 text-orange-600 dark:text-orange-500 border border-orange-500 cursor-default opacity-50"
                          : "px-3 py-1 rounded-full text-sm font-medium bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:border-orange-500 hover:text-orange-500 cursor-pointer transition-colors"
                      }
                    >
                      {feature}
                    </button>
                  ))}
                </div>
              </div>

              <label className="flex items-center gap-3 cursor-pointer group mt-4 w-max">
                <div className="relative flex items-center justify-center w-5 h-5">
                  <input
                    type="checkbox"
                    name="available"
                    checked={formData.available}
                    onChange={handleInputChange}
                    className="appearance-none w-5 h-5 rounded border border-gray-300 dark:border-gray-600 checked:bg-orange-500 checked:border-orange-500 transition-colors cursor-pointer m-0"
                  />
                  {formData.available && (
                    <Check className="absolute w-3.5 h-3.5 text-black pointer-events-none" strokeWidth={4} />
                  )}
                </div>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300 group-hover:text-orange-500 transition-colors">Available for booking</span>
              </label>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 dark:border-[#2a2a3a] p-6 flex justify-between gap-3 bg-gray-50 dark:bg-[#0a0a0f] rounded-b-xl">
          <button
            onClick={() => setStep(Math.max(1, step - 1))}
            disabled={step === 1 || loading}
            className="px-6 py-2 rounded-lg font-medium shadow-sm disabled:opacity-50 disabled:cursor-not-allowed bg-gray-100 text-gray-700 dark:bg-transparent dark:text-gray-300 dark:border dark:border-[#2a2a3a] cursor-pointer hover:border-orange-500 hover:text-orange-500 hover:bg-orange-500/10 transition-colors"
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
              className="px-6 py-2 bg-orange-500 text-white rounded-lg font-medium hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              Next
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="px-6 py-2 bg-orange-500 text-white rounded-lg font-medium hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {loading ? 'Updating...' : 'Update Package'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
