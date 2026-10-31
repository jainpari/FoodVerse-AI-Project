import React, { useState, useRef } from 'react';
import {
  Upload,
  Camera,
  Video,
  RefreshCw,
  Sparkles,
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  FileText,
  Sliders,
  CheckSquare,
  Building2,
  ExternalLink,
} from 'lucide-react';
import { HygieneObservationResult } from '../types/foodverse';
import { observeRestaurantHygiene, fileToBase64, urlToBase64 } from '../services/api';
import { SAMPLE_HYGIENE_ITEMS, SampleMediaItem } from '../services/sampleData';
import { SampleMediaPicker } from '../components/SampleMediaPicker';
import { DisclaimerBanner } from '../components/DisclaimerBanner';
import { addHistoryItem } from '../services/storage';

interface Props {
  onOpenLiveCamera: () => void;
  capturedImageFromCamera?: string | null;
  onClearCapturedCamera: () => void;
}

export const RestaurantHygieneView: React.FC<Props> = ({
  onOpenLiveCamera,
  capturedImageFromCamera,
  onClearCapturedCamera,
}) => {
  const [mediaPreview, setMediaPreview] = useState<string | null>(
    capturedImageFromCamera || SAMPLE_HYGIENE_ITEMS[0].imageUrl
  );
  const [selectedSampleId, setSelectedSampleId] = useState<string | undefined>(
    capturedImageFromCamera ? undefined : SAMPLE_HYGIENE_ITEMS[0].id
  );
  const [mediaType, setMediaType] = useState<'image' | 'video'>('image');
  const [areaType, setAreaType] = useState('Cold Prep & Salad Line');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<HygieneObservationResult | null>(null);

  const videoElementRef = useRef<HTMLVideoElement | null>(null);

  React.useEffect(() => {
    if (capturedImageFromCamera) {
      setMediaType('image');
      setMediaPreview(capturedImageFromCamera);
      setSelectedSampleId(undefined);
      handleAnalyze(capturedImageFromCamera, 'image');
      onClearCapturedCamera();
    }
  }, [capturedImageFromCamera]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const isVideo = file.type.startsWith('video/');
    const isImage = file.type.startsWith('image/');

    if (!isVideo && !isImage) {
      setError('Please select a valid image or video file.');
      return;
    }

    try {
      setError(null);
      setLoading(true);

      if (isVideo) {
        setMediaType('video');
        // Extract snapshot frame from video for multimodal vision
        const videoUrl = URL.createObjectURL(file);
        setMediaPreview(videoUrl);

        // Extract frame using temporary video element
        const frameBase64 = await extractVideoFrame(file);
        handleAnalyze(frameBase64, 'video');
      } else {
        setMediaType('image');
        const b64 = await fileToBase64(file);
        setMediaPreview(b64);
        setSelectedSampleId(undefined);
        handleAnalyze(b64, 'image');
      }
    } catch (err: any) {
      setError('Failed to process uploaded media file.');
      setLoading(false);
    }
  };

  const extractVideoFrame = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const video = document.createElement('video');
      video.preload = 'metadata';
      video.muted = true;
      video.playsInline = true;
      const url = URL.createObjectURL(file);
      video.src = url;

      video.onloadeddata = () => {
        video.currentTime = Math.min(1.0, video.duration / 2);
      };

      video.onseeked = () => {
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth || 640;
        canvas.height = video.videoHeight || 480;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Canvas context failed'));
          return;
        }
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
        URL.revokeObjectURL(url);
        resolve(dataUrl);
      };

      video.onerror = (e) => {
        URL.revokeObjectURL(url);
        reject(e);
      };
    });
  };

  const handleSampleSelect = async (item: SampleMediaItem) => {
    try {
      setSelectedSampleId(item.id);
      setMediaPreview(item.imageUrl);
      setMediaType('image');
      setError(null);
      setLoading(true);
      const b64 = await urlToBase64(item.imageUrl);
      handleAnalyze(b64, 'image', item.notes);
    } catch (e: any) {
      handleAnalyze(item.imageUrl, 'image', item.notes);
    }
  };

  const handleAnalyze = async (
    base64OrUrl: string,
    type: 'image' | 'video',
    notesOverride?: string
  ) => {
    setLoading(true);
    setError(null);

    try {
      let b64 = base64OrUrl;
      if (!b64.startsWith('data:')) {
        b64 = await urlToBase64(b64);
      }

      const data = await observeRestaurantHygiene(b64, type, areaType, notesOverride || notes);
      setResult(data);

      addHistoryItem({
        type: 'hygiene',
        title: data.assessmentTitle,
        subtitle: `Hygiene Score: ${data.overallHygieneScore}/100 • ${data.overallRiskLevel}`,
        scoreOrCalorie: `Score: ${data.overallHygieneScore}/100`,
        badge: data.overallRiskLevel,
        imageThumbnail: base64OrUrl.length > 500000 ? undefined : base64OrUrl,
        data,
      });
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to analyze restaurant kitchen media with AI.');
    } finally {
      setLoading(false);
    }
  };

  const getRiskBadge = (risk: HygieneObservationResult['overallRiskLevel']) => {
    switch (risk) {
      case 'Low Risk':
        return {
          bg: 'bg-emerald-100 text-emerald-800 border-emerald-300',
          icon: <ShieldCheck className="w-4 h-4 text-emerald-700" />,
        };
      case 'Moderate Attention':
        return {
          bg: 'bg-amber-100 text-amber-800 border-amber-300',
          icon: <AlertTriangle className="w-4 h-4 text-amber-700" />,
        };
      case 'High Concern':
        return {
          bg: 'bg-rose-100 text-rose-800 border-rose-300',
          icon: <ShieldAlert className="w-4 h-4 text-rose-700" />,
        };
    }
  };

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* Overview Banner */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-emerald-900/10 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-100 text-teal-900 text-xs font-bold">
              <ShieldCheck className="w-3.5 h-3.5 text-teal-700" />
              <span>Commercial Food Safety & Kitchen Vision Audit</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              Restaurant Kitchen Hygiene Monitoring
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 max-w-2xl">
              Inspect food preparation areas, cook lines, and walk-in stations. Gemini AI analyzes visible hygiene practices across cross-contamination prevention, food covering, surface cleanliness, and PPE compliance.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onOpenLiveCamera}
              className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-semibold rounded-xl shadow-sm transition-all"
            >
              <Camera className="w-4 h-4" />
              <span>Capture Kitchen</span>
            </button>
            <label className="flex items-center gap-2 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs sm:text-sm font-semibold rounded-xl cursor-pointer shadow-sm transition-all">
              <Upload className="w-4 h-4" />
              <span>Upload Photo / Video</span>
              <input
                type="file"
                accept="image/*,video/*"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>
          </div>
        </div>

        {/* Sample Kitchen Scenes */}
        <div className="pt-2 border-t border-slate-100">
          <SampleMediaPicker
            items={SAMPLE_HYGIENE_ITEMS}
            selectedId={selectedSampleId}
            onSelect={handleSampleSelect}
            label="Try instant sample commercial kitchen lines with 1-click:"
          />
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Kitchen Media Preview */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white rounded-3xl p-5 border border-emerald-900/10 shadow-xs space-y-4">
            <div className="relative aspect-4/3 rounded-2xl overflow-hidden bg-slate-900 border border-slate-800">
              {mediaType === 'video' && mediaPreview ? (
                <video
                  ref={videoElementRef}
                  src={mediaPreview}
                  controls
                  playsInline
                  className="w-full h-full object-cover"
                />
              ) : mediaPreview ? (
                <img
                  src={mediaPreview}
                  alt="Kitchen area to audit"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center text-slate-400">
                  <Building2 className="w-12 h-12 mb-2 stroke-1 text-slate-600" />
                  <p className="text-xs text-slate-400">No kitchen media loaded</p>
                </div>
              )}

              {loading && (
                <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-xs flex flex-col items-center justify-center text-white p-6 text-center space-y-3">
                  <RefreshCw className="w-8 h-8 text-teal-400 animate-spin" />
                  <div>
                    <p className="font-bold text-sm">Auditing Visible Kitchen Hygiene</p>
                    <p className="text-xs text-slate-300 mt-0.5">
                      Checking cross-contamination risks, prep surface cleanliness & PPE compliance...
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Context Inputs */}
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Kitchen Station / Area
                </label>
                <select
                  value={areaType}
                  onChange={(e) => setAreaType(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:outline-hidden focus:ring-2 focus:ring-teal-500/30"
                >
                  <option value="Cold Prep & Salad Line">Cold Prep & Salad Line</option>
                  <option value="Hot Line & Saute Cook Station">Hot Line & Saute Cook Station</option>
                  <option value="Dishwashing & Sanitizing Station">Dishwashing & Sanitizing Station</option>
                  <option value="Walk-in Cooler / Dry Storage">Walk-in Cooler / Dry Storage</option>
                  <option value="Bakery & Pastry Bench">Bakery & Pastry Bench</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Inspector Notes / Focus
                </label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Focus on cutting board separation and glove changes"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:outline-hidden focus:ring-2 focus:ring-teal-500/30"
                />
              </div>
            </div>

            <button
              disabled={loading || !mediaPreview}
              onClick={() => mediaPreview && handleAnalyze(mediaPreview, mediaType)}
              className="w-full flex items-center justify-center gap-2 py-3 bg-teal-700 hover:bg-teal-800 disabled:opacity-50 text-white rounded-xl text-xs sm:text-sm font-bold shadow-md shadow-teal-900/20 transition-all"
            >
              <Sparkles className="w-4 h-4" />
              <span>{loading ? 'Evaluating Media with Gemini...' : 'Generate Hygiene Observation Report'}</span>
            </button>

            {error && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}
          </div>
        </div>

        {/* Right: Hygiene Observation Report */}
        <div className="lg:col-span-7 space-y-5">
          {result ? (
            <div className="space-y-5 animate-fade-in">
              {/* Report Header Card */}
              <div className="bg-white rounded-3xl p-6 border border-emerald-900/10 shadow-xs space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-teal-700 bg-teal-50 px-2.5 py-0.5 rounded-md">
                      {result.areaObserved}
                    </span>
                    <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 mt-1">
                      {result.assessmentTitle}
                    </h3>
                  </div>

                  {/* Overall Score & Risk Badge */}
                  <div className="flex items-center gap-3">
                    {(() => {
                      const badge = getRiskBadge(result.overallRiskLevel);
                      return (
                        <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold ${badge.bg}`}>
                          {badge.icon}
                          <span>{result.overallRiskLevel}</span>
                        </div>
                      );
                    })()}
                    <div className="w-12 h-12 rounded-xl bg-teal-700 text-white flex items-center justify-center font-extrabold text-lg shadow-sm">
                      {result.overallHygieneScore}
                    </div>
                  </div>
                </div>

                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  {result.executiveSummary}
                </p>

                {/* 5 Core Hygiene Pillars */}
                <div className="space-y-3 pt-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    5 Core Hygiene Pillars Evaluation
                  </h4>
                  <div className="space-y-2.5">
                    {result.pillars.map((pillar, idx) => (
                      <div
                        key={idx}
                        className="p-3.5 rounded-2xl bg-[#faf8f5] border border-emerald-900/10 space-y-1.5 text-xs"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-800">{pillar.name}</span>
                          <div className="flex items-center gap-2">
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                pillar.status === 'Good'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : pillar.status === 'Warning'
                                  ? 'bg-amber-100 text-amber-800'
                                  : 'bg-rose-100 text-rose-800'
                              }`}
                            >
                              {pillar.status}
                            </span>
                            <span className="font-extrabold text-slate-700">{pillar.score}/100</span>
                          </div>
                        </div>
                        <p className="text-slate-600 leading-relaxed text-[11px]">{pillar.notes}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Positive Practices Observed */}
                {result.positivePracticesObserved?.length > 0 && (
                  <div className="space-y-2 pt-2 border-t border-slate-100">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-800 flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>Compliant Hygiene Practices Observed</span>
                    </h4>
                    <ul className="space-y-1.5 text-xs text-slate-700">
                      {result.positivePracticesObserved.map((pos, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                          <span>{pos}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Areas of Concern & Corrective Action */}
                {result.areasOfConcern?.length > 0 && (
                  <div className="space-y-3 pt-2 border-t border-slate-100">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-amber-800 flex items-center gap-1.5">
                      <AlertTriangle className="w-4 h-4 text-amber-600" />
                      <span>Areas of Concern & Corrective Recommendations</span>
                    </h4>
                    <div className="space-y-2.5">
                      {result.areasOfConcern.map((concern, i) => (
                        <div
                          key={i}
                          className="p-3.5 rounded-2xl bg-amber-50/60 border border-amber-200/60 space-y-1.5 text-xs"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-amber-950">{concern.issue}</span>
                            <span
                              className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                                concern.severity === 'High'
                                  ? 'bg-rose-100 text-rose-800'
                                  : concern.severity === 'Moderate'
                                  ? 'bg-amber-100 text-amber-800'
                                  : 'bg-slate-200 text-slate-700'
                              }`}
                            >
                              {concern.severity} Severity
                            </span>
                          </div>
                          <p className="text-amber-900/90 leading-relaxed">{concern.detail}</p>
                          <div className="pt-1 text-[11px] font-medium text-emerald-800 flex items-start gap-1">
                            <span className="font-bold">Recommendation:</span>
                            <span>{concern.recommendation}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Actionable Kitchen Sanitation Checklist */}
                {result.actionableChecklist?.length > 0 && (
                  <div className="space-y-2 pt-2 border-t border-slate-100">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                      <CheckSquare className="w-3.5 h-3.5 text-slate-500" />
                      <span>Immediate Managerial Checklist</span>
                    </h4>
                    <div className="grid grid-cols-1 gap-1.5 text-xs text-slate-700">
                      {result.actionableChecklist.map((item, i) => (
                        <label
                          key={i}
                          className="flex items-center gap-2.5 p-2 rounded-xl bg-slate-50 hover:bg-slate-100 cursor-pointer transition-colors"
                        >
                          <input
                            type="checkbox"
                            defaultChecked={false}
                            className="rounded text-teal-600 focus:ring-teal-500 w-4 h-4"
                          />
                          <span>{item}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                {/* Prominent Mandatory Legal Disclaimer */}
                <DisclaimerBanner
                  type="warning"
                  title="Official Regulatory Non-Certification Disclaimer"
                  message={result.mandatoryDisclaimer || "CRITICAL NOTICE: This report is an observational AI visual assessment based strictly on visible image/video cues. It does NOT constitute a certified health inspection, regulatory audit, or legal health code violation determination. Official compliance requires in-person inspection by certified public health officials."}
                />
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-3xl p-12 border border-emerald-900/10 shadow-xs text-center space-y-4">
              <div className="w-16 h-16 rounded-3xl bg-teal-50 text-teal-700 flex items-center justify-center mx-auto">
                <ShieldCheck className="w-8 h-8" />
              </div>
              <div className="max-w-md mx-auto space-y-1">
                <h3 className="text-lg font-bold text-slate-900">
                  Ready to audit restaurant kitchen hygiene
                </h3>
                <p className="text-xs text-slate-500">
                  Select a kitchen station sample above or upload a photo/video clip to generate a comprehensive 5-pillar hygiene observation report.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
