import React, { useEffect, useRef, useState } from 'react';
import {
  Cartesian3,
  Cartesian2,
  Cartographic,
  Color,
  defined,
  Entity,
  HorizontalOrigin,
  ImageryLayer,
  LabelStyle,
  Math as CesiumMath,
  OpenStreetMapImageryProvider,
  ScreenSpaceEventHandler,
  ScreenSpaceEventType,
  VerticalOrigin,
  Viewer,
} from 'cesium';
import 'cesium/Build/Cesium/Widgets/widgets.css';
import { Crosshair, RefreshCw } from 'lucide-react';
import type { OceanLocation } from '../../types';
import { Card } from '../Card';
import { MapLegend } from './MapLegend';

interface OceanMapProps {
  selectedLocation: OceanLocation | null;
  onLocationSelect: (location: OceanLocation) => void;
}

const STUDY_REGION = { west: 60, south: 5, east: 100, north: 30 };

const samplePoints: OceanLocation[] = [
  { lat: 15.5, lng: 65.2, name: 'Arabian Sea Buoy' },
  { lat: 10.2, lng: 75.5, name: 'Central NIO Sensor' },
  { lat: 14.8, lng: 88.5, name: 'Bay of Bengal Array' },
];

const formatCoordinate = (value: number, positive: string, negative: string) =>
  `${Math.abs(value).toFixed(3)}°${value >= 0 ? positive : negative}`;

