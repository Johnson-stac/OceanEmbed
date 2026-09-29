import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Polyline, CircleMarker, Tooltip } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { Header } from '../components/Header';
import {
  Navigation,
  Compass,
  Box,
  ShieldCheck,
  Waves,
  ArrowRight,
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
} from 'recharts';

interface PortLocation {
  id: string;
  name: string;
  lat: number;
  lng: number;
  country: string;
}

const PORTS: PortLocation[] = [
  { id: 'mumbai', name: 'Mumbai (JNPT)', lat: 18.95, lng: 72.95, country: 'India' },
  { id: 'colombo', name: 'Colombo Port', lat: 6.94, lng: 79.84, country: 'Sri Lanka' },
  { id: 'kochi', name: 'Kochi (Cochin)', lat: 9.96, lng: 76.27, country: 'India' },
  { id: 'chennai', name: 'Chennai Port', lat: 13.08, lng: 80.29, country: 'India' },
  { id: 'dubai', name: 'Jebel Ali (Dubai)', lat: 25.01, lng: 55.06, country: 'UAE' },
  { id: 'male', name: 'Male Harbor', lat: 4.17, lng: 73.51, country: 'Maldives' },
  { id: 'salalah', name: 'Salalah Port', lat: 16.94, lng: 54.01, country: 'Oman' },
];

const VESSEL_TYPES = [
  { id: 'cargo', name: 'Container Vessel (Panamax)', cruisingSpeed: 19.5, draft: 14.5 },
  { id: 'tanker', name: 'Very Large Crude Carrier (VLCC)', cruisingSpeed: 14.0, draft: 20.5 },
  { id: 'bulk', name: 'Bulk Carrier (Capesize)', cruisingSpeed: 13.5, draft: 16.0 },
  { id: 'research', name: 'Oceanographic Research Vessel', cruisingSpeed: 12.0, draft: 6.5 },
];

interface GeneratedRoute {
  id: 'shortest' | 'environment' | 'thermal';
  name: string;
  badge: string;
  color: string;
  lineStyle: string;
  description: string;
  waypoints: [number, number][];
  distanceNm: number;
  durationHours: number;
  meanSst: number;
  thermoclineGradient: number;
  environmentalScore: number;
  fuelIndex: string;
}

