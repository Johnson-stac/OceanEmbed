/**
 * OceanEmbed — Fisheries Intelligence Species Data Module
 *
 * All thermal and depth parameters are derived from peer-reviewed scientific literature
 * and reports by authoritative fisheries bodies (CMFRI, FAO, FishBase, IOTC, ICAR).
 * Values are presented as ranges with documented confidence levels.
 *
 * THIS IS MODEL-DERIVED THERMAL HABITAT SUITABILITY DATA.
 * Real fish distribution is influenced by many additional factors.
 */

export interface SpeciesSource {
  name: string;
  url?: string;
  type: 'Government' | 'International' | 'Academic' | 'Database';
}

export interface MockSpecies {
  id: string;
  name: string;
  scientificName: string;
  localNames: string[];
  family: string;
  category: 'Commercial' | 'Small Pelagic' | 'Deepwater' | 'Highly Migratory' | 'Coastal Pelagic';
  description: string;
  habitatType: 'Pelagic-Oceanic' | 'Coastal-Pelagic' | 'Mesopelagic' | 'Neritic-Pelagic';
  
  // Geographic Presence
  arabianSea: boolean;
  bayOfBengal: boolean;
  primaryDistribution: string;
  
  // Temperature (°C) — sourced from CMFRI, FishBase, FAO, IOTC
  minTemp: number;       // Lower tolerance boundary
  optTempMin: number;    // Start of optimal range
  optTempMax: number;    // End of optimal range
  maxTemp: number;       // Upper tolerance boundary
  optTemp: number;       // Single-point centroid for legacy compatibility

  // Depth (m)
  minDepth: number;
  maxDepth: number;

  // Ecological context
  seasonality: string;
  migrationPattern: string;
  currentsRelationship: string;
  temperatureRelationship: string;
  primaryRegion: string;
  ecologicalNote: string;

  // Scientific metadata
  sources: SpeciesSource[];
  sourceConfidence: 'High' | 'Moderate' | 'Low';
  confidenceIndicator: string; // legacy compat
}

