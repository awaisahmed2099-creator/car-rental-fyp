export interface Car {
  carId: string;
  name: string;
  brand: string;
  model: string;
  year: number;
  price: number; // per day in PKR
  images: string[];
  category: 'sedan' | 'suv' | 'luxury' | 'van' | 'coaster';
  seats: number;
  transmission: 'automatic' | 'manual';
  fuel: 'petrol' | 'diesel' | 'hybrid';
  features: string[];
  available: boolean;
  description: string;
  createdAt: Date;
}

export interface PackageCar {
  carId?: string; // Optional - only if selected from fleet
  carName: string; // Display name (e.g., "Prado", "Civic")
  quantity: number; // How many of this type (e.g., 8)
  image: string; // Image URL for this car type
}

export interface Package {
  packageId: string;
  name: string;
  description: string;
  cars: PackageCar[]; // Array of car types with quantities
  duration: string;
  pricePerDay: number;
  discount: number; // percentage
  features: string[];
  image: string; // Package thumbnail image (from first car)
  popular: boolean;
  available: boolean;
  createdAt: Date;
}

export interface Booking {
  bookingId: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  customerId?: string; // optional, if logged in
  carId: string;
  carName: string;
  carImage: string;
  packageId?: string; // optional
  packageName?: string; // optional
  startDate: Date;
  endDate: Date;
  totalDays: number;
  totalAmount: number;
  paymentMethod: 'cash' | 'jazzcash';
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  txnRefNo?: string; // JazzCash transaction ID
  bookingStatus: 'confirmed' | 'active' | 'completed' | 'cancelled';
  pickupLocation: string;
  dropoffLocation: string;
  notes?: string;
  createdAt: Date;
}

export interface AdminUser {
  uid: string;
  email: string;
  fullName: string;
  role: 'admin';
  createdAt: Date;
}
