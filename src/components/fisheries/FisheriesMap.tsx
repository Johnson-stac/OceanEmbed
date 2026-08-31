import React from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { OceanLocation } from '../../types';

// Fix for default marker icons in React Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface FisheriesMapProps {
  selectedLocation: OceanLocation | null;
  onLocationSelect: (location: OceanLocation) => void;
}

const MapEvents: React.FC<{ onLocationSelect: (loc: OceanLocation) => void }> = ({ onLocationSelect }) => {
  useMapEvents({
    click(e) {
      onLocationSelect({
        lat: Number(e.latlng.lat.toFixed(4)),
        lng: Number(e.latlng.lng.toFixed(4))
      });
    }
  });
  return null;
};

export const FisheriesMap: React.FC<FisheriesMapProps> = ({ selectedLocation, onLocationSelect }) => {
  return (
    <div className="h-full w-full rounded-xl overflow-hidden border border-slate-300 shadow-sm relative z-0">
      <MapContainer 
        center={[15.0, 70.0]} 
        zoom={4} 
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={false}
        maxBounds={[[-10, 30], [40, 110]]}
        minZoom={3}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://server.arcgisonline.com/ArcGIS/rest/services/Ocean/World_Ocean_Base/MapServer/tile/{z}/{y}/{x}"
        />
        <MapEvents onLocationSelect={onLocationSelect} />
        {selectedLocation && (
          <Marker position={[selectedLocation.lat, selectedLocation.lng]}>
            <Popup>
              Lat: {selectedLocation.lat}<br/>
              Lng: {selectedLocation.lng}
            </Popup>
          </Marker>
        )}
      </MapContainer>
    </div>
  );
};
