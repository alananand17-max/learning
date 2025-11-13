import { Profile } from './types';

export const DEFAULT_QUESTIONS: string[] = [
  "What are your top 3 relevant skills for this position?",
  "Describe your most significant achievement in a previous role that relates to this job.",
  "How do you handle tight deadlines and high-pressure situations?",
  "What are your long-term career goals and how does this role fit into them?",
  "Why are you interested in working for our company?",
];

export const DEFAULT_PROFILE: Profile = {
  personalInfo: {
    name: '',
    email: '',
    phone: '',
    linkedin: '',
    github: '',
    portfolio: '',
  },
  summary: '',
  workExperience: [],
  education: [],
  skills: [],
};