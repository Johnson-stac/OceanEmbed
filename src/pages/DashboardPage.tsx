import React, { useState, useEffect } from 'react';
import { Header } from '../components/Header';
import { DashboardMap } from '../components/dashboard/DashboardMap';
import { DashboardControlsBar } from '../components/dashboard/DashboardControlsBar';
import { PredictionComparisonView } from '../components/dashboard/PredictionComparisonView';
import { LocationComparisonPanel } from '../components/dashboard/LocationComparisonPanel';
import { DetailedReportModal } from '../components/dashboard/DetailedReportModal';
import { OceanAnalystChat } from '../components/chat/OceanAnalystChat';
import { useAuth } from '../context/AuthContext';
import type { OceanLocation, PredictionResponse, SurfaceParameters, ChatContext } from '../types';
import { predictSubsurfaceTemperature, getSurfaceObservations } from '../services/predictionService';
import { generateMockDepthProfile } from '../services/fakeModel';
import { Activity, Globe } from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const { role } = useAuth();
  const isResearcher = role === 'researcher';

  // Default initial location: Central Arabian Sea
  const [selectedDate, setSelectedDate] = useState<string>('2022-05-15T00:00:00.000Z');
  const [selectedLocation, setSelectedLocation] = useState<OceanLocation | null>({
    lat: 15.5,
    lng: 65.2,
    name: 'Central Arabian Sea Sensor Array',
    date: '2022-05-15T00:00:00.000Z',
  });

  const [selectedDepth, setSelectedDepth] = useState<number>(100);
  const [surfaceParameters, setSurfaceParameters] = useState<SurfaceParameters | null>(null);
  const [isPredicting, setIsPredicting] = useState<boolean>(false);
  const [predictionStep, setPredictionStep] = useState<number>(0);
  const [predictionData, setPredictionData] = useState<PredictionResponse | null>(null);
  const [predictionError, setPredictionError] = useState<string | null>(null);

  // Detailed Report Modal
  const [isReportOpen, setIsReportOpen] = useState<boolean>(false);

  // 2-Point Location Comparison State
  const [isComparing, setIsComparing] = useState<boolean>(false);
  const [comparePointA, setComparePointA] = useState<OceanLocation | null>(null);
  const [comparePointB, setComparePointB] = useState<OceanLocation | null>(null);
  const [comparisonDataA, setComparisonDataA] = useState<{
    location: OceanLocation;
    surface: SurfaceParameters;
    profile: any[];
  } | null>(null);
  const [comparisonDataB, setComparisonDataB] = useState<{
    location: OceanLocation;
    surface: SurfaceParameters;
    profile: any[];
  } | null>(null);

  // Load surface observations whenever location or date changes
  useEffect(() => {
    let isMounted = true;
    if (selectedLocation) {
      getSurfaceObservations(selectedLocation.lat, selectedLocation.lng, selectedDate).then((data) => {
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

  // Handle 2-Point comparison data fetching
  useEffect(() => {
    if (comparePointA && comparePointB) {
      Promise.all([
        getSurfaceObservations(comparePointA.lat, comparePointA.lng, selectedDate),
        getSurfaceObservations(comparePointB.lat, comparePointB.lng, selectedDate),
      ]).then(([surfA, surfB]) => {
        const profA = generateMockDepthProfile(surfA.sst, comparePointA.lat, comparePointA.lng, selectedDate);
        const profB = generateMockDepthProfile(surfB.sst, comparePointB.lat, comparePointB.lng, selectedDate);
        setComparisonDataA({ location: comparePointA, surface: surfA, profile: profA });
        setComparisonDataB({ location: comparePointB, surface: surfB, profile: profB });
      });
    } else {
      setComparisonDataA(null);
      setComparisonDataB(null);
    }
  }, [comparePointA, comparePointB, selectedDate]);

  const handleRunPrediction = async () => {
    if (!selectedLocation) return;
    setPredictionError(null);
    setIsPredicting(true);
    setPredictionStep(1);

    // Multi-step loading sequence per requirement #40
    setTimeout(() => setPredictionStep(2), 350);
    setTimeout(() => setPredictionStep(3), 700);
    setTimeout(() => setPredictionStep(4), 1050);

    try {
      const data = await predictSubsurfaceTemperature(
        selectedLocation.lat,
        selectedLocation.lng,
        selectedDate
      );
      setTimeout(() => {
        setPredictionStep(5);
        setPredictionData(data);
        setIsPredicting(false);
      }, 1350);
    } catch (err) {
      console.error('Prediction failed', err);
      setPredictionError('Unable to complete subsurface thermal reconstruction.');
      setIsPredicting(false);
    }
  };

  const handleToggleCompare = () => {
    if (isComparing) {
      handleClearCompare();
    } else {
      setIsComparing(true);
      setComparePointA(selectedLocation);
    }
  };

  const handleClearCompare = () => {
    setIsComparing(false);
    setComparePointA(null);
    setComparePointB(null);
    setComparisonDataA(null);
    setComparisonDataB(null);
  };

  const handleLocationCoordinateChange = (lat: number, lng: number) => {
    setSelectedLocation({
      lat,
      lng,
      name: `Point (${lat.toFixed(2)}°N, ${lng.toFixed(2)}°E)`,
      date: selectedDate,
    });
  };

  const chatContext: ChatContext | null =
    selectedLocation && surfaceParameters && predictionData
      ? {
          date: selectedDate,
          location: selectedLocation,
          surfaceParameters,
          predictions: predictionData.predictions,
        }
      : null;

  return (
    <div className="min-h-screen bg-white text-slate-900 flex flex-col font-sans select-none">
      <Header />

      <main className="flex-grow max-w-7xl xl:max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-5 w-full flex flex-col">
        {/* Compact Scientific Hero Header per requirement #11 */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3.5 gap-2 border-b-2 border-slate-200 mb-4 bg-white">
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <span className="text-[10px] font-black uppercase tracking-widest text-[#0B3A82] bg-[#F0F5FC] px-2 py-0.5 border border-[#CBDDF3]">
                OCEANEMBED
              </span>
              <span className="text-xs font-bold text-[#0B3A82] tracking-wider uppercase font-mono">
                SUBSURFACE OCEAN INTELLIGENCE
              </span>
            </div>
            <p className="text-xs text-slate-600 font-medium">
              Reconstruct and analyze ocean temperature beneath the surface from satellite telemetry.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono self-start sm:self-auto">
            <div className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1 bg-[#F0F5FC] border border-[#CBDDF3] text-[#0B3A82] font-semibold text-[11px] sm:text-xs">
              <Globe className="w-3.5 h-3.5 text-[#0B3A82] shrink-0" />
              <span><span className="hidden sm:inline">North Indian Ocean: </span>5°N–30°N | 60°E–100°E</span>
            </div>
          </div>
        </div>

        {/* 1. LARGE DOMINANT 2D RECTANGULAR MAP (70-80% height dominance) */}
        <section aria-label="Geospatial Ocean Map">
          <DashboardMap
            selectedLocation={selectedLocation}
            onLocationSelect={setSelectedLocation}
            selectedDate={selectedDate}
            isComparing={isComparing}
            onToggleCompare={handleToggleCompare}
            comparePointA={comparePointA}
            comparePointB={comparePointB}
            onSetComparePointA={setComparePointA}
            onSetComparePointB={setComparePointB}
            onClearCompare={handleClearCompare}
          />
        </section>

        {/* 2. CONTROLS BAR (Below map per requirement #11 & #13) */}
        <section aria-label="Observation and Prediction Controls">
          <DashboardControlsBar
            selectedDate={selectedDate}
            onDateChange={setSelectedDate}
            location={selectedLocation}
            onLocationChange={handleLocationCoordinateChange}
            parameters={surfaceParameters}
            selectedDepth={selectedDepth}
            onSelectDepth={setSelectedDepth}
            onRunPrediction={handleRunPrediction}
            isPredicting={isPredicting}
            predictionStep={predictionStep}
            error={predictionError}
            isResearcher={isResearcher}
          />
        </section>

        {/* 3. TWO-POINT LOCATION COMPARISON VIEW (If active) */}
        {comparisonDataA && comparisonDataB && (
          <section aria-label="Two-Point Location Comparison">
            <LocationComparisonPanel
              pointA={comparisonDataA}
              pointB={comparisonDataB}
              onClose={handleClearCompare}
            />
          </section>
        )}

        {/* 4. PREDICTION OUTPUT & GLORYS COMPARISON VIEW */}
        {predictionData ? (
          <section aria-label="Reconstructed Subsurface Profile">
            <PredictionComparisonView
              predictionData={predictionData}
              selectedDepth={selectedDepth}
              onOpenReport={() => setIsReportOpen(true)}
            />
          </section>
        ) : (
          /* Empty / Prompt State */
          <div className="w-full mt-6 p-5 sm:p-8 border border-slate-300 bg-[#F0F5FC] text-center max-w-xl mx-auto rounded-none">
            <Activity className="w-8 h-8 text-[#0B3A82] mx-auto mb-2.5" />
            <h3 className="text-sm font-black text-[#0B3A82] uppercase tracking-wider mb-1">
              Select Location &amp; Run Prediction
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed max-w-md mx-auto mb-3">
              Click any point on the NASA GIBS True Color satellite map, inspect surface observations, and click{' '}
              <strong className="text-[#0B3A82]">RUN PREDICTION</strong> to reconstruct the vertical temperature profile (0m to 1000m) and benchmark against simulated GLORYS reference data.
            </p>
            <button
              onClick={() => handleRunPrediction()}
              className="px-4 py-2 bg-[#0B3A82] hover:bg-[#082C64] text-white text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer rounded-none border border-[#0B3A82]"
            >
              RUN PREDICTION FOR CURRENT COORDINATES
            </button>
          </div>
        )}

        {/* Detailed Scientific Report Modal */}
        {isReportOpen && predictionData && (
          <DetailedReportModal
            predictionData={predictionData}
            userRole={role}
            onClose={() => setIsReportOpen(false)}
          />
        )}

        {/* Chatbot Assistant */}
        <OceanAnalystChat context={chatContext} />
      </main>
    </div>
  );
};
