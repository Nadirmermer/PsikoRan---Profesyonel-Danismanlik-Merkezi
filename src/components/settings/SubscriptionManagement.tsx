import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../lib/auth'; // Auth hook yolu projenize göre değişebilir
import { supabase } from '../../lib/supabase'; // Supabase client yolu projenize göre değişebilir
import { Subscription, SubscriptionPayment, PlanType, BillingCycle } from '../../types/database'; // Yol güncellendi, PlanType ve BillingCycle eklendi
import { format, differenceInDays } from 'date-fns';
import { tr } from 'date-fns/locale';
import { 
    Loader2, AlertCircle, CheckCircle, XCircle, RefreshCcw, ExternalLink, Check, 
    ArrowRight, Clock, Banknote, Info, ShoppingCart, Ban, BadgeCheck, BadgeX, CircleDollarSign
} from 'lucide-react'; // Yeni ikonlar eklendi
import { Link } from 'react-router-dom'; // Link import edildi

// Pricing.tsx'den plan verilerini buraya alıyoruz (veya ortak bir yerden import ediyoruz)
// Not: Enterprise ve Clinic planları şimdilik doğrudan seçilemiyor
const availablePlans = [
    {
      name: 'Başlangıç',
      description: 'Bireysel veya tek profesyonelli pratikler.',
      monthlyPrice: '249',
      annualPrice: '199',
      features: [
        { title: '1 Yönetici', included: true },
        { title: '1 Profesyonel', included: true },
        { title: '25 Aktif Danışan', included: true },
        { title: 'Temel Ödeme Takibi', included: true },
      ],
      planType: 'starter' as PlanType
    },
    {
      name: 'Gelişim',
      description: 'Büyüyen pratikler ve küçük ekipler.',
      monthlyPrice: '499',
      annualPrice: '399',
      features: [
        { title: '1 Yönetici', included: true },
        { title: '3 Profesyonel', included: true },
        { title: '100 Aktif Danışan', included: true },
        { title: 'Gelişmiş Ödeme Takibi', included: true },
        { title: 'Video Görüşme', included: true },
      ],
      planType: 'growth' as PlanType
    }
];

// Helper function to format dates
const formatDate = (dateString: string | null | undefined) => {
  if (!dateString) return '-';
  try {
    return format(new Date(dateString), 'dd MMMM yyyy HH:mm', { locale: tr });
  } catch (error) {
    console.error("Date formatting error:", error);
    return 'Geçersiz Tarih';
  }
};

// Helper function to translate plan names (optional)
const translatePlanName = (plan: string) => {
    switch (plan) {
        case 'starter': return 'Başlangıç';
        case 'growth': return 'Gelişim';
        case 'clinic': return 'Klinik';
        case 'enterprise': return 'Kurumsal';
        default: return plan;
    }
}

// Helper function to translate status (optional)
const translateSubscriptionStatus = (status: string) => {
    switch (status) {
        case 'active': return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300"><BadgeCheck className="w-3 h-3 mr-1"/>Aktif</span>;
        case 'trial': return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300"><Info className="w-3 h-3 mr-1"/>Deneme</span>;
        case 'past_due': return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300"><AlertCircle className="w-3 h-3 mr-1"/>Ödeme Gecikmiş</span>;
        case 'pending_payment': return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-300"><Clock className="w-3 h-3 mr-1"/>Ödeme Bekliyor</span>;
        case 'cancelled': return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300"><Ban className="w-3 h-3 mr-1"/>İptal Edilmiş</span>;
        case 'inactive': return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800 dark:bg-slate-700/40 dark:text-slate-300"><XCircle className="w-3 h-3 mr-1"/>Pasif</span>;
        default: return status;
    }
}

// Yeni helper: Ödeme durumu için çeviri ve stil
const translatePaymentStatus = (status: string) => {
    switch (status) {
        case 'completed': return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300"><BadgeCheck className="w-3 h-3 mr-1"/>Tamamlandı</span>;
        case 'pending_verification': return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300"><Clock className="w-3 h-3 mr-1"/>Onay Bekliyor</span>;
        case 'pending_payment': return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-300"><AlertCircle className="w-3 h-3 mr-1"/>Ödeme Bekliyor</span>;
        case 'failed': return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300"><BadgeX className="w-3 h-3 mr-1"/>Başarısız</span>;
        default: return status;
    }
};

