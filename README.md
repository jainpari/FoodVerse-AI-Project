# FoodVerse AI – Multimodal AI-Powered Food Intelligence Platform

FoodVerse AI is a multimodal artificial intelligence platform designed to make food-related decisions smarter, safer, and more personalized. Powered by Google Gemini's multimodal computer vision and culinary reasoning models, FoodVerse AI analyzes food images and short videos, estimates nutritional macros, evaluates produce freshness, monitors commercial kitchen hygiene practices, assists users in the kitchen, and calculates personalized nutrition plans.

---

## 🌟 Main Modules & Capabilities

### 1. 🥗 AI Food Recognition & Nutritional Analysis
- **Live Camera & Image Upload**: Snap dishes directly through your device webcam or upload photos.
- **Multimodal Dish Identification**: Identifies the dish name, cuisine, ingredients with estimated portion weights, and confidence score.
- **Nutritional Dashboard**: Calorie count, macronutrient breakdown (protein, carbs, fats), fiber, sugar, sodium, and micronutrients (e.g. Omega-3, vitamins).
- **Interactive Portion Multiplier**: Dynamically scale serving size (0.5x, 1x, 1.5x, 2x).
- **Dietary & Allergen Detection**: Flags allergens (nuts, dairy, gluten, shellfish) and evaluates dietary suitability (Keto, Vegan, Halal, etc.).
- **1-Click Intake Logging**: Immediately syncs recognized meals to your daily calorie tracker.
- **Preloaded Test Samples**: Test instantly with 1-click curated sample dishes (Wild Salmon Bowl, Avocado Toast, Miso Ramen, Acai Smoothie, Grilled Chicken Salad).

### 2. 🍎 Food Freshness & Spoilage Detection
- **Visual Characteristic Diagnostic**: Scans produce, meats, dairy, and leftovers for signs of aging, discoloration, moisture loss, and mold.
- **Tri-State Classification**:
  - `Fresh`: Optimal texture, color, and firm turgor.
  - `Possibly Aging`: Approaching peak ripeness with natural sugar freckles or slight softening.
  - `Potentially Spoiled`: Significant degradation, weeping moisture, or fungal growth signs.
- **Safe Shelf-Life Projections**: Accurate shelf-life estimates for room temperature, refrigeration, and freezing.
- **Zero-Waste Culinary Rescue**: Recommends smart cooking solutions (e.g., banana bread, veggie broths, fruit purees) before food spoils.
- **Clear Safety Warnings**: Objective explanations reinforcing that visual AI is an estimate and cannot guarantee microbiological safety.

### 3. 🛡️ Restaurant Kitchen Hygiene Monitoring
- **Image & Short Video Inspection**: Audits commercial food prep stations, cook lines, and storage coolers.
- **5 Core Hygiene Pillars**:
  1. Food handling & cross-contamination prevention.
  2. Food storage & covering practices (uncovered pans, floor proximity).
  3. Preparation surfaces, cutting boards & equipment cleanliness.
  4. Personal protective equipment (PPE) compliance (hair restraints, clean aprons, gloves).
  5. Kitchen sanitation, grease containment, and waste management.
- **Actionable Hygiene Observation Report**: Risk rating (`Low Risk`, `Moderate Attention`, `High Concern`), positive compliant practices, specific concern points with corrective actions, and a manager checklist.
- **Mandatory Legal Disclaimer**: Prominently clarifies that observational AI analysis does not constitute official health code certification or regulatory audits.

### 4. 👨‍🍳 Smart AI Cooking Assistant & Chef Chat
- **Interactive Pantry Scanner**: Enter ingredients in your pantry or select common kitchen staples with 1 click.
- **AI Recipe Generator**: Crafts tested recipes tailored to dietary preferences (High Protein, Vegan, Keto, etc.), prep times (15, 30, 45 mins), and skill levels.
- **Active Step Timers**: Built-in stopwatch timers for sauteing, boiling, or searing steps with interactive audio-visual feedback.
- **Ingredient Substitution Matrix**: Provides practical pantry alternatives when missing key ingredients.
- **Interactive Chef FoodVerse Chat**: Ask any culinary question in real time (e.g. "How do I fix a broken emulsion?", "What is the best dairy-free swap for heavy cream?").

