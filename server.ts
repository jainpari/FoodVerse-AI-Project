import express, { Request, Response } from 'express';
import { GoogleGenAI } from '@google/genai';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Initialize Google Gemini AI client
const apiKey = process.env.GEMINI_API_KEY || '';
const ai = apiKey
  ? new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    })
  : null;

console.log(`[FoodVerse AI] Gemini API initialized: ${Boolean(ai && apiKey)}`);

// Health check endpoint
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    hasApiKey: Boolean(apiKey && apiKey !== 'MY_GEMINI_API_KEY'),
    model: 'gemini-3.8-flash',
  });
});

// Helper to extract JSON from Gemini text response
function extractJsonFromText(text: string): any {
  if (!text) return null;
  let cleaned = text.trim();
  // Strip markdown codeblocks
  if (cleaned.startsWith('```json')) {
    cleaned = cleaned.replace(/^```json\s*/, '').replace(/\s*```$/, '');
  } else if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```\s*/, '').replace(/\s*```$/, '');
  }
  try {
    return JSON.parse(cleaned);
  } catch (e) {
    // Attempt greedy bracket extraction
    const firstBrace = cleaned.indexOf('{');
    const lastBrace = cleaned.lastIndexOf('}');
    if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
      return JSON.parse(cleaned.substring(firstBrace, lastBrace + 1));
    }
    const firstBracket = cleaned.indexOf('[');
    const lastBracket = cleaned.lastIndexOf(']');
    if (firstBracket !== -1 && lastBracket !== -1 && lastBracket > firstBracket) {
      return JSON.parse(cleaned.substring(firstBracket, lastBracket + 1));
    }
    throw e;
  }
}

// Helper to clean base64 string
function parseBase64(dataUriOrRaw: string): { mimeType: string; data: string } {
  if (dataUriOrRaw.startsWith('data:')) {
    const matches = dataUriOrRaw.match(/^data:([a-zA-Z0-9]+\/[a-zA-Z0-9-+.]+);base64,(.+)$/);
    if (matches && matches.length === 3) {
      return { mimeType: matches[1], data: matches[2] };
    }
  }
  return { mimeType: 'image/jpeg', data: dataUriOrRaw };
}

