import React, { useState } from 'react';
import { Profile, Screen } from '../../types';
import { extractProfileFromCV } from '../../services/aiService';
import Icon from '../common/Icon';

interface SettingsScreenProps {
  onNavigate: (screen: Screen) => void;
  onSaveProfile: (profile: Profile) => void;
  initialProfile: Profile;
  isPro: boolean;
  onLogout: () => void;
  currentUser: string;
}

const SettingsScreen: React.FC<SettingsScreenProps> = ({ onNavigate, onSaveProfile, initialProfile, isPro, onLogout, currentUser }) => {
  const [profile, setProfile] = useState<Profile>(initialProfile);
  const [cvText, setCvText] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisError, setAnalysisError] = useState('');
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saved'>('idle');

  const handleAnalyzeCV = async () => {
    if (!cvText.trim()) return;
    setIsAnalyzing(true);
    setAnalysisError('');
    try {
      const extractedProfile = await extractProfileFromCV(cvText);
      setProfile(extractedProfile);
    } catch (e: any) {
      setAnalysisError(`Failed to analyze CV: ${e.message}`);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleProfileChange = (field: string, value: any) => {
    const keys = field.split('.');
    setProfile(prev => {
        let updated = { ...prev };
        let current: any = updated;
        for (let i = 0; i < keys.length - 1; i++) {
            current = current[keys[i]];
        }
        current[keys[keys.length - 1]] = value;
        return updated;
    });
  };

  const handleDynamicListChange = (section: 'workExperience' | 'education', index: number, field: string, value: any) => {
     setProfile(prev => {
        const updatedSection = [...prev[section]];
        (updatedSection[index] as any)[field] = value;
        return { ...prev, [section]: updatedSection };
    });
  };
  
  const addDynamicListItem = (section: 'workExperience' | 'education') => {
      setProfile(prev => {
          const newItem = section === 'workExperience' 
              ? { id: crypto.randomUUID(), jobTitle: '', company: '', location: '', startDate: '', endDate: '', responsibilities: [''] }
              : { id: crypto.randomUUID(), degree: '', institution: '', location: '', graduationDate: ''};
          return { ...prev, [section]: [...prev[section], newItem] };
      });
  };

  const removeDynamicListItem = (section: 'workExperience' | 'education', id: string) => {
      setProfile(prev => ({
          ...prev,
          [section]: prev[section].filter((item: any) => item.id !== id)
      }));
  };

  const handleSaveProfile = () => {
    onSaveProfile(profile);
    setSaveStatus('saved');
    setTimeout(() => setSaveStatus('idle'), 3000);
  }

  return (
    <div className="space-y-6">
        <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold">User Profile & Settings</h2>
            <button
                onClick={() => onNavigate('home')}
                className="px-4 py-2 bg-dark-border text-white font-semibold rounded-lg hover:bg-gray-600 transition-colors text-sm flex items-center gap-2"
            >
                <Icon name="home" className="w-4 h-4" />
                Back to Home
            </button>
        </div>
        
        <div className="space-y-8 animate-fade-in">
             <div className="p-4 border border-dark-border rounded-lg space-y-4">
                <h3 className="text-lg font-semibold">Account Information</h3>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <p className="text-sm text-dark-text-secondary">Email: <span className="font-medium text-dark-text">{currentUser}</span></p>
                        <p className="text-sm text-dark-text-secondary">Plan: 
                            <span className={`font-medium ml-1 px-2 py-0.5 rounded-full text-xs ${isPro ? 'bg-green-800 text-green-300' : 'bg-gray-700 text-gray-300'}`}>
                                {isPro ? 'Pro' : 'Free'}
                            </span>
                        </p>
                    </div>
                    <div className="flex items-center gap-2 w-full sm:w-auto">
                        {!isPro && (
                            <button onClick={() => onNavigate('payment')} className="w-full sm:w-auto px-4 py-2 bg-brand-primary text-white font-semibold rounded-lg hover:bg-brand-secondary transition-colors text-sm">
                                Upgrade to Pro
                            </button>
                        )}
                        <button onClick={onLogout} className="w-full sm:w-auto px-4 py-2 bg-red-800 text-white font-semibold rounded-lg hover:bg-red-700 transition-colors text-sm">
                            Logout
                        </button>
                    </div>
                </div>
            </div>

            <div>
                <h2 id="analyze-cv-heading" className="text-2xl font-bold">Analyze Existing CV</h2>
                <p className="text-dark-text-secondary mb-2">Paste your full CV below to have the AI extract and fill in your details automatically.</p>
                 {analysisError && <div className="p-3 my-2 bg-red-900/50 border border-red-700 text-red-300 rounded-lg">{analysisError}</div>}
                <textarea value={cvText} onChange={(e) => setCvText(e.target.value)} placeholder="Paste your CV here..." className="w-full h-40 bg-dark-bg border border-dark-border rounded-lg p-3 focus:ring-2 focus:ring-brand-primary"/>
                <button onClick={handleAnalyzeCV} disabled={isAnalyzing || !cvText.trim()} className="mt-2 w-full px-4 py-3 bg-brand-secondary text-white font-bold rounded-lg hover:bg-purple-700 transition-colors disabled:bg-gray-600">
                    {isAnalyzing ? 'Analyzing...' : 'Analyze with AI'}
                </button>
            </div>

            <div className="space-y-6">
              <h2 className="text-2xl font-bold">Edit Profile Details</h2>
              {/* Personal Info */}
              <div className="p-4 border border-dark-border rounded-lg space-y-4">
                  <h3 className="text-lg font-semibold">Personal Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div><label className="block text-sm font-medium mb-1">Full Name</label><input type="text" value={profile.personalInfo.name} onChange={e => handleProfileChange('personalInfo.name', e.target.value)} className="w-full bg-dark-bg border-dark-border rounded-md p-2"/></div>
                      <div><label className="block text-sm font-medium mb-1">Email</label><input type="email" value={profile.personalInfo.email} onChange={e => handleProfileChange('personalInfo.email', e.target.value)} className="w-full bg-dark-bg border-dark-border rounded-md p-2"/></div>
                      <div><label className="block text-sm font-medium mb-1">Phone</label><input type="tel" value={profile.personalInfo.phone} onChange={e => handleProfileChange('personalInfo.phone', e.target.value)} className="w-full bg-dark-bg border-dark-border rounded-md p-2"/></div>
                      <div><label className="block text-sm font-medium mb-1">LinkedIn URL</label><input type="url" value={profile.personalInfo.linkedin} onChange={e => handleProfileChange('personalInfo.linkedin', e.target.value)} className="w-full bg-dark-bg border-dark-border rounded-md p-2"/></div>
                       <div><label className="block text-sm font-medium mb-1">GitHub URL</label><input type="url" value={profile.personalInfo.github} onChange={e => handleProfileChange('personalInfo.github', e.target.value)} className="w-full bg-dark-bg border-dark-border rounded-md p-2"/></div>
                        <div><label className="block text-sm font-medium mb-1">Portfolio URL</label><input type="url" value={profile.personalInfo.portfolio} onChange={e => handleProfileChange('personalInfo.portfolio', e.target.value)} className="w-full bg-dark-bg border-dark-border rounded-md p-2"/></div>
                  </div>
              </div>
               {/* Summary */}
              <div className="p-4 border border-dark-border rounded-lg space-y-2">
                  <h3 className="text-lg font-semibold">Professional Summary</h3>
                  <textarea value={profile.summary} onChange={e => handleProfileChange('summary', e.target.value)} className="w-full h-24 bg-dark-bg border-dark-border rounded-md p-2"/>
              </div>
              {/* Work Experience */}
              <div className="p-4 border border-dark-border rounded-lg space-y-4">
                  <div className="flex justify-between items-center"><h3 className="text-lg font-semibold">Work Experience</h3><button onClick={() => addDynamicListItem('workExperience')} className="p-1 rounded-full hover:bg-dark-border"><Icon name="plus" className="w-5 h-5"/></button></div>
                  {profile.workExperience.map((exp, index) => (
                      <div key={exp.id} className="p-3 bg-dark-bg rounded-md space-y-3 relative">
                           <button onClick={() => removeDynamicListItem('workExperience', exp.id)} className="absolute top-2 right-2 p-1 rounded-full hover:bg-dark-border text-dark-text-secondary hover:text-red-400"><Icon name="trash" className="w-5 h-5"/></button>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              <div><label className="text-xs">Job Title</label><input type="text" value={exp.jobTitle} onChange={e => handleDynamicListChange('workExperience', index, 'jobTitle', e.target.value)} className="w-full bg-dark-card border-dark-border rounded p-1.5"/></div>
                              <div><label className="text-xs">Company</label><input type="text" value={exp.company} onChange={e => handleDynamicListChange('workExperience', index, 'company', e.target.value)} className="w-full bg-dark-card border-dark-border rounded p-1.5"/></div>
                              <div><label className="text-xs">Start Date</label><input type="text" value={exp.startDate} onChange={e => handleDynamicListChange('workExperience', index, 'startDate', e.target.value)} className="w-full bg-dark-card border-dark-border rounded p-1.5"/></div>
                              <div><label className="text-xs">End Date</label><input type="text" value={exp.endDate} onChange={e => handleDynamicListChange('workExperience', index, 'endDate', e.target.value)} className="w-full bg-dark-card border-dark-border rounded p-1.5"/></div>
                          </div>
                          <div><label className="text-xs">Responsibilities (one per line)</label><textarea value={Array.isArray(exp.responsibilities) ? exp.responsibilities.join('\n') : ''} onChange={e => handleDynamicListChange('workExperience', index, 'responsibilities', e.target.value.split('\n'))} className="w-full h-20 bg-dark-card border-dark-border rounded p-1.5"/></div>
                      </div>
                  ))}
              </div>
              {/* Education */}
              <div className="p-4 border border-dark-border rounded-lg space-y-4">
                  <div className="flex justify-between items-center"><h3 className="text-lg font-semibold">Education</h3><button onClick={() => addDynamicListItem('education')} className="p-1 rounded-full hover:bg-dark-border"><Icon name="plus" className="w-5 h-5"/></button></div>
                  {profile.education.map((edu, index) => (
                      <div key={edu.id} className="p-3 bg-dark-bg rounded-md space-y-3 relative">
                          <button onClick={() => removeDynamicListItem('education', edu.id)} className="absolute top-2 right-2 p-1 rounded-full hover:bg-dark-border text-dark-text-secondary hover:text-red-400"><Icon name="trash" className="w-5 h-5"/></button>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              <div><label className="text-xs">Degree</label><input type="text" value={edu.degree} onChange={e => handleDynamicListChange('education', index, 'degree', e.target.value)} className="w-full bg-dark-card border-dark-border rounded p-1.5"/></div>
                              <div><label className="text-xs">Institution</label><input type="text" value={edu.institution} onChange={e => handleDynamicListChange('education', index, 'institution', e.target.value)} className="w-full bg-dark-card border-dark-border rounded p-1.5"/></div>
                              <div><label className="text-xs">Graduation Date</label><input type="text" value={edu.graduationDate} onChange={e => handleDynamicListChange('education', index, 'graduationDate', e.target.value)} className="w-full bg-dark-card border-dark-border rounded p-1.5"/></div>
                          </div>
                      </div>
                  ))}
              </div>
               {/* Skills */}
              <div className="p-4 border border-dark-border rounded-lg space-y-2">
                  <h3 className="text-lg font-semibold">Skills</h3>
                  <p className="text-sm text-dark-text-secondary">Enter skills separated by commas.</p>
                  <textarea value={Array.isArray(profile.skills) ? profile.skills.join(', ') : ''} onChange={e => handleProfileChange('skills', e.target.value.split(',').map(s => s.trim()))} className="w-full h-20 bg-dark-bg border-dark-border rounded-md p-2"/>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                  <button onClick={handleSaveProfile} className="flex-1 py-3 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 transition-colors">
                      {saveStatus === 'saved' ? 'Profile Saved!' : 'Save Profile'}
                  </button>
                   <button 
                      onClick={() => document.getElementById('analyze-cv-heading')?.scrollIntoView({ behavior: 'smooth' })}
                      className="flex-1 py-3 bg-dark-border font-semibold rounded-lg hover:bg-gray-600 transition-colors"
                  >
                      Analyze Another CV
                  </button>
              </div>
            </div>
        </div>
    </div>
  );
};

export default SettingsScreen;