import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './TenantPaymentPage.css';

// Payment method data with logo placeholders
const paymentMethodsETB = [
  { id: 'cbe', name: 'CBE Birr', icon: '🏦', color: '#1e40af' },
  { id: 'telebirr', name: 'Telebirr', icon: '📱', color: '#059669' },
  { id: 'abissinia', name: 'Abissinia', icon: '🏛️', color: '#dc2626' },
  { id: 'hellocash', name: 'HelloCash', icon: '💸', color: '#7c3aed' }
];

const paymentMethodsGlobal = [
  { id: 'card', name: 'Credit/Debit Card', icon: '💳', color: '#3b82f6' },
  { id: 'paypal', name: 'PayPal', icon: '🔵', color: '#0070ba' },
  { id: 'googlepay', name: 'Google Pay', icon: '📲', color: '#4285f4' },
  { id: 'applepay', name: 'Apple Pay', icon: '🍎', color: '#000000' }
];

// Currency options
const currencies = [
  { code: 'ETB', symbol: 'Br', name: 'Ethiopian Birr' },
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'GBP', symbol: '£', name: 'British Pound' }
];

// Exchange rates (simplified)
const exchangeRates = {
  ETB: { USD: 0.017, EUR: 0.016, GBP: 0.014, ETB: 1 },
  USD: { ETB: 58.5, EUR: 0.93, GBP: 0.80, USD: 1 },
  EUR: { ETB: 63.0, USD: 1.07, GBP: 0.86, EUR: 1 },
  GBP: { ETB: 73.5, USD: 1.25, EUR: 1.16, GBP: 1 }
};

