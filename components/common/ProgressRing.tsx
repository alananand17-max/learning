
import React from 'react';

interface ProgressRingProps {
  score: number;
}

const ProgressRing: React.FC<ProgressRingProps> = ({ score }) => {
  const radius = 52;
  const stroke = 12;
  const normalizedRadius = radius - stroke * 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  const scoreColor = score > 85 ? 'text-green-400' : score > 75 ? 'text-yellow-400' : 'text-red-400';
  const ringColor = score > 85 ? 'stroke-green-400' : score > 75 ? 'stroke-yellow-400' : 'stroke-red-400';

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg height={radius * 2} width={radius * 2} className="transform -rotate-90">
        <circle
          className="text-dark-border"
          stroke="currentColor"
          strokeWidth={stroke}
          fill="transparent"
          r={normalizedRadius}
          cx={radius}
          cy={radius}
        />
        <circle
          className={`${ringColor} transition-all duration-1000 ease-in-out`}
          stroke="currentColor"
          strokeWidth={stroke}
          strokeDasharray={`${circumference} ${circumference}`}
          style={{ strokeDashoffset }}
          strokeLinecap="round"
          fill="transparent"
          r={normalizedRadius}
          cx={radius}
          cy={radius}
        />
      </svg>
      <div className="absolute flex flex-col items-center justify-center">
        <span className={`text-4xl font-bold ${scoreColor}`}>{score}</span>
        <span className="text-sm text-dark-text-secondary">ATS Score</span>
      </div>
    </div>
  );
};

export default ProgressRing;
