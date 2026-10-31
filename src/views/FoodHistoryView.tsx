import React, { useState } from 'react';
import {
  History,
  ScanLine,
  Apple,
  ShieldCheck,
  ChefHat,
  Search,
  Trash2,
  Download,
  Calendar,
  Clock,
  Eye,
  X,
  FileJson,
} from 'lucide-react';
import { AnalysisHistoryItem } from '../types/foodverse';
import { saveHistoryItems, clearAllHistory } from '../services/storage';

interface Props {
  historyItems: AnalysisHistoryItem[];
  onUpdateHistory: (items: AnalysisHistoryItem[]) => void;
}

export const FoodHistoryView: React.FC<Props> = ({
  historyItems,
  onUpdateHistory,
}) => {
  const [filterType, setFilterType] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedItem, setSelectedItem] = useState<AnalysisHistoryItem | null>(null);

  const filtered = historyItems.filter((item) => {
    const matchesType = filterType === 'all' || item.type === filterType;
    const matchesSearch =
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.subtitle.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesType && matchesSearch;
  });

  const handleDeleteItem = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = historyItems.filter((i) => i.id !== id);
    saveHistoryItems(updated);
    onUpdateHistory(updated);
    if (selectedItem?.id === id) {
      setSelectedItem(null);
    }
  };

  const handleClearAll = () => {
    if (confirm('Are you sure you want to clear your entire analysis history?')) {
      clearAllHistory();
      onUpdateHistory([]);
      setSelectedItem(null);
    }
  };

  const handleExportJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(historyItems, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `foodverse_history_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const getTypeIcon = (type: AnalysisHistoryItem['type']) => {
    switch (type) {
      case 'recognition':
        return <ScanLine className="w-4 h-4 text-emerald-600" />;
      case 'freshness':
        return <Apple className="w-4 h-4 text-amber-600" />;
      case 'hygiene':
        return <ShieldCheck className="w-4 h-4 text-teal-600" />;
      case 'recipe':
        return <ChefHat className="w-4 h-4 text-orange-600" />;
    }
  };

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* Header */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-emerald-900/10 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold">
              <History className="w-3.5 h-3.5 text-emerald-600" />
              <span>Historical Intelligence Repository</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              Food Intelligence History
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 max-w-2xl">
              Inspect previous visual scans, freshness tests, restaurant kitchen observations, and generated culinary recipes.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportJson}
              disabled={historyItems.length === 0}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold disabled:opacity-40 transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export JSON</span>
            </button>
            <button
              onClick={handleClearAll}
              disabled={historyItems.length === 0}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-rose-200 text-rose-700 hover:bg-rose-50 text-xs font-semibold disabled:opacity-40 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear Log</span>
            </button>
          </div>
        </div>

        {/* Filters and Search Bar */}
        <div className="pt-2 border-t border-slate-100 flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
          {/* Module Type Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 text-xs">
            {[
              { id: 'all', label: 'All Modules' },
              { id: 'recognition', label: 'Food Recognition' },
              { id: 'freshness', label: 'Freshness Tests' },
              { id: 'hygiene', label: 'Hygiene Audits' },
              { id: 'recipe', label: 'Chef Recipes' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setFilterType(tab.id)}
                className={`px-3 py-1.5 rounded-xl font-semibold whitespace-nowrap transition-colors ${
                  filterType === tab.id
                    ? 'bg-emerald-800 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search past scans..."
              className="w-full pl-9 pr-3.5 py-1.5 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/30"
            />
          </div>
        </div>
      </div>

      {/* History Items Grid */}
      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((item) => (
            <div
              key={item.id}
              onClick={() => setSelectedItem(item)}
              className="group bg-white rounded-2xl border border-emerald-900/10 p-4 hover:border-emerald-400 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between space-y-3"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-[#faf8f5] border border-slate-100 flex items-center justify-center">
                      {getTypeIcon(item.type)}
                    </div>
                    <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
                      {item.type}
                    </span>
                  </div>

                  {item.badge && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                      {item.badge}
                    </span>
                  )}
                </div>

                {item.imageThumbnail && (
                  <div className="aspect-16/9 rounded-xl overflow-hidden bg-slate-100">
                    <img
                      src={item.imageThumbnail}
                      alt={item.title}
                      className="w-full h-full object-cover transition-transform group-hover:scale-103"
                    />
                  </div>
                )}

                <div>
                  <h4 className="font-bold text-slate-900 text-sm group-hover:text-emerald-700 transition-colors line-clamp-1">
                    {item.title}
                  </h4>
                  <p className="text-xs text-slate-500 line-clamp-2 mt-0.5">
                    {item.subtitle}
                  </p>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {new Date(item.timestamp).toLocaleString([], {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>

                <div className="flex items-center gap-1">
                  <button
                    onClick={(e) => handleDeleteItem(item.id, e)}
                    className="p-1 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                    title="Delete record"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                  <span className="text-emerald-700 font-bold group-hover:translate-x-0.5 transition-transform flex items-center gap-0.5">
                    <span>Inspect</span>
                    <Eye className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-3xl p-12 border border-emerald-900/10 shadow-xs text-center space-y-3">
          <History className="w-12 h-12 text-slate-300 mx-auto stroke-1" />
          <h3 className="text-base font-bold text-slate-800">No records found</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            {searchTerm
              ? `No items matching "${searchTerm}". Try a different search query.`
              : 'Scan dishes, audit kitchens, or test produce freshness to build your ledger.'}
          </p>
        </div>
      )}

      {/* Detail Modal */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-2xl w-full border border-slate-200 shadow-2xl max-h-[85vh] overflow-y-auto space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
                  {getTypeIcon(selectedItem.type)}
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">{selectedItem.title}</h3>
                  <span className="text-[10px] text-slate-400">
                    {new Date(selectedItem.timestamp).toLocaleString()}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setSelectedItem(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {selectedItem.imageThumbnail && (
              <div className="aspect-16/9 max-h-64 rounded-2xl overflow-hidden bg-slate-900">
                <img
                  src={selectedItem.imageThumbnail}
                  alt={selectedItem.title}
                  className="w-full h-full object-contain"
                />
              </div>
            )}

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="font-bold text-slate-800 block mb-1">Executive Summary</span>
                <p className="text-slate-600 leading-relaxed">{selectedItem.subtitle}</p>
              </div>

              {/* JSON Raw Inspection */}
              <div className="space-y-1">
                <span className="font-bold text-slate-700 flex items-center gap-1">
                  <FileJson className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Structured Data Payload</span>
                </span>
                <pre className="p-3.5 rounded-xl bg-slate-900 text-emerald-300 font-mono text-[11px] overflow-x-auto max-h-60">
                  {JSON.stringify(selectedItem.data, null, 2)}
                </pre>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setSelectedItem(null)}
                className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold"
              >
                Close Report
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
