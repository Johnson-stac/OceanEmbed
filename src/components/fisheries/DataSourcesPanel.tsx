import React from 'react';
import { Database, BookOpen, Globe, Layers, ExternalLink } from 'lucide-react';

interface SourceItem {
  name: string;
  detail: string;
  url?: string;
}

interface SourceSection {
  category: string;
  icon: React.ReactNode;
  items: SourceItem[];
}

export const DataSourcesPanel: React.FC = () => {
  const sources: SourceSection[] = [
    {
      category: 'Species Biology & Ecology Literature',
      icon: <BookOpen className="w-3.5 h-3.5 text-[#0a3663]" />,
      items: [
        { name: 'ICAR-CMFRI', detail: 'Indian mackerel, sardine, tuna PSAT tagging records', url: 'https://cmfri.org.in' },
        { name: 'FAO Fisheries & Aquaculture', detail: 'Global species fact sheets & Indian Ocean stocks', url: 'https://fao.org' },
        { name: 'FishBase', detail: 'Thermal tolerance ranges, depth distributions & life traits', url: 'https://fishbase.se' },
        { name: 'IOTC', detail: 'Indian Ocean Tuna Commission stock assessment reports', url: 'https://iotc.org' },
      ],
    },
    {
      category: 'Oceanographic & Satellite Observations',
      icon: <Globe className="w-3.5 h-3.5 text-[#0a3663]" />,
      items: [
        { name: 'Copernicus Marine (GLORYS12V1)', detail: 'Subsurface global reanalysis benchmark' },
        { name: 'NASA GIBS', detail: 'MODIS/VIIRS True Color satellite imagery' },
        { name: 'INCOIS Ocean State Forecast', detail: 'Indian National Centre for Ocean Information Services' },
        { name: 'NOAA World Ocean Database', detail: 'Argo and CTD reference vertical profiles' },
      ],
    },
    {
      category: 'OceanEmbed Framework',
      icon: <Layers className="w-3.5 h-3.5 text-[#0a3663]" />,
      items: [
        { name: 'Subsurface Reconstruction Engine', detail: 'Satellite embeddings → vertical temperature profiles' },
        { name: 'Thermal Suitability Model', detail: 'Trapezoidal-Gaussian environmental matching' },
        { name: 'Strict Ocean Masking', detail: 'Excludes landmasses & resolves coastal waters' },
      ],
    },
  ];

  return (
    <div className="bg-white border border-slate-300 rounded-none overflow-hidden">
      <div className="px-5 py-3 border-b border-slate-200 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Database className="w-4 h-4 text-[#0a3663]" />
          <div>
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Scientific References &amp; Data Provenance
            </h4>
            <p className="text-[10px] text-slate-500">
              All species thermal parameters sourced from peer-reviewed literature and fisheries authorities
            </p>
          </div>
        </div>
        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest font-mono">
          CMFRI / FAO / IOTC
        </span>
      </div>

      <div className="p-4 grid grid-cols-1 md:grid-cols-3 gap-5">
        {sources.map((section) => (
          <div key={section.category} className="space-y-2">
            <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-[#0a3663] border-b border-slate-200 pb-1">
              {section.icon} {section.category}
            </div>
            <div className="space-y-1.5">
              {section.items.map((item) => (
                <div key={item.name} className="flex items-start justify-between gap-2 text-xs">
                  <div>
                    <span className="text-slate-900 font-semibold">{item.name}</span>
                    <span className="text-slate-500 block text-[10px] leading-tight">
                      {item.detail}
                    </span>
                  </div>
                  {item.url && (
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-slate-400 hover:text-[#0a3663] transition-colors shrink-0 mt-0.5"
                    >
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Scientific Disclaimer */}
      <div className="px-5 py-2.5 border-t border-slate-200 bg-slate-50">
        <p className="text-[10px] text-slate-500 leading-relaxed">
          <strong className="text-slate-800">Scientific Integrity Notice:</strong> Habitat suitability indices reflect thermal environmental preference computed from OceanEmbed subsurface temperature reconstruction. They represent <em>Potential Thermal Habitat</em> rather than direct fish detections. In-situ catch depends additionally on marine upwelling, chlorophyll-a fronts, and fishing regulations.
        </p>
      </div>
    </div>
  );
};
