import { CVData, Profile } from '../types';

const CVS_KEY = 'ats_cv_generator_pro_cvs';
const PROFILE_KEY = 'ats_cv_generator_pro_profile';
const PRO_KEY_PREFIX = 'ats_cv_generator_pro_status_';
const CURRENT_USER_KEY = 'ats_cv_generator_pro_current_user';
const USERS_KEY = 'ats_cv_generator_pro_users';

// --- User Management ---
export const getCurrentUser = (): string | null => {
    return localStorage.getItem(CURRENT_USER_KEY);
};

export const logoutUser = (): void => {
    localStorage.removeItem(CURRENT_USER_KEY);
};

const getUsers = (): Record<string, string> => {
    const users = localStorage.getItem(USERS_KEY);
    return users ? JSON.parse(users) : {};
};

export const signUpUser = (email: string, password_unused: string): boolean => {
    const users = getUsers();
    if (users[email]) {
        return false; // User already exists
    }
    users[email] = 'dummy_hash'; // In a real app, this would be a hashed password
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
    localStorage.setItem(CURRENT_USER_KEY, email);
    return true;
};

export const loginUser = (email: string, password_unused: string): boolean => {
    const users = getUsers();
    if (users[email]) {
        localStorage.setItem(CURRENT_USER_KEY, email);
        return true;
    }
    return false; // User not found
};

// --- Data Management ---
export const saveCVs = (cvs: CVData[]): void => {
  localStorage.setItem(CVS_KEY, JSON.stringify(cvs));
}

export const loadCVs = (): CVData[] => {
  const storedCVs = localStorage.getItem(CVS_KEY);
  return storedCVs ? JSON.parse(storedCVs) : [];
}

export const addCV = (cv: CVData): void => {
  const cvs = loadCVs();
  saveCVs([cv, ...cvs]);
}

export const saveProfile = (profile: Profile): void => {
    localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
};

export const loadProfile = (): Profile | null => {
    const storedProfile = localStorage.getItem(PROFILE_KEY);
    return storedProfile ? JSON.parse(storedProfile) : null;
};

// --- Pro Features ---
export const isProUser = (email: string): boolean => {
    if (!email) return false;
    return localStorage.getItem(PRO_KEY_PREFIX + email) === 'true';
};

export const unlockProFeatures = (email: string): boolean => {
    if (!email) return false;
    // In a real app, this would be validated by a server after payment.
    // Here, we just unlock it for the current user.
    localStorage.setItem(PRO_KEY_PREFIX + email, 'true');
    return true;
};