// ----------------------------------------------------
// 1. Food Recognition & Nutritional Analysis
// ----------------------------------------------------
app.post('/api/gemini/food-recognition', async (req: Request, res: Response) => {
  try {
    const { imageBase64, userNotes, compareMode } = req.body;
    if (!imageBase64) {
      res.status(400).json({ error: 'Image is required for food recognition' });
      return;
    }

    if (!ai) {
      // Fallback demo response if no Gemini API key configured
      res.json({
        success: true,
        isDemo: true,
        data: {
          dishName: 'Mediterranean Grilled Salmon Bowl',
          cuisine: 'Mediterranean / Healthy Fusion',
          confidence: 0.96,
          description: 'A vibrant, nutrient-dense bowl featuring seared wild salmon, quinoa base, sliced Hass avocado, cherry tomatoes, and baby spinach with a citrus herb dressing.',
          healthScore: 92,
          healthRating: 'Excellent',
          portionSize: '1 bowl (~380g)',
          calories: 520,
          macronutrients: {
            protein: { amount: 38, unit: 'g', percentage: 29 },
            carbohydrates: { amount: 42, unit: 'g', percentage: 32 },
            fat: { amount: 23, unit: 'g', percentage: 39 },
            fiber: { amount: 8, unit: 'g' },
            sugar: { amount: 4, unit: 'g' },
            sodium: { amount: 390, unit: 'mg' },
          },
          micronutrients: [
            { name: 'Omega-3 Fatty Acids', amount: '2.4g', dailyValue: '150%' },
            { name: 'Vitamin D', amount: '18mcg', dailyValue: '90%' },
            { name: 'Potassium', amount: '780mg', dailyValue: '22%' },
            { name: 'Vitamin C', amount: '24mg', dailyValue: '35%' },
            { name: 'Iron', amount: '3.2mg', dailyValue: '18%' },
          ],
          ingredientsIdentified: [
            { name: 'Wild Atlantic Salmon Fillet', confidence: 'High', estimatedGrams: 160 },
            { name: 'Organic Tri-Color Quinoa', confidence: 'High', estimatedGrams: 110 },
            { name: 'Hass Avocado Slices', confidence: 'High', estimatedGrams: 50 },
            { name: 'Sweet Cherry Tomatoes', confidence: 'High', estimatedGrams: 40 },
            { name: 'Fresh Baby Spinach', confidence: 'High', estimatedGrams: 20 },
            { name: 'Extra Virgin Olive Oil & Lemon Emulsion', confidence: 'Medium', estimatedGrams: 15 },
          ],
          dietaryTags: ['Heart Healthy', 'High Protein', 'Gluten-Free', 'Pescatarian', 'Rich in Antioxidants'],
          allergens: ['Fish'],
          dietarySuitability: {
            isVegetarian: false,
            isVegan: false,
            isGlutenFree: true,
            isDairyFree: true,
            isKeto: false,
            isHalal: true,
            isKosher: true,
          },
          glycemicImpact: 'Low (sustained energy release)',
          aiAdvice: 'Exceptional nutritional balance with heart-protective omega-3s and fiber-rich complex carbohydrates. Ideal post-workout or clean dinner choice.',
          disclaimer: 'Nutritional figures are estimated using multimodal computer vision and standard reference tables. Actual portion weights and oils used during preparation may vary.',
        },
      });
      return;
    }

    const { mimeType, data } = parseBase64(imageBase64);

    const prompt = `You are FoodVerse AI, a world-class certified nutritionist and computer vision food expert.
Analyze this food image in deep detail. If there are multiple items, identify the primary meal or breakdown.
${userNotes ? `User note or context: "${userNotes}"` : ''}

Respond STRICTLY with a valid JSON object (no markdown surrounding, or valid markdown json codeblock) following this exact structure:
{
  "dishName": "Clear, specific dish title",
  "cuisine": "Cuisine type (e.g., Italian, Mediterranean, Japanese, Mexican, American)",
  "confidence": 0.95,
  "description": "Engaging 1-2 sentence culinary description of what is visible",
  "healthScore": 88,
  "healthRating": "Excellent | Good | Moderate | Indulgent",
  "portionSize": "Estimated portion description (e.g., 1 medium plate ~350g)",
  "calories": 480,
  "macronutrients": {
    "protein": { "amount": 28, "unit": "g", "percentage": 25 },
    "carbohydrates": { "amount": 54, "unit": "g", "percentage": 45 },
    "fat": { "amount": 16, "unit": "g", "percentage": 30 },
    "fiber": { "amount": 7, "unit": "g" },
    "sugar": { "amount": 6, "unit": "g" },
    "sodium": { "amount": 420, "unit": "mg" }
  },
  "micronutrients": [
    { "name": "Vitamin C", "amount": "30mg", "dailyValue": "40%" },
    { "name": "Iron", "amount": "3mg", "dailyValue": "17%" }
  ],
  "ingredientsIdentified": [
    { "name": "Ingredient Name", "confidence": "High | Medium | Low", "estimatedGrams": 120 }
  ],
  "dietaryTags": ["High Protein", "Gluten-Free", "Low Sugar", etc.],
  "allergens": ["Gluten", "Dairy", "Nuts", "Soy", etc.],
  "dietarySuitability": {
    "isVegetarian": true,
    "isVegan": false,
    "isGlutenFree": true,
    "isDairyFree": false,
    "isKeto": false,
    "isHalal": true,
    "isKosher": true
  },
  "glycemicImpact": "Low | Moderate | High",
  "aiAdvice": "Actionable, friendly nutritional advice regarding this meal",
  "disclaimer": "Nutritional figures are AI-estimated based on visual food recognition and standard culinary portions. Actual ingredients, cooking oils, and seasonings may affect totals."
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: {
        parts: [
          { inlineData: { mimeType, data } },
          { text: prompt },
        ],
      },
      config: {
        systemInstruction: 'You are FoodVerse AI, a rigorous, precise multimodal food recognition and nutritional intelligence engine. Always provide high-accuracy nutritional breakdown in structured JSON.',
        responseMimeType: 'application/json',
      },
    });

    const parsedData = extractJsonFromText(response.text || '{}');
    res.json({ success: true, isDemo: false, data: parsedData });
  } catch (error: any) {
    console.error('[Food Recognition Error]:', error);
    res.status(500).json({
      error: error.message || 'Failed to analyze food image with Gemini AI',
    });
  }
});

// ----------------------------------------------------
// 2. Food Freshness & Spoilage Detection
// ----------------------------------------------------
app.post('/api/gemini/freshness-detection', async (req: Request, res: Response) => {
  try {
    const { imageBase64, itemType, storageContext } = req.body;
    if (!imageBase64) {
      res.status(400).json({ error: 'Image is required for freshness analysis' });
      return;
    }

    if (!ai) {
      res.json({
        success: true,
        isDemo: true,
        data: {
          productName: 'Cavendish Bananas',
          category: 'Fruit / Fresh Produce',
          freshnessStatus: 'Possibly Aging',
          freshnessScore: 68,
          confidence: 0.94,
          visualObservations: {
            coloration: 'Deep yellow with moderate scattered brown/sugar freckles (senescence spots).',
            textureFirmness: 'Slight softening of the peel; pulp remains mostly intact and sweet.',
            blemishesSpots: 'Numerous small brown spots characteristic of natural peak ripeness transitioning into late ripening.',
            spoilageIndicators: 'No visible white mold, black rot, weeping moisture, or fungal growth.',
          },
          safeShelfLifeEstimate: {
            roomTemperature: '1 to 2 days before becoming overripe',
            refrigerated: '3 to 5 days (peel will darken but pulp stays firm)',
            frozen: 'Up to 3 months (peel and chop first)',
          },
          storageRecommendations: [
            'Separate bananas from other ethylene-sensitive produce like apples and avocados.',
            'Wrap banana stems tightly with beeswax wrap or plastic film to slow ethylene emission.',
            'If not consumed within 24 hours, peel, slice, and freeze for smoothies or baking.',
          ],
          culinaryRescueIdeas: [
            { title: 'Classic Banana Walnut Loaf', description: 'At this sugar-rich stage, moisture and natural sweetness are peaked for baking without extra sugar.' },
            { title: 'Creamy 1-Ingredient Nice Cream', description: 'Blend frozen slices in a food processor until silky soft-serve texture.' },
            { title: 'Pancake Batter Sweetener', description: 'Mash directly into oat or whole-wheat pancake batter.' },
          ],
          safetyExplanation: 'The fruit is at high sugar maturity with natural enzymatic browning. It is entirely safe and flavorful to eat raw or cook today. Discard if you notice fermentation smell, liquid oozing, or cottony fungal growth.',
          disclaimer: 'Visual AI freshness detection provides an observational estimation based on surface appearance. It cannot assess internal pathogens, bacterial toxins, or anaerobic spoilage. Always follow the golden rule of food safety: When in doubt, throw it out.',
        },
      });
      return;
    }

    const { mimeType, data } = parseBase64(imageBase64);

    const prompt = `You are FoodVerse AI's food quality and freshness computer vision inspector.
Examine this image of food (fruit, vegetable, meat, dairy, prepared meal, bread, etc.) closely for visual indicators of freshness, ripeness, enzymatic browning, moisture loss, mold, discoloration, or spoilage.
${itemType ? `Claimed item: ${itemType}` : ''}
${storageContext ? `Storage context: ${storageContext}` : ''}

Classify the status strictly into one of three statuses:
1. "Fresh"
2. "Possibly Aging"
3. "Potentially Spoiled"

Respond STRICTLY with a valid JSON object with the following schema:
{
  "productName": "Identified item name",
  "category": "Produce | Meat/Poultry | Seafood | Dairy | Bakery | Leftovers | Pantry",
  "freshnessStatus": "Fresh | Possibly Aging | Potentially Spoiled",
  "freshnessScore": 75,
  "confidence": 0.92,
  "visualObservations": {
    "coloration": "Detailed observation of color, hue changes, darkening",
    "textureFirmness": "Visual clues about firmness, wrinkling, wilt, shriveling",
    "blemishesSpots": "Bruising, sunken spots, discoloration patches",
    "spoilageIndicators": "Signs of mold, bacterial slime, weeping, yeast growth, or None"
  },
  "safeShelfLifeEstimate": {
    "roomTemperature": "Estimated time window",
    "refrigerated": "Estimated time window",
    "frozen": "Estimated time window"
  },
  "storageRecommendations": [
    "Specific storage advice 1",
    "Specific storage advice 2"
  ],
  "culinaryRescueIdeas": [
    { "title": "Rescue Recipe / Use Idea", "description": "How to make use of it before it spoils" }
  ],
  "safetyExplanation": "Clear, objective explanation of whether this is safe to eat and what red flags to check tactilely/by smell",
  "disclaimer": "Visual AI freshness detection provides an observational estimate based on surface visual characteristics and cannot guarantee microbiological safety. When in doubt, discard."
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: {
        parts: [
          { inlineData: { mimeType, data } },
          { text: prompt },
        ],
      },
      config: {
        systemInstruction: 'You are FoodVerse AI Freshness Inspector. Provide rigorous, objective visual quality assessments with clear safety disclaimers.',
        responseMimeType: 'application/json',
      },
    });

    const parsedData = extractJsonFromText(response.text || '{}');
    res.json({ success: true, isDemo: false, data: parsedData });
  } catch (error: any) {
    console.error('[Freshness Detection Error]:', error);
    res.status(500).json({
      error: error.message || 'Failed to analyze food freshness',
    });
  }
});