export const MarineRoutesPage: React.FC = () => {
  const navigate = useNavigate();
  const [originId, setOriginId] = useState<string>('mumbai');
  const [destinationId, setDestinationId] = useState<string>('colombo');
  const [vesselTypeId, setVesselTypeId] = useState<string>('cargo');
  const [selectedRouteId, setSelectedRouteId] = useState<'shortest' | 'environment' | 'thermal'>('thermal');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);

  const origin = PORTS.find((p) => p.id === originId) || PORTS[0];
  const destination = PORTS.find((p) => p.id === destinationId) || PORTS[1];
  const vessel = VESSEL_TYPES.find((v) => v.id === vesselTypeId) || VESSEL_TYPES[0];

  // Deterministic Route Waypoints & Physics Generation in Pure Blue Variations
  const routes: GeneratedRoute[] = useMemo(() => {
    const lat1 = origin.lat;
    const lng1 = origin.lng;
    const lat2 = destination.lat;
    const lng2 = destination.lng;

    // Direct geodesic waypoints
    const shortestWaypoints: [number, number][] = [
      [lat1, lng1],
      [(lat1 * 2 + lat2) / 3, (lng1 * 2 + lng2) / 3],
      [(lat1 + lat2 * 2) / 3, (lng1 + lng2 * 2) / 3],
      [lat2, lng2],
    ];

    // Environment-aware waypoints
    const envWaypoints: [number, number][] = [
      [lat1, lng1],
      [lat1 - 2.5, lng1 - 1.2],
      [(lat1 + lat2) / 2 - 1.5, (lng1 + lng2) / 2 - 1.8],
      [lat2 + 1.2, lng2 - 0.8],
      [lat2, lng2],
    ];

    // Thermal & Subsurface-aware waypoints (OceanEmbed optimal)
    const thermalWaypoints: [number, number][] = [
      [lat1, lng1],
      [lat1 - 3.2, lng1 - 2.5],
      [(lat1 + lat2) / 2 - 0.8, (lng1 + lng2) / 2 - 3.2],
      [lat2 + 0.6, lng2 - 2.2],
      [lat2, lng2],
    ];

    const baseDistNm = Math.round(
      Math.sqrt(
        Math.pow((lat2 - lat1) * 60, 2) +
          Math.pow((lng2 - lng1) * 60 * Math.cos(((lat1 + lat2) / 2) * (Math.PI / 180)), 2)
      )
    );

    return [
      {
        id: 'shortest',
        name: 'Route A — Shortest Geodesic',
        badge: 'Shortest Distance',
        color: '#94C0F2', // Light Blue (dashed)
        lineStyle: 'dashed',
        description: 'Direct rhumb/geodesic line ignoring ocean currents and internal wave thermal shears.',
        waypoints: shortestWaypoints,
        distanceNm: baseDistNm,
        durationHours: Number((baseDistNm / vessel.cruisingSpeed).toFixed(1)),
        meanSst: 28.6,
        thermoclineGradient: 0.18,
        environmentalScore: 72,
        fuelIndex: 'Baseline 100%',
      },
      {
        id: 'thermal',
        name: 'Route B — OceanEmbed Thermal Aware',
        badge: 'Thermal Optimized',
        color: '#0B3A82', // Deep OceanEmbed Blue (solid primary)
        lineStyle: 'solid',
        description: 'Bypasses high-gradient thermocline shearing and internal solitary wave turbulence detected by OceanEmbed.',
        waypoints: thermalWaypoints,
        distanceNm: Math.round(baseDistNm * 1.07),
        durationHours: Number(((baseDistNm * 1.07) / (vessel.cruisingSpeed * 1.11)).toFixed(1)),
        meanSst: 27.9,
        thermoclineGradient: 0.09,
        environmentalScore: 94,
        fuelIndex: '-7.2% Drag & Fuel',
      },
      {
        id: 'environment',
        name: 'Route C — Environment & Current Aware',
        badge: 'MetOcean Current Aware',
        color: '#2E78E0', // Medium Ocean Blue (solid secondary)
        lineStyle: 'solid',
        description: 'Route aligned with prevailing seasonal Monsoon Current vectors and surface wind drag minimization.',
        waypoints: envWaypoints,
        distanceNm: Math.round(baseDistNm * 1.04),
        durationHours: Number(((baseDistNm * 1.04) / (vessel.cruisingSpeed * 1.06)).toFixed(1)),
        meanSst: 28.2,
        thermoclineGradient: 0.14,
        environmentalScore: 88,
        fuelIndex: '-4.8% Drag & Fuel',
      },
    ];
  }, [origin, destination, vessel]);

  const activeRoute = routes.find((r) => r.id === selectedRouteId) || routes[1];

  // Synthetic depth-thermal cross-section along the route for plotting (All blue shades)
  const thermalProfileData = useMemo(() => {
    const steps = 10;
    return Array.from({ length: steps }, (_, i) => {
      const pct = (i / (steps - 1)) * 100;
      const sst = activeRoute.meanSst + Math.sin(i * 0.7) * 0.4;
      const temp50m = sst - 1.2;
      const temp100m = sst - (activeRoute.id === 'thermal' ? 3.8 : 5.4);
      const temp200m = 18.2 - Math.cos(i * 0.5) * 0.8;
      return {
        point: `${Math.round(pct)}%`,
        sst: Number(sst.toFixed(1)),
        temp50m: Number(temp50m.toFixed(1)),
        temp100m: Number(temp100m.toFixed(1)),
        temp200m: Number(temp200m.toFixed(1)),
      };
    });
  }, [activeRoute]);

  const handleGenerate = () => {
    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);
    }, 450);
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 flex flex-col font-sans select-none">
      <Header />

      <main className="flex-grow max-w-7xl xl:max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-5 w-full flex flex-col gap-5">
        {/* Top Header - White Background, Sharp Corners */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-white border border-slate-300 p-4 rounded-none">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#F0F5FC] text-[#0B3A82] border border-[#CBDDF3] rounded-none">
              <Navigation className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-base font-bold text-slate-900 tracking-tight uppercase flex items-center gap-2">
                Marine Route Intelligence &amp; Environmental Trajectory
              </h1>
              <p className="text-xs text-slate-600 font-medium">
                Subsurface thermal gradient awareness &amp; hydrodynamic trajectory comparison across the North Indian Ocean.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/3d')}
              className="flex items-center gap-2 px-3.5 py-1.5 bg-[#F0F5FC] hover:bg-[#E1EDFB] border border-[#CBDDF3] text-[#0B3A82] text-xs font-bold transition-colors cursor-pointer rounded-none"
              title="Inspect ocean environment in 3D"
            >
              <Box className="w-3.5 h-3.5" />
              <span>VIEW IN 3D</span>
            </button>
            <div className="flex items-center gap-1.5 bg-[#F0F5FC] border border-[#CBDDF3] px-3 py-1.5 text-xs font-mono text-[#0B3A82] font-semibold rounded-none">
              <ShieldCheck className="w-3.5 h-3.5 text-[#0B3A82]" />
              <span>GLORYS Simulation</span>
            </div>
          </div>
        </div>

        {/* Route Configuration Bar - Sharp White Box per Requirement #24 */}
        <div className="bg-white border border-slate-300 rounded-none p-4 shadow-none">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-4 items-center">
            
            {/* Origin */}
            <div className="lg:col-span-3 bg-slate-50 p-2.5 border border-slate-200 rounded-none">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-600 mb-1 block">
                Departure Port
              </label>
              <select
                value={originId}
                onChange={(e) => setOriginId(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-none px-2.5 py-1 text-xs text-slate-900 font-medium focus:outline-none focus:border-[#0B3A82] cursor-pointer"
              >
                {PORTS.map((p) => (
                  <option key={p.id} value={p.id} disabled={p.id === destinationId}>
                    {p.name} ({p.country})
                  </option>
                ))}
              </select>
            </div>

            {/* Destination */}
            <div className="lg:col-span-3 bg-slate-50 p-2.5 border border-slate-200 rounded-none">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-600 mb-1 block">
                Destination Port
              </label>
              <select
                value={destinationId}
                onChange={(e) => setDestinationId(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-none px-2.5 py-1 text-xs text-slate-900 font-medium focus:outline-none focus:border-[#0B3A82] cursor-pointer"
              >
                {PORTS.map((p) => (
                  <option key={p.id} value={p.id} disabled={p.id === originId}>
                    {p.name} ({p.country})
                  </option>
                ))}
              </select>
            </div>

            {/* Vessel Type */}
            <div className="lg:col-span-4 bg-slate-50 p-2.5 border border-slate-200 rounded-none">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-600 mb-1 block">
                Vessel Classification &amp; Draft
              </label>
              <select
                value={vesselTypeId}
                onChange={(e) => setVesselTypeId(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-none px-2.5 py-1 text-xs text-slate-900 font-medium focus:outline-none focus:border-[#0B3A82] cursor-pointer"
              >
                {VESSEL_TYPES.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.name} · {v.cruisingSpeed} kts (Draft: {v.draft}m)
                  </option>
                ))}
              </select>
            </div>

            {/* Generate Action Button */}
            <div className="lg:col-span-2 flex flex-col justify-end">
              <button
                onClick={handleGenerate}
                disabled={isGenerating}
                className="w-full py-3 px-4 bg-[#0B3A82] hover:bg-[#082C64] active:bg-[#051C40] text-white font-bold text-xs uppercase tracking-wider rounded-none border border-[#0B3A82] transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-sm"
              >
                <Compass className="w-4 h-4" />
                <span>{isGenerating ? 'Routing...' : 'GENERATE ROUTE'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Map & Route Selection Area (Large Rectangular Dominant Map) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          
          {/* Map Column (Dominant 8 Cols, 560px-640px height) */}
          <div className="lg:col-span-8 bg-white border-2 border-slate-300 overflow-hidden h-[540px] sm:h-[620px] relative rounded-none shadow-none">
            <MapContainer
              center={[(origin.lat + destination.lat) / 2, (origin.lng + destination.lng) / 2]}
              zoom={5}
              minZoom={3}
              maxZoom={9}
              scrollWheelZoom
              className="h-full w-full z-0 rounded-none"
            >
              <TileLayer
                attribution="&copy; Esri World Ocean"
                url="https://server.arcgisonline.com/ArcGIS/rest/services/Ocean/World_Ocean_Base/MapServer/tile/{z}/{y}/{x}"
              />

              {/* Origin Marker */}
              <CircleMarker
                center={[origin.lat, origin.lng]}
                radius={8}
                pathOptions={{ color: '#ffffff', fillColor: '#0B3A82', fillOpacity: 1, weight: 3 }}
              >
                <Tooltip permanent direction="top" className="bg-[#0B3A82] text-white font-mono text-[10px] px-2 py-0.5 rounded-none border border-white/40 shadow-sm">
                  Origin: {origin.name}
                </Tooltip>
              </CircleMarker>

              {/* Destination Marker */}
              <CircleMarker
                center={[destination.lat, destination.lng]}
                radius={8}
                pathOptions={{ color: '#ffffff', fillColor: '#2E78E0', fillOpacity: 1, weight: 3 }}
              >
                <Tooltip permanent direction="top" className="bg-[#155BBD] text-white font-mono text-[10px] px-2 py-0.5 rounded-none border border-white/40 shadow-sm">
                  Destination: {destination.name}
                </Tooltip>
              </CircleMarker>

              {/* Draw 3 Route Paths Strictly in Blue Shades */}
              {routes.map((r) => {
                const isSelected = r.id === selectedRouteId;
                return (
                  <Polyline
                    key={r.id}
                    positions={r.waypoints}
                    pathOptions={{
                      color: r.color,
                      weight: isSelected ? 4.5 : 2.5,
                      opacity: isSelected ? 1.0 : 0.6,
                      dashArray: r.lineStyle === 'dashed' ? '8, 8' : undefined,
                    }}
                    eventHandlers={{
                      click: () => setSelectedRouteId(r.id),
                    }}
                  />
                );
              })}
            </MapContainer>

            {/* Floating Map Legend (Strictly Blue & White) */}
            <div className="absolute bottom-4 left-4 z-[400] bg-white border border-slate-300 p-3 rounded-none text-xs shadow-sm space-y-1.5 min-w-[220px]">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#0B3A82] block mb-1 border-b border-slate-200 pb-1">
                Active Trajectories
              </span>
              {routes.map((r) => (
                <button
                  key={r.id}
                  onClick={() => setSelectedRouteId(r.id)}
                  className={`flex items-center gap-2 w-full text-left px-2 py-1 rounded-none transition-colors ${
                    r.id === selectedRouteId ? 'bg-[#F0F5FC] text-[#0B3A82] font-bold border-l-2 border-l-[#0B3A82]' : 'text-slate-600 hover:text-[#0B3A82]'
                  }`}
                >
                  <span
                    className="w-3.5 h-1 shrink-0"
                    style={{
                      backgroundColor: r.color,
                      borderTop: r.lineStyle === 'dashed' ? '1px dashed' : undefined,
                    }}
                  />
                  <span className="text-[11px] truncate">{r.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Right Column: Comparative Route Analytics Cards (Strictly White & Blue) */}
          <div className="lg:col-span-4 space-y-3">
            {routes.map((r) => {
              const isSelected = r.id === selectedRouteId;
              return (
                <div
                  key={r.id}
                  onClick={() => setSelectedRouteId(r.id)}
                  className={`p-4 rounded-none border transition-colors cursor-pointer ${
                    isSelected
                      ? 'bg-[#F0F5FC] border-[#0B3A82] border-l-4 border-l-[#0B3A82] shadow-sm'
                      : 'bg-white border-slate-300 hover:border-slate-400 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-bold text-slate-900 flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-none" style={{ backgroundColor: r.color }} />
                      {r.name}
                    </span>
                    <span className="text-[9px] font-bold px-2 py-0.5 rounded-none uppercase tracking-wider bg-white border border-[#CBDDF3] text-[#0B3A82]">
                      {r.badge}
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-600 leading-snug mb-3">{r.description}</p>

                  <div className="grid grid-cols-3 gap-2 font-mono text-center text-xs">
                    <div className="bg-white p-2 border border-slate-200 rounded-none">
                      <span className="text-[9px] text-slate-500 block font-sans">Distance</span>
                      <span className="font-bold text-slate-900">{r.distanceNm} nm</span>
                    </div>
                    <div className="bg-white p-2 border border-slate-200 rounded-none">
                      <span className="text-[9px] text-slate-500 block font-sans">Duration</span>
                      <span className="font-bold text-[#0B3A82]">{r.durationHours} hrs</span>
                    </div>
                    <div className="bg-white p-2 border border-slate-200 rounded-none">
                      <span className="text-[9px] text-slate-500 block font-sans">Eco Score</span>
                      <span className="font-bold text-[#0B3A82]">{r.environmentalScore}/100</span>
                    </div>
                  </div>

                  <div className="mt-2.5 pt-2 border-t border-slate-200 flex items-center justify-between text-[10px] text-slate-600 font-mono">
                    <span>Shear: {(r.thermoclineGradient * 100).toFixed(1)}°C/10m</span>
                    <span className="text-[#0B3A82] font-bold">{r.fuelIndex}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Subsurface Thermal Exposure along Selected Route Chart (Pure Blue Lines) */}
        <div className="bg-white border border-slate-300 rounded-none p-5 shadow-none">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-2 border-b border-slate-200 pb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <Waves className="w-4 h-4 text-[#0B3A82]" />
                Subsurface Thermal Cross-Section Along {activeRoute.name}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Modeled vertical thermal profiles (SST, 50m mixed layer, 100m thermocline, 200m depth) along route trajectory.
              </p>
            </div>
            <span className="text-xs text-slate-600 font-mono flex items-center gap-1.5 self-start sm:self-auto">
              <span>{origin.name} (0%)</span>
              <ArrowRight className="w-3 h-3 text-[#0B3A82]" />
              <span>{destination.name} (100%)</span>
            </span>
          </div>

          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={thermalProfileData} margin={{ top: 10, right: 30, left: 0, bottom: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="point" stroke="#94a3b8" tick={{ fontSize: 10, fill: '#475569' }} />
                <YAxis stroke="#94a3b8" tick={{ fontSize: 10, fill: '#475569' }} unit="°C" domain={[15, 32]} />
                <RechartsTooltip
                  contentStyle={{ backgroundColor: '#ffffff', borderColor: '#0B3A82', borderRadius: '0', fontSize: '11px', color: '#0f172a' }}
                />
                <Line type="monotone" dataKey="sst" name="Surface SST" stroke="#0B3A82" strokeWidth={2.5} dot={{ r: 2 }} />
                <Line type="monotone" dataKey="temp50m" name="50m Mixed Layer" stroke="#2E78E0" strokeWidth={2} dot={{ r: 2 }} />
                <Line type="monotone" dataKey="temp100m" name="100m Thermocline" stroke="#5A9BEB" strokeWidth={2} strokeDasharray="4 4" dot={false} />
                <Line type="monotone" dataKey="temp200m" name="200m Subsurface" stroke="#94C0F2" strokeWidth={1.5} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-6 pt-3 border-t border-slate-100 text-xs">
            <div className="flex items-center gap-2">
              <span className="w-3 h-1 bg-[#0B3A82]"></span>
              <span className="text-slate-700 font-semibold">Surface SST</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-1 bg-[#2E78E0]"></span>
              <span className="text-slate-700 font-semibold">50m Mixed Layer</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-1 bg-[#5A9BEB] border-t border-dashed"></span>
              <span className="text-slate-700 font-semibold">100m Thermocline</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-1 bg-[#94C0F2]"></span>
              <span className="text-slate-700 font-semibold">200m Subsurface</span>
            </div>
          </div>
        </div>

        {/* Operational Disclaimer */}
        <div className="p-3.5 bg-[#F0F5FC] border border-[#CBDDF3] text-xs text-[#0B3A82] leading-relaxed text-center rounded-none font-medium">
          <strong>Operational Notice:</strong> Marine Route Intelligence simulates environmental route optimization by integrating OceanEmbed subsurface thermal gradients with metocean parameters. Commercial navigation decisions must adhere to SOLAS guidelines, IMO traffic separation schemes (TSS), and real-time maritime notices.
        </div>
      </main>
    </div>
  );
};
