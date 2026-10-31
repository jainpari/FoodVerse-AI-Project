import React, { useState } from 'react';
import {
  User,
  Settings,
  Shield,
  Sparkles,
  Save,
  Check,
  Scale,
  Activity,
  Cpu,
  Database,
  Lock,
  RotateCcw,
  Info,
} from 'lucide-react';
import { UserProfile } from '../types/foodverse';
import { saveUserProfile, DEFAULT_USER_PROFILE } from '../services/storage';

interface Props {
  userProfile: UserProfile;
  onUpdateProfile: (updated: UserProfile) => void;
  onResetData: () => void;
}

export const UserProfileView: React.FC<Props> = ({
  userProfile,
  onUpdateProfile,
  onResetData,
}) => {
  const [profile, setProfile] = useState<UserProfile>(userProfile);
  const [allergiesText, setAllergiesText] = useState(userProfile.allergies.join(', '));
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: UserProfile = {
      ...profile,
      allergies: allergiesText
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean),
    };
    saveUserProfile(updated);
    onUpdateProfile(updated);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleResetToDefault = () => {
    if (confirm('Reset profile to default demo settings?')) {
      setProfile(DEFAULT_USER_PROFILE);
      setAllergiesText(DEFAULT_USER_PROFILE.allergies.join(', '));
      saveUserProfile(DEFAULT_USER_PROFILE);
      onUpdateProfile(DEFAULT_USER_PROFILE);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* Header Banner */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-emerald-900/10 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-linear-to-br from-emerald-600 to-teal-700 text-white flex items-center justify-center font-extrabold text-2xl shadow-md">
              {profile.name
                .split(' ')
                .map((n) => n[0])
                .join('')}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900">
                  {profile.name}
                </h2>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                  Standard Member
                </span>
              </div>
              <p className="text-xs text-slate-500">{profile.email}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleResetToDefault}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-semibold transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Profile</span>
            </button>
            <button
              onClick={onResetData}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-rose-200 text-rose-700 hover:bg-rose-50 text-xs font-semibold transition-colors"
            >
              <span>Reset All Applet Data</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Settings Form */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Form */}
        <form onSubmit={handleSave} className="lg:col-span-7 space-y-6">
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-emerald-900/10 shadow-xs space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <User className="w-4 h-4 text-emerald-700" />
                <span>Personal Biometrics & Calorie Goal</span>
              </h3>
              {savedSuccess && (
                <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                  <Check className="w-4 h-4" />
                  Saved Successfully!
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block text-slate-700 font-medium mb-1">Full Name</label>
                <input
                  type="text"
                  value={profile.name}
                  onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">Email Address</label>
                <input
                  type="email"
                  value={profile.email}
                  onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">Age</label>
                <input
                  type="number"
                  value={profile.age}
                  onChange={(e) => setProfile({ ...profile, age: Number(e.target.value) })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">Biological Sex</label>
                <select
                  value={profile.gender}
                  onChange={(e) => setProfile({ ...profile, gender: e.target.value as any })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50"
                >
                  <option value="Female">Female</option>
                  <option value="Male">Male</option>
                  <option value="Non-binary">Non-binary</option>
                  <option value="Prefer not to say">Prefer not to say</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">Height (cm)</label>
                <input
                  type="number"
                  value={profile.heightCm}
                  onChange={(e) => setProfile({ ...profile, heightCm: Number(e.target.value) })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">Weight (kg)</label>
                <input
                  type="number"
                  value={profile.weightKg}
                  onChange={(e) => setProfile({ ...profile, weightKg: Number(e.target.value) })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">Target Daily Calories (kcal)</label>
                <input
                  type="number"
                  value={profile.targetDailyCalories}
                  onChange={(e) => setProfile({ ...profile, targetDailyCalories: Number(e.target.value) })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">Daily Water Goal (Liters)</label>
                <input
                  type="number"
                  step="0.1"
                  value={profile.waterTargetLiters}
                  onChange={(e) => setProfile({ ...profile, waterTargetLiters: Number(e.target.value) })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50"
                />
              </div>
            </div>

            <div className="space-y-4 pt-2 border-t border-slate-100 text-xs">
              <div>
                <label className="block text-slate-700 font-medium mb-1">Primary Fitness Goal</label>
                <select
                  value={profile.goal}
                  onChange={(e) => setProfile({ ...profile, goal: e.target.value as any })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50"
                >
                  <option value="Weight Loss">Weight Loss</option>
                  <option value="Lean Muscle Gain">Lean Muscle Gain</option>
                  <option value="Maintenance & Longevity">Maintenance & Longevity</option>
                  <option value="Athletic Performance">Athletic Performance</option>
                  <option value="Heart Health">Heart Health</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">Dietary Preference</label>
                <select
                  value={profile.dietaryPreference}
                  onChange={(e) => setProfile({ ...profile, dietaryPreference: e.target.value as any })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50"
                >
                  <option value="Omnivore">Omnivore</option>
                  <option value="Vegetarian">Vegetarian</option>
                  <option value="Vegan">Vegan</option>
                  <option value="Pescatarian">Pescatarian</option>
                  <option value="Keto">Keto</option>
                  <option value="Mediterranean">Mediterranean</option>
                  <option value="Low-FODMAP">Low-FODMAP</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">Food Allergies & Intolerances</label>
                <input
                  type="text"
                  value={allergiesText}
                  onChange={(e) => setAllergiesText(e.target.value)}
                  placeholder="e.g. Peanuts, Shellfish, Lactose, Gluten"
                  className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50"
                />
                <span className="text-[10px] text-slate-400 mt-1 block">Separate allergies with commas.</span>
              </div>
            </div>

            <button
              type="submit"
              className="flex items-center justify-center gap-2 w-full py-3 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl text-xs sm:text-sm shadow-md transition-all"
            >
              <Save className="w-4 h-4" />
              <span>Save Profile & Health Goals</span>
            </button>
          </div>
        </form>

        {/* Right Column: AI Architecture & Technology Integration Docs */}
        <div className="lg:col-span-5 space-y-5">
          {/* AI Status Card */}
          <div className="bg-white rounded-3xl p-6 border border-emerald-900/10 shadow-xs space-y-4">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <Cpu className="w-4 h-4 text-emerald-700" />
              <span>AI Engine & Security Architecture</span>
            </h3>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-2xl bg-emerald-50/70 border border-emerald-100 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-emerald-900">Gemini 3.8 Flash</span>
                  <span className="text-[10px] bg-emerald-200 text-emerald-900 font-bold px-2 py-0.5 rounded-full">
                    Active
                  </span>
                </div>
                <p className="text-emerald-800 text-[11px] leading-relaxed">
                  Integrated via official server-side proxy (<code className="bg-emerald-100 px-1 py-0.5 rounded">server.ts</code>) using the official <code className="bg-emerald-100 px-1 py-0.5 rounded">@google/genai</code> SDK.
                </p>
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                <span className="font-bold text-slate-800 flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-slate-600" />
                  <span>Zero Client-Side Secret Exposure</span>
                </span>
                <p className="text-slate-500 text-[11px]">
                  All multimodal visual reasoning requests, prompt engineering, and structured response parsing execute strictly on the Node.js backend.
                </p>
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                <span className="font-bold text-slate-800 flex items-center gap-1.5">
                  <Database className="w-3.5 h-3.5 text-slate-600" />
                  <span>Persistence & Storage Status</span>
                </span>
                <p className="text-slate-500 text-[11px]">
                  Food logs and visual audit histories are currently stored in local browser state and persistent indexed storage, ready for Firebase Firestore sync.
                </p>
              </div>
            </div>
          </div>

          {/* Firebase & Gemini Setup Instructions Card */}
          <div className="bg-white rounded-3xl p-6 border border-emerald-900/10 shadow-xs space-y-3 text-xs">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <Info className="w-4 h-4 text-emerald-700" />
              <span>Connecting External Services</span>
            </h3>

            <div className="space-y-2 text-slate-600 text-[11px] leading-relaxed">
              <p>
                <strong>Gemini API:</strong> AI Studio automatically injects the active API key through the server runtime environment (<code className="bg-slate-100 px-1 py-0.5 rounded">process.env.GEMINI_API_KEY</code>). No manual client key entry is ever required.
              </p>
              <p>
                <strong>Firebase Firestore & Auth:</strong> If persistent cloud sync across multi-user devices is desired, Firebase Firestore and Auth can be enabled anytime via the AI Studio Firebase setup workflow.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
