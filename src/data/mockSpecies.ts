export interface MockSpecies {
  id: string;
  name: string;
  description: string;
  minTemp: number; // Celsius
  maxTemp: number; // Celsius
  minDepth: number; // meters
  maxDepth: number; // meters
  confidenceIndicator: string;
}

export const mockSpecies: MockSpecies[] = [
  {
    id: 'tuna',
    name: 'Yellowfin Tuna (Mock)',
    description: 'Highly migratory pelagic species. Prefers warm surface and near-surface waters but can dive deep.',
    minTemp: 20,
    maxTemp: 30,
    minDepth: 0,
    maxDepth: 250,
    confidenceIndicator: 'High'
  },
  {
    id: 'sardine',
    name: 'Indian Oil Sardine (Mock)',
    description: 'Small, coastal pelagic fish highly sensitive to sea surface temperature and coastal upwelling.',
    minTemp: 26,
    maxTemp: 29,
    minDepth: 0,
    maxDepth: 50,
    confidenceIndicator: 'Moderate'
  },
  {
    id: 'mackerel',
    name: 'Indian Mackerel (Mock)',
    description: 'Schooling pelagic fish found in shallow coastal waters, heavily influenced by thermocline depth.',
    minTemp: 27,
    maxTemp: 31,
    minDepth: 10,
    maxDepth: 90,
    confidenceIndicator: 'Moderate'
  },
  {
    id: 'anchovy',
    name: 'Anchovy (Mock)',
    description: 'Small pelagic species dependent on plankton availability, usually found in well-mixed upper layers.',
    minTemp: 25,
    maxTemp: 28,
    minDepth: 0,
    maxDepth: 40,
    confidenceIndicator: 'Low'
  }
];
