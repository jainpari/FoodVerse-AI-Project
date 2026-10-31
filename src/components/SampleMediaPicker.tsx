import React from 'react';
import { SampleMediaItem } from '../services/sampleData';
import { Sparkles } from 'lucide-react';

interface Props {
  items: SampleMediaItem[];
  onSelect: (item: SampleMediaItem) => void;
  selectedId?: string;
  label?: string;
}

export const SampleMediaPicker: React.FC<Props> = ({
  items,
  onSelect,
  selectedId,
  label = 'Or try instant sample with 1-click:',
}) => {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-1.5 text-xs font-medium text-emerald-800">
        <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
        <span>{label}</span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2.5">
        {items.map((item) => {
          const isSelected = item.id === selectedId;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelect(item)}
              className={`group text-left p-1.5 rounded-xl border transition-all text-xs flex flex-col bg-white overflow-hidden hover:shadow-md ${
                isSelected
                  ? 'border-emerald-600 ring-2 ring-emerald-500/30'
                  : 'border-emerald-100 hover:border-emerald-300'
              }`}
            >
              <div className="relative aspect-4/3 w-full rounded-lg overflow-hidden bg-slate-100 mb-1.5">
                <img
                  src={item.imageUrl}
                  alt={item.title}
                  className="w-full h-full object-cover transition-transform group-hover:scale-105"
                  loading="lazy"
                  crossOrigin="anonymous"
                />
                <span className="absolute top-1 left-1 px-1.5 py-0.5 rounded text-[9px] font-semibold bg-emerald-950/70 text-emerald-100 backdrop-blur-xs">
                  {item.category}
                </span>
              </div>
              <p className="font-semibold text-slate-800 line-clamp-1 text-[11px] px-0.5">
                {item.title}
              </p>
              <p className="text-slate-500 text-[10px] line-clamp-1 px-0.5">
                {item.subtitle}
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
};
