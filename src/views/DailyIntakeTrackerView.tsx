import React, { useState } from 'react';
import {
  Activity,
  Flame,
  Plus,
  Trash2,
  Droplets,
  Clock,
  Sparkles,
  Utensils,
  CheckCircle2,
} from 'lucide-react';
import { FoodIntakeItem, UserProfile } from '../types/foodverse';
import { addIntakeItem, saveIntakeItems } from '../services/storage';

interface Props {
  intakeItems: FoodIntakeItem[];
  onUpdateIntake: (items: FoodIntakeItem[]) => void;
  userProfile: UserProfile;
  waterLiters: number;
  onAddWater: (amount?: number) => void;
  onResetWater: () => void;
}

export const DailyIntakeTrackerView: React.FC<Props> = ({
  intakeItems,
  onUpdateIntake,
  userProfile,
  waterLiters,
  onAddWater,
  onResetWater,
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [newMeal, setNewMeal] = useState({
    title: '',
    mealType: 'Snack' as FoodIntakeItem['mealType'],
    calories: 250,
    protein: 15,
    carbs: 25,
    fat: 8,
  });

  const totalCalories = intakeItems.reduce((sum, item) => sum + item.calories, 0);
  const totalProtein = intakeItems.reduce((sum, item) => sum + item.protein, 0);
  const totalCarbs = intakeItems.reduce((sum, item) => sum + item.carbs, 0);
  const totalFat = intakeItems.reduce((sum, item) => sum + item.fat, 0);

  const targetCals = userProfile.targetDailyCalories || 2150;
  const targetProtein = 140;
  const targetCarbs = 210;
  const targetFat = 65;

  const handleAddCustomMeal = () => {
    if (!newMeal.title.trim()) return;

    const created = addIntakeItem({
      title: newMeal.title,
      mealType: newMeal.mealType,
      calories: Number(newMeal.calories),
      protein: Number(newMeal.protein),
      carbs: Number(newMeal.carbs),
      fat: Number(newMeal.fat),
    });

    onUpdateIntake([created, ...intakeItems]);
    setShowAddModal(false);
    setNewMeal({
      title: '',
      mealType: 'Snack',
      calories: 250,
      protein: 15,
      carbs: 25,
      fat: 8,
    });
  };

  const handleDeleteItem = (id: string) => {
    const updated = intakeItems.filter((item) => item.id !== id);
    saveIntakeItems(updated);
    onUpdateIntake(updated);
  };

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* Header */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-emerald-900/10 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold">
              <Activity className="w-3.5 h-3.5 text-emerald-600" />
              <span>Nutrition Ledger & Journal</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              Daily Food & Hydration Tracker
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 max-w-2xl">
              Track calories, macronutrients, and water intake in real time. Items logged from AI Food Recognition and meal plans automatically sync here.
            </p>
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-bold rounded-xl shadow-sm transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Add Manual Entry</span>
          </button>
        </div>
      </div>

      {/* Progress Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Calories Card */}
        <div className="p-5 rounded-3xl bg-white border border-emerald-900/10 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Energy Balance</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Flame className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-3xl font-extrabold text-slate-900">{totalCalories}</span>
              <span className="text-xs text-slate-400 font-medium">/ {targetCals} kcal</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-2.5 mt-3 overflow-hidden">
              <div
                className="bg-amber-500 h-full rounded-full transition-all"
                style={{ width: `${Math.min(100, (totalCalories / targetCals) * 100)}%` }}
              />
            </div>
          </div>
        </div>

        {/* Protein Card */}
        <div className="p-5 rounded-3xl bg-white border border-emerald-900/10 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Protein Target</span>
            <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full">
              {Math.round((totalProtein / targetProtein) * 100)}%
            </span>
          </div>
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-3xl font-extrabold text-slate-900">{totalProtein}g</span>
              <span className="text-xs text-slate-400 font-medium">/ {targetProtein}g</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-2.5 mt-3 overflow-hidden">
              <div
                className="bg-emerald-600 h-full rounded-full transition-all"
                style={{ width: `${Math.min(100, (totalProtein / targetProtein) * 100)}%` }}
              />
            </div>
          </div>
        </div>

        {/* Carbs & Fats Split */}
        <div className="p-5 rounded-3xl bg-white border border-emerald-900/10 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Carbs & Fat</span>
            <span className="text-xs text-slate-400">Grams logged</span>
          </div>
          <div className="space-y-2 text-xs">
            <div>
              <div className="flex justify-between font-semibold mb-1">
                <span className="text-amber-800">Carbs: {totalCarbs}g</span>
                <span className="text-slate-400">{targetCarbs}g goal</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                <div
                  className="bg-amber-500 h-full rounded-full"
                  style={{ width: `${Math.min(100, (totalCarbs / targetCarbs) * 100)}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between font-semibold mb-1">
                <span className="text-teal-800">Fat: {totalFat}g</span>
                <span className="text-slate-400">{targetFat}g goal</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                <div
                  className="bg-teal-600 h-full rounded-full"
                  style={{ width: `${Math.min(100, (totalFat / targetFat) * 100)}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Hydration Tracker */}
        <div className="p-5 rounded-3xl bg-white border border-emerald-900/10 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Hydration</span>
            <button
              onClick={onResetWater}
              className="text-[10px] text-slate-400 hover:text-slate-600 font-semibold"
            >
              Reset
            </button>
          </div>
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-3xl font-extrabold text-sky-900">{waterLiters.toFixed(2)}</span>
              <span className="text-xs text-slate-400 font-medium">/ {userProfile.waterTargetLiters} L</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-2.5 mt-3 overflow-hidden">
              <div
                className="bg-sky-500 h-full rounded-full transition-all"
                style={{ width: `${Math.min(100, (waterLiters / (userProfile.waterTargetLiters || 2.8)) * 100)}%` }}
              />
            </div>
            <div className="flex gap-2 mt-3">
              <button
                type="button"
                onClick={() => onAddWater(0.25)}
                className="flex-1 py-1.5 text-center text-xs font-bold bg-sky-50 hover:bg-sky-100 text-sky-800 border border-sky-200 rounded-xl transition-colors"
              >
                +250ml
              </button>
              <button
                type="button"
                onClick={() => onAddWater(0.5)}
                className="flex-1 py-1.5 text-center text-xs font-bold bg-sky-50 hover:bg-sky-100 text-sky-800 border border-sky-200 rounded-xl transition-colors"
              >
                +500ml
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Logged Meals List */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-emerald-900/10 shadow-xs space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-slate-900 text-base">Today's Meal Entries</h3>
            <p className="text-xs text-slate-500">{intakeItems.length} meals recorded</p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="text-xs font-semibold text-emerald-700 hover:underline"
          >
            + Quick Add
          </button>
        </div>

        {intakeItems.length > 0 ? (
          <div className="divide-y divide-slate-100">
            {intakeItems.map((item) => (
              <div
                key={item.id}
                className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-2xl bg-[#faf8f5] border border-slate-200 text-emerald-700 flex items-center justify-center shrink-0">
                    <Utensils className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 text-sm">{item.title}</span>
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 font-semibold text-[10px]">
                        {item.mealType}
                      </span>
                    </div>
                    <span className="text-slate-400 text-[11px] flex items-center gap-1 mt-0.5">
                      <Clock className="w-3 h-3" />
                      {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-4 sm:ml-auto">
                  <div className="flex items-center gap-3 text-slate-600">
                    <span className="font-extrabold text-slate-900 text-sm">{item.calories} kcal</span>
                    <span className="text-slate-400">•</span>
                    <span>P: <strong className="text-slate-800">{item.protein}g</strong></span>
                    <span>C: <strong className="text-slate-800">{item.carbs}g</strong></span>
                    <span>F: <strong className="text-slate-800">{item.fat}g</strong></span>
                  </div>

                  <button
                    onClick={() => handleDeleteItem(item.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 transition-colors rounded-lg hover:bg-rose-50"
                    title="Delete entry"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-10 space-y-2">
            <Utensils className="w-10 h-10 text-slate-300 mx-auto stroke-1" />
            <p className="text-xs text-slate-500">No meals logged today yet.</p>
            <p className="text-[11px] text-slate-400">
              Scan a dish with AI Food Recognition or use the "+ Add Manual Entry" button.
            </p>
          </div>
        )}
      </div>

      {/* Manual Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full border border-slate-200 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-base">Log Custom Meal</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-700"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-700 font-medium mb-1">Meal Title</label>
                <input
                  type="text"
                  value={newMeal.title}
                  onChange={(e) => setNewMeal({ ...newMeal, title: e.target.value })}
                  placeholder="e.g. Scrambled Eggs with Sourdough Toast"
                  className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">Meal Type</label>
                <select
                  value={newMeal.mealType}
                  onChange={(e) => setNewMeal({ ...newMeal, mealType: e.target.value as any })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50"
                >
                  <option value="Breakfast">Breakfast</option>
                  <option value="Lunch">Lunch</option>
                  <option value="Dinner">Dinner</option>
                  <option value="Snack">Snack</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-medium mb-1">Calories (kcal)</label>
                  <input
                    type="number"
                    value={newMeal.calories}
                    onChange={(e) => setNewMeal({ ...newMeal, calories: Number(e.target.value) })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-medium mb-1">Protein (g)</label>
                  <input
                    type="number"
                    value={newMeal.protein}
                    onChange={(e) => setNewMeal({ ...newMeal, protein: Number(e.target.value) })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-medium mb-1">Carbs (g)</label>
                  <input
                    type="number"
                    value={newMeal.carbs}
                    onChange={(e) => setNewMeal({ ...newMeal, carbs: Number(e.target.value) })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-medium mb-1">Fat (g)</label>
                  <input
                    type="number"
                    value={newMeal.fat}
                    onChange={(e) => setNewMeal({ ...newMeal, fat: Number(e.target.value) })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50"
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={!newMeal.title.trim()}
                onClick={handleAddCustomMeal}
                className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-bold"
              >
                Add Meal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
