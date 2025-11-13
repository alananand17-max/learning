import React, { useState } from 'react';
import { signUpUser, loginUser } from '../../services/storageService';
import Icon from '../common/Icon';

interface AuthScreenProps {
  onLoginSuccess: (email: string) => void;
}

const AuthScreen: React.FC<AuthScreenProps> = ({ onLoginSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please fill in all fields.');
      return;
    }

    try {
      if (isLogin) {
        const success = loginUser(email, password);
        if (success) {
          onLoginSuccess(email);
        } else {
          setError('Invalid email or password.');
        }
      } else {
        const success = signUpUser(email, password);
        if (success) {
          onLoginSuccess(email);
        } else {
          setError('An account with this email already exists.');
        }
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred.');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center py-10 animate-fade-in">
      <div className="w-full max-w-md">
        <h2 className="text-3xl font-bold text-center mb-2">
          {isLogin ? 'Welcome Back' : 'Create an Account'}
        </h2>
        <p className="text-center text-dark-text-secondary mb-8">
          {isLogin ? 'Sign in to continue.' : 'Get started with your professional CV.'}
        </p>
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && <div className="p-3 bg-red-900/50 border border-red-700 text-red-300 rounded-lg text-center">{error}</div>}
          
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-dark-text mb-1">
              Email Address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 bg-dark-bg border border-dark-border rounded-md placeholder-dark-text-secondary focus:outline-none focus:ring-2 focus:ring-brand-primary"
            />
          </div>

          <div>
            <label htmlFor="password"  className="block text-sm font-medium text-dark-text mb-1">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete={isLogin ? "current-password" : "new-password"}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 bg-dark-bg border border-dark-border rounded-md placeholder-dark-text-secondary focus:outline-none focus:ring-2 focus:ring-brand-primary"
            />
          </div>
          
          <div>
            <button
              type="submit"
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-brand-primary hover:bg-brand-secondary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-dark-card focus:ring-brand-primary transition-colors"
            >
              {isLogin ? 'Sign In' : 'Create Account'}
            </button>
          </div>
        </form>
        <p className="mt-6 text-center text-sm text-dark-text-secondary">
          {isLogin ? "Don't have an account?" : 'Already have an account?'}
          <button
            onClick={() => {
              setIsLogin(!isLogin);
              setError('');
            }}
            className="font-medium text-brand-primary hover:text-brand-secondary ml-1"
          >
            {isLogin ? 'Sign Up' : 'Sign In'}
          </button>
        </p>
      </div>
    </div>
  );
};

export default AuthScreen;