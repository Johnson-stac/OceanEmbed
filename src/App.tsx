import { useState, useEffect } from 'react';
import { Header, type TabType } from './components/Header';
import { OceanMap } from './components/map/OceanMap';
import { LeftSidebar } from './components/LeftSidebar';
import { PredictionSidebar } from './components/PredictionSidebar';
import { AnalyticsPanel } from './components/AnalyticsPanel';
import { OceanHeatmap } from './components/OceanHeatmap';
import { VisualizationDashboard } from './components/VisualizationDashboard';
import { CorrelationDashboard } from './components/CorrelationDashboard';
import { TemporalExplorer } from './components/TemporalExplorer';
import type { OceanLocation, PredictionResponse, SurfaceParameters } from './types';
import { predictSubsurfaceTemperature, getSurfaceObservations } from './services/predictionService';

function App() {
  const [selectedDate, setSelectedDate] = useState<string>('2021-01-01T00:00:00.000Z');
  const [selectedLocation, setSelectedLocation] = useState<OceanLocation | null>(null);
  const [mapMode, setMapMode] = useState<'2D' | '3D'>('2D');
  const [activeTab, setActiveTab] = useState<TabType>('Prediction');
  
  const [surfaceParameters, setSurfaceParameters] = useState<SurfaceParameters | null>(null);
  const [isPredicting, setIsPredicting] = useState<boolean>(false);
  const [predictionData, setPredictionData] = useState<PredictionResponse | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [predictionError, setPredictionError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    
    if (selectedLocation) {
      setPredictionData(null); 
      getSurfaceObservations(selectedLocation.lat, selectedLocation.lng, selectedDate).then(data => {
        if (isMounted) setSurfaceParameters(data);
      });
    } else {
      setSurfaceParameters(null);
      setPredictionData(null);
    }

    return () => {
      isMounted = false;
    };
  }, [selectedLocation, selectedDate]);

  const handleRunPrediction = async () => {
    if (!selectedLocation) return;
    setPredictionError(null);
    setIsPredicting(true);
    try {
      const data = await predictSubsurfaceTemperature(
        selectedLocation.lat,
        selectedLocation.lng,
        selectedDate
      );
      setPredictionData(data);
    } catch (error) {
      console.error("Failed to fetch prediction:", error);
      setPredictionError('Prediction could not be completed. Please try again.');
    } finally {
      setIsPredicting(false);
    }
  };

  const handleReset = () => {
    setSelectedLocation(null);
    setSurfaceParameters(null);
    setPredictionData(null);
    setLocationError(null);
    setPredictionError(null);
  };

  const handleLocationSelect = (location: OceanLocation) => {
    const isInStudyRegion = location.lat >= 5 && location.lat <= 30 && location.lng >= 60 && location.lng <= 100;
    if (!isInStudyRegion) {
      setLocationError('Please select a location inside the North Indian Ocean study region.');
      return;
    }
    setLocationError(null);
    setSelectedLocation(location);
  };

  const handleApplyTemporalMatch = (loc: OceanLocation, dateIso: string) => {
    setSelectedLocation(loc);
    setSelectedDate(dateIso.includes('T') ? dateIso : `${dateIso}T00:00:00.000Z`);
    setActiveTab('Prediction');
  };

  return (
    <div className="min-h-screen bg-[#ffffff] flex flex-col font-sans text-slate-900">
      <Header activeTab={activeTab} onTabChange={setActiveTab} />
      
      <main className="flex-grow max-w-full mx-auto px-6 lg:px-8 xl:px-12 py-6 sm:py-8 w-full flex flex-col">
        
        {activeTab === 'Prediction' && (
          <>
            {/* Main 3-Column Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-[280px_minmax(0,1fr)_320px] xl:grid-cols-[320px_minmax(0,1fr)_340px] 2xl:grid-cols-[360px_minmax(0,1fr)_380px] gap-6 mb-16 items-stretch">
              
              {/* Left Sidebar (Date, Location, Surface Obs) */}
              <div>
                <LeftSidebar 
                  selectedDate={selectedDate}
                  onDateChange={setSelectedDate}
                  location={selectedLocation}
                  parameters={surfaceParameters}
                  onResetSelection={handleReset}
                  error={locationError}
                />
              </div>

              {/* Center Map */}
              <div className="min-w-0 relative h-[640px] sm:h-[740px] xl:h-[820px] 2xl:h-[880px] flex flex-col">
                {mapMode === '3D' ? (
                  <OceanMap 
                    selectedLocation={selectedLocation} 
                    onLocationSelect={handleLocationSelect}
                  />
                ) : (
                  <div className="h-full w-full rounded-xl overflow-hidden border border-slate-300 shadow-sm relative">
                    <OceanHeatmap
                      location={selectedLocation}
                      parameters={surfaceParameters}
                      selectedDate={selectedDate}
                      onDateChange={setSelectedDate}
                      onLocationSelect={handleLocationSelect}
                    />
                  </div>
                )}
                
                <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[1000] flex bg-white/90 backdrop-blur-md rounded-full shadow-lg border border-slate-200 p-1">
                  <button
                    onClick={() => setMapMode('2D')}
                    className={`px-4 py-1.5 text-xs font-semibold rounded-full transition-all ${
                      mapMode === '2D' ? 'bg-cyan-600 text-white shadow' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    2D Map
                  </button>
                  <button
                    onClick={() => setMapMode('3D')}
                    className={`px-4 py-1.5 text-xs font-semibold rounded-full transition-all ${
                      mapMode === '3D' ? 'bg-cyan-600 text-white shadow' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    3D Globe
                  </button>
                </div>
              </div>

              {/* Right Sidebar (Prediction workflow) */}
              <div>
                <PredictionSidebar 
                  canPredict={!!selectedLocation && !!surfaceParameters}
                  isPredicting={isPredicting}
                  predictionData={predictionData}
                  onRunPrediction={handleRunPrediction}
                  error={predictionError}
                />
              </div>

            </div>

            {/* Analytics Section - Only show if prediction is ready */}
            <div className="max-w-[1480px] mx-auto">
              {predictionData ? (
                <div className="w-full border-t border-slate-200 pt-12 mt-8">
                  <p className="text-[11px] font-bold text-ocean-700 tracking-[0.14em] text-center uppercase mb-2">Scientific outputs</p>
                  <h2 className="text-2xl font-semibold text-slate-900 tracking-tight mb-8 text-center">Analysis &amp; Visualization</h2>
                  <AnalyticsPanel predictionData={predictionData} />
                </div>
              ) : (
                <div className="w-full mt-12 mb-20 text-center">
                  <div className="inline-block p-8 border border-slate-200 bg-slate-50 max-w-lg mx-auto">
                    <h3 className="text-sm font-bold text-slate-800 mb-2 uppercase tracking-wide">Analysis available after prediction</h3>
                    <p className="text-slate-500 text-xs">
                      Run a prediction model first to generate the subsurface temperature profile and correlation visualizations.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </>
        )}

        {activeTab === 'TemporalExplorer' && (
          <TemporalExplorer
            initialLocation={selectedLocation}
            onApplyLocationAndDate={handleApplyTemporalMatch}
          />
        )}

        {activeTab === 'Visualization' && (
          <VisualizationDashboard 
            location={selectedLocation}
            surfaceParameters={surfaceParameters}
            predictionData={predictionData}
          />
        )}

        {activeTab === 'Correlation' && (
          <CorrelationDashboard 
            predictionData={predictionData}
            surfaceParameters={surfaceParameters}
          />
        )}

      </main>
    </div>
  );
}

export default App;
