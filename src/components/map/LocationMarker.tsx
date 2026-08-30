import React from 'react';
import { Marker, Popup, CircleMarker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
import type { OceanLocation } from '../../types';

// Fix for default marker icon missing in react-leaflet
let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

interface LocationMarkerProps {
  selectedLocation: OceanLocation | null;
  onLocationSelect: (location: OceanLocation) => void;
  setHoverLocation: (location: OceanLocation | null) => void;
}

export const LocationMarker: React.FC<LocationMarkerProps> = ({ selectedLocation, onLocationSelect, setHoverLocation }) => {
  useMapEvents({
    click(e) {
      // Create a new location on click
      const newLocation: OceanLocation = {
        lat: e.latlng.lat,
        lng: e.latlng.lng,
        name: `Selected: ${e.latlng.lat.toFixed(2)}°N, ${e.latlng.lng.toFixed(2)}°E`,
        date: new Date().toISOString()
      };
      onLocationSelect(newLocation);
    },
    mousemove(e) {
      setHoverLocation({ lat: e.latlng.lat, lng: e.latlng.lng });
    },
    mouseout() {
      setHoverLocation(null);
    }
  });

  return selectedLocation ? (
    <Marker position={[selectedLocation.lat, selectedLocation.lng]}>
      <Popup>
        <div className="text-sm font-medium">{selectedLocation.name || `Lat: ${selectedLocation.lat.toFixed(2)}, Lng: ${selectedLocation.lng.toFixed(2)}`}</div>
      </Popup>
    </Marker>
  ) : null;
};

// Also define the sample points here or in OceanMap
export const SamplePoints: React.FC<{ onSelect: (location: OceanLocation) => void }> = ({ onSelect }) => {
  const points: OceanLocation[] = [
    { lat: 15.5, lng: 65.2, name: 'Arabian Sea Buoy' },
    { lat: 10.2, lng: 75.5, name: 'Central NIO Sensor' },
    { lat: 14.8, lng: 88.5, name: 'Bay of Bengal Array' }
  ];

  return (
    <>
      {points.map((p, i) => (
        <CircleMarker 
          key={i}
          center={[p.lat, p.lng]} 
          radius={6} 
          pathOptions={{ color: '#0284c7', fillColor: '#38bdf8', fillOpacity: 0.8, weight: 2 }}
          eventHandlers={{
            click: () => onSelect({...p, date: new Date().toISOString()})
          }}
        >
          <Popup>
            <div className="text-sm font-semibold">{p.name}</div>
            <div className="text-xs text-slate-600">Lat: {p.lat.toFixed(2)}, Lng: {p.lng.toFixed(2)}</div>
            <div className="text-[10px] text-slate-400 mt-1">(Click to view subsurface profile)</div>
          </Popup>
        </CircleMarker>
      ))}
    </>
  );
};
