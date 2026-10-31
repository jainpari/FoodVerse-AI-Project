import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { LiveCameraModal } from './components/LiveCameraModal';
import { HomeDashboard } from './views/HomeDashboard';
import { FoodRecognitionView } from './views/FoodRecognitionView';
import { FreshnessDetectionView } from './views/FreshnessDetectionView';
import { RestaurantHygieneView } from './views/RestaurantHygieneView';
import { CookingAssistantView } from './views/CookingAssistantView';
import { NutritionPlannerView } from './views/NutritionPlannerView';
import { DailyIntakeTrackerView } from './views/DailyIntakeTrackerView';
import { FoodHistoryView } from './views/FoodHistoryView';
import { UserProfileView } from './views/UserProfileView';
import {
  ModuleType,
  UserProfile,
  FoodIntakeItem,
  AnalysisHistoryItem,
} from './types/foodverse';
import {
  loadUserProfile,
  saveUserProfile,
  loadIntakeItems,
  saveIntakeItems,
  loadDailyWater,
  saveDailyWater,
  loadHistoryItems,
  saveHistoryItems,
  clearAllHistory,
  DEFAULT_USER_PROFILE,
  INITIAL_INTAKE_ITEMS,
  INITIAL_HISTORY_ITEMS,
} from './services/storage';

export default function App() {
  const [activeModule, setActiveModule] = useState<ModuleType>('home');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [cameraModalOpen, setCameraModalOpen] = useState(false);
  const [cameraCapturedImage, setCameraCapturedImage] = useState<string | null>(null);

  // App-level persistent data
  const [userProfile, setUserProfile] = useState<UserProfile>(loadUserProfile());
  const [intakeItems, setIntakeItems] = useState<FoodIntakeItem[]>(loadIntakeItems());
  const [historyItems, setHistoryItems] = useState<AnalysisHistoryItem[]>(loadHistoryItems());
  const [waterLiters, setWaterLiters] = useState<number>(loadDailyWater());

  // Aggregate daily metrics
  const dailyCalories = intakeItems.reduce((acc, item) => acc + item.calories, 0);
  const dailyProtein = intakeItems.reduce((acc, item) => acc + item.protein, 0);
  const dailyCarbs = intakeItems.reduce((acc, item) => acc + item.carbs, 0);
  const dailyFat = intakeItems.reduce((acc, item) => acc + item.fat, 0);

  const handleAddWater = (amount = 0.25) => {
    const updated = Math.min(6.0, waterLiters + amount);
    setWaterLiters(updated);
    saveDailyWater(updated);
  };

  const handleResetWater = () => {
    setWaterLiters(0);
    saveDailyWater(0);
  };

  const handleOpenQuickScan = () => {
    setCameraModalOpen(true);
  };

  const handleCameraCapture = (base64Image: string) => {
    setCameraCapturedImage(base64Image);
    // If not currently in a visual module, redirect to Food Recognition by default
    if (activeModule !== 'recognition' && activeModule !== 'freshness' && activeModule !== 'hygiene') {
      setActiveModule('recognition');
    }
  };

  const handleResetAllData = () => {
    if (confirm('Are you sure you want to reset all local storage data, food history, and logs?')) {
      clearAllHistory();
      setUserProfile(DEFAULT_USER_PROFILE);
      saveUserProfile(DEFAULT_USER_PROFILE);
      setIntakeItems(INITIAL_INTAKE_ITEMS);
      saveIntakeItems(INITIAL_INTAKE_ITEMS);
      setHistoryItems(INITIAL_HISTORY_ITEMS);
      saveHistoryItems(INITIAL_HISTORY_ITEMS);
      setWaterLiters(1.75);
      saveDailyWater(1.75);
      setActiveModule('home');
    }
  };

  return (
    <div className="min-h-screen bg-[#faf8f5] text-slate-800 flex">
      {/* Sidebar Navigation */}
      <Sidebar
        activeModule={activeModule}
        onSelectModule={setActiveModule}
        mobileOpen={mobileMenuOpen}
        onCloseMobile={() => setMobileMenuOpen(false)}
        onOpenQuickScan={handleOpenQuickScan}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <Header
          activeModule={activeModule}
          onOpenMobile={() => setMobileMenuOpen(true)}
          onOpenQuickScan={handleOpenQuickScan}
          dailyCalories={dailyCalories}
          targetCalories={userProfile.targetDailyCalories || 2150}
          waterLiters={waterLiters}
          onAddWater={() => handleAddWater(0.25)}
        />

        <main className="flex-1 p-4 sm:p-8 max-w-7xl w-full mx-auto">
          {activeModule === 'home' && (
            <HomeDashboard
              onNavigate={setActiveModule}
              onOpenQuickScan={handleOpenQuickScan}
              userProfile={userProfile}
              dailyCalories={dailyCalories}
              dailyProtein={dailyProtein}
              dailyCarbs={dailyCarbs}
              dailyFat={dailyFat}
              waterLiters={waterLiters}
              onAddWater={() => handleAddWater(0.25)}
              recentHistory={historyItems}
            />
          )}

          {activeModule === 'recognition' && (
            <FoodRecognitionView
              onOpenLiveCamera={handleOpenQuickScan}
              capturedImageFromCamera={cameraCapturedImage}
              onClearCapturedCamera={() => setCameraCapturedImage(null)}
              onIntakeAdded={() => {
                setIntakeItems(loadIntakeItems());
                setHistoryItems(loadHistoryItems());
              }}
            />
          )}

          {activeModule === 'freshness' && (
            <FreshnessDetectionView
              onOpenLiveCamera={handleOpenQuickScan}
              capturedImageFromCamera={cameraCapturedImage}
              onClearCapturedCamera={() => setCameraCapturedImage(null)}
            />
          )}

          {activeModule === 'hygiene' && (
            <RestaurantHygieneView
              onOpenLiveCamera={handleOpenQuickScan}
              capturedImageFromCamera={cameraCapturedImage}
              onClearCapturedCamera={() => setCameraCapturedImage(null)}
            />
          )}

          {activeModule === 'cooking' && <CookingAssistantView />}

          {activeModule === 'planner' && (
            <NutritionPlannerView
              userProfile={userProfile}
              onUpdateProfile={(updated) => {
                setUserProfile(updated);
                saveUserProfile(updated);
              }}
              onIntakeAdded={() => setIntakeItems(loadIntakeItems())}
            />
          )}

          {activeModule === 'tracker' && (
            <DailyIntakeTrackerView
              intakeItems={intakeItems}
              onUpdateIntake={setIntakeItems}
              userProfile={userProfile}
              waterLiters={waterLiters}
              onAddWater={handleAddWater}
              onResetWater={handleResetWater}
            />
          )}

          {activeModule === 'history' && (
            <FoodHistoryView
              historyItems={historyItems}
              onUpdateHistory={setHistoryItems}
            />
          )}

          {activeModule === 'profile' && (
            <UserProfileView
              userProfile={userProfile}
              onUpdateProfile={setUserProfile}
              onResetData={handleResetAllData}
            />
          )}
        </main>
      </div>

      {/* Live Camera Snapshot Modal */}
      <LiveCameraModal
        isOpen={cameraModalOpen}
        onClose={() => setCameraModalOpen(false)}
        onCapture={handleCameraCapture}
        title={
          activeModule === 'hygiene'
            ? 'Capture Restaurant Kitchen Area'
            : activeModule === 'freshness'
            ? 'Capture Produce / Fresh Food'
            : 'Capture Food Dish'
        }
      />
    </div>
  );
}
