import React, { useState } from 'react';
import Icon from './Icon';

// These types would typically come from @stripe/react-stripe-js and @stripe/stripe-js
// but we'll define them loosely to avoid adding new dependencies.
interface Stripe {
  createPaymentMethod: (options: any) => Promise<any>;
  elements: () => any;
}
interface Elements {
  getElement: (type: any) => any;
}
declare const CardElement: any;
declare const Elements: any;
declare const useStripe: () => Stripe;
declare const useElements: () => Elements;

interface CheckoutFormProps {
  onSuccess: () => void;
}

const StripeCheckoutForm: React.FC<CheckoutFormProps> = ({ onSuccess }) => {
  const stripe = useStripe();
  const [error, setError] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [succeeded, setSucceeded] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setProcessing(true);

    if (!stripe) {
      // Stripe.js has not yet loaded.
      // Make sure to disable form submission until Stripe.js has loaded.
      setProcessing(false);
      return;
    }
    
    // In our mock setup, the CardElement instance is stored on the window.
    const cardElement = (window as any).CardElement;
    if (!cardElement) {
        setError("Card element not ready. Please wait a moment and try again.");
        setProcessing(false);
        return;
    }

    const { error: paymentMethodError, paymentMethod } = await stripe.createPaymentMethod({
      type: 'card',
      card: cardElement,
    });

    if (paymentMethodError) {
      setError(paymentMethodError.message ?? 'An unknown error occurred.');
      setProcessing(false);
      return;
    } 
    
    // In a real app, you would send the paymentMethod.id to your backend.
    // The backend would then create a charge using the Stripe API with your secret key.
    // For this simulation, we'll just assume success.
    console.log('Simulating successful payment with PaymentMethod:', paymentMethod);
    
    setError(null);
    setProcessing(false);
    setSucceeded(true);

    // Wait a moment to show success message before calling onSuccess
    setTimeout(() => {
        onSuccess();
    }, 1500);
  };

  const cardElementOptions = {
    style: {
      base: {
        color: '#d1d5db',
        fontFamily: 'sans-serif',
        fontSmoothing: 'antialiased',
        fontSize: '16px',
        '::placeholder': {
          color: '#6b7280'
        },
      },
      invalid: {
        color: '#ef4444',
        iconColor: '#ef4444'
      }
    },
    hidePostalCode: true,
  };

  return (
    <form id="payment-form" onSubmit={handleSubmit}>
        <label htmlFor="card-element" className="block text-sm font-medium mb-2">Credit or debit card</label>
        <div id="card-element" className="p-3 bg-dark-bg border border-dark-border rounded-md">
            {/* The real CardElement is mounted here by our mock provider */}
        </div>

      {error && <div className="text-red-400 text-sm mt-2 text-center" role="alert">{error}</div>}
      
      <button
        disabled={processing || succeeded || !stripe}
        id="submit"
        className="mt-6 w-full flex items-center justify-center gap-2 px-8 py-4 bg-brand-primary text-white font-bold rounded-lg hover:bg-indigo-700 transition-colors disabled:bg-gray-600 disabled:cursor-not-allowed"
      >
        {processing ? (
            <><Icon name="loader" className="w-5 h-5 animate-spin" /> Processing...</>
        ) : succeeded ? (
            <><Icon name="check" className="w-5 h-5" /> Payment Successful!</>
        ) : (
            `Pay $9.99`
        )}
      </button>
      <p className="text-xs text-dark-text-secondary text-center mt-2">
          You can use the test card number <strong className="font-mono text-dark-text">4242 4242 4242 4242</strong> to simulate a successful payment.
      </p>
    </form>
  );
};

// Main component that wraps the form with Stripe's Elements provider
const CheckoutFormWrapper: React.FC<{ stripePromise: Promise<any>, onSuccess: () => void }> = ({ stripePromise, onSuccess }) => {
    // This is a workaround because we don't have the real @stripe/react-stripe-js library.
    // In a real project, you'd use the Elements component from the library directly.
    const [StripeElements, setStripeElements] = useState<any>(null);

    React.useEffect(() => {
        // This simulates how the real library works internally.
        // It provides the Stripe promise and Elements context to child components.
        // We have to mock the hooks `useStripe` and `useElements` for our form.
        stripePromise.then(stripe => {
             const elements = stripe.elements();
             (window as any).useStripe = () => stripe;
             (window as any).useElements = () => elements;
             // Store the card element instance on the window for direct access in the form
             (window as any).CardElement = elements.create('card');
             
             // A mock Elements provider component
             const MockElementsProvider = ({children}: any) => {
                 // Mount the card element when the provider is rendered
                 React.useEffect(() => {
                    (window as any).CardElement.mount('#card-element');
                    
                    // Cleanup by unmounting the element
                    return () => {
                        try {
                           (window as any).CardElement.unmount();
                        } catch(e) {
                            // Ignore if it's already gone
                        }
                    }
                 }, []);
                 return children;
             };
             setStripeElements(() => MockElementsProvider);
        });
    }, [stripePromise]);

    if (!StripeElements) {
        return <div className="text-center p-4"><Icon name="loader" className="w-8 h-8 animate-spin mx-auto text-dark-text-secondary"/></div>;
    }
    
    return (
        <StripeElements>
            <StripeCheckoutForm onSuccess={onSuccess} />
        </StripeElements>
    );
};


export default CheckoutFormWrapper;
