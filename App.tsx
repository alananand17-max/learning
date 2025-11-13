import React, { useState, useEffect } from 'react';
import { Screen, CVData, Profile } from './types';
import HomeScreen from './components/screens/HomeScreen';
import SettingsScreen from './components/screens/SettingsScreen';
import JobQuestionnaireScreen from './components/screens/JobQuestionnaireScreen';
import CVPreviewScreen from './components/screens/CVPreviewScreen';
import { loadCVs, loadProfile, saveProfile, saveCVs, isProUser, unlockProFeatures, getCurrentUser, logoutUser } from './services/storageService';
import CVListScreen from './components/screens/CVListScreen';
import { DEFAULT_PROFILE } from './constants';
import AuthScreen from './components/screens/AuthScreen';
import PaymentsScreen from './components/screens/PaymentsScreen';

export default function App() {
  const [currentUser, setCurrentUser] = useState<string | null>(getCurrentUser());
  const [currentScreen, setCurrentScreen] = useState<Screen>('home');
  const [profile, setProfile] = useState<Profile | null>(null);
  const [savedCVs, setSavedCVs] = useState<CVData[]>([]);
  const [currentCV, setCurrentCV] = useState<CVData | null>(null);
  const [isPro, setIsPro] = useState<boolean>(false);

  useEffect(() => {
    const user = getCurrentUser();
    setCurrentUser(user);
    if (user) {
      setSavedCVs(loadCVs());
      setProfile(loadProfile());
      setIsPro(isProUser(user));
    } else {
      // If no user, reset state
      setSavedCVs([]);
      setProfile(null);
      setIsPro(false);
    }
  }, [currentUser]);

  const handleLoginSuccess = (email: string) => {
    setCurrentUser(email);
    setCurrentScreen('home');
  };
  
  const handleLogout = () => {
    logoutUser();
    setCurrentUser(null);
    setCurrentScreen('home'); // Redirect to auth screen logic will handle this
  };

  const handleSaveProfile = (newProfile: Profile) => {
    saveProfile(newProfile);
    setProfile(newProfile);
  };

  const handleNavigate = (screen: Screen, cv?: CVData) => {
    if (cv) {
      setCurrentCV(cv);
    }
    setCurrentScreen(screen);
  };
  
  const handleUpdateCV = (updatedCV: CVData) => {
    const newCVs = savedCVs.map(c => c.id === updatedCV.id ? updatedCV : c);
    setSavedCVs(newCVs);
    saveCVs(newCVs);
    setCurrentCV(updatedCV);
  };
  
  const handleUnlockPro = (): void => {
    if (currentUser && unlockProFeatures(currentUser)) {
      setIsPro(true);
    }
  };

  const renderScreen = () => {
    if (!currentUser) {
        return <AuthScreen onLoginSuccess={handleLoginSuccess} />;
    }
    
    switch (currentScreen) {
      case 'home':
        return <HomeScreen onNavigate={handleNavigate} profile={profile} />;
      case 'settings':
        return <SettingsScreen onNavigate={handleNavigate} onSaveProfile={handleSaveProfile} initialProfile={profile || DEFAULT_PROFILE} isPro={isPro} onLogout={handleLogout} currentUser={currentUser} />;
      case 'job_input':
        return <JobQuestionnaireScreen onNavigate={handleNavigate} setSavedCVs={setSavedCVs} profile={profile} />;
      case 'cv_preview':
        return currentCV ? <CVPreviewScreen cv={currentCV} onNavigate={handleNavigate} onUpdateCV={handleUpdateCV} profile={profile} isPro={isPro} /> : <HomeScreen onNavigate={handleNavigate} profile={profile}/>;
      case 'cv_list':
        return <CVListScreen onNavigate={handleNavigate} cvs={savedCVs} />;
      case 'payment':
        return <PaymentsScreen onNavigate={handleNavigate} onUnlockPro={handleUnlockPro} />;
      default:
        return <HomeScreen onNavigate={handleNavigate} profile={profile} />;
    }
  };

  const getGreeting = () => {
    if (!currentUser) return "Welcome";
    const username = profile?.personalInfo?.name?.split(' ')[0] || currentUser.split('@')[0];
    return `Welcome, ${username}`;
  }

  return (
    <div className="min-h-screen bg-dark-bg text-dark-text font-sans p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        <header className="mb-8 text-center">
          <h1 className="text-4xl sm:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-brand-primary to-brand-secondary">
            ATS CV Generator Pro
          </h1>
          {currentUser && <p className="text-lg text-dark-text-secondary mt-2">{getGreeting()}</p>}
        </header>
        <main className="bg-dark-card shadow-lg rounded-xl p-4 sm:p-6 md:p-8 border border-dark-border">
          {renderScreen()}
        </main>
        <footer className="text-center mt-8 text-dark-text-secondary text-sm">
          <p>&copy; {new Date().getFullYear()} ATS CV Generator Pro. All rights reserved.</p>
        </footer>
      </div>
    </div>
  );
}