export const mockSpecies: MockSpecies[] = [
  {
    id: 'yellowfin-tuna',
    name: 'Yellowfin Tuna',
    scientificName: 'Thunnus albacares',
    localNames: ['Pattu', 'Keerai choora (Kerala)', 'Manja Sura'],
    family: 'Scombridae',
    category: 'Highly Migratory',
    description:
      'Highly migratory pelagic apex predator. CMFRI PSAT tagging studies show Arabian Sea populations prefer 26–30°C, constrained by the shallow oxycline unique to the region. Aggregates at SST fronts and upwelling convergence zones.',
    habitatType: 'Pelagic-Oceanic',

    arabianSea: true,
    bayOfBengal: true,
    primaryDistribution: 'Tropical Indo-Pacific; abundant in Arabian Sea, Laccadive Sea, Bay of Bengal',

    minTemp: 20,
    optTempMin: 26,
    optTempMax: 28,
    maxTemp: 30,
    optTemp: 27,

    minDepth: 0,
    maxDepth: 250,

    seasonality: 'Year-round; peak in Arabian Sea Sep–Nov post-monsoon, and Feb–Apr pre-monsoon',
    migrationPattern: 'Trans-oceanic; moves across Indian Ocean following thermal fronts and prey aggregations',
    currentsRelationship: 'Associates with convergence zones, upwelling regions, and SST fronts',
    temperatureRelationship:
      'Vertical movement constrained by the Arabian Sea oxycline (~100–150 m). Prefers well-oxygenated mixed layer.',
    primaryRegion: 'Central & Southern Arabian Sea, Laccadive Sea',
    ecologicalNote:
      'Temperature is a major constraint in North Indian Ocean. The shallow oxycline limits deep dives. OceanEmbed subsurface reconstruction of the 0–250 m layer is directly relevant.',

    sources: [
      { name: 'CMFRI – PSAT Tagging Studies, Arabian Sea', url: 'https://cmfri.org.in', type: 'Government' },
      { name: 'FishBase – Thunnus albacares', url: 'https://fishbase.se', type: 'Database' },
      { name: 'FAO Fisheries – Yellowfin Tuna', url: 'https://fao.org', type: 'International' },
      { name: 'IOTC – Indian Ocean Tuna Commission', url: 'https://iotc.org', type: 'International' },
    ],
    sourceConfidence: 'High',
    confidenceIndicator: 'High',
  },

  {
    id: 'sardine',
    name: 'Indian Oil Sardine',
    scientificName: 'Sardinella longiceps',
    localNames: ['Mathi (Malayalam)', 'Pedda Kommera (Telugu)', 'Mavi (Konkani)', 'Vella Kavalu (Kannada)'],
    family: 'Clupeidae',
    category: 'Small Pelagic',
    description:
      'India\'s most important small pelagic fish by volume. Highly sensitive to SST changes. CMFRI research shows surplus landings linked to coastal upwelling that cools surface waters to 24–27°C. Temperatures >29°C depress recruitment and spawning.',
    habitatType: 'Coastal-Pelagic',

    arabianSea: true,
    bayOfBengal: false,
    primaryDistribution: 'Western Indian coast (Gujarat to Kerala/Kanyakumari), NW Arabian Sea, Persian Gulf',

    minTemp: 22,
    optTempMin: 24,
    optTempMax: 27,
    maxTemp: 29,
    optTemp: 25.5,

    minDepth: 0,
    maxDepth: 50,

    seasonality: 'Peak abundance Oct–Feb (post-SW Monsoon upwelling); reduced Jun–Aug when SST rises',
    migrationPattern: 'Coastal, limited latitudinal migration; may move to deeper, cooler layers when surface SST >29°C',
    currentsRelationship: 'Strongly associated with SW Monsoon upwelling on Malabar coast; follows coastal currents',
    temperatureRelationship:
      'Highly SST-sensitive. Thrives in upwelling-cooled productive zones. Rising temperatures reduce spawning success and recruitment — a key climate-change vulnerability documented by CMFRI.',
    primaryRegion: 'Malabar Coast, Kerala & Karnataka coastline',
    ecologicalNote:
      'Surface and near-surface species (0–50 m). OceanEmbed\'s surface SST and shallow subsurface (0–50 m) reconstruction is directly applicable. Strong indicator of upwelling activity.',

    sources: [
      { name: 'ICAR-CMFRI – Oil Sardine Research Programme', url: 'https://cmfri.org.in', type: 'Government' },
      { name: 'ICAR Annual Report – Marine Fisheries', url: 'https://icar.org.in', type: 'Government' },
      { name: 'FishBase – Sardinella longiceps', url: 'https://fishbase.se', type: 'Database' },
      { name: 'Frontiers in Marine Science – Climate impacts on oil sardine', type: 'Academic' },
    ],
    sourceConfidence: 'High',
    confidenceIndicator: 'High',
  },

  {
    id: 'skipjack',
    name: 'Skipjack Tuna',
    scientificName: 'Katsuwonus pelamis',
    localNames: ['Kaada (Tamil)', 'Bonita (local)', 'Aku (Hawaiian)'],
    family: 'Scombridae',
    category: 'Highly Migratory',
    description:
      'Fast-swimming epipelagic tuna found abundantly in warm open-ocean surface waters. Important for Indian pole-and-line and purse-seine fisheries around Lakshadweep. Schooling behavior; often associates with floating objects and FADs.',
    habitatType: 'Pelagic-Oceanic',

    arabianSea: true,
    bayOfBengal: true,
    primaryDistribution: 'Tropical Indo-Pacific; equatorial Indian Ocean, Laccadive Sea, throughout North Indian Ocean',

    minTemp: 18,
    optTempMin: 25,
    optTempMax: 29,
    maxTemp: 30,
    optTemp: 27,

    minDepth: 0,
    maxDepth: 260,

    seasonality: 'Year-round in equatorial waters; migrates poleward during warming phases',
    migrationPattern:
      'Schooling migrations across open ocean, following warm-water currents; does not typically enter shelf waters <50 m depth',
    currentsRelationship:
      'Follows the North Equatorial Current and South Equatorial Counter-Current; associates with thermocline features',
    temperatureRelationship:
      'Epipelagic; primarily occupies mixed layer (0–150 m). Sensitive to thermocline depth — shallow thermoclines concentrate fish near surface.',
    primaryRegion: 'Equatorial Indian Ocean, Laccadive Sea, Maldives EEZ',
    ecologicalNote:
      'Mixed layer temperature reconstruction (0–150 m) from OceanEmbed is directly relevant. Thermocline depth is a key habitat determinant.',

    sources: [
      { name: 'FishBase – Katsuwonus pelamis', url: 'https://fishbase.se', type: 'Database' },
      { name: 'FAO – Skipjack Tuna Species Fact Sheet', url: 'https://fao.org', type: 'International' },
      { name: 'IOTC – Skipjack Stock Assessment', url: 'https://iotc.org', type: 'International' },
      { name: 'CMFRI – Lakshadweep Tuna Fisheries', url: 'https://cmfri.org.in', type: 'Government' },
    ],
    sourceConfidence: 'High',
    confidenceIndicator: 'High',
  },

  {
    id: 'mackerel',
    name: 'Indian Mackerel',
    scientificName: 'Rastrelliger kanagurta',
    localNames: ['Ayila / Bangda (Kerala/Goa)', 'Bangude (Konkani)', 'Kaanakaathai (Tamil)', 'Bangda (Marathi)'],
    family: 'Scombridae',
    category: 'Coastal Pelagic',
    description:
      'Schooling coastal pelagic fish governing the upper thermocline. One of India\'s most economically important fish. CMFRI studies link distribution closely to SST (23–30°C range observed), with optimal habitat near 25–29°C in well-mixed coastal shelf waters.',
    habitatType: 'Neritic-Pelagic',

    arabianSea: true,
    bayOfBengal: true,
    primaryDistribution: 'Continental shelf of India (both coasts), Sri Lanka, Myanmar, SE Asia',

    minTemp: 23,
    optTempMin: 25,
    optTempMax: 29,
    maxTemp: 30,
    optTemp: 27,

    minDepth: 10,
    maxDepth: 90,

    seasonality: 'Major season Oct–Jan (NE Monsoon); present year-round on SW coast; reduces Jun–Sep',
    migrationPattern:
      'Coastal shelf migrator; descends to 50–90 m in summer when thermocline shoals, returns to surface in post-monsoon',
    currentsRelationship: 'Responds to coastal upwelling; strong association with chlorophyll-a rich zones',
    temperatureRelationship:
      'Stays just above thermocline. As thermocline shoals during SW Monsoon upwelling, mackerel descend. CMFRI notes a "demersal phase" in summer months at 50–90 m.',
    primaryRegion: 'SE & SW Indian Continental Shelf, Malabar Coast',
    ecologicalNote:
      'Thermocline depth (typically 75–125 m in North Indian Ocean) directly governs mackerel vertical distribution. OceanEmbed\'s 50–100 m temperature reconstruction is particularly relevant.',

    sources: [
      { name: 'CMFRI – Indian Mackerel Distribution Studies', url: 'https://cmfri.org.in', type: 'Government' },
      { name: 'FishBase – Rastrelliger kanagurta', url: 'https://fishbase.se', type: 'Database' },
      { name: 'FAO – Indian Mackerel Species Sheet', url: 'https://fao.org', type: 'International' },
      { name: 'ResearchGate – Habitat modeling Indian Mackerel', type: 'Academic' },
    ],
    sourceConfidence: 'Moderate',
    confidenceIndicator: 'Moderate',
  },

  {
    id: 'swordfish',
    name: 'Broadbill Swordfish',
    scientificName: 'Xiphias gladius',
    localNames: ['Vaal Meen (Tamil)', '검치어 (transliteration)', 'Espadón (Spanish reference)'],
    family: 'Xiphiidae',
    category: 'Deepwater',
    description:
      'Apex pelagic predator with unique diel vertical migration: warm surface waters at night, deep cool mesopelagic zone (100–500 m) during day. Preferred temperature straddles the thermocline (12–22°C). IOTC manages Indian Ocean stocks. Demonstrates OceanEmbed\'s unique value for deep subsurface reconstruction.',
    habitatType: 'Mesopelagic',

    arabianSea: true,
    bayOfBengal: true,
    primaryDistribution: 'Entire Indian Ocean basin; significant longlining activity in Arabian Sea, Bay of Bengal, Andaman Sea',

    minTemp: 8,
    optTempMin: 14,
    optTempMax: 22,
    maxTemp: 27,
    optTemp: 18,

    minDepth: 50,
    maxDepth: 600,

    seasonality: 'Year-round; catches in Indian Ocean peak in certain longline seasons (varies by sub-region)',
    migrationPattern:
      'Diel vertical migrator: ascends to warm surface layers (0–50 m) at night, descends to 200–600 m during daytime. Long-distance horizontal migrations across ocean basins.',
    currentsRelationship: 'Follows deep thermocline structure; associates with edges of mesoscale eddies',
    temperatureRelationship:
      'Highly depth-dependent thermal habitat. Daytime habitat (14–22°C) is entirely in the subsurface — exactly what OceanEmbed reconstructs from surface observations. Surface SST alone cannot characterize swordfish habitat; subsurface reconstruction is essential.',
    primaryRegion: 'Deep Arabian Sea, Bay of Bengal, Andaman Basin',
    ecologicalNote:
      'Best demonstration of OceanEmbed\'s unique capability. Surface SST tells us little about swordfish habitat; 100–500 m temperature reconstruction is what matters. This species uniquely requires subsurface intelligence.',

    sources: [
      { name: 'FishBase – Xiphias gladius', url: 'https://fishbase.se', type: 'Database' },
      { name: 'FAO – Swordfish Species Fact Sheet', url: 'https://fao.org', type: 'International' },
      { name: 'IOTC – Indian Ocean Swordfish Stock Assessment', url: 'https://iotc.org', type: 'International' },
      { name: 'MDPI – Environmental Habitat Modeling Swordfish Indian Ocean', type: 'Academic' },
    ],
    sourceConfidence: 'Moderate',
    confidenceIndicator: 'Moderate',
  },
];
