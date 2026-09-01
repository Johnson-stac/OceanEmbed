export interface MockSpecies {
  id: string;
  name: string;
  scientificName: string;
  category: 'Commercial' | 'Small Pelagic' | 'Deepwater' | 'Highly Migratory';
  description: string;
  minTemp: number; // Celsius
  optTemp: number; // Optimal Celsius
  maxTemp: number; // Celsius
  minDepth: number; // meters
  maxDepth: number; // meters
  primaryRegion: string;
  confidenceIndicator: string;
}

export const mockSpecies: MockSpecies[] = [
  {
    id: 'tuna',
    name: 'Yellowfin Tuna',
    scientificName: 'Thunnus albacares',
    category: 'Commercial',
    description: 'Highly migratory pelagic predator. Aggregates around SST fronts between 24°C and 28°C.',
    minTemp: 20,
    optTemp: 26,
    maxTemp: 30,
    minDepth: 0,
    maxDepth: 250,
    primaryRegion: 'Central & Southern Arabian Sea',
    confidenceIndicator: 'High'
  },
  {
    id: 'sardine',
    name: 'Indian Oil Sardine',
    scientificName: 'Sardinella longiceps',
    category: 'Small Pelagic',
    description: 'Small coastal pelagic species highly sensitive to coastal upwelling and SST variations (27°C–29°C).',
    minTemp: 24,
    optTemp: 28,
    maxTemp: 30,
    minDepth: 0,
    maxDepth: 50,
    primaryRegion: 'Malabar & SW Coast of India',
    confidenceIndicator: 'High'
  },
  {
    id: 'mackerel',
    name: 'Indian Mackerel',
    scientificName: 'Rastrelliger kanagurta',
    category: 'Small Pelagic',
    description: 'Schooling pelagic fish found in coastal waters, strongly governed by upper thermocline movement.',
    minTemp: 25,
    optTemp: 28.5,
    maxTemp: 31,
    minDepth: 10,
    maxDepth: 90,
    primaryRegion: 'SE & SW Indian Continental Shelf',
    confidenceIndicator: 'Moderate'
  },
  {
    id: 'skipjack',
    name: 'Skipjack Tuna',
    scientificName: 'Katsuwonus pelamis',
    category: 'Highly Migratory',
    description: 'Fast-swimming pelagic species thriving in warm open-ocean surface waters (25°C–29°C).',
    minTemp: 22,
    optTemp: 27,
    maxTemp: 30.5,
    minDepth: 0,
    maxDepth: 150,
    primaryRegion: 'Equatorial Indian Ocean & Laccadive Sea',
    confidenceIndicator: 'High'
  },
  {
    id: 'swordfish',
    name: 'Broadbill Swordfish',
    scientificName: 'Xiphias gladius',
    category: 'Deepwater',
    description: 'Apex pelagic predator that feeds across deep thermocline boundaries (12°C–22°C) at sub-surface layers.',
    minTemp: 11,
    optTemp: 17,
    maxTemp: 24,
    minDepth: 50,
    maxDepth: 600,
    primaryRegion: 'Deep Bay of Bengal & Arabian Basin',
    confidenceIndicator: 'Moderate'
  },
  {
    id: 'anchovy',
    name: 'Indian Anchovy',
    scientificName: 'Stolephorus indicus',
    category: 'Small Pelagic',
    description: 'Planktonivorous schooling fish occupying warm, well-mixed estuarine and coastal surface layers.',
    minTemp: 25,
    optTemp: 27.5,
    maxTemp: 29.5,
    minDepth: 0,
    maxDepth: 40,
    primaryRegion: 'Coromandel & Northern Bay of Bengal',
    confidenceIndicator: 'Moderate'
  }
];
