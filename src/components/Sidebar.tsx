import React from 'react';
import {
  LayoutDashboard,
  ScanLine,
  Apple,
  ShieldCheck,
  ChefHat,
  CalendarDays,
  History,
  User,
  Settings,
  Sparkles,
  Camera,
  X,
  Activity,
} from 'lucide-react';
import { ModuleType } from '../types/foodverse';

interface Props {
  activeModule: ModuleType;
  onSelectModule: (module: ModuleType) => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
  onOpenQuickScan: () => void;
}

export const Sidebar: React.FC<Props> = ({
  activeModule,
  onSelectModule,
  mobileOpen,
  onCloseMobile,
  onOpenQuickScan,
}) => {
  const navItems: Array<{
    id: ModuleType;
    label: string;
    icon: React.ReactNode;
    badge?: string;
    description: string;
  }> = [
    {
      id: 'home',
      label: 'Home Dashboard',
      icon: <LayoutDashboard className="w-5 h-5" />,
      description: 'Platform overview & analytics',
    },
    {
      id: 'recognition',
      label: 'Food Recognition',
      icon: <ScanLine className="w-5 h-5" />,
      badge: 'Vision AI',
      description: 'Dish, calories & macros',
    },
    {
      id: 'freshness',
      label: 'Freshness Detection',
      icon: <Apple className="w-5 h-5" />,
      badge: 'Quality',
      description: 'Spoilage & shelf-life check',
    },
    {
      id: 'hygiene',
      label: 'Restaurant Hygiene',
      icon: <ShieldCheck className="w-5 h-5" />,
      badge: 'Audit',
      description: 'Kitchen safety & observation',
    },
    {
      id: 'cooking',
      label: 'AI Cooking Assistant',
      icon: <ChefHat className="w-5 h-5" />,
      badge: 'Chef AI',
      description: 'Recipes & culinary chat',
    },
    {
      id: 'planner',
      label: 'Nutrition Planner',
      icon: <CalendarDays className="w-5 h-5" />,
      badge: 'Tailored',
      description: 'Personalized meal plans',
    },
    {
      id: 'tracker',
      label: 'Daily Intake Log',
      icon: <Activity className="w-5 h-5" />,
      description: 'Calories, macros & water',
    },
    {
      id: 'history',
      label: 'Food History',
      icon: <History className="w-5 h-5" />,
      description: 'Saved scans & audits',
    },
    {
      id: 'profile',
      label: 'User Profile & Goals',
      icon: <User className="w-5 h-5" />,
      description: 'Biometrics & preferences',
    },
  ];

  const handleNavClick = (id: ModuleType) => {
    onSelectModule(id);
    onCloseMobile();
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-xs lg:hidden transition-opacity"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed lg:sticky top-0 left-0 z-50 h-screen w-72 bg-[#fdfbf7] border-r border-emerald-900/10 flex flex-col justify-between transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          mobileOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="p-5 border-b border-emerald-900/5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-linear-to-br from-emerald-600 to-teal-700 text-white flex items-center justify-center shadow-md shadow-emerald-700/20">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-slate-900 tracking-tight text-lg">
                  FoodVerse
                </span>
                <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-1.5 py-0.5 rounded-md uppercase tracking-wider">
                  AI
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium">
                Multimodal Food Intelligence
              </p>
            </div>
          </div>
          <button
            onClick={onCloseMobile}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 lg:hidden"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Action Button */}
        <div className="px-4 pt-4 pb-2">
          <button
            onClick={() => {
              onOpenQuickScan();
              onCloseMobile();
            }}
            className="w-full flex items-center justify-center gap-2.5 py-2.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-medium text-xs shadow-sm shadow-emerald-700/20 transition-all hover:scale-[1.01] active:scale-[0.99]"
          >
            <Camera className="w-4 h-4" />
            <span>Instant Camera Scan</span>
          </button>
        </div>

        {/* Navigation list */}
        <div className="flex-1 overflow-y-auto px-3 py-2 space-y-1">
          <div className="px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Intelligence Modules
          </div>

          {navItems.map((item) => {
            const isActive = activeModule === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-left text-xs font-medium transition-all group ${
                  isActive
                    ? 'bg-emerald-800 text-white shadow-sm'
                    : 'text-slate-700 hover:bg-emerald-50/80 hover:text-emerald-900'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`${
                      isActive
                        ? 'text-white'
                        : 'text-emerald-700 group-hover:text-emerald-800'
                    }`}
                  >
                    {item.icon}
                  </div>
                  <div className="truncate">
                    <span className="block truncate text-xs">{item.label}</span>
                    <span
                      className={`block truncate text-[10px] ${
                        isActive ? 'text-emerald-200' : 'text-slate-400'
                      }`}
                    >
                      {item.description}
                    </span>
                  </div>
                </div>

                {item.badge && (
                  <span
                    className={`ml-2 text-[10px] font-semibold px-1.5 py-0.5 rounded ${
                      isActive
                        ? 'bg-emerald-900 text-emerald-100'
                        : 'bg-emerald-100 text-emerald-800'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Gemini Engine Footer info */}
        <div className="p-4 border-t border-emerald-900/5 bg-emerald-50/40">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 text-xs font-bold">
              AM
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-slate-800 truncate">
                Alex Morgan
              </p>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[10px] text-emerald-700 font-medium">
                  Gemini 3.8 Flash Active
                </span>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
