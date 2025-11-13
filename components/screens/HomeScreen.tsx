import React from 'react';
import { Screen, Profile } from '../../types';
import Icon from '../common/Icon';

interface HomeScreenProps {
  onNavigate: (screen: Screen) => void;
  profile: Profile | null;
}

const HomeScreen: React.FC<HomeScreenProps> = ({ onNavigate, profile }) => {
  const isProfileConfigured = profile && profile.personalInfo.name && profile.summary;

  return (
    <div className="space-y-8">
      {!isProfileConfigured && (
        <div className="p-4 bg-yellow-900/50 border border-yellow-700 rounded-lg flex items-start space-x-3">
          <Icon name="user" className="w-6 h-6 text-yellow-400 mt-1 flex-shrink-0" />
          <div>
            <h3 className="font-bold text-yellow-300">Profile Not Set Up</h3>
            <p className="text-yellow-400">
              Please set up your profile to generate tailored CVs.
            </p>
            <button
              onClick={() => onNavigate('settings')}
              className="mt-2 text-sm font-semibold text-yellow-200 hover:text-white"
            >
              Go to Settings &rarr;
            </button>
          </div>
        </div>
      )}

      <div className="text-center p-6 bg-dark-bg rounded-lg border border-dark-border">
          <h2 className="text-xl font-semibold">Settings & Profile</h2>
          <p className="text-dark-text-secondary text-sm mb-4">Configure your personal CV details before you begin.</p>
          <button
              onClick={() => onNavigate('settings')}
              className="p-3 bg-brand-primary text-white hover:bg-brand-secondary rounded-lg transition-colors inline-flex items-center gap-2"
              aria-label="Go to settings"
            >
              <Icon name="settings" />
              <span>Configure Profile</span>
          </button>
      </div>

      <div className="text-center space-y-6 pt-6 border-t border-dark-border">
          <h2 className="text-2xl font-bold">Get Started</h2>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                onClick={() => onNavigate('job_input')}
                disabled={!isProfileConfigured}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-4 bg-brand-primary text-white font-bold rounded-lg hover:bg-indigo-700 transition-colors disabled:bg-gray-600 disabled:cursor-not-allowed"
              >
                <Icon name="file-text" className="w-5 h-5"/>
                Generate New CV
              </button>
               <button
                onClick={() => onNavigate('cv_list')}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-4 bg-dark-border text-white font-bold rounded-lg hover:bg-gray-600 transition-colors"
              >
                <Icon name="list" className="w-5 h-5"/>
                View Saved CVs
              </button>
          </div>
          {!isProfileConfigured && <p className="text-yellow-400 text-sm mt-4">You must configure your profile before generating a CV.</p>}
      </div>
    </div>
  );
};

export default HomeScreen;