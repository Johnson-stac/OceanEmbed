import { useState, useMemo } from 'react';
import { Header } from '../components/Header';
import { FisheriesMap } from '../components/fisheries/FisheriesMap';
import { SpeciesSelector } from '../components/fisheries/SpeciesSelector';
import { HabitatSummary } from '../components/fisheries/HabitatSummary';
import { TemperatureDepthChart } from '../components/fisheries/TemperatureDepthChart';
import { FisheriesInsight } from '../components/fisheries/FisheriesInsight';
import { mockSpecies } from '../data/mockSpecies';
import { generateSpatialHabitatGrid } from '../services/habitatAnalysis';
import { Fish, ShieldCheck, Compass } from 'lucide-react';

export default function FisheriesPage() {
  const [selectedSpeciesId, setSelectedSpeciesId] = useState<string>(mockSpecies[0].id);
  const [selectedDepth, setSelectedDepth] = useState<number>(0);

  const selectedSpecies = useMemo(
    () => mockSpecies.find(s => s.id === selectedSpeciesId) || mockSpecies[0],
    [selectedSpeciesId]
  );

  // Compute spatial habitat suitability grid across the North Indian Ocean for the selected species & depth
  const spatialData = useMemo(
    () => generateSpatialHabitatGrid(selectedSpecies, selectedDepth),
    [selectedSpecies, selectedDepth]
  );

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col font-sans text-slate-900 pb-20">
      <Header />

      <main className="flex-grow max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-6 w-full flex flex-col gap-6">
        
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl border border-indigo-100">
                <Fish className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
                  Fisheries Intelligence & Spatial Habitat Modeling
                </h1>
                <p className="text-xs text-slate-500 font-medium">
                  Select a marine species to dynamically project thermal suitability hotspots across the North Indian Ocean.
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl text-xs text-slate-700 font-semibold shadow-sm">
              <Compass className="w-4 h-4 text-indigo-600" />
              <span>North Indian Ocean (5°N–28°N, 60°E–98°E)</span>
            </div>
            <div className="flex items-center gap-1.5 bg-emerald-50 text-emerald-800 border border-emerald-200 px-3 py-1.5 rounded-xl text-xs font-bold shadow-sm">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Species-Driven AI Projection</span>
            </div>
          </div>
        </div>

        {/* Primary 2-Column Map & Species Selector Layout (Compact 460px height) */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] xl:grid-cols-[1fr_380px] gap-6 h-[460px] lg:h-[480px]">
          {/* Spatial Heatmap Overlay Map */}
          <div className="h-full w-full">
            <FisheriesMap
              species={selectedSpecies}
              gridCells={spatialData.cells}
              summary={spatialData.summary}
              selectedDepth={selectedDepth}
              onDepthChange={setSelectedDepth}
            />
          </div>

          {/* Interactive Species Selector */}
          <div className="h-full overflow-hidden">
            <SpeciesSelector
              speciesList={mockSpecies}
              selectedSpeciesId={selectedSpeciesId}
              onSelectSpecies={setSelectedSpeciesId}
            />
          </div>
        </div>

        {/* Spatial Habitat Metrics Summary Banner */}
        <div className="w-full">
          <HabitatSummary summary={spatialData.summary} />
        </div>

        {/* Bottom Row: Fisheries Insight (Purple Card) & Temperature-Depth Graph */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch w-full min-h-[380px]">
          <div className="h-full">
            <FisheriesInsight summary={spatialData.summary} species={selectedSpecies} />
          </div>
          <div className="h-full">
            <TemperatureDepthChart predictionData={null} species={selectedSpecies} />
          </div>
        </div>

        {/* Scientific & Operational Disclaimer */}
        <div className="mt-4 p-4 bg-slate-100/80 rounded-xl border border-slate-200 text-xs text-slate-500 leading-relaxed text-center max-w-5xl mx-auto">
          <span className="font-bold text-slate-700">Fisheries Notice:</span> Spatial suitability maps are computed using thermal preference Gaussian distributions overlaid on subsurface temperature profiles. Commercial fisheries operation requires multi-variable integration including chlorophyll-a concentration, sea surface height anomalies (SLA), primary productivity, and coastal upwelling indices.
        </div>

      </main>
    </div>
  );
}
