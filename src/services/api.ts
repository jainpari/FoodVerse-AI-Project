import {
  FoodRecognitionResult,
  FreshnessResult,
  HygieneObservationResult,
  RecipeResult,
  NutritionPlanResult,
} from '../types/foodverse';

export interface ApiResponse<T> {
  success: boolean;
  isDemo?: boolean;
  data: T;
  error?: string;
}

export async function checkApiHealth(): Promise<{ status: string; hasApiKey: boolean; model: string }> {
  try {
    const res = await fetch('/api/health');
    if (!res.ok) throw new Error('Health check failed');
    return await res.json();
  } catch (e) {
    return { status: 'offline', hasApiKey: false, model: 'demo-fallback' };
  }
}

export async function analyzeFoodImage(
  imageBase64: string,
  userNotes?: string
): Promise<FoodRecognitionResult> {
  const res = await fetch('/api/gemini/food-recognition', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ imageBase64, userNotes }),
  });

  const json = await res.json();
  if (!res.ok || !json.success) {
    throw new Error(json.error || 'Failed to analyze food image with AI');
  }
  return json.data;
}

export async function detectFreshness(
  imageBase64: string,
  itemType?: string,
  storageContext?: string
): Promise<FreshnessResult> {
  const res = await fetch('/api/gemini/freshness-detection', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ imageBase64, itemType, storageContext }),
  });

  const json = await res.json();
  if (!res.ok || !json.success) {
    throw new Error(json.error || 'Failed to analyze freshness with AI');
  }
  return json.data;
}

export async function observeRestaurantHygiene(
  mediaBase64: string,
  mediaType: 'image' | 'video',
  areaType?: string,
  notes?: string
): Promise<HygieneObservationResult> {
  const res = await fetch('/api/gemini/hygiene-monitor', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ mediaBase64, mediaType, areaType, notes }),
  });

  const json = await res.json();
  if (!res.ok || !json.success) {
    throw new Error(json.error || 'Failed to analyze restaurant hygiene with AI');
  }
  return json.data;
}

export async function generateRecipe(params: {
  ingredients: string[];
  dietaryFilter?: string;
  maxPrepTime?: number;
  mealType?: string;
  skillLevel?: string;
}): Promise<RecipeResult> {
  const res = await fetch('/api/gemini/cooking-recipe', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });

  const json = await res.json();
  if (!res.ok || !json.success) {
    throw new Error(json.error || 'Failed to generate recipe with AI');
  }
  return json.data;
}

export async function sendCookingChat(
  message: string,
  history: Array<{ role: 'user' | 'assistant'; text: string }>
): Promise<{ reply: string; suggestedQuestions?: string[] }> {
  const res = await fetch('/api/gemini/cooking-chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message, history }),
  });

  const json = await res.json();
  if (!res.ok || !json.success) {
    throw new Error(json.error || 'Failed to get answer from cooking assistant');
  }
  return { reply: json.reply, suggestedQuestions: json.suggestedQuestions };
}

export async function generateNutritionPlan(profileData: any): Promise<NutritionPlanResult> {
  const res = await fetch('/api/gemini/nutrition-planner', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(profileData),
  });

  const json = await res.json();
  if (!res.ok || !json.success) {
    throw new Error(json.error || 'Failed to generate nutrition plan with AI');
  }
  return json.data;
}

// Convert File to base64 helper
export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(file);
  });
}

// Helper to convert URL image to base64
export async function urlToBase64(url: string): Promise<string> {
  const response = await fetch(url);
  const blob = await response.blob();
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}