export const OceanMap: React.FC<OceanMapProps> = ({ selectedLocation, onLocationSelect }) => {
  const [hoverLocation, setHoverLocation] = useState<OceanLocation | null>(null);
  const globeElement = useRef<HTMLDivElement>(null);
  const viewerRef = useRef<Viewer | null>(null);
  const selectedEntityRef = useRef<Entity | null>(null);
  const onLocationSelectRef = useRef(onLocationSelect);

  useEffect(() => {
    onLocationSelectRef.current = onLocationSelect;
  }, [onLocationSelect]);

  const flyToStudyRegion = () => {
    viewerRef.current?.camera.flyTo({
      destination: Cartesian3.fromDegrees(80, 17.5, 5_700_000),
      duration: 0.9,
    });
  };

  useEffect(() => {
    if (!globeElement.current) return;

    const viewer = new Viewer(globeElement.current, {
      animation: false,
      baseLayerPicker: false,
      fullscreenButton: false,
      geocoder: false,
      homeButton: false,
      infoBox: false,
      navigationHelpButton: false,
      sceneModePicker: false,
      selectionIndicator: false,
      timeline: false,
      baseLayer: new ImageryLayer(new OpenStreetMapImageryProvider({ url: 'https://tile.openstreetmap.org/' })),
    });

    viewerRef.current = viewer;
    viewer.scene.globe.enableLighting = true;
    viewer.scene.backgroundColor = Color.fromCssColorString('#06172d');
    if (viewer.scene.skyAtmosphere) {
      viewer.scene.skyAtmosphere.hueShift = -0.03;
      viewer.scene.skyAtmosphere.saturationShift = 0.15;
    }

    viewer.entities.add({
      id: 'study-region',
      polygon: {
        hierarchy: Cartesian3.fromDegreesArray([
          STUDY_REGION.west, STUDY_REGION.south,
          STUDY_REGION.east, STUDY_REGION.south,
          STUDY_REGION.east, STUDY_REGION.north,
          STUDY_REGION.west, STUDY_REGION.north,
        ]),
        material: Color.fromCssColorString('#38bdf8').withAlpha(0.08),
        outline: true,
        outlineColor: Color.fromCssColorString('#67e8f9').withAlpha(0.95),
        height: 40,
      },
    });

    samplePoints.forEach((point, index) => {
      viewer.entities.add({
        id: `sample-${index}`,
        position: Cartesian3.fromDegrees(point.lng, point.lat, 1_200),
        point: {
          pixelSize: 10,
          color: Color.fromCssColorString('#67e8f9'),
          outlineColor: Color.fromCssColorString('#082f49'),
          outlineWidth: 3,
        },
        label: {
          text: point.name ?? '',
          font: '600 12px Inter, system-ui, sans-serif',
          fillColor: Color.WHITE,
          outlineColor: Color.fromCssColorString('#082f49'),
          outlineWidth: 4,
          style: LabelStyle.FILL_AND_OUTLINE,
          horizontalOrigin: HorizontalOrigin.LEFT,
          verticalOrigin: VerticalOrigin.CENTER,
          pixelOffset: new Cartesian3(12, 0, 0),
          distanceDisplayCondition: undefined,
        },
        properties: { oceanLocation: point },
      });
    });

    const locationFromScreen = (position: Cartesian2) => {
      const ray = viewer.camera.getPickRay(position);
      if (!ray) return null;
      const cartesian = viewer.scene.globe.pick(ray, viewer.scene);
      if (!cartesian) return null;
      const cartographic = Cartographic.fromCartesian(cartesian);
      return {
        lat: CesiumMath.toDegrees(cartographic.latitude),
        lng: CesiumMath.toDegrees(cartographic.longitude),
      };
    };

    const handler = new ScreenSpaceEventHandler(viewer.scene.canvas);
    handler.setInputAction((movement: ScreenSpaceEventHandler.PositionedEvent) => {
      const picked = viewer.scene.pick(movement.position);
      const sample = defined(picked) && picked.id instanceof Entity
        ? picked.id.properties?.oceanLocation?.getValue()
        : undefined;
      const coordinates = sample ?? locationFromScreen(movement.position);
      if (!coordinates) return;

      onLocationSelectRef.current({
        ...coordinates,
        name: sample?.name ?? `Selected: ${formatCoordinate(coordinates.lat, 'N', 'S')}, ${formatCoordinate(coordinates.lng, 'E', 'W')}`,
        date: new Date().toISOString(),
      });
    }, ScreenSpaceEventType.LEFT_CLICK);

    handler.setInputAction((movement: ScreenSpaceEventHandler.MotionEvent) => {
      setHoverLocation(locationFromScreen(movement.endPosition));
    }, ScreenSpaceEventType.MOUSE_MOVE);

    flyToStudyRegion();

    return () => {
      handler.destroy();
      viewer.destroy();
      viewerRef.current = null;
    };
  }, []);

  useEffect(() => {
    const viewer = viewerRef.current;
    if (!viewer) return;

    if (selectedEntityRef.current) {
      viewer.entities.remove(selectedEntityRef.current);
      selectedEntityRef.current = null;
    }

    if (!selectedLocation) return;
    selectedEntityRef.current = viewer.entities.add({
      id: 'selected-location',
      position: Cartesian3.fromDegrees(selectedLocation.lng, selectedLocation.lat, 1_800),
      point: {
        pixelSize: 17,
        color: Color.fromCssColorString('#fbbf24'),
        outlineColor: Color.WHITE,
        outlineWidth: 3,
      },
      label: {
        text: `${formatCoordinate(selectedLocation.lat, 'N', 'S')}  ·  ${formatCoordinate(selectedLocation.lng, 'E', 'W')}`,
        font: '700 13px Inter, system-ui, sans-serif',
        fillColor: Color.WHITE,
        outlineColor: Color.fromCssColorString('#451a03'),
        outlineWidth: 4,
        style: LabelStyle.FILL_AND_OUTLINE,
        horizontalOrigin: HorizontalOrigin.LEFT,
        verticalOrigin: VerticalOrigin.CENTER,
        pixelOffset: new Cartesian3(16, 0, 0),
      },
    });
  }, [selectedLocation]);

  return (
    <Card noPadding className="h-full w-full relative overflow-hidden group border-slate-300 shadow-sm">
      <div ref={globeElement} className="cesium-globe h-full w-full cursor-crosshair" aria-label="Interactive 3D globe of the North Indian Ocean study region" />

      <div className="absolute top-4 left-4 z-10 max-w-[240px] bg-slate-950/80 backdrop-blur-md p-3 rounded-lg shadow-xl border border-cyan-200/20 pointer-events-none">
        <div className="flex items-center gap-2 text-cyan-200">
          <Crosshair className="h-3.5 w-3.5" />
          <h3 className="font-semibold text-sm">3D Ocean Globe</h3>
        </div>
        <p className="text-[11px] text-slate-300 mt-1">Click any point to capture coordinates.</p>
        <div className="mt-2 text-[10px] font-mono text-cyan-50 bg-slate-950/50 p-1.5 rounded border border-white/10 min-h-[26px]">
          {hoverLocation ? `${formatCoordinate(hoverLocation.lat, 'N', 'S')}  |  ${formatCoordinate(hoverLocation.lng, 'E', 'W')}` : 'Move across the globe'}
        </div>
      </div>

      <div className="absolute top-4 right-4 z-10">
        <button
          onClick={flyToStudyRegion}
          className="bg-slate-950/80 backdrop-blur-md hover:bg-slate-900 text-cyan-100 p-2 rounded-lg shadow-xl border border-cyan-200/20 transition-colors"
          title="Return to the study region"
          aria-label="Return to the study region"
        >
          <RefreshCw className="h-4 w-4" />
        </button>
      </div>
      
      <MapLegend />
    </Card>
  );
};
