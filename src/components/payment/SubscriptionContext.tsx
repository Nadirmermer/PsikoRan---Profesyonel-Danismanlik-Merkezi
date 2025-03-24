import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { 
  PlanType, 
  BillingPeriod, 
  getSubscription, 
  hasActiveSubscription 
} from './PaymentService';

interface SubscriptionContextType {
  isActive: boolean;
  planType: PlanType | null;
  billingPeriod: BillingPeriod | null;
  expiresAt: Date | null;
  refreshSubscription: () => void;
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

interface SubscriptionProviderProps {
  children: ReactNode;
}

export const SubscriptionProvider: React.FC<SubscriptionProviderProps> = ({ children }) => {
  const [isActive, setIsActive] = useState<boolean>(false);
  const [planType, setPlanType] = useState<PlanType | null>(null);
  const [billingPeriod, setBillingPeriod] = useState<BillingPeriod | null>(null);
  const [expiresAt, setExpiresAt] = useState<Date | null>(null);

  const refreshSubscription = () => {
    const active = hasActiveSubscription();
    setIsActive(active);

    const subscription = getSubscription();
    if (subscription && active) {
      setPlanType(subscription.planType);
      setBillingPeriod(subscription.billingPeriod);
      setExpiresAt(new Date(subscription.expiresAt));
    } else {
      setPlanType(null);
      setBillingPeriod(null);
      setExpiresAt(null);
    }
  };

  useEffect(() => {
    refreshSubscription();
    
    // Abonelik değişikliklerini dinle
    window.addEventListener('storage', (event) => {
      if (event.key === 'user_subscription') {
        refreshSubscription();
      }
    });
    
    // Düzenli olarak abonelik durumunu kontrol et (her 30 dakikada bir)
    const checkInterval = setInterval(refreshSubscription, 30 * 60 * 1000);
    
    return () => {
      clearInterval(checkInterval);
    };
  }, []);

  return (
    <SubscriptionContext.Provider 
      value={{ 
        isActive, 
        planType, 
        billingPeriod,
        expiresAt, 
        refreshSubscription 
      }}
    >
      {children}
    </SubscriptionContext.Provider>
  );
};

export const useSubscription = (): SubscriptionContextType => {
  const context = useContext(SubscriptionContext);
  if (context === undefined) {
    throw new Error('useSubscription must be used within a SubscriptionProvider');
  }
  return context;
};

export default SubscriptionContext; 