// ----------------------------------------------------
// 3. Restaurant Kitchen Hygiene Monitoring
// ----------------------------------------------------
app.post('/api/gemini/hygiene-monitor', async (req: Request, res: Response) => {
  try {
    const { mediaBase64, mediaType, areaType, notes } = req.body;
    if (!mediaBase64) {
      res.status(400).json({ error: 'Media is required for hygiene observation' });
      return;
    }

    if (!ai) {
      res.json({
        success: true,
        isDemo: true,
        data: {
          assessmentTitle: 'Commercial Food Prep Station Audit',
          areaObserved: 'Cold Prep Line & Salad Station',
          overallHygieneScore: 82,
          overallRiskLevel: 'Moderate Attention',
          confidence: 0.91,
          executiveSummary: 'The kitchen demonstrates generally sound baseline hygiene practices with stainless steel equipment and organized stations. However, 2 moderate observational concerns regarding open container staging and glove protocol require attention.',
          pillars: [
            {
              name: 'Food Handling & Cross-Contamination Prevention',
              score: 78,
              status: 'Warning',
              notes: 'Separate cutting stations visible, but raw garnishes are stored in open pans within reach of unwashed reach-ins.'
            },
            {
              name: 'Food Storage & Covering Practices',
              score: 75,
              status: 'Warning',
              notes: 'Prep pans left uncovered during downtime; temperature log not visibly posted.'
            },
            {
              name: 'Surfaces, Utensils & Equipment Cleanliness',
              score: 90,
              status: 'Good',
              notes: 'Stainless prep counters wipe-down looks recent; sanitizing bucket visible nearby.'
            },
            {
              name: 'Personal Protective Equipment (PPE) & Attire',
              score: 85,
              status: 'Good',
              notes: 'Staff wearing aprons and hair restraints; disposable glove compliance should be reinforced between tasks.'
            },
            {
              name: 'Kitchen Sanitation & Waste Management',
              score: 88,
              status: 'Good',
              notes: 'Floor drains clear, no trash overflow observed near preparation benches.'
            }
          ],
          positivePracticesObserved: [
            'Clean commercial-grade stainless steel preparation tables with minimal clutter.',
            'Adequate task illumination over chopping and assembly zones.',
            'Proper floor drainage without pooling water or grease slicks.',
            'Staff wearing clean head coverings/caps.'
          ],
          areasOfConcern: [
            {
              severity: 'Moderate',
              issue: 'Uncovered Staged Ingredients',
              detail: 'Prep pans containing cut ingredients exposed without lids or clear wrap while station is unattended.',
              recommendation: 'Enforce "lid when not actively assembling" policy to prevent airborne particulate contamination.'
            },
            {
              severity: 'Low',
              issue: 'Towel Placement on Countertop',
              detail: 'A moist wipe cloth was observed lying directly on the food contact board rather than in sanitizing solution.',
              recommendation: 'Store wiping cloths in marked sanitizer solution buckets when not in direct use.'
            }
          ],
          actionableChecklist: [
            'Verify refrigeration holding temperatures (must be <= 41°F / 5°C).',
            'Cover all prep inserts with Cambro lids or food-grade cling film.',
            'Replace sanitizer cloth bucket and test ppm with test strips.',
            'Review color-coded board protocols for raw vs cooked stations.'
          ],
          mandatoryDisclaimer: 'CRITICAL NOTICE: This report is an observational AI visual assessment based exclusively on visible image/video cues. It does NOT constitute a certified health inspection, regulatory audit, or legal health code violation determination. Certified compliance requires official inspections by certified public health sanitarians.'
        }
      });
      return;
    }

    const { mimeType, data } = parseBase64(mediaBase64);

    const prompt = `You are FoodVerse AI Restaurant Kitchen Hygiene Observer.
Analyze this restaurant kitchen / food preparation area image or short video frame.
Evaluate visible hygiene practices across 5 core pillars:
1. Food handling & cross-contamination prevention
2. Food storage & temperature covering practices (e.g., uncovered food, floor proximity)
3. Preparation surfaces, utensils, and equipment cleanliness
4. Personal protective equipment (hairnets, aprons, glove compliance)
5. Kitchen sanitation, grease buildup, floor cleanliness, waste bins

${areaType ? `Area reported: ${areaType}` : ''}
${notes ? `Additional notes: ${notes}` : ''}

Respond STRICTLY with a valid JSON object matching this schema:
{
  "assessmentTitle": "Title of the observation",
  "areaObserved": "Prep Line | Cook Line | Dishwashing Area | Walk-in Storage | Plating Station",
  "overallHygieneScore": 85,
  "overallRiskLevel": "Low Risk | Moderate Attention | High Concern",
  "confidence": 0.90,
  "executiveSummary": "2-3 sentence overview of observations",
  "pillars": [
    {
      "name": "Food Handling & Cross-Contamination",
      "score": 85,
      "status": "Good | Warning | Critical",
      "notes": "Specific notes on visible evidence"
    },
    {
      "name": "Food Storage & Covering Practices",
      "score": 80,
      "status": "Good | Warning | Critical",
      "notes": "Specific notes on visible evidence"
    },
    {
      "name": "Surfaces, Utensils & Equipment Cleanliness",
      "score": 90,
      "status": "Good | Warning | Critical",
      "notes": "Specific notes on visible evidence"
    },
    {
      "name": "Personal Protective Equipment (PPE) & Attire",
      "score": 85,
      "status": "Good | Warning | Critical",
      "notes": "Specific notes on visible evidence"
    },
    {
      "name": "Kitchen Sanitation & Waste Management",
      "score": 88,
      "status": "Good | Warning | Critical",
      "notes": "Specific notes on visible evidence"
    }
  ],
  "positivePracticesObserved": [
    "Good practice 1",
    "Good practice 2"
  ],
  "areasOfConcern": [
    {
      "severity": "Low | Moderate | High",
      "issue": "Brief issue title",
      "detail": "What was observed",
      "recommendation": "Corrective hygiene practice recommendation"
    }
  ],
  "actionableChecklist": [
    "Immediate action item 1",
    "Immediate action item 2"
  ],
  "mandatoryDisclaimer": "CRITICAL NOTICE: This report is an observational AI visual assessment based strictly on visible image cues. It does NOT constitute a certified health inspection, regulatory audit, or legal health code violation determination. Official compliance requires in-person inspection by certified public health officials."
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: {
        parts: [
          { inlineData: { mimeType, data } },
          { text: prompt },
        ],
      },
      config: {
        systemInstruction: 'You are FoodVerse AI Hygiene Observer. Provide objective, constructive visual hygiene observations. Never claim legal certification authority.',
        responseMimeType: 'application/json',
      },
    });

    const parsedData = extractJsonFromText(response.text || '{}');
    res.json({ success: true, isDemo: false, data: parsedData });
  } catch (error: any) {
    console.error('[Hygiene Monitor Error]:', error);
    res.status(500).json({
      error: error.message || 'Failed to analyze hygiene image',
    });
  }
});

// ----------------------------------------------------
// 4. Smart AI Cooking Assistant & Recipe Generator
// ----------------------------------------------------
app.post('/api/gemini/cooking-recipe', async (req: Request, res: Response) => {
  try {
    const { ingredients, dietaryFilter, maxPrepTime, mealType, skillLevel } = req.body;
    if (!ingredients || !ingredients.length) {
      res.status(400).json({ error: 'At least one ingredient is required' });
      return;
    }

    if (!ai) {
      res.json({
        success: true,
        isDemo: true,
        data: {
          recipeTitle: 'Rustic Garlic Herb Chicken & Vegetable Skillet',
          tagline: 'A vibrant 25-minute pan-seared skillet bursting with lemon-garlic butter aroma.',
          prepTimeMinutes: 10,
          cookTimeMinutes: 15,
          totalTimeMinutes: 25,
          servings: 2,
          difficulty: 'Easy',
          caloriesPerServing: 380,
          macronutrients: {
            protein: '36g',
            carbs: '14g',
            fat: '18g',
            fiber: '4g',
          },
          requiredIngredients: [
            { item: 'Boneless chicken breast or thigh', amount: '350g', fromUserPantry: true },
            { item: 'Fresh garlic cloves, minced', amount: '4 cloves', fromUserPantry: true },
            { item: 'Olive oil or butter', amount: '2 tbsp', fromUserPantry: true },
            { item: 'Fresh spinach or leafy greens', amount: '2 cups', fromUserPantry: true },
            { item: 'Lemon juice & zest', amount: '1 lemon', fromUserPantry: false },
            { item: 'Salt, black pepper, and dried oregano', amount: 'To taste', fromUserPantry: false },
          ],
          substitutions: [
            { original: 'Chicken breast', substitute: 'Extra-firm tofu or chickpeas', note: 'Perfect vegetarian swap; press tofu dry before searing' },
            { original: 'Butter', substitute: 'Cold-pressed avocado or olive oil', note: 'For dairy-free option with healthy fats' },
            { original: 'Spinach', substitute: 'Kale, broccoli florets, or zucchini ribbons', note: 'Adjust cook time slightly for firmer greens' },
          ],
          stepByStepInstructions: [
            {
              stepNumber: 1,
              title: 'Prepare & Season Protein',
              instruction: 'Pat the chicken dry with paper towels. Slice into bite-sized medallions. Toss with salt, freshly cracked black pepper, and dried oregano.',
              timerSeconds: 0,
              chefTip: 'Drying protein is the #1 secret to getting a golden sear instead of boiling in steam.',
            },
            {
              stepNumber: 2,
              title: 'Sear to Golden Perfection',
              instruction: 'Heat 1 tablespoon of olive oil in a wide heavy skillet over medium-high heat. Lay chicken in a single layer without overcrowding. Sear undisturbed for 3-4 minutes until golden crust forms, then flip.',
              timerSeconds: 240,
              chefTip: 'Resist moving the meat around early; allow fond to develop on the pan bottom.',
            },
            {
              stepNumber: 3,
              title: 'Aromatic Infusion',
              instruction: 'Reduce heat to medium. Toss in minced garlic and remaining butter/oil. Stir continuously for 45-60 seconds until fragrant without letting garlic burn.',
              timerSeconds: 60,
              chefTip: 'If pan is too hot, pull it off the heat for 15 seconds to save delicate garlic from bitter burning.',
            },
            {
              stepNumber: 4,
              title: 'Wilt Greens & Deglaze',
              instruction: 'Squeeze fresh lemon juice over the pan to lift browned bits. Add spinach or greens and toss vigorously until wilted and glossy (about 90 seconds). Remove from heat.',
              timerSeconds: 90,
              chefTip: 'Finish with flaky sea salt and lemon zest right at plating for bright aromatics.',
            },
          ],
          chefProTips: [
            'Deglazing with lemon juice captures the flavorful fond at the base of the pan.',
            'Pairs deliciously with steamed brown rice, warm crusty bread, or a crisp side salad.',
          ],
        },
      });
      return;
    }

    const prompt = `You are FoodVerse AI Master Chef and Culinary Scientist.
Create an inventive, delicious, well-tested recipe using these available ingredients:
${ingredients.join(', ')}

Preferences:
- Meal Type: ${mealType || 'Any / Dinner'}
- Dietary Needs: ${dietaryFilter || 'Standard / None'}
- Max Prep Time: ${maxPrepTime || '30'} minutes
- Difficulty: ${skillLevel || 'Easy to Intermediate'}

Respond STRICTLY in valid JSON matching this schema:
{
  "recipeTitle": "Catchy, authentic recipe name",
  "tagline": "Enticing 1-sentence culinary hook",
  "prepTimeMinutes": 10,
  "cookTimeMinutes": 20,
  "totalTimeMinutes": 30,
  "servings": 2,
  "difficulty": "Easy | Intermediate | Advanced",
  "caloriesPerServing": 420,
  "macronutrients": {
    "protein": "32g",
    "carbs": "28g",
    "fat": "16g",
    "fiber": "5g"
  },
  "requiredIngredients": [
    { "item": "Name of ingredient", "amount": "Quantity", "fromUserPantry": true }
  ],
  "substitutions": [
    { "original": "Ingredient", "substitute": "Alternative", "note": "Why this works and adjustments" }
  ],
  "stepByStepInstructions": [
    {
      "stepNumber": 1,
      "title": "Short title",
      "instruction": "Detailed, encouraging cooking instruction",
      "timerSeconds": 180,
      "chefTip": "Professional culinary technique tip"
    }
  ],
  "chefProTips": [
    "Flavor enhancement tip",
    "Plating or storage advice"
  ]
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        systemInstruction: 'You are FoodVerse AI Master Chef. Provide precise, inspiring, mouth-watering culinary recipes and actionable steps.',
        responseMimeType: 'application/json',
      },
    });

    const parsedData = extractJsonFromText(response.text || '{}');
    res.json({ success: true, isDemo: false, data: parsedData });
  } catch (error: any) {
    console.error('[Cooking Assistant Recipe Error]:', error);
    res.status(500).json({
      error: error.message || 'Failed to generate recipe with Gemini AI',
    });
  }
});

