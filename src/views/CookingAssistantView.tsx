import React, { useState, useEffect, useRef } from 'react';
import {
  ChefHat,
  Sparkles,
  Plus,
  X,
  Clock,
  Flame,
  CheckCircle2,
  Send,
  MessageSquare,
  Play,
  Pause,
  RotateCcw,
  BookOpen,
  ArrowRight,
  AlertCircle,
  Lightbulb,
  Check,
} from 'lucide-react';
import { RecipeResult, ChatMessage } from '../types/foodverse';
import { generateRecipe, sendCookingChat } from '../services/api';
import { addHistoryItem } from '../services/storage';

const QUICK_PANTRY_ITEMS = [
  'Chicken Breast',
  'Garlic',
  'Olive Oil',
  'Baby Spinach',
  'Eggs',
  'Tomatoes',
  'Quinoa',
  'Avocado',
  'Onion',
  'Pasta',
  'Greek Yogurt',
  'Lemon',
  'Broccoli',
  'Mushrooms',
  'Tofu',
];

export const CookingAssistantView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'recipe' | 'chat'>('recipe');

  // Recipe Generator State
  const [ingredients, setIngredients] = useState<string[]>([
    'Chicken Breast',
    'Garlic',
    'Olive Oil',
    'Baby Spinach',
  ]);
  const [newIngredient, setNewIngredient] = useState('');
  const [dietaryFilter, setDietaryFilter] = useState('Standard / Balanced');
  const [mealType, setMealType] = useState('Quick Dinner');
  const [maxPrepTime, setMaxPrepTime] = useState(30);
  const [skillLevel, setSkillLevel] = useState('Easy to Intermediate');

  const [recipeLoading, setRecipeLoading] = useState(false);
  const [recipeError, setRecipeError] = useState<string | null>(null);
  const [recipeResult, setRecipeResult] = useState<RecipeResult | null>(null);

  // Active cooking timer state
  const [activeTimerSeconds, setActiveTimerSeconds] = useState<number | null>(null);
  const [timerRunning, setTimerRunning] = useState(false);
  const [timerStepTitle, setTimerStepTitle] = useState('');

  // Chef Chat State
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: 'msg-1',
      role: 'assistant',
      text: "Bonjour & Welcome! I am Chef FoodVerse, your culinary scientist and master kitchen guide. Ask me about ingredient substitutions, mastering kitchen techniques, fixing sauces, or balancing flavors!",
      suggestedQuestions: [
        'How can I substitute heavy cream with pantry staples?',
        'What temperature should a perfectly seared salmon fillet reach?',
        'How do I fix a soup that accidentally got too salty?',
      ],
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const chatBottomRef = useRef<HTMLDivElement | null>(null);

  // Timer interval
  useEffect(() => {
    let interval: any = null;
    if (timerRunning && activeTimerSeconds !== null && activeTimerSeconds > 0) {
      interval = setInterval(() => {
        setActiveTimerSeconds((prev) => (prev !== null && prev > 0 ? prev - 1 : 0));
      }, 1000);
    } else if (activeTimerSeconds === 0) {
      setTimerRunning(false);
    }
    return () => clearInterval(interval);
  }, [timerRunning, activeTimerSeconds]);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const handleAddIngredient = () => {
    const trimmed = newIngredient.trim();
    if (trimmed && !ingredients.includes(trimmed)) {
      setIngredients([...ingredients, trimmed]);
      setNewIngredient('');
    }
  };

  const handleTogglePantryItem = (item: string) => {
    if (ingredients.includes(item)) {
      setIngredients(ingredients.filter((i) => i !== item));
    } else {
      setIngredients([...ingredients, item]);
    }
  };

  const handleRemoveIngredient = (item: string) => {
    setIngredients(ingredients.filter((i) => i !== item));
  };

  const handleGenerateRecipe = async () => {
    if (ingredients.length === 0) {
      setRecipeError('Please select or add at least one ingredient.');
      return;
    }

    setRecipeLoading(true);
    setRecipeError(null);

    try {
      const data = await generateRecipe({
        ingredients,
        dietaryFilter,
        maxPrepTime,
        mealType,
        skillLevel,
      });

      setRecipeResult(data);

      addHistoryItem({
        type: 'recipe',
        title: data.recipeTitle,
        subtitle: `${data.totalTimeMinutes} mins • ${data.caloriesPerServing} kcal • ${data.difficulty}`,
        scoreOrCalorie: `${data.caloriesPerServing} kcal`,
        badge: `${data.totalTimeMinutes} min`,
        data,
      });
    } catch (err: any) {
      setRecipeError(err.message || 'Failed to generate recipe with Gemini AI.');
    } finally {
      setRecipeLoading(false);
    }
  };

  const handleStartTimer = (seconds: number, title: string) => {
    setActiveTimerSeconds(seconds);
    setTimerStepTitle(title);
    setTimerRunning(true);
  };

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || chatInput).trim();
    if (!text || chatLoading) return;

    const userMsg: ChatMessage = {
      id: 'usr-' + Date.now(),
      role: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setChatMessages((prev) => [...prev, userMsg]);
    setChatInput('');
    setChatLoading(true);

    try {
      const historyContext = chatMessages.slice(-6).map((m) => ({
        role: m.role,
        text: m.text,
      }));

      const res = await sendCookingChat(text, historyContext);

      const botMsg: ChatMessage = {
        id: 'bot-' + Date.now(),
        role: 'assistant',
        text: res.reply,
        suggestedQuestions: res.suggestedQuestions,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setChatMessages((prev) => [...prev, botMsg]);
    } catch (err: any) {
      const botErr: ChatMessage = {
        id: 'bot-err-' + Date.now(),
        role: 'assistant',
        text: 'Sorry, I encountered an issue contacting the culinary engine. Please try asking again!',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setChatMessages((prev) => [...prev, botErr]);
    } finally {
      setChatLoading(false);
    }
  };

  const formatTimer = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* Top Banner with Tab Navigation */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-emerald-900/10 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-100 text-orange-900 text-xs font-bold">
              <ChefHat className="w-3.5 h-3.5 text-orange-700" />
              <span>Gemini Culinary Scientist</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              Smart AI Cooking Assistant
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 max-w-2xl">
              Turn random pantry ingredients into chef-quality recipes with interactive step timers, ingredient substitutions, and real-time cooking Q&A.
            </p>
          </div>

          {/* Tab Switcher */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-2xl">
            <button
              onClick={() => setActiveTab('recipe')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                activeTab === 'recipe'
                  ? 'bg-white text-orange-800 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span>Recipe Generator</span>
            </button>
            <button
              onClick={() => setActiveTab('chat')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                activeTab === 'chat'
                  ? 'bg-white text-orange-800 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <MessageSquare className="w-4 h-4" />
              <span>Chef Chat Assistant</span>
            </button>
          </div>
        </div>
      </div>

      {/* Floating Active Timer Widget */}
      {activeTimerSeconds !== null && (
        <div className="sticky top-20 z-20 bg-slate-950 text-white rounded-2xl p-4 shadow-xl border border-slate-800 flex items-center justify-between gap-4 animate-fade-in">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-500/20 text-orange-400 flex items-center justify-center font-mono font-bold text-sm">
              <Clock className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-300">
                Cooking Timer • {timerStepTitle || 'Step In Progress'}
              </p>
              <p className="text-2xl font-mono font-extrabold tracking-wider text-orange-400">
                {formatTimer(activeTimerSeconds)}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setTimerRunning(!timerRunning)}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white transition-colors"
            >
              {timerRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            </button>
            <button
              onClick={() => {
                setActiveTimerSeconds(null);
                setTimerRunning(false);
              }}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {activeTab === 'recipe' ? (
        /* Recipe Generation Interface */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Pantry Inputs */}
          <div className="lg:col-span-5 space-y-5">
            <div className="bg-white rounded-3xl p-6 border border-emerald-900/10 shadow-xs space-y-5">
              <div className="space-y-1">
                <h3 className="text-base font-bold text-slate-900">What's in your kitchen?</h3>
                <p className="text-xs text-slate-500">
                  Select common items or type custom ingredients you have on hand.
                </p>
              </div>

              {/* Custom Input */}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newIngredient}
                  onChange={(e) => setNewIngredient(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddIngredient()}
                  placeholder="e.g. Bell peppers, coconut milk, parmesan..."
                  className="flex-1 px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:outline-hidden focus:ring-2 focus:ring-orange-500/30"
                />
                <button
                  type="button"
                  onClick={handleAddIngredient}
                  className="px-4 py-2.5 bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold rounded-xl transition-colors flex items-center gap-1"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add</span>
                </button>
              </div>

              {/* Active Selected Ingredients */}
              <div className="space-y-1.5">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Selected Pantry ({ingredients.length})
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {ingredients.map((ing) => (
                    <span
                      key={ing}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-orange-50 text-orange-900 border border-orange-200 text-xs font-medium"
                    >
                      <span>{ing}</span>
                      <button
                        onClick={() => handleRemoveIngredient(ing)}
                        className="p-0.5 rounded-full hover:bg-orange-200/60 text-orange-700"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                  {ingredients.length === 0 && (
                    <p className="text-xs text-slate-400 italic">No ingredients added yet.</p>
                  )}
                </div>
              </div>

              {/* Quick Pantry Click Tags */}
              <div className="space-y-1.5 pt-2 border-t border-slate-100">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Quick Add Common Items
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {QUICK_PANTRY_ITEMS.map((item) => {
                    const isSelected = ingredients.includes(item);
                    return (
                      <button
                        key={item}
                        type="button"
                        onClick={() => handleTogglePantryItem(item)}
                        className={`text-[11px] px-2.5 py-1 rounded-lg border transition-all ${
                          isSelected
                            ? 'bg-orange-600 text-white border-orange-600 font-semibold'
                            : 'bg-slate-50 text-slate-700 border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        {isSelected ? '✓ ' : '+ '}
                        {item}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Cooking Preferences */}
              <div className="space-y-3 pt-2 border-t border-slate-100">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Preferences & Constraints
                </span>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="block text-slate-700 font-medium mb-1">Meal Occasion</label>
                    <select
                      value={mealType}
                      onChange={(e) => setMealType(e.target.value)}
                      className="w-full p-2 rounded-xl border border-slate-200 bg-slate-50"
                    >
                      <option value="Quick Dinner">Quick Dinner</option>
                      <option value="Nutrient Breakfast">Nutrient Breakfast</option>
                      <option value="Energizing Lunch">Energizing Lunch</option>
                      <option value="Healthy Snack / Side">Healthy Snack / Side</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-700 font-medium mb-1">Dietary Target</label>
                    <select
                      value={dietaryFilter}
                      onChange={(e) => setDietaryFilter(e.target.value)}
                      className="w-full p-2 rounded-xl border border-slate-200 bg-slate-50"
                    >
                      <option value="Standard / Balanced">Standard / Balanced</option>
                      <option value="High Protein">High Protein</option>
                      <option value="Vegetarian">Vegetarian</option>
                      <option value="Vegan">Vegan</option>
                      <option value="Gluten-Free">Gluten-Free</option>
                      <option value="Keto / Low Carb">Keto / Low Carb</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="block text-slate-700 font-medium mb-1">Max Time (Mins)</label>
                    <select
                      value={maxPrepTime}
                      onChange={(e) => setMaxPrepTime(Number(e.target.value))}
                      className="w-full p-2 rounded-xl border border-slate-200 bg-slate-50"
                    >
                      <option value={15}>15 Minutes (Express)</option>
                      <option value={30}>30 Minutes (Standard)</option>
                      <option value={45}>45 Minutes (Gourmet)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-700 font-medium mb-1">Difficulty</label>
                    <select
                      value={skillLevel}
                      onChange={(e) => setSkillLevel(e.target.value)}
                      className="w-full p-2 rounded-xl border border-slate-200 bg-slate-50"
                    >
                      <option value="Easy">Easy (Beginner)</option>
                      <option value="Intermediate">Intermediate</option>
                      <option value="Advanced">Advanced Chef</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <button
                type="button"
                disabled={recipeLoading || ingredients.length === 0}
                onClick={handleGenerateRecipe}
                className="w-full flex items-center justify-center gap-2 py-3 bg-orange-600 hover:bg-orange-700 disabled:opacity-50 text-white rounded-xl text-xs sm:text-sm font-bold shadow-md shadow-orange-700/20 transition-all"
              >
                <Sparkles className="w-4 h-4" />
                <span>
                  {recipeLoading ? 'Creating Recipe with Gemini...' : 'Generate AI Recipe'}
                </span>
              </button>

              {recipeError && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{recipeError}</span>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Recipe Result Display */}
          <div className="lg:col-span-7 space-y-5">
            {recipeResult ? (
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-emerald-900/10 shadow-xs space-y-6 animate-fade-in">
                {/* Recipe Header */}
                <div className="border-b border-slate-100 pb-5 space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-orange-100 text-orange-800">
                      {recipeResult.difficulty} Difficulty
                    </span>
                    <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                      {recipeResult.totalTimeMinutes} mins total
                    </span>
                    <span className="text-[11px] font-semibold text-slate-500">
                      {recipeResult.servings} Servings
                    </span>
                  </div>

                  <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                    {recipeResult.recipeTitle}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 italic">
                    "{recipeResult.tagline}"
                  </p>
                </div>

                {/* Macro summary pills */}
                <div className="grid grid-cols-4 gap-2 text-center text-xs">
                  <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-100">
                    <span className="text-[10px] text-amber-700 font-bold block">Calories</span>
                    <span className="font-extrabold text-amber-950 text-sm">
                      {recipeResult.caloriesPerServing}
                    </span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-100">
                    <span className="text-[10px] text-emerald-700 font-bold block">Protein</span>
                    <span className="font-extrabold text-emerald-950 text-sm">
                      {recipeResult.macronutrients.protein}
                    </span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-orange-50 border border-orange-100">
                    <span className="text-[10px] text-orange-700 font-bold block">Carbs</span>
                    <span className="font-extrabold text-orange-950 text-sm">
                      {recipeResult.macronutrients.carbs}
                    </span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-teal-50 border border-teal-100">
                    <span className="text-[10px] text-teal-700 font-bold block">Fats</span>
                    <span className="font-extrabold text-teal-950 text-sm">
                      {recipeResult.macronutrients.fat}
                    </span>
                  </div>
                </div>

                {/* Ingredients Needed */}
                <div className="space-y-3">
                  <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                    <span>Ingredients Checklist</span>
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    {recipeResult.requiredIngredients.map((item, idx) => (
                      <div
                        key={idx}
                        className="p-2.5 rounded-xl bg-[#faf8f5] border border-slate-100 flex items-center justify-between"
                      >
                        <span className="font-medium text-slate-800">{item.item}</span>
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-slate-600">{item.amount}</span>
                          {item.fromUserPantry && (
                            <span className="text-[9px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.5 rounded">
                              In Pantry
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Ingredient Substitutions Table */}
                {recipeResult.substitutions?.length > 0 && (
                  <div className="space-y-2.5 p-4 rounded-2xl bg-orange-50/50 border border-orange-100">
                    <h4 className="font-bold text-orange-900 text-xs uppercase tracking-wider flex items-center gap-1.5">
                      <Lightbulb className="w-3.5 h-3.5 text-orange-600" />
                      <span>Smart Ingredient Substitutions</span>
                    </h4>
                    <div className="space-y-2 text-xs">
                      {recipeResult.substitutions.map((sub, idx) => (
                        <div key={idx} className="bg-white p-3 rounded-xl border border-orange-100 space-y-0.5">
                          <div className="flex items-center gap-2 font-semibold text-slate-800">
                            <span className="text-slate-500 line-through">{sub.original}</span>
                            <ArrowRight className="w-3 h-3 text-orange-600" />
                            <span className="text-orange-800">{sub.substitute}</span>
                          </div>
                          <p className="text-[11px] text-slate-500">{sub.note}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Step by Step Cooking Instructions with Timers */}
                <div className="space-y-4">
                  <h4 className="font-bold text-slate-900 text-sm">
                    Step-by-Step Cooking Guide
                  </h4>
                  <div className="space-y-3">
                    {recipeResult.stepByStepInstructions.map((step) => (
                      <div
                        key={step.stepNumber}
                        className="p-4 rounded-2xl bg-slate-50/80 border border-slate-100 space-y-2 text-xs"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="w-6 h-6 rounded-full bg-orange-600 text-white font-bold flex items-center justify-center text-xs">
                              {step.stepNumber}
                            </span>
                            <span className="font-bold text-slate-900 text-sm">
                              {step.title}
                            </span>
                          </div>

                          {step.timerSeconds && step.timerSeconds > 0 && (
                            <button
                              type="button"
                              onClick={() => handleStartTimer(step.timerSeconds!, step.title)}
                              className="inline-flex items-center gap-1.5 px-3 py-1 bg-orange-100 hover:bg-orange-200 text-orange-800 rounded-lg text-xs font-bold transition-colors"
                            >
                              <Clock className="w-3.5 h-3.5" />
                              <span>{formatTimer(step.timerSeconds)} Timer</span>
                            </button>
                          )}
                        </div>

                        <p className="text-slate-700 leading-relaxed text-xs sm:text-sm pl-8">
                          {step.instruction}
                        </p>

                        {step.chefTip && (
                          <div className="ml-8 p-2.5 rounded-xl bg-amber-50/70 border border-amber-200/50 text-[11px] text-amber-900">
                            <span className="font-bold">Chef's Secret: </span>
                            <span>{step.chefTip}</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Chef Pro Tips */}
                {recipeResult.chefProTips?.length > 0 && (
                  <div className="space-y-2 pt-2 border-t border-slate-100">
                    <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider text-slate-400">
                      Plating & Presentation Tips
                    </h4>
                    <ul className="space-y-1 text-xs text-slate-600">
                      {recipeResult.chefProTips.map((tip, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="text-orange-600 font-bold">✦</span>
                          <span>{tip}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-white rounded-3xl p-12 border border-emerald-900/10 shadow-xs text-center space-y-4">
                <div className="w-16 h-16 rounded-3xl bg-orange-50 text-orange-600 flex items-center justify-center mx-auto">
                  <ChefHat className="w-8 h-8" />
                </div>
                <div className="max-w-md mx-auto space-y-1">
                  <h3 className="text-lg font-bold text-slate-900">
                    Ready to cook something delicious
                  </h3>
                  <p className="text-xs text-slate-500">
                    Add or select your available ingredients on the left and click "Generate AI Recipe" to craft a custom gourmet dish.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Chef Interactive Chat Interface */
        <div className="bg-white rounded-3xl border border-emerald-900/10 shadow-xs flex flex-col h-[650px] overflow-hidden">
          {/* Chat Header */}
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-orange-100 text-orange-700 flex items-center justify-center font-bold">
                <ChefHat className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Chef FoodVerse AI</h3>
                <p className="text-[11px] text-emerald-700 flex items-center gap-1 font-medium">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  Culinary Scientist & Flavor Consultant
                </p>
              </div>
            </div>
          </div>

          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {chatMessages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-3 max-w-2xl ${
                  msg.role === 'user' ? 'ml-auto flex-row-reverse' : ''
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-full shrink-0 flex items-center justify-center text-xs font-bold ${
                    msg.role === 'user'
                      ? 'bg-slate-900 text-white'
                      : 'bg-orange-100 text-orange-800'
                  }`}
                >
                  {msg.role === 'user' ? 'You' : <ChefHat className="w-4 h-4" />}
                </div>

                <div className="space-y-2">
                  <div
                    className={`p-4 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                      msg.role === 'user'
                        ? 'bg-emerald-800 text-white rounded-tr-xs'
                        : 'bg-[#faf8f5] text-slate-800 border border-slate-100 rounded-tl-xs'
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{msg.text}</p>
                    <span
                      className={`block text-[10px] mt-1.5 opacity-60 ${
                        msg.role === 'user' ? 'text-right' : ''
                      }`}
                    >
                      {msg.timestamp}
                    </span>
                  </div>

                  {/* Suggested Follow-up Questions */}
                  {msg.suggestedQuestions && msg.suggestedQuestions.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {msg.suggestedQuestions.map((q, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => handleSendMessage(q)}
                          className="text-[11px] px-3 py-1 bg-orange-50 hover:bg-orange-100 text-orange-900 border border-orange-200 rounded-full transition-colors text-left"
                        >
                          💬 {q}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {chatLoading && (
              <div className="flex gap-3 max-w-md">
                <div className="w-8 h-8 rounded-full bg-orange-100 text-orange-800 flex items-center justify-center">
                  <ChefHat className="w-4 h-4" />
                </div>
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 flex items-center gap-2 text-xs text-slate-500">
                  <Sparkles className="w-3.5 h-3.5 text-orange-600 animate-spin" />
                  <span>Chef is consulting the culinary cookbook...</span>
                </div>
              </div>
            )}
            <div ref={chatBottomRef} />
          </div>

          {/* Chat Input Bar */}
          <div className="p-4 border-t border-slate-100 bg-white">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex gap-2"
            >
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Ask Chef anything: 'Can I swap butter for coconut oil in brownies?'"
                className="flex-1 px-4 py-3 text-xs sm:text-sm rounded-xl border border-slate-200 bg-slate-50 focus:outline-hidden focus:ring-2 focus:ring-orange-500/30"
              />
              <button
                type="submit"
                disabled={chatLoading || !chatInput.trim()}
                className="px-5 py-3 bg-orange-600 hover:bg-orange-700 disabled:opacity-40 text-white rounded-xl text-xs sm:text-sm font-bold flex items-center gap-1.5 transition-colors shadow-sm"
              >
                <Send className="w-4 h-4" />
                <span className="hidden sm:inline">Send</span>
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
