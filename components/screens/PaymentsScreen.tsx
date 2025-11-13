import React from 'react';
import { Screen } from '../../types';
import Icon from '../common/Icon';
import CheckoutForm from '../common/CheckoutForm';
import PayPalButton from '../common/PayPalButton';

// Stripe is loaded from a script tag in index.html
declare const Stripe: any;

interface PaymentsScreenProps {
  onNavigate: (screen: Screen) => void;
  onUnlockPro: () => void;
}

// IMPORTANT: This is a public test key from Stripe's documentation.
// In a real application, this should be loaded from environment variables.
const STRIPE_PUBLISHABLE_KEY = 'pk_test_6pRNASCoBOKtIshFeQd4XMUh00PEd3I4p5';

let stripePromise: Promise<any>;
const getStripe = () => {
    if (!stripePromise) {
        // The CheckoutForm component expects a promise, so we wrap the synchronous
        // Stripe object initialization in a resolved promise to match the expected interface.
        stripePromise = Promise.resolve(Stripe(STRIPE_PUBLISHABLE_KEY));
    }
    return stripePromise;
};

const PaymentsScreen: React.FC<PaymentsScreenProps> = ({ onNavigate, onUnlockPro }) => {
    
  const proFeatures = [
    "Unlimited PDF Downloads",
    "Advanced AI-Powered Regeneration",
    "Priority ATS Score Analysis",
    "Access to Premium CV Templates (Coming Soon)",
    "Priority Support"
  ];
  
  const handleSuccess = () => {
    onUnlockPro();
    onNavigate('home');
  };

  return (
    <div className="max-w-lg mx-auto text-center animate-fade-in">
      <Icon name="lock" className="w-16 h-16 mx-auto text-brand-secondary" />
      <h2 className="text-3xl font-bold mt-4">Unlock Pro Features</h2>
      <p className="text-dark-text-secondary mt-2 mb-8">
        Take your job application to the next level. Get unlimited access to all premium features.
      </p>

      <div className="bg-dark-bg border border-dark-border rounded-lg p-6 text-left space-y-4 mb-8">
        <h3 className="text-xl font-semibold">What's Included in Pro:</h3>
        <ul className="space-y-3">
          {proFeatures.map(feature => (
            <li key={feature} className="flex items-start">
              <Icon name="check" className="w-5 h-5 text-green-400 mr-3 mt-1 flex-shrink-0" />
              <span>{feature}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="p-6 bg-brand-primary/10 border border-brand-primary rounded-lg text-left">
        <div className="text-center mb-6">
            <p className="text-lg">One-Time Payment</p>
            <p className="text-5xl font-bold my-2">$9.99</p>
            <p className="text-dark-text-secondary text-sm">Lifetime access, no subscription.</p>
        </div>
        <CheckoutForm stripePromise={getStripe()} onSuccess={handleSuccess} />

        <div className="flex items-center my-6">
            <div className="flex-grow border-t border-dark-border"></div>
            <span className="flex-shrink mx-4 text-dark-text-secondary text-sm">OR</span>
            <div className="flex-grow border-t border-dark-border"></div>
        </div>
        
        <PayPalButton onSuccess={handleSuccess} />
      </div>

      <button
        onClick={() => onNavigate('home')}
        className="mt-8 text-sm text-dark-text-secondary hover:text-dark-text"
      >
        Maybe later
      </button>
    </div>
  );
};

export default PaymentsScreen;