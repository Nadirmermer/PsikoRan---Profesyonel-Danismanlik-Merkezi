// PaymentService.ts - Ödeme işlemlerini yönetir

export type PaymentMethod = 'credit_card' | 'bank_transfer';
export type PlanType = 'starter' | 'professional' | 'enterprise';
export type BillingPeriod = 'monthly' | 'annual';

export interface PaymentDetails {
  planType: PlanType;
  billingPeriod: BillingPeriod;
  amount: number;
  customerName?: string;
  customerEmail?: string;
  cardDetails?: {
    number: string;
    name: string;
    expiry: string;
    cvc: string;
  };
}

export interface PaymentResponse {
  success: boolean;
  transactionId?: string;
  errorMessage?: string;
}

// Abonelik bilgilerini yerel depolamada saklar
export const saveSubscription = (planType: PlanType, billingPeriod: BillingPeriod, expiresAt: Date) => {
  const subscriptionData = {
    planType,
    billingPeriod,
    startDate: new Date().toISOString(),
    expiresAt: expiresAt.toISOString(),
    isActive: true
  };
  
  localStorage.setItem('user_subscription', JSON.stringify(subscriptionData));
};

// Mevcut abonelik bilgilerini getirir
export const getSubscription = () => {
  const data = localStorage.getItem('user_subscription');
  if (!data) return null;
  
  try {
    return JSON.parse(data);
  } catch (error) {
    console.error('Abonelik verisi ayrıştırılamadı:', error);
    return null;
  }
};

// Aboneliğin aktif olup olmadığını kontrol eder
export const hasActiveSubscription = (): boolean => {
  const subscription = getSubscription();
  
  if (!subscription || !subscription.isActive) return false;
  
  const now = new Date();
  const expiresAt = new Date(subscription.expiresAt);
  
  return now < expiresAt;
};

// Mock ödeme işlemi - gerçek entegrasyonda burada API çağrısı yapılacak
export const processPayment = async (paymentDetails: PaymentDetails): Promise<PaymentResponse> => {
  // Ödeme işlemini simüle etmek için bir gecikme ekle
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  // Gerçek hayatta burada bir ödeme ağ geçidi API'sine bir çağrı yapılır
  // Örneğin iyzico, PayTR veya başka bir ödeme sağlayıcısı
  
  // Başarılı ödeme simüle et (%90 başarı oranı)
  const isSuccessful = Math.random() < 0.9;
  
  if (isSuccessful) {
    // Başarılı ödeme durumunda abonelik bilgilerini kaydet
    const expiryDate = new Date();
    
    if (paymentDetails.billingPeriod === 'annual') {
      expiryDate.setFullYear(expiryDate.getFullYear() + 1);
    } else {
      expiryDate.setMonth(expiryDate.getMonth() + 1);
    }
    
    saveSubscription(
      paymentDetails.planType,
      paymentDetails.billingPeriod,
      expiryDate
    );
    
    return {
      success: true,
      transactionId: `TR-${Date.now()}-${Math.floor(Math.random() * 10000)}`
    };
  } else {
    // Başarısız ödeme simüle et
    return {
      success: false,
      errorMessage: 'Ödeme sırasında bir hata oluştu. Lütfen kart bilgilerinizi kontrol edin ve tekrar deneyin.'
    };
  }
};

// Banka transferi işleminin kaydedilmesi
export const recordBankTransfer = async (
  paymentDetails: Omit<PaymentDetails, 'cardDetails'> & { 
    transferReference?: string 
  }
): Promise<PaymentResponse> => {
  // Ödeme kaydını simüle etmek için bir gecikme ekle
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Transfer kaydını oluştur (gerçekte burada bir API çağrısı yapılır)
  const transferId = `BTR-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
  
  // Başarılı bir şekilde kaydedildiğini varsay
  return {
    success: true,
    transactionId: transferId
  };
};

// Gerçek entegrasyonlarda kullanılacak:

// export const verifyPayment = async (transactionId: string): Promise<boolean> => {
//   // Burada ödeme durumunu doğrulamak için ödeme sağlayıcısına API çağrısı yapılır
//   return true;
// };

// export const cancelSubscription = async (): Promise<boolean> => {
//   // Burada aboneliği iptal etmek için API çağrısı yapılır
//   const subscription = getSubscription();
//   if (subscription) {
//     subscription.isActive = false;
//     localStorage.setItem('user_subscription', JSON.stringify(subscription));
//     return true;
//   }
//   return false;
// }; 