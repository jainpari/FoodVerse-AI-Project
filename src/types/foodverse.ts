export type ModuleType =
  | 'home'
  | 'recognition'
  | 'freshness'
  | 'hygiene'
  | 'cooking'
  | 'planner'
  | 'tracker'
  | 'history'
  | 'profile';

export interface NutrientItem {
  name: string;
  amount: string;
  dailyValue?: string;
}

export interface IngredientIdentified {
  name: string;
  confidence: 'High' | 'Medium' | 'Low';
  estimatedGrams?: number;
}

export interface FoodRecognitionResult {
  dishName: string;
  cuisine: string;
  confidence: number;
  description: string;
  healthScore: number;
  healthRating: string;
  portionSize: string;
  calories: number;
  macronutrients: {
    protein: { amount: number; unit: string; percentage?: number };
    carbohydrates: { amount: number; unit: string; percentage?: number };
    fat: { amount: number; unit: string; percentage?: number };
    fiber?: { amount: number; unit: string };
    sugar?: { amount: number; unit: string };
    sodium?: { amount: number; unit: string };
  };
  micronutrients?: NutrientItem[];
  ingredientsIdentified?: IngredientIdentified[];
  dietaryTags?: string[];
  allergens?: string[];
  dietarySuitability?: {
    isVegetarian: boolean;
    isVegan: boolean;
    isGlutenFree: boolean;
    isDairyFree: boolean;
    isKeto: boolean;
    isHalal: boolean;
    isKosher: boolean;
  };
  glycemicImpact?: string;
  aiAdvice: string;
  disclaimer: string;
}

export interface FreshnessResult {
  productName: string;
  category: string;
  freshnessStatus: 'Fresh' | 'Possibly Aging' | 'Potentially Spoiled';
  freshnessScore: number;
  confidence: number;
  visualObservations: {
    coloration: string;
    textureFirmness: string;
    blemishesSpots: string;
    spoilageIndicators: string;
  };
  safeShelfLifeEstimate: {
    roomTemperature: string;
    refrigerated: string;
    frozen: string;
  };
  storageRecommendations: string[];
  culinaryRescueIdeas?: Array<{
    title: string;
    description: string;
  }>;
  safetyExplanation: string;
  disclaimer: string;
}

export interface HygienePillar {
  name: string;
  score: number;
  status: 'Good' | 'Warning' | 'Critical';
  notes: string;
}

export interface HygieneConcern {
  severity: 'Low' | 'Moderate' | 'High';
  issue: string;
  detail: string;
  recommendation: string;
}

export interface HygieneObservationResult {
  assessmentTitle: string;
  areaObserved: string;
  overallHygieneScore: number;
  overallRiskLevel: 'Low Risk' | 'Moderate Attention' | 'High Concern';
  confidence: number;
  executiveSummary: string;
  pillars: HygienePillar[];
  positivePracticesObserved: string[];
  areasOfConcern: HygieneConcern[];
  actionableChecklist: string[];
  mandatoryDisclaimer: string;
}

export interface RecipeStep {
  stepNumber: number;
  title: string;
  instruction: string;
  timerSeconds?: number;
  chefTip?: string;
}

export interface RecipeIngredient {
  item: string;
  amount: string;
  fromUserPantry?: boolean;
}

export interface RecipeSubstitution {
  original: string;
  substitute: string;
  note: string;
}

export interface RecipeResult {
  recipeTitle: string;
  tagline: string;
  prepTimeMinutes: number;
  cookTimeMinutes: number;
  totalTimeMinutes: number;
  servings: number;
  difficulty: 'Easy' | 'Intermediate' | 'Advanced';
  caloriesPerServing: number;
  macronutrients: {
    protein: string;
    carbs: string;
    fat: string;
    fiber?: string;
  };
  requiredIngredients: RecipeIngredient[];
  substitutions: RecipeSubstitution[];
  stepByStepInstructions: RecipeStep[];
  chefProTips: string[];
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  suggestedQuestions?: string[];
  timestamp: string;
}

export interface PlannedMeal {
  mealType: string;
  time: string;
  title: string;
  calories: number;
  macros: {
    protein: string;
    carbs: string;
    fat: string;
  };
  description: string;
  keyNutrients: string[];
  prepTime: string;
}

export interface GroceryCategory {
  category: string;
  items: string[];
}

export interface NutritionPlanResult {
  clientProfileSummary: string;
  energyCalculation: {
    bmrCalories: number;
    tdeeCalories: number;
    targetDailyCalories: number;
    calorieDeficitSurplus: string;
  };
  targetMacronutrients: {
    protein: { grams: number; percentage: number; calories: number };
    carbohydrates: { grams: number; percentage: number; calories: number };
    fat: { grams: number; percentage: number; calories: number };
    fiber: { grams: number; unit: string };
    waterIntakeLiters: number;
  };
  mealPlan: PlannedMeal[];
  groceryList: GroceryCategory[];
  nutritionistAdvice: string[];
}

export interface FoodIntakeItem {
  id: string;
  timestamp: string;
  title: string;
  mealType: 'Breakfast' | 'Lunch' | 'Dinner' | 'Snack';
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  image?: string;
}

export interface AnalysisHistoryItem {
  id: string;
  timestamp: string;
  type: 'recognition' | 'freshness' | 'hygiene' | 'recipe';
  title: string;
  subtitle: string;
  scoreOrCalorie?: string;
  badge?: string;
  imageThumbnail?: string;
  data: any;
}

export interface UserProfile {
  name: string;
  email: string;
  age: number;
  gender: 'Female' | 'Male' | 'Non-binary' | 'Prefer not to say';
  heightCm: number;
  weightKg: number;
  activityLevel: 'Sedentary' | 'Light (1-2 days/wk)' | 'Moderate (3-5 days/wk)' | 'Very Active (6-7 days/wk)' | 'Athlete';
  goal: 'Weight Loss' | 'Lean Muscle Gain' | 'Maintenance & Longevity' | 'Athletic Performance' | 'Heart Health';
  dietaryPreference: 'Omnivore' | 'Vegetarian' | 'Vegan' | 'Pescatarian' | 'Keto' | 'Mediterranean' | 'Low-FODMAP';
  allergies: string[];
  targetDailyCalories: number;
  waterTargetLiters: number;
  useMetric: boolean;
}
