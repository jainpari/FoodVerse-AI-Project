import React, { useState } from 'react';
import {
  CalendarDays,
  Sparkles,
  RefreshCw,
  Flame,
  Droplets,
  ShoppingCart,
  CheckCircle2,
  Clock,
  Printer,
  ChevronRight,
  AlertCircle,
  Dumbbell,
  Heart,
  Scale,
  Plus,
} from 'lucide-react';
import { NutritionPlanResult, UserProfile } from '../types/foodverse';
import { generateNutritionPlan } from '../services/api';
import { addIntakeItem, saveUserProfile } from '../services/storage';

interface Props {
  userProfile: UserProfile;
  onUpdateProfile: (updated: UserProfile) => void;
  onIntakeAdded?: () => void;
}

export const NutritionPlannerView: React.FC<Props> = ({
  userProfile,
  onUpdateProfile,
  onIntakeAdded,
}) => {
  const [formData, setFormData] = useState({
    age: userProfile.age || 28,
    gender: userProfile.gender || 'Female',
    heightCm: userProfile.heightCm || 172,
    weightKg: userProfile.weightKg || 64,
    activityLevel: userProfile.activityLevel || 'Moderate (3-5 days/wk)',
    goal: userProfile.goal || 'Lean Muscle Gain',
    dietaryPreference: userProfile.dietaryPreference || 'Omnivore',
    allergies: userProfile.allergies.join(', ') || 'Peanuts (Mild)',
    mealsPerDay: 4,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [planResult, setPlanResult] = useState<NutritionPlanResult | null>(null);
  const [checkedGroceryItems, setCheckedGroceryItems] = useState<Record<string, boolean>>({});

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleGeneratePlan = async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await generateNutritionPlan(formData);
      setPlanResult(data);

      // Update user target calories in profile
      const updated: UserProfile = {
        ...userProfile,
        age: Number(formData.age),
        gender: formData.gender as any,
        heightCm: Number(formData.heightCm),
        weightKg: Number(formData.weightKg),
        activityLevel: formData.activityLevel as any,
        goal: formData.goal as any,
        dietaryPreference: formData.dietaryPreference as any,
        targetDailyCalories: data.energyCalculation.targetDailyCalories,
        waterTargetLiters: data.targetMacronutrients.waterIntakeLiters,
      };
      onUpdateProfile(updated);
      saveUserProfile(updated);
    } catch (err: any) {
      setError(err.message || 'Failed to generate personalized nutrition plan.');
    } finally {
      setLoading(false);
    }
  };

  const toggleGroceryItem = (item: string) => {
    setCheckedGroceryItems((prev) => ({
      ...prev,
      [item]: !prev[item],
    }));
  };

  const handleLogMealToTracker = (meal: any) => {
    const p = parseInt(meal.macros.protein) || 25;
    const c = parseInt(meal.macros.carbs) || 35;
    const f = parseInt(meal.macros.fat) || 12;

    addIntakeItem({
      title: meal.title,
      mealType: meal.mealType.includes('Breakfast')
        ? 'Breakfast'
        : meal.mealType.includes('Lunch')
        ? 'Lunch'
        : meal.mealType.includes('Dinner')
        ? 'Dinner'
        : 'Snack',
      calories: meal.calories,
      protein: p,
      carbs: c,
      fat: f,
    });

    if (onIntakeAdded) onIntakeAdded();
  };

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* Banner */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-emerald-900/10 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold">
              <CalendarDays className="w-3.5 h-3.5 text-emerald-600" />
              <span>Biometric Sports Nutritionist AI</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              Personalized Nutrition & Meal Planner
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 max-w-2xl">
              Calculate clinical BMR & TDEE based on your body biometrics. Receive tailored macro targets, daily meal plans, and auto-generated smart grocery lists.
            </p>
          </div>

          <button
            onClick={handleGeneratePlan}
            disabled={loading}
            className="flex items-center gap-2 px-5 py-3 bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white text-xs sm:text-sm font-bold rounded-xl shadow-md shadow-emerald-900/20 transition-all shrink-0"
          >
            <Sparkles className="w-4 h-4" />
            <span>{loading ? 'Calculating Plan...' : 'Generate AI Plan'}</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Parameters Form & Results */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Biometric Parameters Form */}
        <div className="lg:col-span-4 space-y-5">
          <div className="bg-white rounded-3xl p-6 border border-emerald-900/10 shadow-xs space-y-4">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <Scale className="w-4 h-4 text-emerald-700" />
              <span>Biometric Parameters</span>
            </h3>

            {/* Age & Gender */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block text-slate-700 font-medium mb-1">Age</label>
                <input
                  type="number"
                  value={formData.age}
                  onChange={(e) => handleInputChange('age', e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">Biological Sex</label>
                <select
                  value={formData.gender}
                  onChange={(e) => handleInputChange('gender', e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50"
                >
                  <option value="Female">Female</option>
                  <option value="Male">Male</option>
                  <option value="Other">Non-binary</option>
                </select>
              </div>
            </div>

            {/* Height & Weight */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block text-slate-700 font-medium mb-1">Height (cm)</label>
                <input
                  type="number"
                  value={formData.heightCm}
                  onChange={(e) => handleInputChange('heightCm', e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">Weight (kg)</label>
                <input
                  type="number"
                  value={formData.weightKg}
                  onChange={(e) => handleInputChange('weightKg', e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50"
                />
              </div>
            </div>

            {/* Fitness Goal */}
            <div className="text-xs space-y-1">
              <label className="block text-slate-700 font-medium">Primary Health Goal</label>
              <select
                value={formData.goal}
                onChange={(e) => handleInputChange('goal', e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50"
              >
                <option value="Weight Loss">Fat Loss & Calorie Deficit</option>
                <option value="Lean Muscle Gain">Lean Muscle Hypertrophy</option>
                <option value="Maintenance & Longevity">Maintenance & Cellular Longevity</option>
                <option value="Athletic Performance">Endurance & Athletic Output</option>
                <option value="Heart Health">Cardiovascular & Blood Pressure</option>
              </select>
            </div>

            {/* Activity Level */}
            <div className="text-xs space-y-1">
              <label className="block text-slate-700 font-medium">Daily Physical Activity</label>
              <select
                value={formData.activityLevel}
                onChange={(e) => handleInputChange('activityLevel', e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50"
              >
                <option value="Sedentary (Desk Job, little exercise)">Sedentary (Desk Job, little exercise)</option>
                <option value="Light (1-2 days/week)">Light (1-2 days/week light exercise)</option>
                <option value="Moderate (3-5 days/week)">Moderate (3-5 days/week workouts)</option>
                <option value="Very Active (6-7 days/week)">Very Active (Daily training)</option>
                <option value="Athlete / Physical Labor">Competitive Athlete / Physical Labor</option>
              </select>
            </div>

            {/* Dietary Preference */}
            <div className="text-xs space-y-1">
              <label className="block text-slate-700 font-medium">Dietary Lifestyle</label>
              <select
                value={formData.dietaryPreference}
                onChange={(e) => handleInputChange('dietaryPreference', e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50"
              >
                <option value="Omnivore">Balanced Omnivore</option>
                <option value="Vegetarian">Lacto-Ovo Vegetarian</option>
                <option value="Vegan">100% Plant-Based Vegan</option>
                <option value="Pescatarian">Pescatarian (Fish & Seafood)</option>
                <option value="Keto / Low-Carb">Keto / Very Low Carb</option>
                <option value="Mediterranean">Mediterranean Longevity Diet</option>
                <option value="Low-FODMAP">Low-FODMAP (Gut Sensitive)</option>
              </select>
            </div>

            {/* Allergies / Avoidances */}
            <div className="text-xs space-y-1">
              <label className="block text-slate-700 font-medium">Allergies & Intolerances</label>
              <input
                type="text"
                value={formData.allergies}
                onChange={(e) => handleInputChange('allergies', e.target.value)}
                placeholder="e.g. Peanuts, Dairy, Gluten, Shellfish"
                className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50"
              />
            </div>

            <button
              type="button"
              disabled={loading}
              onClick={handleGeneratePlan}
              className="w-full flex items-center justify-center gap-2 py-3 bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white rounded-xl text-xs sm:text-sm font-bold shadow-md shadow-emerald-900/20 transition-all mt-2"
            >
              <Sparkles className="w-4 h-4" />
              <span>{loading ? 'Crunching Macros...' : 'Calculate & Generate Plan'}</span>
            </button>

            {error && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Tailored Meal Plan & Targets */}
        <div className="lg:col-span-8 space-y-6">
          {planResult ? (
            <div className="space-y-6 animate-fade-in">
              {/* Energy Calculation Card */}
              <div className="bg-white rounded-3xl p-6 border border-emerald-900/10 shadow-xs space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-md">
                      Target Energy Calculation
                    </span>
                    <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 mt-1">
                      {planResult.clientProfileSummary}
                    </h3>
                  </div>

                  <div className="text-right">
                    <p className="text-[10px] uppercase font-bold text-slate-400">Target Calories</p>
                    <p className="text-2xl font-extrabold text-emerald-800">
                      {planResult.energyCalculation.targetDailyCalories}{' '}
                      <span className="text-xs font-normal text-slate-500">kcal/day</span>
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">
                      Basal Metabolic Rate (BMR)
                    </span>
                    <span className="text-base font-extrabold text-slate-900">
                      {planResult.energyCalculation.bmrCalories} kcal
                    </span>
                    <span className="text-[10px] text-slate-500 block">Resting baseline</span>
                  </div>

                  <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">
                      Total Energy Expenditure (TDEE)
                    </span>
                    <span className="text-base font-extrabold text-slate-900">
                      {planResult.energyCalculation.tdeeCalories} kcal
                    </span>
                    <span className="text-[10px] text-slate-500 block">With physical activity</span>
                  </div>

                  <div className="p-3 rounded-2xl bg-emerald-50/70 border border-emerald-100">
                    <span className="text-[10px] uppercase font-bold text-emerald-800 block mb-0.5">
                      Recommended Strategy
                    </span>
                    <span className="text-xs font-bold text-emerald-950 block">
                      {planResult.energyCalculation.calorieDeficitSurplus}
                    </span>
                  </div>
                </div>

                {/* Macro Target Meters */}
                <div className="space-y-2 pt-2 border-t border-slate-100">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Recommended Daily Macronutrient Split
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center text-xs">
                    <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-100">
                      <span className="text-emerald-800 font-bold block mb-1">Protein</span>
                      <span className="text-xl font-extrabold text-emerald-950">
                        {planResult.targetMacronutrients.protein.grams}g
                      </span>
                      <span className="text-[10px] text-emerald-700 block">
                        {planResult.targetMacronutrients.protein.percentage}% ({planResult.targetMacronutrients.protein.calories} kcal)
                      </span>
                    </div>

                    <div className="p-3 rounded-2xl bg-amber-50 border border-amber-100">
                      <span className="text-amber-800 font-bold block mb-1">Carbs</span>
                      <span className="text-xl font-extrabold text-amber-950">
                        {planResult.targetMacronutrients.carbohydrates.grams}g
                      </span>
                      <span className="text-[10px] text-amber-700 block">
                        {planResult.targetMacronutrients.carbohydrates.percentage}% ({planResult.targetMacronutrients.carbohydrates.calories} kcal)
                      </span>
                    </div>

                    <div className="p-3 rounded-2xl bg-teal-50 border border-teal-100">
                      <span className="text-teal-800 font-bold block mb-1">Healthy Fats</span>
                      <span className="text-xl font-extrabold text-teal-950">
                        {planResult.targetMacronutrients.fat.grams}g
                      </span>
                      <span className="text-[10px] text-teal-700 block">
                        {planResult.targetMacronutrients.fat.percentage}% ({planResult.targetMacronutrients.fat.calories} kcal)
                      </span>
                    </div>

                    <div className="p-3 rounded-2xl bg-sky-50 border border-sky-100">
                      <span className="text-sky-800 font-bold block mb-1">Hydration</span>
                      <span className="text-xl font-extrabold text-sky-950">
                        {planResult.targetMacronutrients.waterIntakeLiters}L
                      </span>
                      <span className="text-[10px] text-sky-700 block">
                        Fiber: {planResult.targetMacronutrients.fiber?.grams}g
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Daily Meal Schedule */}
              <div className="bg-white rounded-3xl p-6 border border-emerald-900/10 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-slate-900 text-base">
                    Customized Daily Meal Schedule
                  </h3>
                  <span className="text-xs text-slate-400 font-medium">4 Balanced Meals</span>
                </div>

                <div className="space-y-3">
                  {planResult.mealPlan.map((meal, idx) => (
                    <div
                      key={idx}
                      className="p-4 rounded-2xl bg-[#faf8f5] border border-slate-100 space-y-2 hover:border-emerald-300 transition-all text-xs"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="px-2.5 py-0.5 rounded-lg bg-emerald-100 text-emerald-800 font-bold text-[11px]">
                            {meal.mealType}
                          </span>
                          <span className="text-slate-400 text-[11px] flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {meal.time}
                          </span>
                          <span className="text-slate-400 text-[11px]">• {meal.prepTime}</span>
                        </div>

                        <div className="flex items-center gap-3">
                          <span className="font-bold text-amber-900 bg-amber-50 px-2 py-0.5 rounded-md">
                            {meal.calories} kcal
                          </span>
                          <button
                            type="button"
                            onClick={() => handleLogMealToTracker(meal)}
                            className="text-[11px] font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 hover:underline"
                          >
                            <Plus className="w-3 h-3" />
                            <span>Log Meal</span>
                          </button>
                        </div>
                      </div>

                      <p className="font-bold text-slate-900 text-sm">{meal.title}</p>
                      <p className="text-slate-600 leading-relaxed">{meal.description}</p>

                      <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-200/60 text-[11px]">
                        <div className="flex items-center gap-3 text-slate-500 font-medium">
                          <span>P: <strong className="text-slate-800">{meal.macros.protein}</strong></span>
                          <span>C: <strong className="text-slate-800">{meal.macros.carbs}</strong></span>
                          <span>F: <strong className="text-slate-800">{meal.macros.fat}</strong></span>
                        </div>

                        {meal.keyNutrients && (
                          <div className="flex flex-wrap gap-1">
                            {meal.keyNutrients.map((n, i) => (
                              <span key={i} className="px-2 py-0.5 bg-white border border-slate-200 rounded text-[10px] text-slate-600">
                                {n}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Smart Grocery Shopping List */}
              {planResult.groceryList?.length > 0 && (
                <div className="bg-white rounded-3xl p-6 border border-emerald-900/10 shadow-xs space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                      <ShoppingCart className="w-4 h-4 text-emerald-700" />
                      <span>Smart Meal Plan Grocery List</span>
                    </h3>
                    <span className="text-xs text-slate-400">Check off as you shop</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {planResult.groceryList.map((cat, idx) => (
                      <div key={idx} className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-2 text-xs">
                        <h4 className="font-bold text-slate-800 uppercase tracking-wider text-[11px] text-emerald-800">
                          {cat.category}
                        </h4>
                        <div className="space-y-1.5">
                          {cat.items.map((item, i) => {
                            const isChecked = Boolean(checkedGroceryItems[item]);
                            return (
                              <label
                                key={i}
                                onClick={() => toggleGroceryItem(item)}
                                className={`flex items-center gap-2 p-1.5 rounded-lg cursor-pointer transition-colors ${
                                  isChecked ? 'line-through text-slate-400 bg-emerald-50/50' : 'text-slate-700 hover:bg-white'
                                }`}
                              >
                                <input
                                  type="checkbox"
                                  checked={isChecked}
                                  onChange={() => {}}
                                  className="rounded text-emerald-600 focus:ring-emerald-500"
                                />
                                <span>{item}</span>
                              </label>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Nutritionist Clinical Advice */}
              {planResult.nutritionistAdvice?.length > 0 && (
                <div className="p-5 rounded-3xl bg-emerald-50/60 border border-emerald-100 space-y-2.5 text-xs">
                  <h4 className="font-bold text-emerald-900 text-sm flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-emerald-600" />
                    <span>Nutritionist Lifestyle Guidelines</span>
                  </h4>
                  <ul className="space-y-1.5 text-emerald-950">
                    {planResult.nutritionistAdvice.map((adv, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 mt-1.5 shrink-0" />
                        <span>{adv}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white rounded-3xl p-12 border border-emerald-900/10 shadow-xs text-center space-y-4">
              <div className="w-16 h-16 rounded-3xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
                <CalendarDays className="w-8 h-8" />
              </div>
              <div className="max-w-md mx-auto space-y-1">
                <h3 className="text-lg font-bold text-slate-900">
                  Ready to calculate your customized meal plan
                </h3>
                <p className="text-xs text-slate-500">
                  Configure your biometric stats on the left and click "Calculate & Generate Plan" to receive calibrated calorie targets, macros, and full daily recipes.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