// Payment status modal component
const PaymentStatusModal: React.FC<{
  status: 'processing' | 'success' | 'error';
  amount: string;
  currency: string;
  onClose: () => void;
  onRetry?: () => void;
}> = ({ status, amount, currency, onClose, onRetry }) => {
  useEffect(() => {
    if (status === 'success') {
      const timer = setTimeout(() => onClose(), 3000);
      return () => clearTimeout(timer);
    }
  }, [status, onClose]);

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        {status === 'processing' && (
          <>
            <div className="modal-spinner"></div>
            <h3>Processing Payment...</h3>
            <p>Please wait while we process your payment</p>
          </>
        )}
        
        {status === 'success' && (
          <>
            <div className="modal-success">✓</div>
            <h3>Payment Successful!</h3>
            <p>Payment of {amount} {currency} completed successfully</p>
            <button className="modal-button" onClick={onClose}>Continue to Dashboard</button>
          </>
        )}
        
        {status === 'error' && (
          <>
            <div className="modal-error">✕</div>
            <h3>Payment Failed</h3>
            <p>Your payment could not be processed. Please try again.</p>
            <div className="modal-buttons">
              <button className="modal-button retry" onClick={onRetry}>Try Again</button>
              <button className="modal-button" onClick={onClose}>Cancel</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

const TenantPaymentPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { tenant, email, amount = 150 } = (location.state as any) || {};

  const [currency, setCurrency] = useState<string>('ETB');
  const [selectedMethod, setSelectedMethod] = useState<string>('');
  const [modalStatus, setModalStatus] = useState<'processing' | 'success' | 'error' | null>(null);
  const [savedMethods, setSavedMethods] = useState<Array<{method: string, currency: string}>>([]);

  // Calculate converted amount
  const convertedAmount = (amount * exchangeRates.ETB[currency as keyof typeof exchangeRates.ETB]).toFixed(2);
  const currencySymbol = currencies.find(c => c.code === currency)?.symbol || '';

  // Load saved payment methods from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('savedPaymentMethods');
    if (saved) {
      setSavedMethods(JSON.parse(saved));
    }
  }, []);

  // Save preferred payment method
  const savePaymentMethod = () => {
    const newSaved = [...savedMethods.filter(m => m.currency !== currency), 
                     {method: selectedMethod, currency}];
    setSavedMethods(newSaved);
    localStorage.setItem('savedPaymentMethods', JSON.stringify(newSaved));
  };

  // Process payment based on selected method
  const processPayment = async () => {
    setModalStatus('processing');
    
    try {
      // Simulate API call based on payment method
      let success = await simulatePaymentAPI(selectedMethod);
      
      if (success) {
        setModalStatus('success');
        savePaymentMethod();
      } else {
        setModalStatus('error');
      }
    } catch (error) {
      setModalStatus('error');
    }
  };

  // Simulate API calls to different payment providers
  const simulatePaymentAPI = async (method: string): Promise<boolean> => {
    // In a real implementation, you would make actual API calls here
    
    // Ethiopian payment gateways
    if (method === 'cbe') {
      /* 
      Real CBE Birr API integration would go here:
      const response = await fetch('https://api.cbe.com.et/payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: convertedAmount,
          currency: currency,
          merchantId: 'YOUR_MERCHANT_ID',
          customerEmail: email
        })
      });
      return response.ok;
      */
      return simulateAPIDelay(2000);
    }
    
    if (method === 'telebirr') {
      /* 
      Real Telebirr API integration:
      const response = await fetch('https://api.telebirr.et/payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: convertedAmount,
          currency: currency,
          customerPhone: 'CUSTOMER_PHONE'
        })
      });
      return response.ok;
      */
      return simulateAPIDelay(2000);
    }
    
    // Global payment gateways
    if (method === 'card') {
      /* 
      Real Stripe integration would go here:
      const stripe = await loadStripe('YOUR_STRIPE_PUBLISHABLE_KEY');
      const { error } = await stripe.redirectToCheckout({
        lineItems: [{ price: 'PRICE_ID', quantity: 1 }],
        mode: 'payment',
        successUrl: 'https://yourdomain.com/success',
        cancelUrl: 'https://yourdomain.com/cancel'
      });
      return !error;
      */
      return simulateAPIDelay(2500);
    }
    
    if (method === 'paypal') {
      /* 
      Real PayPal integration:
      const response = await fetch('https://api.paypal.com/v2/checkout/orders', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': 'Bearer YOUR_ACCESS_TOKEN'
        },
        body: JSON.stringify({
          intent: 'CAPTURE',
          purchase_units: [{
            amount: {
              currency_code: currency,
              value: convertedAmount
            }
          }]
        })
      });
      return response.ok;
      */
      return simulateAPIDelay(2200);
    }
    
    // Default simulation
    return simulateAPIDelay(2000);
  };

  const simulateAPIDelay = (ms: number): Promise<boolean> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        // 85% success rate for simulation
        resolve(Math.random() > 0.15);
      }, ms);
    });
  };

  const handlePayment = () => {
    if (!selectedMethod) {
      alert('Please select a payment method.');
      return;
    }
    processPayment();
  };

  const closeModal = () => {
    setModalStatus(null);
    if (modalStatus === 'success') {
      navigate('/TenantAdminDashboard', { 
        state: { 
          message: `Payment of ${currencySymbol}${convertedAmount} successful!`,
          timestamp: new Date().toLocaleString()
        } 
      });
    }
  };

  const retryPayment = () => {
    setModalStatus(null);
    setTimeout(() => processPayment(), 500);
  };

  // Apply saved payment method if available for this currency
  useEffect(() => {
    const saved = savedMethods.find(m => m.currency === currency);
    if (saved) {
      setSelectedMethod(saved.method);
    }
  }, [currency, savedMethods]);

  return (
    <div className="payment-container">
      <div className="payment-card">
        <header className="payment-header">
          <h1>Complete Payment</h1>
          <p>Secure payment processing</p>
        </header>

        <div className="payment-info">
          <div className="tenant-info">
            <h2>Payment for {tenant || 'Tenant'}</h2>
            <p>{email || 'tenant@example.com'}</p>
          </div>
          
          <div className="currency-section">
            <label className="section-label">Select Currency</label>
            <div className="currency-selector">
              {currencies.map(curr => (
                <button
                  key={curr.code}
                  className={`currency-option ${currency === curr.code ? 'active' : ''}`}
                  onClick={() => setCurrency(curr.code)}
                >
                  {curr.code} ({curr.symbol})
                </button>
              ))}
            </div>
          </div>

          <div className="amount-display">
            <div className="amount-label">Amount Due</div>
            <div className="amount-value">
              {currencySymbol}{convertedAmount} {currency}
            </div>
            <div className="original-amount">
              ≈ Br{amount} ETB
            </div>
          </div>

          <div className="payment-methods-section">
            <label className="section-label">Select Payment Method</label>
            <div className="payment-methods">
              {(currency === 'ETB' ? paymentMethodsETB : paymentMethodsGlobal).map((method) => (
                <div 
                  key={method.id}
                  className={`method-card ${selectedMethod === method.id ? 'selected' : ''}`}
                  onClick={() => setSelectedMethod(method.id)}
                  style={{ '--method-color': method.color } as React.CSSProperties}
                >
                  <div className="method-icon">{method.icon}</div>
                  <div className="method-name">{method.name}</div>
                </div>
              ))}
            </div>
          </div>

          <button 
            className={`pay-button ${!selectedMethod ? 'disabled' : ''}`}
            onClick={handlePayment}
            disabled={!selectedMethod}
          >
            Pay {currencySymbol}{convertedAmount}
          </button>

          <div className="security-note">
            <div className="lock-icon">🔒</div>
            <span>Your payment information is securely encrypted</span>
          </div>
        </div>
      </div>

      {modalStatus && (
        <PaymentStatusModal
          status={modalStatus}
          amount={`${currencySymbol}${convertedAmount}`}
          currency={currency}
          onClose={closeModal}
          onRetry={retryPayment}
        />
      )}
    </div>
  );
};

export default TenantPaymentPage;