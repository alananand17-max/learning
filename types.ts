export type Screen = 'home' | 'settings' | 'job_input' | 'cv_preview' | 'cv_list' | 'auth' | 'payment';

export interface CVData {
  id: string;
  jobDescription: string;
  markdown: string;
  atsScore: number;
  generatedDate: string;
}

export interface PersonalInfo {
  name: string;
  email: string;
  phone: string;
  linkedin: string;
  github: string;
  portfolio: string;
}

export interface WorkExperience {
  id: string;
  jobTitle: string;
  company: string;
  location: string;
  startDate: string;
  endDate: string;
  responsibilities: string[];
}

export interface Education {
  id:string;
  degree: string;
  institution: string;
  location: string;
  graduationDate: string;
}

export interface Profile {
  personalInfo: PersonalInfo;
  summary: string;
  workExperience: WorkExperience[];
  education: Education[];
  skills: string[];
}