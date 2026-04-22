import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { User, Product } from '../types';
import { MapPin, ShoppingBag, Star, Phone, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';

// Fix for default marker icon
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

interface SupplierMapProps {
  suppliers: any[];
  onSupplierClick?: (supplierId: number) => void;
  center?: [number, number];
  zoom?: number;
}

export default function SupplierMap({ suppliers, onSupplierClick, center = [14.5995, 120.9842], zoom = 13 }: SupplierMapProps) {
  return (
    <div className="h-[500px] w-full rounded-3xl overflow-hidden border border-emerald-100 shadow-xl z-0">
      <MapContainer 
        center={center} 
        zoom={zoom} 
        scrollWheelZoom={true}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {suppliers.map((supplier) => (
          <Marker 
            key={supplier.id} 
            position={[supplier.latitude, supplier.longitude]}
          >
            <Popup className="custom-popup">
              <div className="p-2 min-w-[200px]">
                <h3 className="font-bold text-emerald-900 text-lg mb-1">{supplier.name}</h3>
                <div className="flex items-center gap-1 text-orange-400 mb-2">
                  <Star size={14} fill="currentColor" />
                  <span className="text-xs font-bold text-emerald-700">
                    {supplier.average_rating ? Number(supplier.average_rating).toFixed(1) : 'New'}
                  </span>
                </div>
                
                <div className="space-y-2 mb-4">
                  <div className="flex items-start gap-2 text-emerald-600">
                    <MapPin size={14} className="mt-0.5 shrink-0" />
                    <p className="text-xs leading-tight">
                      {supplier.purok && `Purok ${supplier.purok}, `}
                      {supplier.address}
                    </p>
                  </div>
                  {supplier.phone && (
                    <div className="flex items-center gap-2 text-emerald-600">
                      <Phone size={14} className="shrink-0" />
                      <p className="text-xs">{supplier.phone}</p>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-emerald-600">
                    <ShoppingBag size={14} className="shrink-0" />
                    <p className="text-xs font-bold">{supplier.product_count || 0} Products Available</p>
                  </div>
                </div>

                <button 
                  onClick={() => onSupplierClick?.(supplier.id)}
                  className="w-full bg-emerald-600 text-white py-2 rounded-xl text-xs font-bold hover:bg-emerald-700 transition-all flex items-center justify-center gap-2"
                >
                  View Products <ExternalLink size={12} />
                </button>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
