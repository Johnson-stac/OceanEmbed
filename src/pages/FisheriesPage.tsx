import { useState, useMemo } from 'react';
import { Header } from '../components/Header';
import { FisheriesMap } from '../components/fisheries/FisheriesMap';
import { SpeciesSelector } from '../components/fisheries/SpeciesSelector';
import { HabitatSummary } from '../components/fisheries/HabitatSummary';
import { TemperatureDepthChart } from '../components/fisheries/TemperatureDepthChart';
import { FisheriesInsight } from '../components/fisheries/FisheriesInsight';
import { DataSourcesPanel } from '../components/fisheries/DataSourcesPanel';
import { mockSpecies } from '../data/mockSpecies';
import {
  generateSpatialHabitatGrid,
  type PotentialHabitatPoint,
} from '../services/habitatAnalysis';
import { Fish, Calendar, CheckSquare } from 'lucide-react';

export default function FisheriesPage() {
  const [selectedSpeciesId, setSelectedSpeciesId] = useState<string>(mockSpecies[0].id);
  const [selectedDepth, setSelectedDepth] = useState<number>(0);
  const [selectedDate, setSelectedDate] = useState<string>('2022-05-15');
  const [selectedPoint, setSelectedPoint] = useState<PotentialHabitatPoint | null>(null);

  const selectedSpecies = useMemo(
    () => mockSpecies.find((s) => s.id === selectedSpeciesId) || mockSpecies[0],
    [selectedSpeciesId]
  );

  // Compute discrete spatial potential habitat points strictly masked to ocean waters
  const spatialData = useMemo(
    () => generateSpatialHabitatGrid(selectedSpecies, selectedDepth, 1.0, selectedDate),
    [selectedSpecies, selectedDepth, selectedDate]
  );

  return (
    <div className="min-h-screen bg-white text-slate-900 flex flex-col font-sans select-none overflow-x-hidden">
      <Header />

      <main className="flex-grow max-w-7xl xl:max-w-[1600px] mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-5 w-full flex flex-col gap-4 sm:gap-5">
        {/* Page Top Context Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-white border border-slate-300 p-3 sm:p-4 rounded-none">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#F0F5FC] text-[#0B3A82] border border-[#CBDDF3] rounded-none shrink-0">
              <Fish className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight uppercase">
                Fisheries Intelligence &amp; Thermal Habitat Modeling
              </h1>
              <p className="text-xs text-slate-600 font-medium hidden sm:block">
                Ocean-masked potential thermal habitat points derived from OceanEmbed subsurface temperature reconstruction.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-1.5 bg-white border border-slate-300 px-3 py-1.5 text-xs text-slate-800 font-mono rounded-none">
              <Calendar className="w-3.5 h-3.5 text-[#0B3A82]" />
              <input
                type="date"
                value={selectedDate}
                min="2018-01-01"
                max="2024-12-31"
                onChange={(e) => setSelectedDate(e.target.value)}
                className="bg-transparent text-slate-800 focus:outline-none cursor-pointer"
              />
            </div>
            <div className="flex items-center gap-1.5 bg-[#F0F5FC] text-[#0B3A82] border border-[#CBDDF3] px-3 py-1.5 text-xs font-bold rounded-none">
              <CheckSquare className="w-3.5 h-3.5 text-[#0B3A82]" />
              <span className="hidden sm:inline">Potential Thermal Habitat</span>
              <span className="inline sm:hidden">Thermal Habitat</span>
            </div>
          </div>
        </div>

        {/* Primary 2-Column: Dominant Rectangular Map & Species Profile Selector */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-4 sm:gap-5">
          {/* Rectangular Ocean Map - Mobile: fixed height, Desktop: taller */}
          <div className="h-[300px] sm:h-[420px] md:h-[500px] lg:h-[620px] w-full">
            <FisheriesMap
              species={selectedSpecies}
              points={spatialData.points}
              areas={spatialData.areas}
              summary={spatialData.summary}
              selectedDepth={selectedDepth}
              onDepthChange={setSelectedDepth}
              selectedDate={selectedDate}
              selectedPoint={selectedPoint}
              onSelectPoint={setSelectedPoint}
            />
          </div>

          {/* Species Selector */}
          <div className="lg:h-[620px]">
            <SpeciesSelector
              speciesList={mockSpecies}
              selectedSpeciesId={selectedSpeciesId}
              onSelectSpecies={(id) => {
                setSelectedSpeciesId(id);
                setSelectedPoint(null);
              }}
            />
          </div>
        </div>

        {/* Regional Habitat Metrics Summary */}
        <div className="w-full">
          <HabitatSummary summary={spatialData.summary} />
        </div>

        {/* Depth Profile Chart & Ecological Intelligence Insight */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5 items-stretch w-full">
          <div className="min-h-[300px] sm:min-h-[360px]">
            <TemperatureDepthChart
              predictionData={null}
              species={selectedSpecies}
              selectedPoint={selectedPoint}
            />
          </div>
          <div className="min-h-[300px] sm:min-h-[360px]">
            <FisheriesInsight summary={spatialData.summary} species={selectedSpecies} />
          </div>
        </div>

        {/* Scientific References & Data Provenance */}
        <div className="w-full">
          <DataSourcesPanel />
        </div>

        {/* Explicit Data Honesty Disclaimer */}
        <div className="p-3 sm:p-3.5 bg-[#F0F5FC] border border-[#CBDDF3] rounded-none text-xs text-[#0B3A82] leading-relaxed text-center font-medium">
          <strong>Data Integrity Notice:</strong> Spatial points represent{' '}
          <strong className="text-[#0B3A82]">Potential Thermal Habitat</strong> derived from OceanEmbed subsurface temperature reconstruction and species physiological tolerance windows. All points are rigorously masked to ocean waters. They indicate environmental temperature compatibility and do not guarantee fish presence or commercial abundance.
        </div>
      </main>
    </div>
  );
}
