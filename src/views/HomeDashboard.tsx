import React from 'react';
import {
  ScanLine,
  Apple,
  ShieldCheck,
  ChefHat,
  CalendarDays,
  Activity,
  ArrowRight,
  TrendingUp,
  Droplets,
  Flame,
  Award,
  Sparkles,
  Camera,
  Heart,
  Clock,
  CheckCircle2,
} from 'lucide-react';
import { ModuleType, AnalysisHistoryItem, UserProfile } from '../types/foodverse';

interface Props {
  onNavigate: (module: ModuleType) => void;
  onOpenQuickScan: () => void;
  userProfile: UserProfile;
  dailyCalories: number;
  dailyProtein: number;
  dailyCarbs: number;
  dailyFat: number;
  waterLiters: number;
  onAddWater: () => void;
  recentHistory: AnalysisHistoryItem[];
}

export const HomeDashboard: React.FC<Props> = ({
  onNavigate,
  onOpenQuickScan,
  userProfile,
  dailyCalories,
  dailyProtein,
  dailyCarbs,
  dailyFat,
  waterLiters,
  onAddWater,
  recentHistory,
}) => {
  const targetCals = userProfile.targetDailyCalories || 2150;
  const calPercent = Math.min(100, Math.round((dailyCalories / targetCals) * 100));

  const targetProtein = 140;
  const targetCarbs = 210;
  const targetFat = 65;

  const proteinPercent = Math.min(100, Math.round((dailyProtein / targetProtein) * 100));
  const carbsPercent = Math.min(100, Math.round((dailyCarbs / targetCarbs) * 100));
  const fatPercent = Math.min(100, Math.round((dailyFat / targetFat) * 100));
  const waterPercent = Math.min(100, Math.round((waterLiters / (userProfile.waterTargetLiters || 2.8)) * 100));

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* Hero Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-linear-to-br from-emerald-800 via-emerald-900 to-teal-950 text-white p-6 sm:p-10 shadow-xl shadow-emerald-950/20">
        <div className="relative z-10 max-w-2xl space-y-3 sm:space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-200 text-xs font-semibold backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5 text-emerald-300" />
            <span>Multimodal Gemini 3.8 Flash Engine Active</span>
          </div>

          <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
            Welcome back, {userProfile.name.split(' ')[0]}!
          </h2>

          <p className="text-sm sm:text-base text-emerald-100/90 leading-relaxed">
            Your all-in-one AI food companion. Scan dishes for instant macros, detect produce freshness, audit kitchen hygiene standards, cook with ingredients in your pantry, and personalize your nutrition journey.
          </p>

          <div className="flex flex-wrap gap-3 pt-2">
            <button
              onClick={() => onNavigate('recognition')}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-xs sm:text-sm shadow-lg shadow-emerald-500/25 transition-all hover:scale-102"
            >
              <ScanLine className="w-4 h-4" />
              Recognize Food Photo
            </button>
            <button
              onClick={() => onNavigate('cooking')}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-xl text-xs sm:text-sm border border-white/20 backdrop-blur-md transition-colors"
            >
              <ChefHat className="w-4 h-4" />
              Cooking Assistant
            </button>
          </div>
        </div>

        {/* Decorative background accents */}
        <div className="absolute right-0 top-0 w-80 h-80 bg-emerald-400/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute right-12 bottom-0 w-60 h-60 bg-teal-500/15 rounded-full blur-2xl pointer-events-none" />
      </div>

      {/* Daily Nutrition Summary Cards */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-slate-900">Today's Nutrition Summary</h3>
            <p className="text-xs text-slate-500">Live tracker synced with your biometric goals</p>
          </div>
          <button
            onClick={() => onNavigate('tracker')}
            className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
          >
            <span>Full Log</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Calories Card */}
          <div className="p-4 sm:p-5 rounded-2xl bg-white border border-emerald-900/10 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-500">Energy Intake</span>
              <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                <Flame className="w-4 h-4" />
              </div>
            </div>
            <div>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-extrabold text-slate-900">{dailyCalories}</span>
                <span className="text-xs text-slate-400 font-medium">/ {targetCals} kcal</span>
              </div>
              <div className="mt-2.5 w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-amber-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${calPercent}%` }}
                />
              </div>
              <span className="text-[10px] text-slate-400 mt-1 block">
                {targetCals - dailyCalories > 0 ? `${targetCals - dailyCalories} kcal remaining` : 'Target reached!'}
              </span>
            </div>
          </div>

          {/* Protein Card */}
          <div className="p-4 sm:p-5 rounded-2xl bg-white border border-emerald-900/10 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-500">Protein</span>
              <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                {proteinPercent}%
              </span>
            </div>
            <div>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-extrabold text-slate-900">{dailyProtein}</span>
                <span className="text-xs text-slate-400 font-medium">/ {targetProtein}g</span>
              </div>
              <div className="mt-2.5 w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-emerald-600 h-full rounded-full transition-all duration-500"
                  style={{ width: `${proteinPercent}%` }}
                />
              </div>
              <span className="text-[10px] text-slate-400 mt-1 block">Muscle recovery target</span>
            </div>
          </div>

          {/* Carbs Card */}
          <div className="p-4 sm:p-5 rounded-2xl bg-white border border-emerald-900/10 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-500">Carbohydrates</span>
              <span className="text-[11px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full">
                {carbsPercent}%
              </span>
            </div>
            <div>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-extrabold text-slate-900">{dailyCarbs}</span>
                <span className="text-xs text-slate-400 font-medium">/ {targetCarbs}g</span>
              </div>
              <div className="mt-2.5 w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-amber-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${carbsPercent}%` }}
                />
              </div>
              <span className="text-[10px] text-slate-400 mt-1 block">Glycogen & daily energy</span>
            </div>
          </div>

          {/* Fat Card */}
          <div className="p-4 sm:p-5 rounded-2xl bg-white border border-emerald-900/10 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-500">Healthy Fats</span>
              <span className="text-[11px] font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded-full">
                {fatPercent}%
              </span>
            </div>
            <div>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-extrabold text-slate-900">{dailyFat}</span>
                <span className="text-xs text-slate-400 font-medium">/ {targetFat}g</span>
              </div>
              <div className="mt-2.5 w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-teal-600 h-full rounded-full transition-all duration-500"
                  style={{ width: `${fatPercent}%` }}
                />
              </div>
              <span className="text-[10px] text-slate-400 mt-1 block">Hormone & cell support</span>
            </div>
          </div>

          {/* Water Intake Card */}
          <div className="p-4 sm:p-5 rounded-2xl bg-white border border-emerald-900/10 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-500">Hydration</span>
              <button
                type="button"
                onClick={onAddWater}
                className="w-7 h-7 rounded-lg bg-sky-100 hover:bg-sky-200 text-sky-700 flex items-center justify-center text-xs font-bold transition-colors"
                title="Add 250ml"
              >
                +
              </button>
            </div>
            <div>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-extrabold text-sky-900">{waterLiters.toFixed(1)}</span>
                <span className="text-xs text-slate-400 font-medium">/ {userProfile.waterTargetLiters}L</span>
              </div>
              <div className="mt-2.5 w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-sky-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${waterPercent}%` }}
                />
              </div>
              <span className="text-[10px] text-sky-600 mt-1 block font-medium">
                {waterPercent}% of hydration goal
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 5 Core AI Modules Quick-Access Cards */}
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-bold text-slate-900">AI Intelligence Modules</h3>
          <p className="text-xs text-slate-500">Explore computer vision and generative food intelligence</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {/* Module 1: AI Food Recognition */}
          <div
            onClick={() => onNavigate('recognition')}
            className="group cursor-pointer rounded-2xl bg-white border border-emerald-900/10 p-5 hover:border-emerald-500 hover:shadow-lg transition-all flex flex-col justify-between space-y-4"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <ScanLine className="w-6 h-6" />
                </div>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  Multimodal Vision
                </span>
              </div>
              <div>
                <h4 className="font-bold text-slate-900 text-base group-hover:text-emerald-700 transition-colors">
                  AI Food Recognition
                </h4>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  Upload food pictures or snap photos to identify dishes, estimate calories, calculate protein/carb/fat macros, and inspect identifiable ingredients.
                </p>
              </div>
            </div>
            <div className="flex items-center justify-between text-xs font-semibold text-emerald-700 pt-3 border-t border-slate-100">
              <span>Scan Dish</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </div>
          </div>

          {/* Module 2: Food Freshness Detection */}
          <div
            onClick={() => onNavigate('freshness')}
            className="group cursor-pointer rounded-2xl bg-white border border-emerald-900/10 p-5 hover:border-emerald-500 hover:shadow-lg transition-all flex flex-col justify-between space-y-4"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <Apple className="w-6 h-6" />
                </div>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                  Freshness Radar
                </span>
              </div>
              <div>
                <h4 className="font-bold text-slate-900 text-base group-hover:text-amber-700 transition-colors">
                  Food Freshness Detection
                </h4>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  Analyze fruits, vegetables, and leftovers for signs of aging, discoloration, and mold. Receive shelf-life estimates and smart zero-waste rescue recipes.
                </p>
              </div>
            </div>
            <div className="flex items-center justify-between text-xs font-semibold text-amber-700 pt-3 border-t border-slate-100">
              <span>Check Freshness</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </div>
          </div>

          {/* Module 3: Restaurant Hygiene Monitoring */}
          <div
            onClick={() => onNavigate('hygiene')}
            className="group cursor-pointer rounded-2xl bg-white border border-emerald-900/10 p-5 hover:border-emerald-500 hover:shadow-lg transition-all flex flex-col justify-between space-y-4"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-2xl bg-teal-100 text-teal-700 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-teal-50 text-teal-700 border border-teal-200">
                  Safety Audit
                </span>
              </div>
              <div>
                <h4 className="font-bold text-slate-900 text-base group-hover:text-teal-700 transition-colors">
                  Restaurant Hygiene Monitor
                </h4>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  Upload kitchen photos or videos to audit visible prep practices, uncover storage risks, PPE compliance, and surface cleanliness observations.
                </p>
              </div>
            </div>
            <div className="flex items-center justify-between text-xs font-semibold text-teal-700 pt-3 border-t border-slate-100">
              <span>Audit Kitchen</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </div>
          </div>

          {/* Module 4: Smart AI Cooking Assistant */}
          <div
            onClick={() => onNavigate('cooking')}
            className="group cursor-pointer rounded-2xl bg-white border border-emerald-900/10 p-5 hover:border-emerald-500 hover:shadow-lg transition-all flex flex-col justify-between space-y-4"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-2xl bg-orange-100 text-orange-700 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <ChefHat className="w-6 h-6" />
                </div>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-orange-50 text-orange-700 border border-orange-200">
                  Pantry Recipe AI
                </span>
              </div>
              <div>
                <h4 className="font-bold text-slate-900 text-base group-hover:text-orange-700 transition-colors">
                  Smart AI Cooking Assistant
                </h4>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  Enter available pantry ingredients to generate step-by-step recipes with cooking timers, substitution tables, and an interactive chef chat.
                </p>
              </div>
            </div>
            <div className="flex items-center justify-between text-xs font-semibold text-orange-700 pt-3 border-t border-slate-100">
              <span>Cook from Pantry</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </div>
          </div>

          {/* Module 5: Personalized Nutrition Planner */}
          <div
            onClick={() => onNavigate('planner')}
            className="group cursor-pointer rounded-2xl bg-white border border-emerald-900/10 p-5 hover:border-emerald-500 hover:shadow-lg transition-all flex flex-col justify-between space-y-4"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <CalendarDays className="w-6 h-6" />
                </div>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                  Tailored Plan
                </span>
              </div>
              <div>
                <h4 className="font-bold text-slate-900 text-base group-hover:text-emerald-800 transition-colors">
                  Personalized Nutrition Planner
                </h4>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  Calculate BMR & TDEE based on your biometrics. Generate breakfast, lunch, dinner, and snack meal plans with grocery shopping lists.
                </p>
              </div>
            </div>
            <div className="flex items-center justify-between text-xs font-semibold text-emerald-800 pt-3 border-t border-slate-100">
              <span>Generate Meal Plan</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </div>
          </div>

          {/* Food History & Analytics */}
          <div
            onClick={() => onNavigate('history')}
            className="group cursor-pointer rounded-2xl bg-linear-to-br from-emerald-50 to-teal-50/50 border border-emerald-200/60 p-5 hover:border-emerald-400 hover:shadow-lg transition-all flex flex-col justify-between space-y-4"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-2xl bg-white text-emerald-700 flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
                  <Activity className="w-6 h-6" />
                </div>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-white text-emerald-800 border border-emerald-200">
                  {recentHistory.length} Scans Saved
                </span>
              </div>
              <div>
                <h4 className="font-bold text-slate-900 text-base group-hover:text-emerald-700 transition-colors">
                  Food History & Logs
                </h4>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  Review all past nutritional visual scans, freshness diagnostics, kitchen hygiene audits, and saved recipes in one unified ledger.
                </p>
              </div>
            </div>
            <div className="flex items-center justify-between text-xs font-semibold text-emerald-700 pt-3 border-t border-emerald-100">
              <span>View History</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </div>
          </div>
        </div>
      </div>

      {/* Visual Analytics & Recent Scans */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Macronutrient Balance Visual Breakdown */}
        <div className="p-5 rounded-2xl bg-white border border-emerald-900/10 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-slate-900 text-sm">Macronutrient Distribution</h4>
            <span className="text-xs text-slate-400 font-medium">Logged today</span>
          </div>

          <div className="flex items-center justify-center py-4">
            <div className="relative w-40 h-40 flex items-center justify-center">
              {/* Circular SVG Ring */}
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="38"
                  fill="transparent"
                  stroke="#f1f5f9"
                  strokeWidth="10"
                />
                {/* Protein Segment */}
                <circle
                  cx="50"
                  cy="50"
                  r="38"
                  fill="transparent"
                  stroke="#059669"
                  strokeWidth="10"
                  strokeDasharray="238.76"
                  strokeDashoffset={238.76 - (238.76 * (dailyProtein * 4)) / Math.max(1, dailyCalories)}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute flex flex-col items-center">
                <span className="text-xs text-slate-400 font-medium">Total</span>
                <span className="text-xl font-extrabold text-slate-900">{dailyCalories}</span>
                <span className="text-[10px] text-slate-500">kcal</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 text-center pt-2 border-t border-slate-100 text-xs">
            <div className="p-2 rounded-xl bg-emerald-50/60">
              <span className="block text-emerald-700 font-bold">{dailyProtein}g</span>
              <span className="text-[10px] text-slate-500">Protein</span>
            </div>
            <div className="p-2 rounded-xl bg-amber-50/60">
              <span className="block text-amber-700 font-bold">{dailyCarbs}g</span>
              <span className="text-[10px] text-slate-500">Carbs</span>
            </div>
            <div className="p-2 rounded-xl bg-teal-50/60">
              <span className="block text-teal-700 font-bold">{dailyFat}g</span>
              <span className="text-[10px] text-slate-500">Fat</span>
            </div>
          </div>
        </div>

        {/* Recent Analysis History Feed */}
        <div className="lg:col-span-2 p-5 rounded-2xl bg-white border border-emerald-900/10 shadow-xs flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-slate-900 text-sm">Recent Intelligence Scans</h4>
            <button
              onClick={() => onNavigate('history')}
              className="text-xs font-semibold text-emerald-700 hover:underline"
            >
              View All ({recentHistory.length})
            </button>
          </div>

          <div className="space-y-3">
            {recentHistory.slice(0, 3).map((item) => (
              <div
                key={item.id}
                onClick={() => onNavigate(item.type === 'recognition' ? 'recognition' : item.type === 'freshness' ? 'freshness' : 'hygiene')}
                className="group flex items-center justify-between p-3 rounded-xl border border-slate-100 hover:border-emerald-300 hover:bg-emerald-50/30 transition-all cursor-pointer"
              >
                <div className="flex items-center gap-3 min-w-0">
                  {item.imageThumbnail ? (
                    <img
                      src={item.imageThumbnail}
                      alt={item.title}
                      className="w-12 h-12 rounded-xl object-cover shrink-0 border border-slate-100"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                      <ScanLine className="w-5 h-5" />
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-800 truncate group-hover:text-emerald-700 transition-colors">
                      {item.title}
                    </p>
                    <p className="text-[11px] text-slate-500 truncate">
                      {item.subtitle}
                    </p>
                  </div>
                </div>

                <div className="text-right shrink-0 ml-3">
                  {item.badge && (
                    <span className="inline-block text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                      {item.badge}
                    </span>
                  )}
                  <span className="block text-[10px] text-slate-400 mt-1">
                    {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Multimodal AI Vision ready for new uploads</span>
            </span>
            <button
              onClick={onOpenQuickScan}
              className="text-emerald-700 font-semibold hover:underline"
            >
              + Quick Scan
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
