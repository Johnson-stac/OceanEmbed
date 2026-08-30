import React from 'react';
import { Rectangle } from 'react-leaflet';

export const DomainBoundary: React.FC = () => {
  // Approximate project bounding box: Lat: 5°N to 30°N, Lng: 60°E to 100°E
  const bounds: [[number, number], [number, number]] = [
    [5, 60],
    [30, 100]
  ];

  return (
    <Rectangle 
      bounds={bounds} 
      pathOptions={{
        color: '#0ea5e9',
        weight: 1,
        fillColor: '#0ea5e9',
        fillOpacity: 0.05,
        dashArray: '5, 5'
      }} 
    />
  );
};