// Cooking Assistant Chat (Q&A with culinary intelligence)
app.post('/api/gemini/cooking-chat', async (req: Request, res: Response) => {
  try {
    const { message, history } = req.body;
    if (!message) {
      res.status(400).json({ error: 'Message is required' });
      return;
    }

    if (!ai) {
      res.json({
        success: true,
        reply: `Here's a chef's answer to "${message}": For best culinary results, remember that heat control and seasoning at every layer make all the difference! When substituting ingredients, balance moisture and fat content carefully.`,
        suggestedQuestions: [
          'How do I keep chicken breast juicy and not dry?',
          'What are the best dairy-free substitutes for heavy cream?',
          'How do I fix a sauce that is too salty or acidic?',
        ],
      });
      return;
    }

    const conversationContext = Array.isArray(history)
      ? history.map((h: any) => `${h.role === 'user' ? 'User' : 'Chef'}: ${h.text}`).join('\n')
      : '';

    const prompt = `You are Chef FoodVerse, an expert culinary advisor, master home cooking instructor, and food scientist.
Answer the user's cooking question with warmth, precision, and practical kitchen tips. Keep answers concise, actionable, and engaging (2-4 paragraphs). Also include 3 brief suggested follow-up questions.

Format your response in JSON:
{
  "reply": "Your markdown-formatted helpful answer here with tips, temperature guidance, and food science insights",
  "suggestedQuestions": ["Follow up 1", "Follow up 2", "Follow up 3"]
}

Previous Conversation:
${conversationContext}

User Question: ${message}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        systemInstruction: 'You are Chef FoodVerse, a world-class chef and food scientist. Provide enthusiastic, rigorous, helpful cooking advice.',
        responseMimeType: 'application/json',
      },
    });

    const parsed = extractJsonFromText(response.text || '{}');
    res.json({ success: true, ...parsed });
  } catch (error: any) {
    console.error('[Cooking Chat Error]:', error);
    res.status(500).json({
      error: error.message || 'Failed to get answer from Cooking Assistant',
    });
  }
});

// ----------------------------------------------------
// 5. Personalized Nutrition Planner
// ----------------------------------------------------
app.post('/api/gemini/nutrition-planner', async (req: Request, res: Response) => {
  try {
    const {
      age,
      gender,
      heightCm,
      weightKg,
      activityLevel,
      goal,
      dietaryPreference,
      allergies,
      mealsPerDay,
    } = req.body;

    if (!ai) {
      res.json({
        success: true,
        isDemo: true,
        data: {
          clientProfileSummary: `${age || 28}yo ${gender || 'Adult'}, Goal: ${goal || 'Lean Muscle & Health'}, Diet: ${dietaryPreference || 'Balanced Omnivore'}`,
          energyCalculation: {
            bmrCalories: 1650,
            tdeeCalories: 2350,
            targetDailyCalories: 2100,
            calorieDeficitSurplus: '-250 kcal (mild fat loss / lean recomposition)',
          },
          targetMacronutrients: {
            protein: { grams: 155, percentage: 30, calories: 620 },
            carbohydrates: { grams: 210, percentage: 40, calories: 840 },
            fat: { grams: 70, percentage: 30, calories: 630 },
            fiber: { grams: 35, unit: 'g' },
            waterIntakeLiters: 3.2,
          },
          mealPlan: [
            {
              mealType: 'Breakfast',
              time: '08:00 AM',
              title: 'Protein-Packed Berry Chia Oatmeal Bowl',
              calories: 460,
              macros: { protein: '32g', carbs: '56g', fat: '12g' },
              description: 'Rolled oats simmered with almond milk, stirred with whey/plant protein isolate, topped with fresh blueberries, chia seeds, and a drizzle of honey.',
              keyNutrients: ['Beta-glucans', 'Antioxidants', 'Slow-digesting carbs'],
              prepTime: '8 mins',
            },
            {
              mealType: 'Lunch',
              time: '01:00 PM',
              title: 'Grilled Lemon Herb Chicken & Quinoa Crunch Salad',
              calories: 620,
              macros: { protein: '46g', carbs: '52g', fat: '18g' },
              description: 'Herb-marinated chicken breast slices over fluffy quinoa, crisp cucumbers, cherry tomatoes, kalamata olives, and crumbled feta with tahini vinaigrette.',
              keyNutrients: ['Lean bioavailable protein', 'Magnesium', 'Healthy monounsaturated fats'],
              prepTime: '15 mins',
            },
            {
              mealType: 'Afternoon Snack',
              time: '04:30 PM',
              title: 'Greek Yogurt with Crushed Walnuts & Cinnamon',
              calories: 240,
              macros: { protein: '20g', carbs: '12g', fat: '10g' },
              description: 'Creamy 0% or 2% plain Greek yogurt with toasted walnut halves and ground Ceylon cinnamon.',
              keyNutrients: ['Probiotics', 'Calcium', 'Omega-3 ALA'],
              prepTime: '3 mins',
            },
            {
              mealType: 'Dinner',
              time: '07:30 PM',
              title: 'Pan-Roasted Atlantic Salmon with Roasted Asparagus & Sweet Potato',
              calories: 580,
              macros: { protein: '42g', carbs: '44g', fat: '22g' },
              description: 'Crispy skin salmon fillet served alongside paprika-roasted sweet potato cubes and tender garlic asparagus spears.',
              keyNutrients: ['EPA/DHA Omega-3s', 'Vitamin A', 'Potassium'],
              prepTime: '22 mins',
            },
          ],
          groceryList: [
            { category: 'Proteins', items: ['Chicken breasts (700g)', 'Atlantic Salmon fillets (400g)', 'Plain Greek Yogurt (1kg)', 'Eggs or Protein Powder'] },
            { category: 'Produce', items: ['Blueberries', 'Baby spinach', 'Cucumbers', 'Cherry tomatoes', 'Asparagus', 'Sweet potatoes', 'Lemons'] },
            { category: 'Grains & Pantry', items: ['Rolled oats', 'Quinoa', 'Chia seeds', 'Raw walnuts', 'Extra virgin olive oil', 'Tahini'] },
          ],
          nutritionistAdvice: [
            'Drink 500ml water immediately upon waking to kickstart metabolic hydration.',
            'Aim for 30g+ protein at breakfast to stabilize ghrelin (hunger hormone) throughout the morning.',
            'Keep dinner rich in micronutrients and fiber to promote deep restorative sleep.',
          ],
        },
      });
      return;
    }

    const prompt = `You are FoodVerse AI Senior Clinical Nutritionist and Sports Dietitian.
Calculate an optimal daily nutrition strategy and 1-day sample meal plan based on this user:
- Age: ${age || 30}
- Gender: ${gender || 'Adult'}
- Height: ${heightCm || 175} cm
- Weight: ${weightKg || 70} kg
- Activity Level: ${activityLevel || 'Moderate (3-5 days exercise)'}
- Goal: ${goal || 'Healthy Living & Body Recomposition'}
- Dietary Preference: ${dietaryPreference || 'Omnivore'} (Vegetarian/Vegan/Keto/Pescatarian etc.)
- Allergies / Avoidances: ${allergies || 'None'}
- Meals per day: ${mealsPerDay || 4}

Calculate realistic BMR (Mifflin-St Jeor), TDEE, recommended daily calorie target according to goal, and macronutrient targets (Protein, Carbs, Fat, Fiber, Water).
Then generate a tailored, mouth-watering meal plan with breakfast, lunch, dinner, and snacks.

Respond STRICTLY in valid JSON matching this schema:
{
  "clientProfileSummary": "Summary text",
  "energyCalculation": {
    "bmrCalories": 1600,
    "tdeeCalories": 2300,
    "targetDailyCalories": 2000,
    "calorieDeficitSurplus": "Explanation of deficit/surplus"
  },
  "targetMacronutrients": {
    "protein": { "grams": 150, "percentage": 30, "calories": 600 },
    "carbohydrates": { "grams": 200, "percentage": 40, "calories": 800 },
    "fat": { "grams": 67, "percentage": 30, "calories": 600 },
    "fiber": { "grams": 35, "unit": "g" },
    "waterIntakeLiters": 3.0
  },
  "mealPlan": [
    {
      "mealType": "Breakfast | Lunch | Dinner | Snack",
      "time": "08:00 AM",
      "title": "Dish title",
      "calories": 450,
      "macros": { "protein": "30g", "carbs": "45g", "fat": "15g" },
      "description": "Tasty, realistic recipe summary",
      "keyNutrients": ["Nutrient 1", "Nutrient 2"],
      "prepTime": "10 mins"
    }
  ],
  "groceryList": [
    { "category": "Proteins | Produce | Grains & Pantry | Dairy/Alternatives", "items": ["Item 1", "Item 2"] }
  ],
  "nutritionistAdvice": [
    "Advice tip 1",
    "Advice tip 2",
    "Advice tip 3"
  ]
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        systemInstruction: 'You are FoodVerse AI Senior Nutritionist. Generate scientifically sound, highly actionable, delicious meal plans.',
        responseMimeType: 'application/json',
      },
    });

    const parsed = extractJsonFromText(response.text || '{}');
    res.json({ success: true, isDemo: false, data: parsed });
  } catch (error: any) {
    console.error('[Nutrition Planner Error]:', error);
    res.status(500).json({
      error: error.message || 'Failed to generate nutrition plan',
    });
  }
});

// Serve frontend in production or mount Vite middleware in development
async function startServer() {
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[FoodVerse AI] Server running at http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('[FoodVerse AI] Failed to start server:', err);
});
