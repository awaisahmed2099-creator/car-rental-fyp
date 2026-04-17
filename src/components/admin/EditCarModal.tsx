'use client';

import React, { useState } from 'react';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { uploadToCloudinary } from '@/lib/cloudinary';
import { COLLECTIONS } from '@/lib/collections';
import { Car } from '@/types';
import toast from 'react-hot-toast';
import { X, Upload, Plus } from 'lucide-react';

const SUGGESTED_FEATURES = ['AC', 'Music System', 'GPS', 'Bluetooth', 'USB Charging', 'Leather Seats', 'Sunroof', 'Backup Camera'];

interface FormData {
  name: string;
  brand: string;
  model: string;
  year: number;
  category: string;
  seats: number;
  transmission: string;
  fuel: string;
  pricePerDay: number;
  available: boolean;
  description: string;
  features: string[];
  images: File[];
  existingImages: string[];
}

interface EditCarModalProps {
  car: Car;
  onClose: () => void;
}

export default function EditCarModal({ car, onClose }: EditCarModalProps) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    name: car.name,
    brand: car.brand,
    model: car.model,
    year: car.year,
    category: car.category,
    seats: car.seats,
    transmission: car.transmission,
    fuel: car.fuel,
    pricePerDay: car.price,
    available: car.available,
    description: car.description,
    features: car.features,
    images: [],
    existingImages: car.images,
  });

  const [dragActive, setDragActive] = useState(false);
  const [featureInput, setFeatureInput] = useState('');
  const [newImagePreviews, setNewImagePreviews] = useState<File[]>([]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'number' ? Number(value) : type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleImageDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = Array.from(e.dataTransfer.files).filter((file) => file.type.startsWith('image/'));
    if (files.length + formData.existingImages.length + formData.images.length > 5) {
      toast.error('Maximum 5 images allowed');
      return;
    }

    addImages(files);
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      if (files.length + formData.existingImages.length + formData.images.length > 5) {
        toast.error('Maximum 5 images allowed');
        return;
      }
      addImages(files);
    }
  };

  const addImages = (files: File[]) => {
    const totalImages = formData.existingImages.length + formData.images.length;
    const remainingSlots = 5 - totalImages;
    const newImages = files.slice(0, remainingSlots);

    setFormData((prev) => ({
      ...prev,
      images: [...prev.images, ...newImages],
    }));
    setNewImagePreviews((prev) => [...prev, ...newImages]);
  };

  const removeExistingImage = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      existingImages: prev.existingImages.filter((_, i) => i !== index),
    }));
  };

  const removeNewImage = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
    setNewImagePreviews((prev) => prev.filter((_, i) => i !== index));
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

  const toggleFeature = (feature: string) => {
    setFormData((prev) => ({
      ...prev,
      features: prev.features.includes(feature)
        ? prev.features.filter((f) => f !== feature)
        : [...prev.features, feature],
    }));
  };

  const removeFeature = (feature: string) => {
    setFormData((prev) => ({
      ...prev,
      features: prev.features.filter((f) => f !== feature),
    }));
  };

  const validateStep = (stepNum: number) => {
    if (stepNum === 1) {
      if (!formData.name || !formData.brand || !formData.category || !formData.pricePerDay) {
        toast.error('Please fill in all required fields');
        return false;
      }
    } else if (stepNum === 2) {
      if (formData.existingImages.length + formData.images.length === 0) {
        toast.error('Please keep or add at least one image');
        return false;
      }
    } else if (stepNum === 3) {
      if (!formData.description) {
        toast.error('Please enter a description');
        return false;
      }
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateStep(3)) return;

    try {
      setLoading(true);

      // Validate file sizes (max 10MB each for Cloudinary)
      for (const file of formData.images) {
        if (file.size > 10 * 1024 * 1024) {
          toast.error(`Image ${file.name} is too large (max 10MB)`);
          setLoading(false);
          return;
        }
      }

      const uploadToastId = toast.loading(`Uploading ${formData.images.length} new image(s)...`);
      console.log(`[CLOUDINARY] Starting image upload for ${formData.images.length} new images`);

      // Upload new images if any
      const updatedImages = [...formData.existingImages];
      let currentToastId = uploadToastId;
      
      if (formData.images.length > 0) {
        const carId = `car_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        for (let i = 0; i < formData.images.length; i++) {
          const file = formData.images[i];
          const imageNum = i + 1;
          console.log(`[CLOUDINARY] Uploading image ${imageNum}/${formData.images.length}: ${file.name} (${(file.size / 1024 / 1024).toFixed(2)}MB)`);
          
          try {
            // Upload with timeout protection (30 seconds)
            const uploadPromise = uploadToCloudinary(file, `driveease/cars/${carId}`);
            const timeoutPromise = new Promise<string>((_, reject) => 
              setTimeout(() => reject(new Error('Upload timeout - check your internet connection')), 30000)
            );

            const url = await Promise.race([uploadPromise, timeoutPromise]);
            console.log(`[CLOUDINARY] Got image ${imageNum} URL: ${url.substring(0, 60)}...`);
            updatedImages.push(url);
          } catch (uploadError) {
            console.error(`[CLOUDINARY-ERROR] Failed to upload image ${imageNum}:`, uploadError);
            toast.dismiss(currentToastId);
            const errorMsg = uploadError instanceof Error ? uploadError.message : String(uploadError);
            toast.error(`Failed to upload image ${imageNum}: ${errorMsg}`);
            setLoading(false);
            return;
          }
        }
      }

      console.log(`[CLOUDINARY] All ${formData.images.length} new images uploaded successfully`);
      toast.dismiss(currentToastId);
      const saveToastId = toast.loading('Updating car in database...');
      console.log(`[DATABASE] Starting database update...`);

      // Update car document with timeout
      try {
        console.log(`[DATABASE] Updating Firestore document with ${updatedImages.length} total images`);
        const carRef = doc(db, COLLECTIONS.CARS, car.carId);
        
        const updatePromise: Promise<void> = updateDoc(carRef, {
          name: formData.name,
          brand: formData.brand,
          model: formData.model,
          year: formData.year,
          category: formData.category,
          seats: formData.seats,
          transmission: formData.transmission,
          fuel: formData.fuel,
          price: formData.pricePerDay,
          available: formData.available,
          description: formData.description,
          features: formData.features,
          images: updatedImages,
        });

        // Add 15 second timeout for database update
        const updateTimeoutPromise = new Promise<void>((_, reject) => 
          setTimeout(() => reject(new Error('Database update timeout - Firestore may be unavailable')), 15000)
        );

        await Promise.race([updatePromise, updateTimeoutPromise]);
        
        console.log(`[DATABASE-SUCCESS] Car updated successfully`);
        toast.dismiss(saveToastId);
        toast.success('Car updated successfully!');
        
        // Small delay to let user see success message
        setTimeout(() => {
          onClose();
        }, 1000);
      } catch (dbError) {
        console.error(`[DATABASE-ERROR] Database error:`, dbError);
        toast.dismiss(saveToastId);
        const errorMsg = dbError instanceof Error ? dbError.message : String(dbError);
        toast.error(`Database error: ${errorMsg}`);
        setLoading(false);
        return;
      }
    } catch (error) {
      console.error('[ERROR] Unexpected error updating car:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      toast.error(`Error: ${errorMessage}`);
      setLoading(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200 sticky top-0 bg-white">
          <h2 className="text-2xl font-bold text-slate-900">Edit Car</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <X size={24} />
          </button>
        </div>

        {/* Steps Progress */}
        <div className="px-6 pt-6 pb-4">
          <div className="flex gap-4">
            {[1, 2, 3].map((s) => (
              <div key={s} className="flex-1">
                <div className={`h-2 rounded-full ${step >= s ? 'bg-orange-500' : 'bg-gray-200'}`}></div>
                <p className="text-xs text-gray-600 mt-2 text-center">
                  {s === 1 ? 'Basic Info' : s === 2 ? 'Images' : 'Details'}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="px-6 pb-6">
          {/* Step 1: Basic Info */}
          {step === 1 && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Car Name *</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Brand *</label>
                  <input
                    type="text"
                    name="brand"
                    value={formData.brand}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Model</label>
                  <input
                    type="text"
                    name="model"
                    value={formData.model}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Year</label>
                  <input
                    type="number"
                    name="year"
                    value={formData.year}
                    onChange={handleInputChange}
                    min="2000"
                    max="2026"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Category *</label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  >
                    <option value="sedan">Sedan</option>
                    <option value="suv">SUV</option>
                    <option value="luxury">Luxury</option>
                    <option value="van">Van</option>
                    <option value="coaster">Coaster</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Seats</label>
                  <input
                    type="number"
                    name="seats"
                    value={formData.seats}
                    onChange={handleInputChange}
                    min="1"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Transmission</label>
                  <select
                    name="transmission"
                    value={formData.transmission}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  >
                    <option value="automatic">Automatic</option>
                    <option value="manual">Manual</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Fuel</label>
                  <select
                    name="fuel"
                    value={formData.fuel}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  >
                    <option value="petrol">Petrol</option>
                    <option value="diesel">Diesel</option>
                    <option value="hybrid">Hybrid</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Price Per Day (PKR) *</label>
                  <input
                    type="number"
                    name="pricePerDay"
                    value={formData.pricePerDay}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  name="available"
                  checked={formData.available}
                  onChange={handleInputChange}
                  className="w-5 h-5 text-orange-500 rounded"
                />
                <label className="text-sm font-medium text-gray-700">Available for rental</label>
              </div>
            </div>
          )}

          {/* Step 2: Images */}
          {step === 2 && (
            <div className="space-y-4">
              {/* Existing Images */}
              {formData.existingImages.length > 0 && (
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-3">Current Images ({formData.existingImages.length})</p>
                  <div className="grid grid-cols-5 gap-3 mb-4">
                    {formData.existingImages.map((image, index) => (
                      <div key={index} className="relative group">
                        <img src={image} alt={`Image ${index}`} className="w-full h-20 object-cover rounded-lg" />
                        <button
                          onClick={() => removeExistingImage(index)}
                          className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-lg"
                        >
                          <X size={20} className="text-white" />
                        </button>
                        {index === 0 && (
                          <div className="absolute top-1 left-1 bg-orange-500 text-white text-xs px-2 py-1 rounded">
                            Primary
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Upload New Images */}
              {formData.existingImages.length + formData.images.length < 5 && (
                <div
                  onDrag={handleImageDrop}
                  onDragStart={() => setDragActive(true)}
                  onDragLeave={() => setDragActive(false)}
                  onDragOver={() => setDragActive(true)}
                  onDrop={handleImageDrop}
                  className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                    dragActive ? 'border-orange-500 bg-orange-50' : 'border-gray-300 bg-gray-50'
                  }`}
                >
                  <Upload className="w-10 h-10 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-700 font-medium mb-1">Add more images</p>
                  <p className="text-gray-500 text-sm mb-3">or</p>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleImageSelect}
                    id="image-input"
                    className="hidden"
                  />
                  <label
                    htmlFor="image-input"
                    className="inline-block px-4 py-2 bg-orange-500 text-white rounded-lg font-medium hover:bg-orange-600 cursor-pointer"
                  >
                    Click to Upload
                  </label>
                  <p className="text-gray-500 text-xs mt-3">
                    {5 - formData.existingImages.length - formData.images.length} slot(s) remaining
                  </p>
                </div>
              )}

              {/* New Image Previews */}
              {newImagePreviews.length > 0 && (
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-3">New Images</p>
                  <div className="grid grid-cols-5 gap-3">
                    {newImagePreviews.map((file, index) => (
                      <div key={index} className="relative group">
                        <img 
                          src={URL.createObjectURL(file)} 
                          alt={`New ${index}`} 
                          className="w-full h-20 object-cover rounded-lg" 
                        />
                        <button
                          onClick={() => removeNewImage(index)}
                          className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-lg"
                        >
                          <X size={20} className="text-white" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Step 3: Details */}
          {step === 3 && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description *</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Features</label>
                <div className="flex gap-2 mb-3">
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
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                  <button
                    onClick={addFeature}
                    className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors flex items-center gap-2"
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
                      className="bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-sm font-medium flex items-center gap-2"
                    >
                      {feature}
                      <button
                        onClick={() => removeFeature(feature)}
                        className="hover:text-orange-900"
                      >
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
                        className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                          formData.features.includes(feature)
                            ? 'bg-orange-500 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {feature}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-between gap-3 p-6 border-t border-gray-200 bg-gray-50">
          <button
            onClick={() => setStep(Math.max(1, step - 1))}
            disabled={step === 1 || loading}
            className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-all"
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
              className="px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-all"
            >
              Next
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-all flex items-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Processing...
                </>
              ) : (
                'Update Car'
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