export const SubscriptionManagement: React.FC = () => {
  const { assistant } = useAuth();
  console.log('SubscriptionManagement - Assistant:', assistant); // Assistant nesnesini logla

  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [payments, setPayments] = useState<SubscriptionPayment[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true); // Başlangıçta true
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null); // Başarı mesajı state'i
  const [isCancelling, setIsCancelling] = useState<boolean>(false);
  const [isNotifying, setIsNotifying] = useState<boolean>(false);

  // Yeni state'ler
  const [annualBilling, setAnnualBilling] = useState(true); // Fatura döngüsü seçimi
  const [isSelectingPlan, setIsSelectingPlan] = useState<PlanType | null>(null); // Hangi planın seçilmekte olduğunu tutar

  // Mesajları belirli bir süre sonra temizle
  useEffect(() => {
      if (error || successMessage) {
          const timer = setTimeout(() => {
              setError(null);
              setSuccessMessage(null);
          }, 5000); // 5 saniye sonra temizle
          return () => clearTimeout(timer);
      }
  }, [error, successMessage]);

  const fetchSubscriptionData = useCallback(async () => {
    console.log('[fetchSubscriptionData] Fetching data...'); // Log 1: Fetch başlangıcı
    console.log('[fetchSubscriptionData] Assistant object:', assistant); // Log 2: Assistant nesnesi

    if (!assistant?.id) {
      console.warn('[fetchSubscriptionData] Assistant ID not found yet.'); // Log 3: Asistan ID yoksa
      // setError('Asistan kimliği bulunamadı.'); // Hata göstermek yerine bekleyebiliriz
      // setIsLoading(false); // Henüz yüklemeyi bitirme
      return;
    }
    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);
    try {
        console.log(`[fetchSubscriptionData] Fetching subscription for assistant_id: ${assistant.id}`); // Log 4: Fetch sorgusu
        const { data: subData, error: subError } = await supabase
            .from('subscriptions')
            .select('*')
            .eq('assistant_id', assistant.id)
            .maybeSingle();

        if (subError) {
            console.error('[fetchSubscriptionData] Subscription fetch error:', subError); // Log 5: Fetch hatası
            throw new Error(`Abonelik bilgileri alınamadı: ${subError.message}`);
        }
        
        console.log('[fetchSubscriptionData] Fetched subscription data:', subData); // Log 6: Çekilen veri
        setSubscription(subData);

        if (subData) {
            console.log('Ödeme geçmişi çekiliyor...');
            const { data: paymentData, error: paymentError } = await supabase
                .from('subscription_payments')
                .select('*')
                .eq('subscription_id', subData.id)
                .order('payment_date', { ascending: false });

            if (paymentError) throw new Error(`Ödeme geçmişi: ${paymentError.message}`);
            console.log('Ödeme geçmişi alındı:', paymentData);
            setPayments(paymentData || []);
        } else {
            setPayments([]);
        }
    } catch (err: any) {
        console.error('[fetchSubscriptionData] Error in fetch process:', err); // Log 7: Genel hata
        setError(err.message || 'Veriler getirilirken bir hata oluştu.');
        setSubscription(null);
        setPayments([]);
    } finally {
        console.log('[fetchSubscriptionData] Fetch complete, setting loading to false.'); // Log 8: Fetch tamamlandı
        setIsLoading(false);
    }
  }, [assistant]);

  useEffect(() => {
    fetchSubscriptionData();
  }, [fetchSubscriptionData]);

  const handleBankTransferNotification = async () => {
    if (!subscription) return;
    const reference = prompt("Lütfen havale açıklamasını veya referans numarasını girin (Örn: Firma Adı - Ay):");
    if (!reference) return;

    setIsNotifying(true);
    setError(null); // Önceki hataları temizle
    setSuccessMessage(null);

    try {
      const { error: insertError } = await supabase
        .from('subscription_payments')
        .insert({
          subscription_id: subscription.id,
          amount: 0, // Miktarı admin belirleyecek veya abonelikten çekilecek
          currency: 'TRY',
          payment_method: 'bank_transfer',
          status: 'pending_verification',
          bank_transfer_reference: reference,
        });

      if (insertError) throw insertError;
      
      setSuccessMessage('Havale bildiriminiz başarıyla alındı. Yönetici onayı bekleniyor.'); // alert yerine state
      await fetchSubscriptionData(); // Veriyi yenile

    } catch (err: any) {
        console.error('Havale bildirim hatası:', err);
        setError(err.message || 'Havale bildirimi sırasında bir hata oluştu.');
    } finally {
        setIsNotifying(false); // Bildirme işlemi bittiğinde loading'i kaldır
    }
  };

  // Abonelik İptali (Dönem sonunda)
  const handleCancelSubscription = async () => {
    if (!subscription || subscription.cancel_at_period_end || subscription.status === 'cancelled') return;

    const confirmCancel = window.confirm(
        `Aboneliğinizi mevcut dönemin sonunda (${formatDate(subscription.current_period_end)}) iptal etmek istediğinizden emin misiniz?`
    );
    if (!confirmCancel) return;

    setIsCancelling(true);
    setError(null);
    setSuccessMessage(null);
    try {
        // Eğer Iyzico abonesiyse, Iyzico API'si üzerinden iptal işlemi yapılmalı (backend fonksiyonu ile)
        if (subscription.iyzico_subscription_id) {
            // TODO: Supabase function çağırarak Iyzico aboneliğini iptal et
            // await supabase.functions.invoke('cancel-iyzico-subscription', { 
            //     body: { subscriptionId: subscription.iyzico_subscription_id }
            // });
            alert("Iyzico abonelik iptali için backend fonksiyonu henüz eklenmedi.");
            // Şimdilik sadece veritabanını güncelleyelim (geçici)
             const { error: updateError } = await supabase
                .from('subscriptions')
                .update({ cancel_at_period_end: true })
                .eq('id', subscription.id);
            if (updateError) throw updateError;
        } else {
            // Havale ile yönetiliyorsa direkt veritabanını güncelle
            const { error: updateError } = await supabase
                .from('subscriptions')
                .update({ cancel_at_period_end: true })
                // Alternatif: Direkt iptal etmek için status: 'cancelled', cancelled_at: new Date().toISOString()
                // .update({ status: 'cancelled', cancelled_at: new Date().toISOString() })
                .eq('id', subscription.id);
             if (updateError) throw updateError;
        }

        setSuccessMessage('Aboneliğiniz dönem sonunda iptal edilmek üzere işaretlendi.'); // alert yerine state
        await fetchSubscriptionData(); // Veriyi yenile

    } catch (err: any) {
        console.error('Abonelik iptal hatası:', err);
        setError(err.message || 'Abonelik iptali sırasında bir hata oluştu.');
        alert(`Abonelik iptal edilirken hata oluştu: ${err.message}`);
    } finally {
        setIsCancelling(false); // İptal işlemi bittiğinde loading'i kaldır
    }
  };

  // --- YENİ FONKSİYON: Plan Seçimi/Yükseltme --- 
  const handleSelectPlan = async (planType: PlanType) => {
    if (!assistant?.id) {
      setError('Plan seçimi için asistan kimliği bulunamadı.');
      return;
    }

    // Güvenlik: Zaten seçilmekte olan bir işlem varsa veya aktif/bekleyen bir abonelik (deneme hariç) varsa engelle
    if (isSelectingPlan) return;
    if (subscription && subscription.status !== 'trial') {
        setError(`Zaten aktif veya bekleyen bir '${translatePlanName(subscription.plan_type)}' aboneliğiniz var.`);
        return;
    }

    setIsSelectingPlan(planType);
    setError(null);
    setSuccessMessage(null);
    const selectedBillingCycle: BillingCycle = annualBilling ? 'annual' : 'monthly';

    try {
        // Mevcut abonelik deneme mi?
        if (subscription && subscription.status === 'trial') {
            // Mevcut deneme aboneliğini güncelle
            console.log(`Deneme aboneliği (${subscription.id}) şuna yükseltiliyor: Plan: ${planType}, Döngü: ${selectedBillingCycle}`);
            const { data, error: updateError } = await supabase
                .from('subscriptions')
                .update({
                    plan_type: planType,
                    billing_cycle: selectedBillingCycle,
                    status: 'pending_payment', // Ödeme bekleniyor
                    payment_method: 'bank_transfer', // TODO: Ödeme yöntemi seçimi ekle
                    trial_end: null, // Deneme bitti
                    // current_period_end şimdilik değişmesin, ödeme onaylanınca ayarlanacak
                    // start_date şimdilik değişmesin
                })
                .eq('id', subscription.id)
                .select()
                .single();

            if (updateError) {
                 console.error('Deneme aboneliği güncelleme hatası:', updateError);
                 throw new Error(`Abonelik güncellenirken bir veritabanı hatası oluştu: ${updateError.message}`);
            }
            console.log('Deneme aboneliği güncellendi:', data);
            setSuccessMessage(`${translatePlanName(planType)} planına geçiş talebiniz alındı. Lütfen ödemeyi yapıp havale bildiriminde bulunun.`);

        } else {
            // Yeni abonelik oluştur (pending_payment)
            console.log(`Yeni abonelik oluşturuluyor: Plan: ${planType}, Döngü: ${selectedBillingCycle}`);
            const { data, error: insertError } = await supabase
                .from('subscriptions')
                .insert({
                  assistant_id: assistant.id,
                  plan_type: planType,
                  status: 'pending_payment', 
                  billing_cycle: selectedBillingCycle,
                  payment_method: 'bank_transfer', // TODO: Ödeme yöntemi seçimi ekle
                  // current_period_start/end ödeme onaylanınca belirlenecek
                  // start_date ödeme onaylanınca belirlenecek
                })
                .select() 
                .single();

              if (insertError) {
                console.error('Abonelik oluşturma hatası:', insertError);
                if (insertError.code === '23505') { // unique_violation (assistant_id)
                     throw new Error('Bu asistan için zaten bir abonelik kaydı mevcut veya bekleniyor.');
                } else {
                    throw new Error(`Abonelik oluşturulurken bir veritabanı hatası oluştu: ${insertError.message}`);
                }
              }
            console.log('Yeni abonelik kaydı oluşturuldu:', data);
            setSuccessMessage(`${translatePlanName(planType)} planı için abonelik talebiniz alındı. Lütfen ödemeyi yapıp havale bildiriminde bulunun.`);
        }

        await fetchSubscriptionData();
    } catch (err: any) {
        console.error('handleSelectPlan Hatası:', err);
        setError(err.message || 'Plan seçimi sırasında bir hata oluştu.');
        // Başarısız olursa state'i null yapmaya gerek yok, hata mesajı yeterli
    } finally {
      setIsSelectingPlan(null); // Yükleme durumunu bitir
    }
  };

  if (isLoading) { 
    return (
      <div className="flex justify-center items-center p-20">
        <Loader2 className="h-10 w-10 animate-spin text-primary-500 dark:text-primary-400" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 dark:bg-red-900/30 rounded-lg border border-red-200 dark:border-red-700 flex items-start">
          <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 mr-3 flex-shrink-0 mt-0.5" />
          <div>
              <h4 className="text-sm font-semibold text-red-800 dark:text-red-300">Bir Hata Oluştu</h4>
              <p className="text-sm text-red-700 dark:text-red-400 mt-1">{error}</p>
          </div>
          <button onClick={() => setError(null)} className="ml-auto -mr-1 -mt-1 p-1 rounded-md text-red-500 hover:bg-red-100 dark:hover:bg-red-900/50 focus:outline-none focus:ring-2 focus:ring-red-500">
              <XCircle className="h-5 w-5"/>
          </button>
      </div>
    );
  }

  // Kalan günleri hesaplayan fonksiyon
  const getRemainingDays = (endDateString: string | null | undefined): number | null => {
      if (!endDateString) return null;
      try {
          const endDate = new Date(endDateString);
          const today = new Date();
          // Eğer bitiş tarihi geçmişse 0 döndür, değilse kalan gün sayısını hesapla
          return Math.max(0, differenceInDays(endDate, today));
      } catch (error) {
          console.error("Remaining days calculation error:", error);
          return null;
      }
  };

  // Mevcut abonelik için kalan günleri hesapla
  const remainingDays = subscription ? 
      getRemainingDays(subscription.status === 'trial' ? subscription.trial_end : subscription.current_period_end) 
      : null;

  // Bileşenin render edilmesinden hemen önce state'i logla
  console.log('[Render] Current state before render:', {
      isLoading,
      error,
      successMessage,
      subscription,
      remainingDays
  }); // Log 9: Render öncesi state

  return (
    <div className="space-y-10">
      {/* Başlık */}
      <div className="pb-5 border-b border-slate-200 dark:border-slate-700">
        <h2 className="text-2xl font-bold leading-7 text-slate-900 dark:text-white sm:text-3xl sm:truncate">
          Abonelik Yönetimi
        </h2>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Mevcut abonelik planınızı, fatura döngünüzü ve ödeme bilgilerinizi yönetin.
        </p>
      </div>

      {/* Hata ve Başarı Mesajları */} 
      {error && (
          <div className="p-4 bg-red-50 dark:bg-red-900/30 rounded-lg border border-red-200 dark:border-red-700 flex items-start">
              <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 mr-3 flex-shrink-0 mt-0.5" />
              <div>
                  <h4 className="text-sm font-semibold text-red-800 dark:text-red-300">Bir Hata Oluştu</h4>
                  <p className="text-sm text-red-700 dark:text-red-400 mt-1">{error}</p>
              </div>
              <button onClick={() => setError(null)} className="ml-auto -mr-1 -mt-1 p-1 rounded-md text-red-500 hover:bg-red-100 dark:hover:bg-red-900/50 focus:outline-none focus:ring-2 focus:ring-red-500">
                  <XCircle className="h-5 w-5"/>
              </button>
          </div>
      )}
      {successMessage && (
          <div className="p-4 bg-green-50 dark:bg-green-900/30 rounded-lg border border-green-200 dark:border-green-700 flex items-start">
              <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400 mr-3 flex-shrink-0 mt-0.5" />
              <div>
                  <h4 className="text-sm font-semibold text-green-800 dark:text-green-300">Başarılı</h4>
                  <p className="text-sm text-green-700 dark:text-green-400 mt-1">{successMessage}</p>
              </div>
              <button onClick={() => setSuccessMessage(null)} className="ml-auto -mr-1 -mt-1 p-1 rounded-md text-green-500 hover:bg-green-100 dark:hover:bg-green-900/50 focus:outline-none focus:ring-2 focus:ring-green-500">
                   <XCircle className="h-5 w-5"/>
              </button>
          </div>
      )}

      {/* === Abonelik Varsa Gösterilecek İçerik === */} 
      {subscription && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Sol Taraf: Mevcut Plan */} 
          <div className="lg:col-span-2 p-6 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 border-b pb-3 dark:border-slate-600 flex items-center">
                <ShoppingCart className="w-5 h-5 mr-2 text-primary-500 dark:text-primary-400"/> Mevcut Planınız
            </h3>
            <dl className="space-y-3 text-sm">
              <div className="flex justify-between items-center">
                <dt className="text-slate-500 dark:text-slate-400">Plan Türü:</dt>
                <dd className="font-medium text-primary-700 dark:text-primary-400 text-base">{translatePlanName(subscription.plan_type)}</dd>
              </div>
              <div className="flex justify-between items-center">
                <dt className="text-slate-500 dark:text-slate-400">Durum:</dt>
                <dd>{translateSubscriptionStatus(subscription.status)}</dd>
              </div>
               <div className="flex justify-between items-center">
                <dt className="text-slate-500 dark:text-slate-400">Fatura Döngüsü:</dt>
                <dd className="font-medium text-slate-700 dark:text-slate-300">{subscription.billing_cycle === 'annual' ? 'Yıllık' : 'Aylık'}</dd>
              </div>
              <div className="flex justify-between items-center">
                <dt className="text-slate-500 dark:text-slate-400">Başlangıç Tarihi:</dt>
                <dd className="font-medium text-slate-700 dark:text-slate-300">{formatDate(subscription.start_date)}</dd>
              </div>
              {/* Bitiş/Yenileme Tarihi ve Kalan Gün */} 
              {(subscription.status === 'trial' || subscription.status === 'active' || subscription.cancel_at_period_end) && (subscription.trial_end || subscription.current_period_end) && (
                  <div className="flex justify-between items-center pt-2 border-t dark:border-slate-700">
                    <dt className="text-slate-500 dark:text-slate-400">
                        {subscription.status === 'trial' ? 'Deneme Bitiyor:' : subscription.cancel_at_period_end ? 'İptal Olacak:' : 'Yenilenecek:'}
                    </dt>
                    <div className="text-right">
                        <dd className="font-medium text-slate-700 dark:text-slate-300">
                            {formatDate(subscription.status === 'trial' ? subscription.trial_end : subscription.current_period_end)}
                        </dd>
                        {remainingDays !== null && (subscription.status === 'trial' || subscription.status === 'active') && (
                            <dd className="text-xs text-slate-500 dark:text-slate-400 flex items-center justify-end mt-0.5">
                               <Clock className="w-3 h-3 mr-1" /> {remainingDays} gün kaldı
                            </dd>
                        )}
                    </div>
                  </div>
              )}
              {/* İptal Bilgileri */} 
              {subscription.cancelled_at && (
                 <div className="flex justify-between items-center text-red-600 dark:text-red-400 pt-2 border-t dark:border-slate-700">
                   <dt className="font-medium"><Ban className="w-4 h-4 mr-1 inline-block"/>İptal Edilme Tarihi:</dt>
                   <dd className="font-medium">{formatDate(subscription.cancelled_at)}</dd>
                 </div>
              )}
            </dl>
            {/* Eylemler */} 
            <div className="mt-5 pt-4 border-t dark:border-slate-700 flex items-center justify-end space-x-4">
                 <Link 
                     to="/pricing" 
                     className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 inline-flex items-center font-medium"
                 >
                     Planları İncele <ExternalLink className="w-3.5 h-3.5 ml-1.5" />
                 </Link>
                 {/* İptal butonu */} 
                 {!(subscription.cancel_at_period_end || subscription.status === 'cancelled') && (subscription.status === 'active' || subscription.status === 'trial') && (
                    <button 
                        onClick={handleCancelSubscription}
                        disabled={isCancelling}
                        className={`text-sm font-medium px-3 py-1.5 rounded-md flex items-center transition-colors duration-200 ${isCancelling ? 'bg-red-200 text-red-500 cursor-wait' : 'bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-900/30 dark:text-red-400 dark:hover:bg-red-900/60'} disabled:opacity-60 disabled:cursor-not-allowed`}
                    >
                        {isCancelling ? <Loader2 className="w-4 h-4 mr-1.5 animate-spin" /> : <Ban className="w-4 h-4 mr-1.5"/>}
                        <span>Dönem Sonunda İptal Et</span>
                    </button>
                 )}
            </div>
          </div>

          {/* Sağ Taraf: Ödeme Yöntemi */} 
          <div className="lg:col-span-1 p-6 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm h-fit">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 border-b pb-3 dark:border-slate-600 flex items-center">
                <CircleDollarSign className="w-5 h-5 mr-2 text-primary-500 dark:text-primary-400"/> Ödeme Yöntemi
            </h3>
            <div className="flex items-center justify-between">
                <p className="text-sm text-slate-600 dark:text-slate-400">
                {subscription.iyzico_subscription_id 
                    ? `Kredi Kartı (Iyzico)` 
                    : subscription.status !== 'trial' ? `Havale/EFT` : `Deneme Süresi`
                }
                </p>
                 {/* TODO: Yönetim butonu eklenebilir */} 
                 {/* 
                 <button className="text-xs text-blue-600 hover:underline dark:text-blue-400">
                    Yönet
                 </button>
                 */} 
            </div>
             {subscription.payment_method === 'bank_transfer' && subscription.status !== 'trial' && (
                  <p className="mt-3 text-xs text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-700/50 p-2 rounded">
                      Ödemelerinizi havale/EFT ile yapıyorsunuz. Ödeme sonrası bildirim yapmayı unutmayın.
                 </p>
             )}
          </div>
        </div>
      )}

      {/* === PLAN SEÇİMİ (Abonelik Yoksa veya Denemedeyse) === */} 
      {(!subscription || subscription.status === 'trial') && !isLoading && (
        <div className="space-y-8">
          {/* Bilgilendirme ve Fatura Döngüsü Seçimi */} 
          <div className={`p-5 rounded-xl border shadow-sm ${subscription?.status === 'trial' ? 'bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/30 dark:to-teal-900/30 border-emerald-200 dark:border-teal-700/50' : 'bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30 border-blue-200 dark:border-indigo-700/50'}`}>
              <div className="flex items-center mb-3">
                  <Info className={`w-6 h-6 mr-3 flex-shrink-0 ${subscription?.status === 'trial' ? 'text-emerald-600 dark:text-emerald-400' : 'text-blue-600 dark:text-blue-400'}`}/>
                   <div>
                       <h3 className={`text-lg font-semibold ${subscription?.status === 'trial' ? 'text-emerald-900 dark:text-emerald-200' : 'text-blue-900 dark:text-blue-200'}`}>
                         {subscription?.status === 'trial' ? 'Aboneliğinizi Yükseltin' : 'Bir Abonelik Planı Seçin'}
                       </h3>
                       <p className={`text-sm ${subscription?.status === 'trial' ? 'text-emerald-700 dark:text-emerald-300' : 'text-blue-700 dark:text-blue-300'}`}>
                           {subscription?.status === 'trial' ? 'Deneme süreniz devam ederken veya bitiminde planınızı seçerek devam edebilirsiniz.' : 'PsikoRan özelliklerini kullanmaya başlamak için ihtiyacınıza uygun bir plan seçin.'}
                       </p>
                  </div>
              </div>
              {/* Fatura Değiştirici */} 
              <div className="mt-5 flex justify-center sm:justify-start">
                <div className="relative bg-white dark:bg-slate-800 p-1 rounded-full flex shadow-inner w-fit border dark:border-slate-700">
                  <button
                    onClick={() => setAnnualBilling(false)}
                    disabled={!!isSelectingPlan} // Plan seçilirken disable et
                    className={`${!annualBilling ? 'bg-primary-500 text-white shadow-md' : 'bg-transparent text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'} relative w-28 sm:w-32 rounded-full py-2 px-3 sm:px-4 text-xs sm:text-sm font-medium transition-all duration-300 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    Aylık Fatura
                  </button>
                  <button
                    onClick={() => setAnnualBilling(true)}
                    disabled={!!isSelectingPlan} // Plan seçilirken disable et
                    className={`${annualBilling ? 'bg-primary-500 text-white shadow-md' : 'bg-transparent text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'} relative w-28 sm:w-32 rounded-full py-2 px-3 sm:px-4 text-xs sm:text-sm font-medium transition-all duration-300 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    Yıllık Fatura
                    <span className="absolute -top-2 -right-1 sm:-right-2 bg-emerald-500 text-white text-[10px] sm:text-xs font-semibold px-1.5 py-0.5 rounded-full shadow">
                      %20+ İndirim
                    </span>
                  </button>
                </div>
              </div>
          </div>

          {/* Plan Kartları */} 
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
            {availablePlans.map((plan) => (
              <div key={plan.planType} className={`flex flex-col rounded-xl overflow-hidden border dark:border-slate-700 shadow-lg transition-shadow hover:shadow-xl ${isSelectingPlan === plan.planType ? 'border-primary-300 dark:border-primary-600' : 'border-slate-200 dark:border-slate-700'} bg-white dark:bg-slate-800`}>
                 {/* Plan Header */} 
                <div className="p-6 bg-slate-50 dark:bg-slate-800/50 border-b dark:border-slate-700">
                  <h4 className="text-xl font-bold text-primary-700 dark:text-primary-400 mb-1">{plan.name}</h4>
                  <p className="text-sm text-slate-600 dark:text-slate-300 mb-4">{plan.description}</p>
                  <div className="">
                    <span className="text-4xl font-extrabold text-slate-900 dark:text-white">₺{annualBilling ? plan.annualPrice : plan.monthlyPrice}</span>
                    <span className="text-base font-medium text-slate-500 dark:text-slate-400">/ay</span>
                  </div>
                  {annualBilling && (
                    <p className="mt-1 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                      Yıllık faturalandırmada (%20+ indirimli)
                    </p>
                  )}
                </div>
                 {/* Plan Features */} 
                <div className="p-6 flex-grow flex flex-col">
                  <h5 className="text-sm font-semibold text-slate-600 dark:text-slate-400 mb-3">Öne Çıkan Özellikler:</h5>
                  <ul className="space-y-2.5 mb-8 flex-grow">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex items-start">
                          <Check className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />
                        <span className="ml-2 text-sm text-slate-700 dark:text-slate-300">
                          {feature.title}
                        </span>
                      </li>
                    ))}
                  </ul>
                   {/* CTA Button */} 
                  <div className="mt-auto">
                      <button
                        onClick={() => handleSelectPlan(plan.planType)}
                        disabled={!!isSelectingPlan}
                        className={`w-full py-3 px-5 rounded-lg flex items-center justify-center text-base font-semibold transition-all duration-200 group ${ 
                          isSelectingPlan === plan.planType 
                          ? 'bg-slate-200 text-slate-500 cursor-wait dark:bg-slate-700 dark:text-slate-400' 
                          : 'bg-primary-600 text-white hover:bg-primary-700 dark:bg-primary-500 dark:hover:bg-primary-600 shadow-lg hover:shadow-xl shadow-primary-500/30 disabled:opacity-60 disabled:cursor-not-allowed'
                        }`}
                      >
                        {isSelectingPlan === plan.planType ? (
                           <><Loader2 className="animate-spin h-5 w-5 mr-2" /> İşleniyor...</>
                        ) : (
                           <><span>Bu Planı Seç</span><ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform duration-200" /></>
                        )}
                      </button>
                   </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      {/* === PLAN SEÇİMİ BİTİŞ === */} 

      {/* Havale Bildirimi Bölümü */} 
      <div className="p-6 bg-yellow-50 dark:bg-yellow-900/40 rounded-xl border border-yellow-200 dark:border-yellow-700/60 shadow-sm">
        <h3 className="text-lg font-semibold text-yellow-900 dark:text-yellow-300 mb-3 flex items-center">
            <Banknote className="w-5 h-5 mr-2"/> Havale/EFT ile Ödeme
        </h3>
        <p className="text-sm text-yellow-800 dark:text-yellow-400 mb-4">
          Havale/EFT ile ödeme yapmak veya yenilemek için aşağıdaki hesap bilgilerini kullanabilirsiniz. Ödeme sonrası dekontu veya açıklama bilgisini kullanarak aşağıdaki butondan bildirim yapmayı unutmayın.
        </p>
        <div className="p-4 bg-yellow-100 dark:bg-yellow-800/60 rounded-lg font-mono text-sm text-yellow-900 dark:text-yellow-200 mb-5 border border-yellow-200 dark:border-yellow-700/50 shadow-inner">
          TRXX XXXX XXXX XXXX XXXX XXXX <br /> Nadir MERMER - Banka Adı
        </div>
        <button 
          onClick={handleBankTransferNotification}
          disabled={isNotifying || !subscription || subscription.payment_method !== 'bank_transfer'} 
          className={`px-6 py-2.5 bg-yellow-500 text-white text-sm font-semibold rounded-lg transition-colors duration-200 flex items-center shadow hover:shadow-md disabled:opacity-60 disabled:cursor-not-allowed ${isNotifying ? 'bg-yellow-400' : 'hover:bg-yellow-600'}`}
        >
          {isNotifying ? <Loader2 className="h-4 w-4 mr-2 animate-spin"/> : <CheckCircle className="h-4 w-4 mr-2"/>}
          Havale Yaptım, Bildir
        </button>
        {subscription && subscription.payment_method !== 'bank_transfer' && subscription.status !== 'trial' && (
             <p className="mt-3 text-xs text-yellow-700 dark:text-yellow-500">Not: Aboneliğiniz {subscription.payment_method === 'iyzico' ? 'Iyzico' : 'farklı bir yöntem'} üzerinden yönetildiği için havale bildirimi gerekmez.</p>
        )}
      </div>

      {/* Ödeme Geçmişi Bölümü */} 
      <div className="p-6 bg-white dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 border-b pb-3 dark:border-slate-600">Ödeme Geçmişi</h3>
        {payments.length === 0 ? (
          <div className="text-center py-6">
             <CircleDollarSign className="mx-auto h-12 w-12 text-slate-300 dark:text-slate-600"/>
             <p className="mt-2 text-sm font-medium text-slate-500 dark:text-slate-400">Ödeme Geçmişi Boş</p>
             <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">Henüz kayıtlı bir ödeme bulunmuyor.</p>
          </div>
        ) : (
          <div className="overflow-x-auto -mx-6">
            <table className="min-w-full">
              <thead className="bg-slate-50 dark:bg-slate-700/50">
                <tr>
                  <th scope="col" className="py-3.5 pl-6 pr-3 text-left text-sm font-semibold text-slate-900 dark:text-white">Tarih</th>
                  <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-slate-900 dark:text-white">Miktar</th>
                  <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-slate-900 dark:text-white">Yöntem</th>
                  <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-slate-900 dark:text-white">Durum</th>
                  <th scope="col" className="px-3 py-3.5 pr-6 text-left text-sm font-semibold text-slate-900 dark:text-white">Referans/Not</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-700 bg-white dark:bg-slate-800/50">
                {payments.map((payment, index) => (
                  <tr key={payment.id} className={index % 2 === 0 ? undefined : 'bg-slate-50/50 dark:bg-slate-700/20'}>
                    <td className="whitespace-nowrap py-4 pl-6 pr-3 text-sm font-medium text-slate-900 dark:text-slate-200">{formatDate(payment.payment_date)}</td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-slate-700 dark:text-slate-300">{payment.amount} {payment.currency}</td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-slate-700 dark:text-slate-300">{payment.payment_method === 'iyzico' ? 'Iyzico' : 'Havale/EFT'}</td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm">{translatePaymentStatus(payment.status)}</td>
                    <td className="whitespace-nowrap px-3 py-4 pr-6 text-sm text-slate-500 dark:text-slate-400 truncate max-w-xs">{payment.iyzico_transaction_id || payment.bank_transfer_reference || payment.notes || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

// Eğer default export kullanıyorsanız:
// export default SubscriptionManagement; 