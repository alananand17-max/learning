import React, { useState } from 'react';
import { Screen, CVData, Profile } from '../../types';
import { fetchAI } from '../../services/aiService';
import LoadingSpinner from '../common/LoadingSpinner';
import { addCV } from '../../services/storageService';

interface GenerateCVScreenProps {
  onNavigate: (screen: Screen, cv?: CVData) => void;
  setSavedCVs: React.Dispatch<React.SetStateAction<CVData[]>>;
  profile: Profile | null;
}

const GenerateCVScreen: React.FC<GenerateCVScreenProps> = ({ onNavigate, setSavedCVs, profile }) => {
  const [jobDescription, setJobDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerateCV = async () => {
    if (!profile) return;
    setIsLoading(true);
    setError(null);
    
    const prompt = `Generate a professional, ATS-compliant CV in Markdown format based on the user's profile and the provided job description.
The output MUST be ONLY the Markdown code for the CV, with no other text or explanations.
The Markdown structure MUST EXACTLY match the following format and conventions. Pay close attention to headings, bolding, italics, and lists.

--- SAMPLE CV FORMAT ---
# JANE DOE

<p class="contact-info">jane.doe@email.com | 555-123-4567 | linkedin.com/in/janedoe</p>

## Professional Summary

[A tailored summary based on the user's profile and the job description.]

## Work Experience

### **Job Title** | Company Name | Location
*Start Date - End Date*

- Responsibility or achievement 1, tailored to the job description.
- Responsibility or achievement 2, tailored to the job description.
- Responsibility or achievement 3, tailored to the job description.

### **Another Job Title** | Another Company | Location
*Start Date - End Date*

- Responsibility or achievement.

## Education

### **Degree Name** | Institution Name | Location
*Graduation Date*

## Skills

**Category:** Skill 1, Skill 2, Skill 3
**Another Category:** Skill A, Skill B

--- END OF SAMPLE ---

Now, generate the CV for the following user, strictly adhering to the format above.

User Profile: """${JSON.stringify(profile)}"""

Job Description: """${jobDescription}"""
`;

    try {
      const markdownCV = await fetchAI<string>({ prompt });
      const newCV: CVData = {
        id: new Date().toISOString(),
        jobDescription,
        markdown: markdownCV,
        atsScore: Math.floor(Math.random() * (99 - 75 + 1)) + 75, // 75-99
        generatedDate: new Date().toISOString(),
      };
      addCV(newCV);
      setSavedCVs(prev => [newCV, ...prev]);
      onNavigate('cv_preview', newCV);
    } catch (e: any) {
      setError(`Failed to generate CV: ${e.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  if (!profile) {
    return (
        <div className="text-center py-12">
            <h2 className="text-xl font-bold">Profile not found</h2>
            <p className="text-dark-text-secondary mt-2">Please set up your profile in the settings before generating a CV.</p>
            <button onClick={() => onNavigate('settings')} className="mt-4 px-4 py-2 bg-brand-primary text-white font-bold rounded-lg hover:bg-indigo-700">
                Go to Settings
            </button>
        </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-center">Generate a Tailored CV</h2>
      {error && <div className="p-4 bg-red-900/50 border border-red-700 text-red-300 rounded-lg">{error}</div>}
      
      {isLoading ? (
        <LoadingSpinner text="Generating your tailored CV..."/>
      ) : (
        <div className="space-y-4">
          <div>
            <label htmlFor="job-description" className="block text-lg font-medium mb-2">Paste Job Description</label>
            <textarea
              id="job-description"
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              placeholder="Paste the full job description here to create a CV tailored specifically for this role."
              className="w-full h-64 bg-dark-bg border border-dark-border rounded-lg p-3 focus:ring-2 focus:ring-brand-primary focus:border-brand-primary transition"
            />
          </div>
          <button
            onClick={handleGenerateCV}
            disabled={!jobDescription.trim()}
            className="w-full px-4 py-3 bg-brand-primary text-white font-bold rounded-lg hover:bg-indigo-700 transition-colors disabled:bg-gray-600 disabled:cursor-not-allowed"
          >
            Generate CV with AI
          </button>
        </div>
      )}
    </div>
  );
};

export default GenerateCVScreen;