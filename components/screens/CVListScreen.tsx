
import React from 'react';
import { CVData, Screen } from '../../types';
import Icon from '../common/Icon';

interface CVListScreenProps {
  cvs: CVData[];
  onNavigate: (screen: Screen, cv?: CVData) => void;
}

const CVListScreen: React.FC<CVListScreenProps> = ({ cvs, onNavigate }) => {
  return (
    <div className="space-y-6">
       <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Saved CVs</h2>
          <button
              onClick={() => onNavigate('home')}
              className="px-4 py-2 bg-dark-border text-white font-semibold rounded-lg hover:bg-gray-600 transition-colors text-sm flex items-center gap-2"
            >
              <Icon name="home" className="w-4 h-4" />
              Home
          </button>
      </div>
      
      {cvs.length === 0 ? (
        <div className="text-center py-12 px-6 bg-dark-bg rounded-lg border-2 border-dashed border-dark-border">
          <Icon name="file-text" className="mx-auto w-12 h-12 text-dark-text-secondary" />
          <h3 className="mt-4 text-xl font-semibold">No Saved CVs</h3>
          <p className="mt-1 text-dark-text-secondary">Generate a new CV to see it here.</p>
          <button
            onClick={() => onNavigate('job_input')}
            className="mt-6 px-4 py-2 bg-brand-primary text-white font-bold rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Generate New CV
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {cvs.map(cv => (
            <div 
              key={cv.id} 
              className="bg-dark-bg p-4 rounded-lg border border-dark-border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
            >
              <div className="flex-grow">
                <p className="font-semibold truncate text-lg" title={cv.jobDescription}>
                  For: {cv.jobDescription.substring(0, 50)}...
                </p>
                <p className="text-sm text-dark-text-secondary">
                  Generated on: {new Date(cv.generatedDate).toLocaleDateString()}
                </p>
              </div>
              <div className="flex items-center gap-4 w-full sm:w-auto">
                 <div className="text-lg font-bold">ATS: {cv.atsScore}</div>
                 <button
                    onClick={() => onNavigate('cv_preview', cv)}
                    className="flex-1 sm:flex-initial w-full px-4 py-2 bg-brand-primary text-white font-semibold rounded-lg hover:bg-indigo-700 transition-colors text-sm"
                  >
                   View
                 </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CVListScreen;
