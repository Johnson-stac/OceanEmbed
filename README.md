# OceanEmbed

OceanEmbed is an interactive ocean-intelligence prototype for exploring how surface ocean conditions can relate to subsurface temperature. A user selects a location in the North Indian Ocean on a 3D globe, reviews surface inputs, and runs a demonstration prediction workflow to view a vertical temperature profile and supporting analytics.

> **Project status:** prototype / demo. The current model and heatmap values are simulated for interface and workflow demonstration. They must not be used for scientific, navigational, or operational decisions.

## Problem statement

Ocean observations are often available at the surface, while the thermal structure below the surface is harder and more expensive to measure. OceanEmbed explores a simple workflow for using location, date, and surface variables to estimate a subsurface temperature profile.

The initial study region is the North Indian Ocean, including the Arabian Sea and Bay of Bengal.

## What the application does

1. Select a point on the interactive 3D globe.
2. Capture latitude and longitude.
3. Validate that the point is inside the study region (5–30°N, 60–100°E).
4. Display demonstration surface observations: SST, SSS, SLA, and current components.
5. Choose an observation date from 2021–2025.
6. Run a demonstration subsurface-temperature prediction.
7. Review the predicted depth profile, uncertainty bounds, correlations, and detailed output.

## Main features

### 3D location-selection globe

- CesiumJS globe with pan, zoom, rotation, live coordinate readout, and click-to-select.
- Highlighted North Indian Ocean study region and sample buoy/sensor points.
- Labelled marker at the selected coordinate.

### Surface-observation panel

- Sea Surface Temperature (SST), Sea Surface Salinity (SSS), Sea Level Anomaly (SLA), and current components.
- Clear units, definitions, and reset state.

### Demonstration prediction workflow

- Predicted profile at 5, 10, 20, 30, 50, and 75 m.
- Lower and upper uncertainty bounds for each depth.
- Clear demo-mode status rather than a false claim of validated prediction.

### Analytics and map experiment

- Vertical temperature-depth profile.
- Correlation chart for surface inputs versus predicted temperature.
- Expandable detailed-data table.
- Separate 2D temperature-map experiment with 2021–2025 time and 0–1,000 m depth controls.

## Technology stack

| Area | Technology | Purpose |
|---|---|---|
| Front end | React 19 + TypeScript | UI and type safety |
| Build tooling | Vite | Local development and production build |
| Styling | Tailwind CSS | Responsive interface styling |
| 3D geospatial view | CesiumJS | Interactive globe and coordinate picking |
| 2D geospatial view | Leaflet + React Leaflet | Temperature-layer experiment |
| Charts | Recharts | Depth profile and correlation charts |
| Icons | Lucide React | Interface iconography |

## Project architecture

```text
User selects globe position
          │
          ▼
Location validation (North Indian Ocean)
          │
          ▼
Surface-observation service
          │
          ▼
Prediction service
          │
          ├── Demonstration subsurface profile
          ├── Correlation results
          └── Analytics and detailed table
```

### Important source files

| File | Responsibility |
|---|---|
| `src/App.tsx` | Coordinates application state and prediction workflow |
| `src/components/map/OceanMap.tsx` | Cesium 3D globe and coordinate selection |
| `src/components/OceanHeatmap.tsx` | Experimental 2D temperature layer |
| `src/components/LeftSidebar.tsx` | Date, location, and surface-observation controls |
| `src/components/PredictionSidebar.tsx` | Prediction action and result state |
| `src/components/AnalyticsPanel.tsx` | Charts, correlations, and detailed data |
| `src/services/predictionService.ts` | UI-facing prediction-service layer |
| `src/services/fakeModel.ts` | Demonstration data and inference placeholder |

## Data flow and modelling note

The UI communicates only with `predictionService.ts`. At present, that service calls `fakeModel.ts`, which creates plausible demonstration values from the selected coordinate. This separation lets a future real API replace the service implementation without rewriting the UI.

A production-ready version would need quality-controlled SST, SSS, SLA, current, wind, bathymetry, and profile data; a validated model trained against in-situ data such as Argo floats; model metrics (MAE, RMSE, bias); gridded prediction outputs; and accurate coastline/ocean masks.

## Running the project

### Prerequisites

- Node.js 20 or later
- npm

### Commands

```bash
npm install
npm run dev
```

Open the local address shown by Vite in a browser.

```bash
npm run build  # Type-check and create a production build
npm run lint   # Run lint checks
npm run preview
```

## PPT-ready outline

### Slide 1 — Title

**OceanEmbed: AI-Powered Subsurface Ocean Intelligence**

Interactive estimation and visualization of ocean temperature below the surface.

### Slide 2 — Problem

- Surface measurements are easier to obtain than subsurface observations.
- Ocean temperature varies across location, season, and depth.
- A clear exploratory interface can make these relationships easier to understand.

### Slide 3 — Proposed solution

- An interactive map, surface inputs, and prediction workflow in one interface.
- User selects a location and date, then explores a subsurface temperature profile.
- Initial target region: North Indian Ocean.

### Slide 4 — User workflow

1. Select a location on the 3D globe.
2. Review surface parameters.
3. Select a date.
4. Run the prediction.
5. Explore depth profile, correlations, and detailed results.

### Slide 5 — Key interface features

- Cesium 3D globe with coordinate capture.
- Location validation and sample observation points.
- Surface-parameter cards and prediction controls.
- Temperature-depth profile, correlations, and detailed table.

### Slide 6 — Architecture

Use the architecture diagram above. Highlight the separation between React UI, prediction service, and future model/API.

### Slide 7 — Technologies used

- React + TypeScript + Vite
- CesiumJS for 3D geospatial interaction
- Leaflet for the 2D map experiment
- Recharts for analytics
- Tailwind CSS for responsive design

### Slide 8 — Current output

- Temperature profile at multiple depths.
- Prediction uncertainty bounds.
- Correlation analysis for SST, SSS, SLA, and currents.
- 2D temperature-map experiment with time and depth controls.

### Slide 9 — Limitations and responsible use

- Current inference and map values are simulated.
- Results are not scientifically validated predictions.
- Real data integration, validation, and calibrated uncertainty are required before deployment.

### Slide 10 — Future scope

- Integrate satellite and Argo data.
- Train and validate a real ML model.
- Serve real gridded predictions for the heatmap.
- Add time/depth animation, exportable reports, and more ocean basins.

## Suggested PPT demo sequence

1. Show the landing screen.
2. Rotate the globe and select an ocean point inside the study area.
3. Show captured coordinates and surface inputs.
4. Change the date.
5. Run a prediction and show the temperature-depth profile.
6. Show correlations and detailed data.
7. Introduce the 2D map as a future-facing exploratory feature.

## License

No license has been specified for this repository.
