import { useState, useEffect } from 'react';
import { Header } from '../components/Header';
import { FisheriesMap } from '../components/fisheries/FisheriesMap';
import { SpeciesSelector } from '../components/fisheries/SpeciesSelector';
import { HabitatSummary } from '../components/fisheries/HabitatSummary';
import { TemperatureDepthChart } from '../components/fisheries/TemperatureDepthChart';
import { FisheriesInsight } from '../components/fisheries/FisheriesInsight';
import { mockSpecies } from '../data/mockSpecies';
import { analyzeHabitat } from '../services/habitatAnalysis';
import { predictSubsurfaceTemperature } from '../services/predictionService';
import type { OceanLocation, PredictionResponse } from '../types';

export default function FisheriesPage() {
  const [selectedLocation, setSelectedLocation] = useState<OceanLocation | null>(null);
  const [predictionData, setPredictionData] = useState<PredictionResponse | null>(null);
  const [isPredicting, setIsPredicting] = useState(false);
  const [selectedSpeciesId, setSelectedSpeciesId] = useState<string>(mockSpecies[0].id);

  const selectedSpecies = mockSpecies.find(s => s.id === selectedSpeciesId) || mockSpecies[0];

  useEffect(() => {
    let isMounted = true;
    
    const fetchPrediction = async () => {
      if (!selectedLocation) return;
      setIsPredicting(true);
      try {
        // Fetching prediction for current date (mock)
        const dateStr = new Date().toISOString();
        const data = await predictSubsurfaceTemperature(
          selectedLocation.lat,
          selectedLocation.lng,
          dateStr
        );
        if (isMounted) setPredictionData(data);
      } catch (error) {
        console.error("Failed to fetch prediction:", error);
      } finally {
        if (isMounted) setIsPredicting(false);
      }
    };

    fetchPrediction();

    return () => {
      isMounted = false;
    };
  }, [selectedLocation]);

  const analysis = analyzeHabitat(selectedSpecies, predictionData);

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col font-sans text-slate-900">
      <Header />
      
      <main className="flex-grow max-w-[1600px] mx-auto px-6 lg:px-8 xl:px-12 py-6 sm:py-8 w-full flex flex-col">
        {/* Page Header */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Fisheries Intelligence</h1>
            <span className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider bg-indigo-100 text-indigo-800 rounded border border-indigo-200">
              Experimental Habitat Analysis
            </span>
          </div>
          <p className="text-sm text-slate-600 max-w-3xl">
            Many marine species occupy environments within characteristic temperature and depth ranges. 
            OceanEmbed can provide subsurface thermal information that may support future habitat and fisheries analysis.
          </p>
        </div>

        {/* Main Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6 mb-6 h-[500px] lg:h-[600px]">
          {/* Map Area */}
          <div className="h-full w-full relative">
            <FisheriesMap 
              selectedLocation={selectedLocation} 
              onLocationSelect={setSelectedLocation}
            />
            {isPredicting && (
              <div className="absolute inset-0 bg-white/50 backdrop-blur-sm z-10 flex items-center justify-center rounded-xl">
                <div className="flex flex-col items-center gap-3">
                  <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                  <span className="text-sm font-bold text-indigo-900 bg-white/80 px-3 py-1 rounded shadow-sm">Analyzing Ocean Profile...</span>
                </div>
              </div>
            )}
          </div>

          {/* Species Selector */}
          <div className="h-full">
            <SpeciesSelector 
              speciesList={mockSpecies}
              selectedSpeciesId={selectedSpeciesId}
              onSelectSpecies={setSelectedSpeciesId}
            />
          </div>
        </div>

        {/* Analysis Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="flex flex-col gap-6">
            <HabitatSummary analysis={predictionData ? analysis : null} />
            <FisheriesInsight analysis={predictionData ? analysis : null} species={selectedSpecies} />
          </div>
          
          <div>
            <TemperatureDepthChart predictionData={predictionData} species={selectedSpecies} />
          </div>
        </div>
        
        {/* Footer Disclaimer */}
        <div className="mt-12 mb-4 p-4 bg-slate-100 rounded-lg border border-slate-200 text-xs text-slate-500 leading-relaxed max-w-5xl mx-auto text-center">
          <span className="font-bold text-slate-700">Scientific note:</span> OceanEmbed provides predicted subsurface temperature. Fisheries habitat interpretation requires additional biological, ecological and environmental datasets. The habitat scores shown in this demonstration represent temperature compatibility and are not direct predictions of fish presence or migration.
        </div>
      </main>
    </div>
  );
}
