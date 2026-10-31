import React from 'react';
import { Menu, Camera, Droplets, Sparkles } from 'lucide-react';
import { ModuleType } from '../types/foodverse';

interface Props {
  activeModule: ModuleType;
  onOpenMobile: () => void;
  onOpenQuickScan: () => void;
  dailyCalories: number;
  targetCalories: number;
  waterLiters: number;
  onAddWater: () => void;
}

const MODULE_TITLES: Record<ModuleType, { title: string; subtitle: string }> = {
  home: {
    title: 'FoodVerse AI Dashboard',
    subtitle: 'Multimodal food intelligence, nutritional computer vision & kitchen analytics',
  },
  recognition: {
    title: 'AI Food Recognition',
    subtitle: 'Analyze dish photos, calculate nutritional macros & identify ingredients',
  },
  freshness: {
    title: 'Food Freshness Detection',
    subtitle: 'Visual computer vision for ripeness, decay signs, shelf-life & rescue ideas',
  },
  hygiene: {
    title: 'Restaurant Kitchen Hygiene Audit',
    subtitle: 'Computer vision observation of commercial kitchen sanitation & food safety practices',
  },
  cooking: {
    title: 'Smart AI Cooking Assistant',
    subtitle: 'Generate recipes from available ingredients, view cooking timers & culinary advice',
  },
  planner: {
    title: 'Personalized Nutrition Planner',
    subtitle: 'Tailored calorie & macronutrient goals with 7-day meal plans and smart grocery lists',
  },
  tracker: {
    title: 'Daily Food & Hydration Tracker',
    subtitle: 'Log meals, monitor daily caloric balance, and track water intake',
  },
  history: {
    title: 'Food Intelligence History',
    subtitle: 'Review past scans, freshness diagnostics, and kitchen hygiene audits',
  },
  profile: {
    title: 'Profile & Health Settings',
    subtitle: 'Manage biometrics, dietary restrictions, fitness targets, and system configuration',
  },
};

export const Header: React.FC<Props> = ({
  activeModule,
  onOpenMobile,
  onOpenQuickScan,
  dailyCalories,
  targetCalories,
  waterLiters,
  onAddWater,
}) => {
  const meta = MODULE_TITLES[activeModule] || MODULE_TITLES.home;
  const caloriePercent = Math.min(100, Math.round((dailyCalories / (targetCalories || 2000)) * 100));

  return (
    <header className="sticky top-0 z-30 bg-[#faf8f5]/90 backdrop-blur-md border-b border-emerald-900/10 px-4 sm:px-8 py-3.5 flex items-center justify-between gap-4">
      {/* Left: Mobile hamburger & Title */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={onOpenMobile}
          className="p-2 -ml-1 text-slate-600 hover:text-slate-900 rounded-xl hover:bg-emerald-100/50 lg:hidden"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h1 className="text-lg sm:text-xl font-bold text-slate-900 truncate">
              {meta.title}
            </h1>
            <span className="hidden md:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
              <Sparkles className="w-3 h-3 text-emerald-600" />
              Gemini 3.8 Flash
            </span>
          </div>
          <p className="hidden sm:block text-xs text-slate-500 truncate">
            {meta.subtitle}
          </p>
        </div>
      </div>

      {/* Right: Quick actions and intake summary */}
      <div className="flex items-center gap-2.5 shrink-0">
        {/* Calorie Pill */}
        <div className="hidden sm:flex items-center gap-2.5 px-3 py-1.5 bg-white border border-emerald-100 rounded-full shadow-xs text-xs">
          <div className="text-right">
            <span className="font-bold text-slate-800">{dailyCalories}</span>
            <span className="text-slate-400 text-[10px]"> / {targetCalories} kcal</span>
          </div>
          <div className="w-10 bg-slate-100 h-2 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all ${
                caloriePercent > 100 ? 'bg-amber-500' : 'bg-emerald-600'
              }`}
              style={{ width: `${caloriePercent}%` }}
            />
          </div>
        </div>

        {/* Water Tracker Button */}
        <button
          type="button"
          onClick={onAddWater}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-sky-50 hover:bg-sky-100 text-sky-800 border border-sky-200 rounded-full text-xs font-medium transition-colors"
          title="Click to add 250ml water"
        >
          <Droplets className="w-3.5 h-3.5 text-sky-600" />
          <span>{waterLiters.toFixed(1)}L</span>
          <span className="text-[10px] font-bold text-sky-600">+250ml</span>
        </button>

        {/* Scan Camera Action */}
        <button
          onClick={onOpenQuickScan}
          className="flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full text-xs font-semibold shadow-xs shadow-emerald-700/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
        >
          <Camera className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Camera Scan</span>
        </button>
      </div>
    </header>
  );
};
