import React, { useState, useMemo } from 'react';
import { Header } from '../components/Header';
import { DetailedReportModal } from '../components/dashboard/DetailedReportModal';
import { useAuth } from '../context/AuthContext';
import {
  ResponsiveContainer,
  ComposedChart,
  ScatterChart,
  Line,
  BarChart,
  Bar,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
} from 'recharts';
import {
  LineChart as LineChartIcon,
  ShieldCheck,
  Activity,
  ArrowRight,
  TrendingUp,
  Layers,
  Database,
  Calendar,
  Compass,
  FileText,
  HelpCircle,
} from 'lucide-react';
import {
  calculateValidationMetrics,
  runFakeInference,
} from '../services/fakeModel';

const STATIONS = [
  { name: 'Central Arabian Sea (RAMA 15N 65E)', lat: 15.0, lng: 65.0 },
  { name: 'Bay of Bengal Deep Array (17N 89E)', lat: 17.5, lng: 89.0 },
  { name: 'Equatorial NIO Channel (8N 76E)', lat: 8.5, lng: 76.2 },
  { name: 'Andaman Sea Basin (13N 94E)', lat: 13.2, lng: 94.5 },
];

export const AnalyticsPage: React.FC = () => {
  const { role } = useAuth();
  const [stationIndex, setStationIndex] = useState<number>(0);
  const [selectedDate, setSelectedDate] = useState<string>('2022-05-15');
  const [isReportOpen, setIsReportOpen] = useState<boolean>(false);
  const [showErrorTooltip, setShowErrorTooltip] = useState<boolean>(false);

  const activeStation = STATIONS[stationIndex];

  // Dynamically compute surface parameters, predictions, and validation metrics
  const { fullPredictionResponse, predictions, metrics, overallErrorPct, confidenceLevel, errorByDepth, scatterData, correlationFeatures } = useMemo(() => {
    const resp = runFakeInference(activeStation.lat, activeStation.lng, `${selectedDate}T00:00:00.000Z`);
    const preds = resp.predictions;
    const met = calculateValidationMetrics(preds);

    // Calculate Overall Error Percentage per requirement #25
    const meanTemp = preds.reduce((acc, p) => acc + p.predicted_temperature, 0) / preds.length;
    const overallErr = Number(((met.mae / meanTemp) * 100).toFixed(1));

    // Determine Confidence Level dynamically per requirement #24
    let conf: 'HIGH' | 'MODERATE' | 'LOW' = 'HIGH';
    if (met.mae > 0.4 || met.correlation < 0.92) {
      conf = 'LOW';
    } else if (met.mae > 0.25 || met.correlation < 0.96) {
      conf = 'MODERATE';
    }

    // Error by depth (Blue intensity)
    const errDepth = preds.map((p) => ({
      depth: p.depth,
      depthLabel: `${p.depth}m`,
      absError: Number(Math.abs(p.difference ?? 0).toFixed(2)),
      signedError: p.difference ?? 0,
    }));

    // Scatter plot points: GLORYS vs OceanEmbed
    const scat = preds.map((p) => ({
      glorys: p.glorys_reference ?? p.predicted_temperature,
      predicted: p.predicted_temperature,
      depth: p.depth,
    }));

    // Surface to subsurface feature attribution
    const corr = [
      { feature: 'SST (Sea Surface Temp)', weight: 0.88, impact: 'Primary boundary anchor for mixed layer (0–50m)' },
      { feature: 'SSS (Sea Surface Salinity)', weight: -0.68, impact: 'Governs halocline stratification in Bay of Bengal' },
      { feature: 'SLA (Sea Level Anomaly)', weight: 0.54, impact: 'Direct proxy for thermocline displacement and eddy heave' },
      { feature: 'Zonal Wind U', weight: -0.26, impact: 'Forces coastal upwelling and thermocline shoaling' },
      { feature: 'Meridional Wind V', weight: 0.22, impact: 'Regulates Somali current and Findlater jet turbulence' },
    ];

    return {
      fullPredictionResponse: resp,
      predictions: preds,
      metrics: met,
      overallErrorPct: overallErr,
      confidenceLevel: conf,
      errorByDepth: errDepth,
      scatterData: scat,
      correlationFeatures: corr,
    };
  }, [activeStation, selectedDate]);

  return (
    <div className="min-h-screen bg-white text-slate-900 flex flex-col font-sans select-none">
      <Header />

      <main className="flex-grow max-w-7xl xl:max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-5 w-full flex flex-col gap-5">
        
        {/* Top Context Header - Pure Blue & White */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 border border-slate-300">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <div className="p-2 bg-[#F0F5FC] text-[#0B3A82] border border-[#CBDDF3]">
                <LineChartIcon className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-xl font-black text-slate-900 tracking-tight uppercase flex items-center gap-2">
                  OceanEmbed Model Validation
                </h1>
                <p className="text-xs text-slate-600 font-medium">
                  Scientific accuracy assessment &amp; empirical benchmarking against Simulated GLORYS12V1 Reference standards.
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            {/* GENERATE DETAILED REPORT button per requirement #30 & #31 */}
            <button
              onClick={() => setIsReportOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-[#0B3A82] hover:bg-[#082C64] active:bg-[#051C40] text-white font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer border border-[#0B3A82] shadow-sm"
              title="Generate scientific observation report"
            >
              <FileText className="w-4 h-4" />
              <span>GENERATE DETAILED REPORT</span>
            </button>

            <div className="flex items-center gap-1.5 bg-[#F0F5FC] border border-[#CBDDF3] px-3 py-2 text-xs text-[#0B3A82] font-semibold">
              <ShieldCheck className="w-4 h-4 text-[#0B3A82]" />
              <span>GLORYS Reference — Demo Data</span>
            </div>
          </div>
        </div>

        {/* Validation Station & Date Selector */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-1">
          <div className="flex items-center gap-2 overflow-x-auto">
            <span className="text-xs font-bold uppercase tracking-wider text-[#0B3A82] mr-2 flex items-center gap-1.5 shrink-0">
              <Compass className="w-4 h-4 text-[#0B3A82]" />
              Benchmark Station:
            </span>
            {STATIONS.map((station, idx) => (
              <button
                key={station.name}
                onClick={() => setStationIndex(idx)}
                className={`px-3 py-1.5 text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer border ${
                  stationIndex === idx
                    ? 'bg-[#0B3A82] text-white border-[#0B3A82] font-bold shadow-sm'
                    : 'bg-white text-slate-700 border-slate-300 hover:bg-[#F0F5FC]'
                }`}
              >
                {station.name}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1.5 bg-white border border-slate-300 px-3 py-1.5 text-xs text-slate-800 font-mono">
            <Calendar className="w-3.5 h-3.5 text-[#0B3A82]" />
            <span className="text-[10px] text-slate-500 uppercase font-sans font-bold">Date:</span>
            <input
              type="date"
              value={selectedDate}
              min="2018-01-01"
              max="2024-12-31"
              onChange={(e) => setSelectedDate(e.target.value)}
              className="bg-transparent text-slate-900 focus:outline-none cursor-pointer font-mono"
            />
          </div>
        </div>

        {/* Dynamic Metric Cards with Confidence & Overall Error Tooltip (Strictly Blue & White) */}
        <div className="grid grid-cols-2 sm:grid-cols-6 gap-3">
          
          {/* 1. Overall Error with RMSE/MAE Tooltip per requirement #25 & #26 */}
          <div className="bg-white p-4 border-2 border-slate-300 relative group">
            <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-slate-600 mb-1">
              <span>Overall Error</span>
              <div
                className="relative cursor-pointer"
                onMouseEnter={() => setShowErrorTooltip(true)}
                onMouseLeave={() => setShowErrorTooltip(false)}
                onClick={() => setShowErrorTooltip(!showErrorTooltip)}
                tabIndex={0}
                aria-label="View Validation Error Metrics"
              >
                <HelpCircle className="w-4 h-4 text-[#0B3A82]" />
                {showErrorTooltip && (
                  <div className="absolute right-0 top-full mt-2 w-48 bg-white border-2 border-[#0B3A82] shadow-xl p-3 z-30 text-xs text-slate-900 font-mono rounded-none">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#0B3A82] block mb-1.5 border-b border-slate-200 pb-1">
                      Validation Metrics
                    </span>
                    <div className="flex justify-between py-1">
                      <span className="text-slate-500 font-sans">RMSE:</span>
                      <span className="font-bold text-[#0B3A82]">{metrics.rmse.toFixed(2)} °C</span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-slate-500 font-sans">MAE:</span>
                      <span className="font-bold text-slate-900">{metrics.mae.toFixed(2)} °C</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
            <span className="text-3xl font-black text-slate-900 font-mono">{overallErrorPct}%</span>
            <span className="text-[10px] text-[#0B3A82] font-semibold block mt-1">Normalized Error Index</span>
          </div>

          {/* 2. Confidence Level per requirement #24 & #27 (Strict Blue Indicator) */}
          <div className="bg-[#F0F5FC] p-4 border-2 border-[#CBDDF3]">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#0B3A82] block mb-1">
              Model Confidence
            </span>
            <span className="text-3xl font-black text-[#0B3A82] font-sans flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 bg-[#0B3A82] rounded-none inline-block" />
              {confidenceLevel}
            </span>
            <span className="text-[10px] text-slate-600 font-medium block mt-1">High Input Agreement</span>
          </div>

          {/* 3. MAE */}
          <div className="bg-white p-4 border border-slate-300">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-600 block mb-1">
              Mean Absolute Error
            </span>
            <span className="text-2xl font-black text-slate-900 font-mono">{metrics.mae.toFixed(2)} °C</span>
            <span className="text-[10px] text-slate-500 block mt-1">L1 Absolute Residual</span>
          </div>

          {/* 4. RMSE */}
          <div className="bg-white p-4 border border-slate-300">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-600 block mb-1">
              Root Mean Square Error
            </span>
            <span className="text-2xl font-black text-[#0B3A82] font-mono">{metrics.rmse.toFixed(2)} °C</span>
            <span className="text-[10px] text-slate-500 block mt-1">L2 Dispersion</span>
          </div>

          {/* 5. Correlation */}
          <div className="bg-white p-4 border border-slate-300">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-600 block mb-1">
              Correlation (r)
            </span>
            <span className="text-2xl font-black text-slate-900 font-mono">{metrics.correlation.toFixed(3)}</span>
            <span className="text-[10px] text-[#0B3A82] font-semibold block mt-1">Pearson Alignment</span>
          </div>

          {/* 6. Mean Bias */}
          <div className="bg-white p-4 border border-slate-300">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-600 block mb-1">
              Mean Bias
            </span>
            <span className="text-2xl font-black text-slate-900 font-mono">
              {metrics.meanBias > 0 ? `+${metrics.meanBias.toFixed(2)}` : metrics.meanBias.toFixed(2)} °C
            </span>
            <span className="text-[10px] text-slate-500 block mt-1">R² = {metrics.r2.toFixed(3)}</span>
          </div>
        </div>

        {/* Row 1: Dual Line Graph (Prediction vs GLORYS) + Error-by-Depth Graph (Blue Only) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          
          {/* Chart 1: Dual Line Graph per requirement #23 */}
          <div className="lg:col-span-7 bg-white border border-slate-300 p-5 shadow-none">
            <div className="flex items-center justify-between mb-3 border-b border-slate-200 pb-2">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-2">
                  <Activity className="w-4 h-4 text-[#0B3A82]" />
                  OceanEmbed vs GLORYS Reference (Temperature vs Depth)
                </h3>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Continuous vertical profile comparison across all 15 observation depths (0m to 1000m).
                </p>
              </div>

              <div className="flex items-center gap-3 text-xs font-mono">
                <span className="flex items-center gap-1.5 text-[#0B3A82] font-bold">
                  <span className="w-3.5 h-1 bg-[#0B3A82] inline-block" /> OceanEmbed
                </span>
                <span className="flex items-center gap-1.5 text-slate-600 font-semibold">
                  <span className="w-3.5 h-0.5 bg-[#5A9BEB] inline-block border-t-2 border-dashed border-[#5A9BEB]" /> GLORYS Ref
                </span>
              </div>
            </div>

            <div className="h-[350px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart
                  layout="vertical"
                  data={predictions}
                  margin={{ top: 10, right: 30, left: 10, bottom: 20 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis
                    type="number"
                    domain={['dataMin - 1', 'dataMax + 1']}
                    stroke="#94a3b8"
                    tick={{ fontSize: 10, fill: '#475569' }}
                    label={{ value: 'Temperature (°C)', position: 'bottom', offset: 0, fill: '#0B3A82', fontSize: 11, fontWeight: 600 }}
                  />
                  <YAxis
                    dataKey="depth"
                    type="number"
                    reversed={true}
                    stroke="#94a3b8"
                    tick={{ fontSize: 10, fill: '#475569' }}
                    label={{ value: 'Depth (m)', angle: -90, position: 'insideLeft', offset: -5, fill: '#0B3A82', fontSize: 11, fontWeight: 600 }}
                  />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#ffffff', borderColor: '#0B3A82', borderRadius: '0', fontSize: '11px', color: '#0f172a' }}
                    formatter={(val: any, name: any) => [
                      `${Number(val).toFixed(2)} °C`,
                      name === 'predicted_temperature' ? 'OceanEmbed Prediction' : 'GLORYS Reference',
                    ]}
                    labelFormatter={(d) => `Depth: ${d}m`}
                  />
                  <Line
                    type="monotone"
                    dataKey="glorys_reference"
                    stroke="#5A9BEB"
                    strokeWidth={2}
                    strokeDasharray="4 4"
                    dot={{ r: 3, fill: '#5A9BEB' }}
                  />
                  <Line
                    type="monotone"
                    dataKey="predicted_temperature"
                    stroke="#0B3A82"
                    strokeWidth={3}
                    dot={{ r: 3.5, fill: '#0B3A82' }}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Chart 2: Prediction Error by Depth per requirement #28 (Shades of Blue Only) */}
          <div className="lg:col-span-5 bg-white border border-slate-300 p-5 shadow-none">
            <div className="flex items-center justify-between mb-3 border-b border-slate-200 pb-2">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-[#0B3A82]" />
                  Prediction Error by Depth (|Pred - Ref|)
                </h3>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Absolute residual deviation (°C) across the vertical water column.
                </p>
              </div>
            </div>

            <div className="h-[350px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  layout="vertical"
                  data={errorByDepth}
                  margin={{ top: 10, right: 30, left: 10, bottom: 20 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis
                    type="number"
                    domain={[0, 0.4]}
                    stroke="#94a3b8"
                    tick={{ fontSize: 10, fill: '#475569' }}
                    label={{ value: 'Absolute Error (°C)', position: 'bottom', offset: 0, fill: '#0B3A82', fontSize: 11, fontWeight: 600 }}
                  />
                  <YAxis
                    dataKey="depthLabel"
                    type="category"
                    stroke="#94a3b8"
                    tick={{ fontSize: 10, fill: '#475569' }}
                    width={45}
                  />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#ffffff', borderColor: '#0B3A82', borderRadius: '0', fontSize: '11px', color: '#0f172a' }}
                    formatter={(val: any) => [`${Number(val).toFixed(2)} °C`, 'Absolute Error']}
                  />
                  <Bar dataKey="absError" radius={0} barSize={11}>
                    {errorByDepth.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.depth >= 75 && entry.depth <= 200 ? '#0B3A82' : '#5A9BEB'}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Row 2: Correlation Scatter Plot + Surface-to-Subsurface Mechanics (Blue Only) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          
          {/* Chart 3: OceanEmbed vs GLORYS Scatter Plot per requirement #29 */}
          <div className="lg:col-span-6 bg-white border border-slate-300 p-5 shadow-none">
            <div className="flex items-center justify-between mb-3 border-b border-slate-200 pb-2">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-2">
                  <Database className="w-4 h-4 text-[#0B3A82]" />
                  OceanEmbed vs GLORYS Correlation Scatter
                </h3>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Linearity check showing dynamic agreement from 4°C to 30°C.
                </p>
              </div>
              <span className="font-mono text-xs text-[#0B3A82] bg-[#F0F5FC] border border-[#CBDDF3] px-2.5 py-1 font-bold">
                r = {metrics.correlation.toFixed(3)}
              </span>
            </div>

            <div className="h-[290px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <ScatterChart margin={{ top: 20, right: 30, bottom: 20, left: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis
                    type="number"
                    dataKey="glorys"
                    name="GLORYS Temp"
                    unit="°C"
                    domain={[0, 32]}
                    stroke="#94a3b8"
                    tick={{ fontSize: 10, fill: '#475569' }}
                    label={{ value: 'GLORYS Reference Temperature (°C)', position: 'bottom', offset: 0, fill: '#0B3A82', fontSize: 11, fontWeight: 600 }}
                  />
                  <YAxis
                    type="number"
                    dataKey="predicted"
                    name="Predicted Temp"
                    unit="°C"
                    domain={[0, 32]}
                    stroke="#94a3b8"
                    tick={{ fontSize: 10, fill: '#475569' }}
                    label={{ value: 'OceanEmbed Prediction (°C)', angle: -90, position: 'insideLeft', offset: -5, fill: '#0B3A82', fontSize: 11, fontWeight: 600 }}
                  />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#ffffff', borderColor: '#0B3A82', borderRadius: '0', fontSize: '11px', color: '#0f172a' }}
                    formatter={(val: any, name: any) => [`${Number(val).toFixed(2)} °C`, name]}
                  />
                  <Scatter name="Observations" data={scatterData} fill="#0B3A82" />
                </ScatterChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Section 4: Surface vs Subsurface Attribution */}
          <div className="lg:col-span-6 bg-white border border-slate-300 p-5 shadow-none">
            <div className="flex items-center justify-between mb-3 border-b border-slate-200 pb-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-2">
                <Layers className="w-4 h-4 text-[#0B3A82]" />
                Surface Observations → Subsurface Reconstruction
              </h3>
            </div>

            <div className="p-3 bg-[#F0F5FC] border border-[#CBDDF3] text-xs mb-4 flex items-center justify-between text-center font-mono">
              <div className="px-2.5 py-1 bg-white border border-slate-300 text-slate-800 font-semibold">
                <span className="block text-[9px] text-slate-500 font-sans">Input</span>
                SST · SSS · SLA · UV
              </div>
              <ArrowRight className="w-4 h-4 text-[#0B3A82] shrink-0" />
              <div className="px-2.5 py-1 bg-[#0B3A82] text-white font-bold">
                <span className="block text-[9px] text-blue-200 font-sans">Transformer</span>
                OceanEmbed Model
              </div>
              <ArrowRight className="w-4 h-4 text-[#0B3A82] shrink-0" />
              <div className="px-2.5 py-1 bg-white border border-slate-300 text-[#0B3A82] font-black">
                <span className="block text-[9px] text-slate-500 font-sans">Output</span>
                T(z) [0m–1000m]
              </div>
            </div>

            <div className="space-y-2">
              {correlationFeatures.map((f) => (
                <div key={f.feature} className="p-2.5 border border-slate-200 bg-white text-xs">
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="font-bold text-slate-900">{f.feature}</span>
                    <span className="font-mono text-[#0B3A82] font-bold">
                      Weight: {f.weight > 0 ? `+${f.weight}` : f.weight}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 leading-tight">{f.impact}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Detailed Scientific Report Modal */}
        {isReportOpen && (
          <DetailedReportModal
            predictionData={fullPredictionResponse}
            userRole={role}
            onClose={() => setIsReportOpen(false)}
          />
        )}

        {/* Disclaimer */}
        <div className="p-4 bg-[#F0F5FC] border border-[#CBDDF3] text-xs text-[#0B3A82] leading-relaxed text-center max-w-5xl mx-auto font-medium">
          <strong>Validation Notice:</strong> Validation statistics (MAE, RMSE, R²) are derived by comparing OceanEmbed synthetic predictions against Simulated GLORYS12V1 Reference reanalysis arrays for demonstration purposes. Field operational pipelines interface with the Copernicus Marine Environment Monitoring Service (CMEMS) API.
        </div>
      </main>
    </div>
  );
};
