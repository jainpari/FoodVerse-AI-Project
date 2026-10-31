import React, { useState } from 'react';
import {
  Upload,
  Camera,
  RefreshCw,
  Sparkles,
  Flame,
  Check,
  Plus,
  AlertCircle,
  Share2,
  UtensilsCrossed,
  ShieldCheck,
  Tag,
  Scale,
} from 'lucide-react';
import { FoodRecognitionResult } from '../types/foodverse';
import { analyzeFoodImage, fileToBase64, urlToBase64 } from '../services/api';
import { SAMPLE_FOOD_ITEMS, SampleMediaItem } from '../services/sampleData';
import { SampleMediaPicker } from '../components/SampleMediaPicker';
import { DisclaimerBanner } from '../components/DisclaimerBanner';
import { addHistoryItem, addIntakeItem } from '../services/storage';

interface Props {
  onOpenLiveCamera: () => void;
  capturedImageFromCamera?: string | null;
  onClearCapturedCamera: () => void;
  onIntakeAdded?: () => void;
}

export const FoodRecognitionView: React.FC<Props> = ({
  onOpenLiveCamera,
  capturedImageFromCamera,
  onClearCapturedCamera,
  onIntakeAdded,
}) => {
  const [imagePreview, setImagePreview] = useState<string | null>(
    capturedImageFromCamera || SAMPLE_FOOD_ITEMS[0].imageUrl
  );
  const [selectedSampleId, setSelectedSampleId] = useState<string | undefined>(
    capturedImageFromCamera ? undefined : SAMPLE_FOOD_ITEMS[0].id
  );
  const [userNotes, setUserNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<FoodRecognitionResult | null>(null);
  const [portionMultiplier, setPortionMultiplier] = useState<number>(1);
  const [addedToLog, setAddedToLog] = useState(false);

  // If new camera capture comes in
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
      setError('Please select a valid image file (JPEG, PNG, WebP).');
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
      // Convert sample image URL to base64 for reliable Gemini API transfer
      setLoading(true);
      const b64 = await urlToBase64(item.imageUrl);
      handleAnalyze(b64, item.notes);
    } catch (e: any) {
      // If CORS on direct fetch, still attempt sending URL or fallback
      handleAnalyze(item.imageUrl, item.notes);
    }
  };

  const handleAnalyze = async (base64OrUrl: string, noteOverride?: string) => {
    setLoading(true);
    setError(null);
    setAddedToLog(false);

    try {
      let b64 = base64OrUrl;
      if (!b64.startsWith('data:')) {
        b64 = await urlToBase64(b64);
      }

      const data = await analyzeFoodImage(b64, noteOverride || userNotes);
      setResult(data);

      // Save to persistent history
      addHistoryItem({
        type: 'recognition',
        title: data.dishName,
        subtitle: `${data.calories} kcal • ${data.macronutrients.protein.amount}g Protein • ${data.cuisine}`,
        scoreOrCalorie: `${data.calories} kcal`,
        badge: `Health: ${data.healthScore}/100`,
        imageThumbnail: base64OrUrl.length > 500000 ? undefined : base64OrUrl,
        data,
      });
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to analyze food image with AI. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToDailyLog = () => {
    if (!result) return;
    const cals = Math.round(result.calories * portionMultiplier);
    const p = Math.round(result.macronutrients.protein.amount * portionMultiplier);
    const c = Math.round(result.macronutrients.carbohydrates.amount * portionMultiplier);
    const f = Math.round(result.macronutrients.fat.amount * portionMultiplier);

    addIntakeItem({
      title: `${result.dishName} (${portionMultiplier}x portion)`,
      mealType: 'Lunch',
      calories: cals,
      protein: p,
      carbs: c,
      fat: f,
      image: imagePreview || undefined,
    });

    setAddedToLog(true);
    if (onIntakeAdded) onIntakeAdded();
  };

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* Module Overview Header */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-emerald-900/10 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              <span>Computer Vision Food Intelligence</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              AI Food Recognition & Nutritional Analysis
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 max-w-2xl">
              Snap a picture or upload any meal. Gemini 3.8 Flash automatically identifies the dish, breaks down key ingredients, and calculates calorie and macronutrient estimates.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onOpenLiveCamera}
              className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-semibold rounded-xl shadow-sm transition-all"
            >
              <Camera className="w-4 h-4" />
              <span>Take Live Photo</span>
            </button>
            <label className="flex items-center gap-2 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs sm:text-sm font-semibold rounded-xl cursor-pointer shadow-sm transition-all">
              <Upload className="w-4 h-4" />
              <span>Upload Image</span>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>
          </div>
        </div>

        {/* 1-Click Sample Previews */}
        <div className="pt-2 border-t border-slate-100">
          <SampleMediaPicker
            items={SAMPLE_FOOD_ITEMS}
            selectedId={selectedSampleId}
            onSelect={handleSampleSelect}
            label="Try instant sample dishes with 1-click:"
          />
        </div>
      </div>

      {/* Main Grid: Upload & Preview on Left, Analysis Dashboard on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Image Preview & Control */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white rounded-3xl p-5 border border-emerald-900/10 shadow-xs space-y-4">
            <div className="relative aspect-4/3 rounded-2xl overflow-hidden bg-slate-100 border border-slate-200">
              {imagePreview ? (
                <img
                  src={imagePreview}
                  alt="Food dish to analyze"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center text-slate-400">
                  <UtensilsCrossed className="w-12 h-12 mb-2 stroke-1 text-slate-300" />
                  <p className="text-xs">No image selected</p>
                </div>
              )}

              {loading && (
                <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-xs flex flex-col items-center justify-center text-white p-6 text-center space-y-3">
                  <RefreshCw className="w-8 h-8 text-emerald-400 animate-spin" />
                  <div>
                    <p className="font-bold text-sm">Gemini Multimodal Analysis</p>
                    <p className="text-xs text-slate-300 mt-0.5">
                      Identifying ingredients, estimating portion & macros...
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* User Context & Re-analyze */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-700">
                Optional Context / Preparation Note
              </label>
              <input
                type="text"
                value={userNotes}
                onChange={(e) => setUserNotes(e.target.value)}
                placeholder="e.g., 'Cooked in olive oil, no added salt', or '2 servings'"
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/30 bg-slate-50"
              />
            </div>

            <button
              disabled={loading || !imagePreview}
              onClick={() => imagePreview && handleAnalyze(imagePreview)}
              className="w-full flex items-center justify-center gap-2 py-3 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl text-xs sm:text-sm font-bold shadow-md shadow-emerald-700/20 transition-all"
            >
              <Sparkles className="w-4 h-4" />
              <span>{loading ? 'Analyzing with Gemini...' : 'Analyze This Meal'}</span>
            </button>

            {error && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Nutritional Dashboard */}
        <div className="lg:col-span-7 space-y-5">
          {result ? (
            <div className="space-y-5 animate-fade-in">
              {/* Dish Title & Health Score */}
              <div className="bg-white rounded-3xl p-6 border border-emerald-900/10 shadow-xs space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-md">
                        {result.cuisine}
                      </span>
                      <span className="text-[11px] font-semibold text-slate-400">
                        {Math.round(result.confidence * 100)}% Confidence
                      </span>
                    </div>
                    <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 mt-1">
                      {result.dishName}
                    </h3>
                  </div>

                  {/* Health Score Metric */}
                  <div className="flex items-center gap-3 bg-emerald-50/70 border border-emerald-200/80 px-4 py-2.5 rounded-2xl">
                    <div className="text-right">
                      <p className="text-[10px] uppercase font-bold text-emerald-800 tracking-wider">
                        Health Score
                      </p>
                      <p className="text-xs font-semibold text-emerald-600">
                        {result.healthRating}
                      </p>
                    </div>
                    <div className="w-12 h-12 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-extrabold text-lg shadow-sm">
                      {result.healthScore}
                    </div>
                  </div>
                </div>

                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  {result.description}
                </p>

                {/* Portion Multiplier Controller */}
                <div className="p-3.5 rounded-2xl bg-[#faf8f5] border border-emerald-900/10 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2 text-xs">
                    <Scale className="w-4 h-4 text-emerald-700" />
                    <span className="font-semibold text-slate-700">Portion Size:</span>
                    <span className="text-slate-500">{result.portionSize}</span>
                  </div>

                  <div className="flex items-center gap-1.5 bg-white border border-slate-200 p-1 rounded-xl">
                    {[0.5, 1, 1.5, 2].map((m) => (
                      <button
                        key={m}
                        type="button"
                        onClick={() => setPortionMultiplier(m)}
                        className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition-colors ${
                          portionMultiplier === m
                            ? 'bg-emerald-700 text-white'
                            : 'text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        {m}x
                      </button>
                    ))}
                  </div>
                </div>

                {/* Calorie & Macro Highlights */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
                  <div className="p-3.5 rounded-2xl bg-amber-50/80 border border-amber-200/60 text-center">
                    <div className="flex items-center justify-center gap-1 text-amber-700 mb-1">
                      <Flame className="w-4 h-4" />
                      <span className="text-[11px] font-bold uppercase tracking-wider">Calories</span>
                    </div>
                    <p className="text-2xl font-extrabold text-amber-950">
                      {Math.round(result.calories * portionMultiplier)}
                    </p>
                    <p className="text-[10px] text-amber-700/80">kcal per serving</p>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-emerald-50/80 border border-emerald-200/60 text-center">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800 block mb-1">
                      Protein
                    </span>
                    <p className="text-2xl font-extrabold text-emerald-950">
                      {Math.round(result.macronutrients.protein.amount * portionMultiplier)}g
                    </p>
                    <p className="text-[10px] text-emerald-700/80">
                      {result.macronutrients.protein.percentage || 25}% of energy
                    </p>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-orange-50/80 border border-orange-200/60 text-center">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-orange-800 block mb-1">
                      Carbs
                    </span>
                    <p className="text-2xl font-extrabold text-orange-950">
                      {Math.round(result.macronutrients.carbohydrates.amount * portionMultiplier)}g
                    </p>
                    <p className="text-[10px] text-orange-700/80">
                      {result.macronutrients.carbohydrates.percentage || 45}% of energy
                    </p>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-teal-50/80 border border-teal-200/60 text-center">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-teal-800 block mb-1">
                      Fats
                    </span>
                    <p className="text-2xl font-extrabold text-teal-950">
                      {Math.round(result.macronutrients.fat.amount * portionMultiplier)}g
                    </p>
                    <p className="text-[10px] text-teal-700/80">
                      {result.macronutrients.fat.percentage || 30}% of energy
                    </p>
                  </div>
                </div>

                {/* Additional Nutrition (Fiber, Sugar, Sodium) */}
                <div className="grid grid-cols-3 gap-2 text-center text-xs py-2 px-3 bg-slate-50 rounded-xl border border-slate-100">
                  <div>
                    <span className="text-slate-400 text-[10px] block">Fiber</span>
                    <span className="font-bold text-slate-800">
                      {result.macronutrients.fiber
                        ? `${Math.round(result.macronutrients.fiber.amount * portionMultiplier)}g`
                        : '--'}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] block">Sugars</span>
                    <span className="font-bold text-slate-800">
                      {result.macronutrients.sugar
                        ? `${Math.round(result.macronutrients.sugar.amount * portionMultiplier)}g`
                        : '--'}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] block">Sodium</span>
                    <span className="font-bold text-slate-800">
                      {result.macronutrients.sodium
                        ? `${Math.round(result.macronutrients.sodium.amount * portionMultiplier)}mg`
                        : '--'}
                    </span>
                  </div>
                </div>

                {/* Add to Daily Tracker Action */}
                <div className="pt-2 flex items-center justify-between gap-3">
                  <button
                    type="button"
                    onClick={handleAddToDailyLog}
                    disabled={addedToLog}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs sm:text-sm font-bold shadow-sm transition-all ${
                      addedToLog
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                        : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                    }`}
                  >
                    {addedToLog ? (
                      <>
                        <Check className="w-4 h-4 text-emerald-700" />
                        <span>Logged to Today's Intake!</span>
                      </>
                    ) : (
                      <>
                        <Plus className="w-4 h-4" />
                        <span>Log to Daily Nutrition Tracker</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Identified Ingredients Breakdown */}
              {result.ingredientsIdentified && result.ingredientsIdentified.length > 0 && (
                <div className="bg-white rounded-3xl p-6 border border-emerald-900/10 shadow-xs space-y-3">
                  <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                    <UtensilsCrossed className="w-4 h-4 text-emerald-600" />
                    <span>Identified Ingredients</span>
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {result.ingredientsIdentified.map((ing, idx) => (
                      <div
                        key={idx}
                        className="p-2.5 rounded-xl border border-slate-100 bg-[#faf8f5] flex items-center justify-between text-xs"
                      >
                        <span className="font-medium text-slate-800">{ing.name}</span>
                        <div className="flex items-center gap-2">
                          {ing.estimatedGrams && (
                            <span className="text-[10px] text-slate-500 font-mono">
                              ~{Math.round(ing.estimatedGrams * portionMultiplier)}g
                            </span>
                          )}
                          <span
                            className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                              ing.confidence === 'High'
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-slate-200 text-slate-700'
                            }`}
                          >
                            {ing.confidence}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Dietary Tags & Allergens */}
              <div className="bg-white rounded-3xl p-6 border border-emerald-900/10 shadow-xs space-y-4">
                <div className="space-y-2">
                  <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider text-slate-400">
                    Dietary Tags & Suitability
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {result.dietaryTags?.map((tag, i) => (
                      <span
                        key={i}
                        className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-semibold"
                      >
                        {tag}
                      </span>
                    ))}
                    {result.allergens && result.allergens.length > 0 && (
                      result.allergens.map((alg, i) => (
                        <span
                          key={i}
                          className="px-2.5 py-1 rounded-lg bg-amber-50 text-amber-800 border border-amber-200 text-xs font-semibold"
                        >
                          Allergen: {alg}
                        </span>
                      ))
                    )}
                  </div>
                </div>

                {/* Nutritionist Advice */}
                {result.aiAdvice && (
                  <div className="p-4 rounded-2xl bg-emerald-50/50 border border-emerald-100 text-xs text-emerald-950 space-y-1">
                    <p className="font-bold flex items-center gap-1.5 text-emerald-800">
                      <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                      Nutritionist Insight
                    </p>
                    <p className="leading-relaxed">{result.aiAdvice}</p>
                  </div>
                )}

                {/* Disclaimer */}
                <DisclaimerBanner
                  type="info"
                  title="Nutritional Estimation Notice"
                  message={result.disclaimer || "Nutritional figures are AI-estimated based on visual food recognition and standard culinary portions. Actual ingredients, cooking oils, and seasonings may affect totals."}
                />
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-3xl p-12 border border-emerald-900/10 shadow-xs text-center space-y-4">
              <div className="w-16 h-16 rounded-3xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
                <Sparkles className="w-8 h-8" />
              </div>
              <div className="max-w-md mx-auto space-y-1">
                <h3 className="text-lg font-bold text-slate-900">
                  Ready to analyze your food
                </h3>
                <p className="text-xs text-slate-500">
                  Click on one of the sample dishes above or upload your own meal picture to view complete macronutrients, ingredients, and health score.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
