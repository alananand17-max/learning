
import React from 'react';
import Icon from './Icon';

interface LoadingSpinnerProps {
  text?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ text = "Processing..." }) => {
  return (
    <div className="flex flex-col items-center justify-center space-y-4 my-8">
      <Icon name="loader" className="w-12 h-12 animate-spin text-brand-primary" />
      <p className="text-lg text-dark-text-secondary">{text}</p>
    </div>
  );
};

export default LoadingSpinner;