### 5. 📊 Personalized Nutrition Planner & Hydration Tracker
- **Biometric Energy Engine**: Calculates BMR and TDEE using the Mifflin-St Jeor equation according to age, biological sex, height, weight, and activity level.
- **Target Macro Distribution**: Calorie deficit/surplus strategy with exact protein, carb, fat, and fiber goals.
- **4-Meal Daily Schedule**: Breakfast, Lunch, Dinner, and Snacks tailored to dietary preferences (Omnivore, Vegetarian, Vegan, Pescatarian, Keto, etc.).
- **Smart Grocery Shopping List**: Categorized ingredients list with interactive checkboxes.
- **Daily Food & Water Tracker**: Real-time progress meters for calories, protein, carbs, fat, and hydration (+250ml clicks).

### 6. 📜 Food Intelligence History & Data Management
- Comprehensive log of past food scans, freshness checks, kitchen audits, and chef recipes.
- Filter by module, search by dish name, and inspect complete structured JSON payloads.
- 1-click JSON export and local cache reset.

---

## 🛠️ Technology Stack & Architecture

- **Frontend**: React 19, TypeScript, Tailwind CSS v4, Lucide React icons, Motion animations.
- **Backend**: Node.js & Express server (`server.ts`) running a secure server-side proxy.
- **AI Multimodal Model**: Google Gemini 3.8 Flash (`gemini-3.8-flash`) via the modern `@google/genai` SDK.
- **Client-Side Security**: API keys are strictly accessed server-side via `process.env.GEMINI_API_KEY`. No API keys or secrets are ever exposed in client browser bundles.
- **Data Persistence**: Local storage with fallback mock schemas ready for Firebase Firestore.

---

## ⚙️ Environment Variables Configuration

Create a `.env` file in the project root:

```bash
# GEMINI_API_KEY: Required for Gemini AI API calls.
# AI Studio automatically injects this at runtime from user secrets.
GEMINI_API_KEY="your-google-gemini-api-key"

# APP_URL: The URL where this applet is hosted.
APP_URL="http://localhost:3000"

# PORT: Server listening port (default: 3000)
PORT=3000
```

---

## 🚀 Installation & Execution

### 1. Install Dependencies
```bash
npm install
```

### 2. Start Full-Stack Development Server
```bash
npm run dev
```
The server will start at `http://localhost:3000` with Express handling `/api/*` endpoints and Vite serving the React frontend.

### 3. Production Build
```bash
npm run build
npm start
```

---

## 🔗 Connecting External Services

### 1. Connecting Google Gemini API
- **In Google AI Studio**: The `GEMINI_API_KEY` is automatically injected into the server environment at runtime through the **Settings > Secrets** panel.
- **In Local Environment**: Obtain an API key from [Google AI Studio](https://aistudio.google.com/) and paste it into your local `.env` file as `GEMINI_API_KEY="AIzaSy..."`.
- The application automatically detects key status through `/api/health`. If no key is configured, high-fidelity demo fixtures ensure all modules remain completely functional for demonstration.

### 2. Connecting Firebase Firestore & Authentication
To enable cloud synchronization across multiple user devices:
1. When prompted or requested, initiate the Firebase setup workflow via the `set_up_firebase` tool in AI Studio.
2. Accept the Firebase terms to provision a Firestore database and Firebase Authentication.
3. Replace the local storage adapter in `src/services/storage.ts` with Firestore collection references (`users/{uid}/intake`, `users/{uid}/history`).
4. FoodVerse AI is architected with modular data schemas in `src/types/foodverse.ts` that map 1:1 to Firestore documents.

---

## ⚖️ Food Safety & Legal Disclaimers

1. **Nutritional Estimation**: All nutritional calories, macronutrients, and ingredient weights are computer-vision-based estimates and should not be used as clinical medical prescriptions.
2. **Freshness Assessment**: Visual AI examines surface-level characteristics (discoloration, texture, mold). It cannot detect odorless microbiological pathogens (e.g., *Salmonella*, *Listeria*, *Staphylococcus aureus*). Always discard food if odor, slime, or uncertainty exists.
3. **Restaurant Hygiene**: Visual kitchen reports provide observational feedback and never certify compliance with local municipal or national health codes. Official certification requires certified public health inspections.
