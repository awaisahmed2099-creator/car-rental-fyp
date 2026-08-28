'use client';

import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { LocationData } from '@/types';

// Fix standard Leaflet marker icons in React
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface LeafletMapProps {
  onSelect: (location: LocationData) => void;
  onClose: () => void;
}

function LocationMarker({ position, setPosition, setAddress }: { position: L.LatLng | null, setPosition: (p: L.LatLng) => void, setAddress: (a: string) => void }) {
  const map = useMapEvents({
    click(e) {
      setPosition(e.latlng);
      map.flyTo(e.latlng, map.getZoom());
    },
  });

  useEffect(() => {
    if (position) {
      // Reverse Geocoding
      fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${position.lat}&lon=${position.lng}`)
        .then((res) => res.json())
        .then((data) => {
          if (data && data.display_name) {
            setAddress(data.display_name);
          }
        })
        .catch((err) => console.error("Error reverse geocoding:", err));
    }
  }, [position, setAddress]);

  return position === null ? null : (
    <Marker position={position}></Marker>
  );
}

function SearchField({ setPosition, setAddress }: { setPosition: (p: L.LatLng) => void, setAddress: (a: string) => void }) {
  const map = useMap();
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);

  const executeSearch = async () => {
    if (!query.trim()) return;
    setLoading(true);
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}`);
      const data = await res.json();
      if (data && data.length > 0) {
        const item = data[0];
        const lat = parseFloat(item.lat);
        const lon = parseFloat(item.lon);
        const newPos = L.latLng(lat, lon);
        setPosition(newPos);
        setAddress(item.display_name);
        map.setView([lat, lon], 14);
      }
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[1000] w-[90%] max-w-md">
      <div className="flex bg-white dark:bg-[#1a1a24] rounded-xl shadow-lg border border-gray-200 dark:border-[#2a2a3a] overflow-hidden">
        <input 
          type="text" 
          value={query} 
          onChange={e => setQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              executeSearch();
            }
          }}
          placeholder="Search location..." 
          className="flex-1 bg-transparent px-4 py-3 text-sm text-gray-900 dark:text-white focus:outline-none placeholder:text-gray-500"
        />
        <button 
          type="button" 
          onClick={executeSearch}
          disabled={loading} 
          className="px-4 bg-orange-500 text-white text-sm font-medium hover:bg-orange-600 transition-colors disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
        >
          {loading ? '...' : 'Search'}
        </button>
      </div>
    </div>
  );
}

export default function LeafletMap({ onSelect, onClose }: LeafletMapProps) {
  const [position, setPosition] = useState<L.LatLng | null>(null);
  const [address, setAddress] = useState<string>('Click on the map to select a location');

  const handleConfirm = () => {
    if (position && address && address !== 'Click on the map to select a location') {
      onSelect({
        address,
        lat: position.lat,
        lng: position.lng
      });
    }
  };

  return (
    <div className="relative w-full h-full flex flex-col">
      <MapContainer 
        center={[33.6844, 73.0479]} // Default to Islamabad
        zoom={12} 
        style={{ width: '100%', height: '100%', zIndex: 10 }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <SearchField setPosition={setPosition} setAddress={setAddress} />
        <LocationMarker position={position} setPosition={setPosition} setAddress={setAddress} />
      </MapContainer>

      {/* Info Panel Overlay */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-[20] w-[90%] max-w-lg bg-white/95 dark:bg-gray-900/95 backdrop-blur-md p-4 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 flex flex-col gap-3">
        <div>
          <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Selected Location</p>
          <p className="text-sm text-gray-900 dark:text-white font-medium line-clamp-2">{address}</p>
        </div>
        
        <div className="flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-4 py-2 bg-transparent border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium hover:bg-red-500 hover:text-white hover:border-red-500 dark:hover:border-red-500 cursor-pointer transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={!position || address === 'Click on the map to select a location'}
            className="flex-1 px-4 py-2 bg-orange-500 text-white rounded-lg text-sm font-medium hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition-colors"
          >
            Confirm Location
          </button>
        </div>
      </div>
    </div>
  );
}
