import React, { useState } from 'react';
import {
  Upload,
  Camera,
  RefreshCw,
  Sparkles,
  Apple,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Clock,
  Archive,
  Lightbulb,
  ShieldAlert,
  ChevronRight,
  Info,
} from 'lucide-react';
import { FreshnessResult } from '../types/foodverse';
import { detectFreshness, fileToBase64, urlToBase64 } from '../services/api';
import { SAMPLE_FRESHNESS_ITEMS, SampleMediaItem } from '../services/sampleData';
import { SampleMediaPicker } from '../components/SampleMediaPicker';
import { DisclaimerBanner } from '../components/DisclaimerBanner';
import { addHistoryItem } from '../services/storage';

interface Props {
  onOpenLiveCamera: () => void;
  capturedImageFromCamera?: string | null;
  onClearCapturedCamera: () => void;
}

export const FreshnessDetectionView: React.FC<Props> = ({
  onOpenLiveCamera,
  capturedImageFromCamera,
  onClearCapturedCamera,
}) => {
  const [imagePreview, setImagePreview] = useState<string | null>(
    capturedImageFromCamera || SAMPLE_FRESHNESS_ITEMS[1].imageUrl // Spotted bananas as default demo
  );
  const [selectedSampleId, setSelectedSampleId] = useState<string | undefined>(
    capturedImageFromCamera ? undefined : SAMPLE_FRESHNESS_ITEMS[1].id
  );
  const [itemType, setItemType] = useState('');
  const [storageContext, setStorageContext] = useState('Countertop / Room Temp');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<FreshnessResult | null>(null);

  React.useEffect(() => {
    if (capturedImageFromCamera) {
      setImagePreview(capturedImageFromCamera);
      setSelectedSampleId(undefined);
      handleAnalyze(capturedImageFromCamera);
      onClearCapturedCamera();
    }
  }, [capturedImageFromCamera]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please select an image file (JPEG, PNG, WebP).');
      return;
    }

    try {
      setError(null);
      const b64 = await fileToBase64(file);
      setImagePreview(b64);
      setSelectedSampleId(undefined);
      handleAnalyze(b64);
    } catch (err: any) {
      setError('Failed to process image file.');
    }
  };

  const handleSampleSelect = async (item: SampleMediaItem) => {
    try {
      setSelectedSampleId(item.id);
      setImagePreview(item.imageUrl);
      setError(null);
      setLoading(true);
      const b64 = await urlToBase64(item.imageUrl);
      handleAnalyze(b64, item.title);
    } catch (e: any) {
      handleAnalyze(item.imageUrl, item.title);
    }
  };

  const handleAnalyze = async (base64OrUrl: string, itemTypeOverride?: string) => {
    setLoading(true);
    setError(null);

    try {
      let b64 = base64OrUrl;
      if (!b64.startsWith('data:')) {
        b64 = await urlToBase64(b64);
      }

      const data = await detectFreshness(b64, itemTypeOverride || itemType, storageContext);
      setResult(data);

      addHistoryItem({
        type: 'freshness',
        title: `${data.productName} Freshness Check`,
        subtitle: `Status: ${data.freshnessStatus} • Score: ${data.freshnessScore}/100`,
        scoreOrCalorie: `Score: ${data.freshnessScore}/100`,
        badge: data.freshnessStatus,
        imageThumbnail: base64OrUrl.length > 500000 ? undefined : base64OrUrl,
        data,
      });
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to detect food freshness with AI.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: FreshnessResult['freshnessStatus']) => {
    switch (status) {
      case 'Fresh':
        return {
          bg: 'bg-emerald-100 text-emerald-800 border-emerald-300',
          icon: <CheckCircle2 className="w-4 h-4 text-emerald-700" />,
          label: 'Fresh & Optimal',
        };
      case 'Possibly Aging':
        return {
          bg: 'bg-amber-100 text-amber-800 border-amber-300',
          icon: <AlertTriangle className="w-4 h-4 text-amber-700" />,
          label: 'Possibly Aging / Peak Ripeness',
        };
      case 'Potentially Spoiled':
        return {
          bg: 'bg-rose-100 text-rose-800 border-rose-300',
          icon: <XCircle className="w-4 h-4 text-rose-700" />,
          label: 'Potentially Spoiled – Do Not Ingest',
        };
    }
  };

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* Overview Banner */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-emerald-900/10 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-bold">
              <Apple className="w-3.5 h-3.5 text-amber-700" />
              <span>Visual Spoilage & Ripeness Diagnostic</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              Food Freshness & Spoilage Detection
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 max-w-2xl">
              Inspect produce, fruits, vegetables, dairy, or leftovers. Gemini scans visible coloration, texture cues, senescence spots, and spoilage indicators to estimate safe shelf-life and rescue ideas.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onOpenLiveCamera}
              className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-semibold rounded-xl shadow-sm transition-all"
            >
              <Camera className="w-4 h-4" />
              <span>Scan Produce Live</span>
            </button>
            <label className="flex items-center gap-2 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs sm:text-sm font-semibold rounded-xl cursor-pointer shadow-sm transition-all">
              <Upload className="w-4 h-4" />
              <span>Upload Photo</span>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>
          </div>
        </div>

        {/* Sample Produce Selector */}
        <div className="pt-2 border-t border-slate-100">
          <SampleMediaPicker
            items={SAMPLE_FRESHNESS_ITEMS}
            selectedId={selectedSampleId}
            onSelect={handleSampleSelect}
            label="Try instant sample produce with different freshness stages:"
          />
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Image & Inputs */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white rounded-3xl p-5 border border-emerald-900/10 shadow-xs space-y-4">
            <div className="relative aspect-4/3 rounded-2xl overflow-hidden bg-slate-100 border border-slate-200">
              {imagePreview ? (
                <img
                  src={imagePreview}
                  alt="Produce to diagnose"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center text-slate-400">
                  <Apple className="w-12 h-12 mb-2 stroke-1 text-slate-300" />
                  <p className="text-xs">No produce photo selected</p>
                </div>
              )}

              {loading && (
                <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-xs flex flex-col items-center justify-center text-white p-6 text-center space-y-3">
                  <RefreshCw className="w-8 h-8 text-amber-400 animate-spin" />
                  <div>
                    <p className="font-bold text-sm">Evaluating Visual Characteristics</p>
                    <p className="text-xs text-slate-300 mt-0.5">
                      Checking color degradation, spots, moisture turgor & mold signs...
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Storage context selector */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Item Name (Optional)
                </label>
                <input
                  type="text"
                  value={itemType}
                  onChange={(e) => setItemType(e.target.value)}
                  placeholder="e.g. Honeycrisp Apple, Strawberries"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:outline-hidden focus:ring-2 focus:ring-amber-500/30"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Storage Location
                </label>
                <select
                  value={storageContext}
                  onChange={(e) => setStorageContext(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:outline-hidden focus:ring-2 focus:ring-amber-500/30"
                >
                  <option value="Countertop / Room Temp">Room Temp Countertop</option>
                  <option value="Refrigerator Crisper Drawer">Refrigerator Crisper</option>
                  <option value="Pantry / Dark Cabinet">Pantry / Dark Cabinet</option>
                  <option value="Freezer">Freezer</option>
                </select>
              </div>
            </div>

            <button
              disabled={loading || !imagePreview}
              onClick={() => imagePreview && handleAnalyze(imagePreview)}
              className="w-full flex items-center justify-center gap-2 py-3 bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white rounded-xl text-xs sm:text-sm font-bold shadow-md shadow-amber-700/20 transition-all"
            >
              <Sparkles className="w-4 h-4" />
              <span>{loading ? 'Diagnosing with Gemini...' : 'Analyze Freshness Status'}</span>
            </button>

            {error && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}
          </div>
        </div>

        {/* Right: Freshness Report */}
        <div className="lg:col-span-7 space-y-5">
          {result ? (
            <div className="space-y-5 animate-fade-in">
              {/* Status Banner */}
              <div className="bg-white rounded-3xl p-6 border border-emerald-900/10 shadow-xs space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                      {result.category}
                    </span>
                    <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 mt-0.5">
                      {result.productName}
                    </h3>
                  </div>

                  {/* Status Badge */}
                  {(() => {
                    const badge = getStatusBadge(result.freshnessStatus);
                    return (
                      <div className={`flex items-center gap-2 px-4 py-2 rounded-2xl border ${badge.bg}`}>
                        {badge.icon}
                        <span className="font-extrabold text-xs tracking-wide">
                          {badge.label}
                        </span>
                      </div>
                    );
                  })()}
                </div>

                {/* Freshness Score Gauge */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-700">Visual Quality Index</span>
                    <span className="font-extrabold text-slate-900 text-sm">
                      {result.freshnessScore} / 100
                    </span>
                  </div>

                  <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden flex">
                    <div
                      className={`h-full transition-all duration-700 ${
                        result.freshnessScore > 75
                          ? 'bg-emerald-600'
                          : result.freshnessScore > 40
                          ? 'bg-amber-500'
                          : 'bg-rose-500'
                      }`}
                      style={{ width: `${result.freshnessScore}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[10px] text-slate-400 font-medium">
                    <span>Potentially Spoiled</span>
                    <span>Possibly Aging</span>
                    <span>Peak Fresh</span>
                  </div>
                </div>

                {/* Explanation text */}
                <div className="p-4 rounded-2xl bg-[#faf8f5] border border-emerald-900/10 text-xs sm:text-sm text-slate-700 leading-relaxed">
                  <p className="font-bold text-slate-900 mb-1 flex items-center gap-1.5">
                    <Info className="w-4 h-4 text-emerald-700" />
                    Safety & Condition Assessment
                  </p>
                  <p>{result.safetyExplanation}</p>
                </div>

                {/* Visual Observation Markers */}
                <div className="space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Visible Characteristic Diagnostic
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                        Color & Hue
                      </span>
                      <p className="text-slate-800">{result.visualObservations.coloration}</p>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                        Texture & Firmness
                      </span>
                      <p className="text-slate-800">{result.visualObservations.textureFirmness}</p>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                        Spots & Blemishes
                      </span>
                      <p className="text-slate-800">{result.visualObservations.blemishesSpots}</p>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                        Spoilage Markers
                      </span>
                      <p className="text-slate-800 font-medium">{result.visualObservations.spoilageIndicators}</p>
                    </div>
                  </div>
                </div>

                {/* Estimated Shelf Life */}
                <div className="space-y-2 pt-2 border-t border-slate-100">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-slate-500" />
                    <span>Estimated Safe Shelf-Life</span>
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                    <div className="p-3 rounded-2xl bg-amber-50/60 border border-amber-200/50">
                      <span className="text-[10px] font-bold text-amber-800 block">Room Temp</span>
                      <p className="font-semibold text-amber-950 mt-0.5">
                        {result.safeShelfLifeEstimate.roomTemperature}
                      </p>
                    </div>
                    <div className="p-3 rounded-2xl bg-emerald-50/60 border border-emerald-200/50">
                      <span className="text-[10px] font-bold text-emerald-800 block">Refrigerated</span>
                      <p className="font-semibold text-emerald-950 mt-0.5">
                        {result.safeShelfLifeEstimate.refrigerated}
                      </p>
                    </div>
                    <div className="p-3 rounded-2xl bg-sky-50/60 border border-sky-200/50">
                      <span className="text-[10px] font-bold text-sky-800 block">Frozen</span>
                      <p className="font-semibold text-sky-950 mt-0.5">
                        {result.safeShelfLifeEstimate.frozen}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Storage Recommendations */}
                {result.storageRecommendations?.length > 0 && (
                  <div className="space-y-2 pt-2 border-t border-slate-100">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                      <Archive className="w-3.5 h-3.5 text-slate-500" />
                      <span>Optimal Storage Protocol</span>
                    </h4>
                    <ul className="space-y-1.5 text-xs text-slate-700">
                      {result.storageRecommendations.map((rec, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                          <span>{rec}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Zero-Waste Culinary Rescue Ideas */}
                {result.culinaryRescueIdeas && result.culinaryRescueIdeas.length > 0 && (
                  <div className="space-y-2.5 pt-2 border-t border-slate-100">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-amber-700 flex items-center gap-1.5">
                      <Lightbulb className="w-4 h-4 text-amber-600" />
                      <span>Zero-Waste Culinary Rescue Ideas</span>
                    </h4>
                    <div className="grid grid-cols-1 gap-2">
                      {result.culinaryRescueIdeas.map((rescue, i) => (
                        <div
                          key={i}
                          className="p-3 rounded-2xl bg-amber-50/70 border border-amber-200/60 text-xs space-y-0.5"
                        >
                          <p className="font-bold text-amber-900">{rescue.title}</p>
                          <p className="text-amber-800/90 leading-relaxed">{rescue.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Safety Disclaimer Banner */}
                <DisclaimerBanner
                  type="warning"
                  title="Mandatory Food Safety Warning"
                  message={result.disclaimer || "Image-based analysis is an observational estimate and cannot guarantee food safety. Visual inspection cannot identify microscopic pathogens (Salmonella, E. coli, Listeria) or bacterial toxins. When in doubt, discard."}
                />
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-3xl p-12 border border-emerald-900/10 shadow-xs text-center space-y-4">
              <div className="w-16 h-16 rounded-3xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
                <Apple className="w-8 h-8" />
              </div>
              <div className="max-w-md mx-auto space-y-1">
                <h3 className="text-lg font-bold text-slate-900">
                  Ready to test produce freshness
                </h3>
                <p className="text-xs text-slate-500">
                  Select a fruit or vegetable sample above or upload a photo to inspect visual aging markers and get shelf-life estimates.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
