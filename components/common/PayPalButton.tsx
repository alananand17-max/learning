import React, { useState, useEffect, useRef } from 'react';
import Icon from './Icon';

// The PayPal SDK is loaded from a script in index.html and attaches itself to the window.
// We declare it here to inform TypeScript about the global 'paypal' object.
declare global {
  interface Window {
    paypal: any;
  }
}

interface PayPalButtonProps {
  onSuccess: () => void;
}

// Helper to extract a user-friendly error message from various possible formats.
const getErrorMessage = (error: unknown, defaultMessage: string): string => {
  if (error instanceof Error) return error.message;
  if (error && typeof error === 'object' && 'message' in error && typeof error.message === 'string') return error.message;
  if (typeof error === 'string' && error.length > 0) return error;
  try {
    const stringified = JSON.stringify(error);
    if (stringified !== '{}') return stringified;
  } catch (e) {
    // ignore if stringify fails
  }
  return defaultMessage;
};

const PayPalButton: React.FC<PayPalButtonProps> = ({ onSuccess }) => {
  const paypalContainerRef = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState<'loading' | 'ready' | 'processing' | 'succeeded' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState('');

  // Use a ref for the success callback to ensure the useEffect hook below doesn't
  // re-run if the parent component re-renders with a new function instance.
  const onSuccessRef = useRef(onSuccess);
  useEffect(() => {
    onSuccessRef.current = onSuccess;
  }, [onSuccess]);

  useEffect(() => {
    let buttons: any;

    const intervalId = setInterval(() => {
      // Check if SDK is loaded and container is available
      if (window.paypal && window.paypal.Buttons && paypalContainerRef.current) {
        clearInterval(intervalId);
        
        // Prevent re-rendering if already rendered (e.g., due to React StrictMode)
        if (paypalContainerRef.current.childElementCount > 0) {
          setStatus('ready');
          return;
        }

        try {
          buttons = window.paypal.Buttons({
            style: {
              layout: 'vertical',
              color: 'blue',
              shape: 'rect',
              label: 'paypal',
              height: 55,
            },
            onClick: () => {
               setErrorMessage('');
            },
            createOrder: (data: any, actions: any) => actions.order.create({
              purchase_units: [{
                description: 'ATS CV Generator Pro Lifetime Access',
                amount: { value: '9.99', currency_code: 'USD' }
              }]
            }),
            onApprove: async (data: any, actions: any) => {
              setStatus('processing');
              try {
                const details = await actions.order.capture();
                console.log('PayPal transaction approved:', details);
                setStatus('succeeded');
                setTimeout(() => onSuccessRef.current(), 1500);
              } catch (err) {
                setStatus('error');
                setErrorMessage(getErrorMessage(err, 'Payment failed during capture.'));
              }
            },
            onError: (err: any) => {
              setStatus('error');
              setErrorMessage(getErrorMessage(err, 'An error occurred with the PayPal button.'));
            },
          });

          buttons.render(paypalContainerRef.current)
            .then(() => { setStatus('ready'); })
            .catch((err: any) => {
              setStatus('error');
              setErrorMessage(getErrorMessage(err, 'PayPal button failed to render.'));
            });
        } catch (err) {
          setStatus('error');
          setErrorMessage(getErrorMessage(err, 'PayPal SDK initialization failed.'));
        }
      }
    }, 200);

    const timeoutId = setTimeout(() => {
      clearInterval(intervalId);
      // Only show timeout error if still loading
      setStatus(currentStatus => {
          if(currentStatus === 'loading') {
              setErrorMessage("PayPal SDK failed to load. Check your network or ad-blocker.");
              return 'error';
          }
          return currentStatus;
      });
    }, 10000);

    return () => {
      clearInterval(intervalId);
      clearTimeout(timeoutId);
      if (buttons && typeof buttons.close === 'function') {
        buttons.close().catch((err: any) => {
          console.error('PayPal button cleanup error:', err);
        });
      }
    };
  }, []);


  const renderContent = () => {
    switch (status) {
      case 'loading':
      case 'processing':
        return <><Icon name="loader" className="w-5 h-5 animate-spin" /> {status === 'loading' ? 'Loading PayPal...' : 'Processing...'}</>;
      case 'succeeded':
        return <><Icon name="check" className="w-5 h-5" /> Payment Successful!</>;
      default:
        return null;
    }
  };

  return (
    <div>
      <div className="relative" style={{ minHeight: '55px' }}>
        {/* This overlay provides feedback to the user without unmounting the container below */}
        {status !== 'ready' && status !== 'error' && (
          <div className="absolute inset-0 flex items-center justify-center gap-2 bg-dark-card text-white font-bold rounded-lg pointer-events-none z-10">
            {renderContent()}
          </div>
        )}
        {/* This is the stable container where PayPal will render its button */}
        <div 
          ref={paypalContainerRef}
          className={`transition-opacity duration-300 ${status === 'ready' || status === 'error' ? 'opacity-100' : 'opacity-0'}`}
          aria-hidden={status !== 'ready' && status !== 'error'}
        />
      </div>
      {status === 'error' && errorMessage && (
        <p className="text-red-400 text-sm mt-2 text-center" role="alert">
          {errorMessage}
        </p>
      )}
    </div>
  );
};

export default PayPalButton;