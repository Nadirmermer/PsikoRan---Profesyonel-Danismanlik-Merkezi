import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../lib/auth'; // Gerekirse admin bilgilerini almak için
import { LogOut, Users, User, Building, Mail, Phone, CreditCard, AlertTriangle, CheckCircle, MoreVertical, XCircle, Power, Edit, Sun, Moon } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useNavigate } from 'react-router-dom';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner'; // Reverted path
import { Subscription, SubscriptionPayment, PlanType, SubscriptionStatus, BillingCycle } from '../../types/database'; // Tipler import edildi
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import { Button } from "../../components/ui/button"; // Reverted path
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../../components/ui/card"; // Reverted path
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../../components/ui/accordion"; // Reverted path
import { Badge } from "../../components/ui/badge"; // Reverted path
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../../components/ui/dropdown-menu"; // Reverted path
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../../components/ui/alert-dialog"; // Reverted path
import { useTheme } from '../../lib/theme'; // Import useTheme

// Veri tipleri (Gerekirse genişletilebilir)
interface Assistant {
  id: string;
  user_id: string; // Eklendi (RLS için gerekebilir)
  full_name: string;
  email: string;
  phone?: string;
  clinic_name?: string;
  subscription?: Subscription | null; // İlişkili abonelik bilgisi
  pending_payments?: SubscriptionPayment[]; // Onay bekleyen ödemeler
  // Diğer asistan alanları...
}

interface Professional {
  id: string;
  full_name: string;
  title?: string;
  email?: string;
  assistant_id: string; // Hangi asistana bağlı olduğunu belirtir
  // Diğer profesyonel alanları...
}

// Helper fonksiyonları (SubscriptionManagement'tan alınabilir veya ortak bir yere taşınabilir)
const formatDate = (dateString: string | null | undefined): string => {
  if (!dateString) return '-';
  try {
    return format(new Date(dateString), 'dd MMM yyyy', { locale: tr }); // Daha kısa format
  } catch (error) {
    console.error("Date format error:", dateString, error);
    return 'Hatalı Tarih';
  }
};

const translatePlanName = (plan: PlanType | undefined | null): string => {
    switch (plan) {
        case 'starter': return 'Başlangıç';
        case 'growth': return 'Gelişim';
        case 'clinic': return 'Klinik';
        case 'enterprise': return 'Kurumsal';
        default: return plan || 'Bilinmiyor';
    }
}

const translateSubscriptionStatus = (status: SubscriptionStatus | undefined | null): React.ReactNode => {
    switch (status) {
        case 'active': return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"><CheckCircle className="w-3 h-3 mr-1"/>Aktif</span>;
        case 'trial': return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"><CheckCircle className="w-3 h-3 mr-1"/>Deneme</span>;
        case 'past_due': return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"><AlertTriangle className="w-3 h-3 mr-1"/>Ödeme Gecikmiş</span>;
        case 'pending_payment': return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300"><AlertTriangle className="w-3 h-3 mr-1"/>Ödeme Bekliyor</span>;
        case 'cancelled': return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"><CheckCircle className="w-3 h-3 mr-1"/>İptal Edilmiş</span>;
        case 'inactive': return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-300"><CheckCircle className="w-3 h-3 mr-1"/>Pasif</span>;
        default: return status || 'Bilinmiyor';
    }
}

// Abonelik Durumu için Badge varyantları
const getStatusVariant = (status: SubscriptionStatus | undefined | null): "default" | "destructive" | "outline" | "secondary" => {
    switch (status) {
        case 'active': return 'default'; // Use default (often primary color, greenish by default)
        case 'trial': return 'secondary'; // Use secondary for trial
        case 'past_due': return 'outline'; // Use outline for warnings
        case 'pending_payment': return 'outline'; // Use outline for warnings
        case 'cancelled': return 'destructive';
        case 'inactive': return 'secondary';
        default: return 'outline'; // Fallback to outline
    }
}

export function AdminPanel() {
  const { admin, user: adminUser, signOut } = useAuth();
  const { theme, setTheme, isDarkMode } = useTheme(); // Use the theme hook
  const navigate = useNavigate();
  const [assistants, setAssistants] = useState<Assistant[]>([]);
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingPaymentId, setUpdatingPaymentId] = useState<string | null>(null);
  const [cancellingSubscriptionId, setCancellingSubscriptionId] = useState<string | null>(null); // Yeni state
  const [showCancelConfirm, setShowCancelConfirm] = useState(false); // Yeni state
  const [selectedSubscriptionToCancel, setSelectedSubscriptionToCancel] = useState<Subscription | null>(null); // Yeni state

  // Theme toggle function
  const toggleTheme = () => {
    const newTheme = isDarkMode ? 'light' : 'dark';
    setTheme(newTheme);
  };

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Asistanları çek
      const { data: assistantsData, error: assistantsError } = await supabase
        .from('assistants')
        .select('id, user_id, full_name, email, phone, clinic_name'); 

      if (assistantsError) throw assistantsError;
      setAssistants(assistantsData || []);

      // Profesyonelleri çek
      const { data: professionalsData, error: professionalsError } = await supabase
        .from('professionals')
        .select('id, full_name, title, email, assistant_id');

      if (professionalsError) throw professionalsError;
      setProfessionals(professionalsData || []);

      const { data: subscriptionsData, error: subscriptionsError } = await supabase
          .from('subscriptions')
          .select('*');
      if (subscriptionsError) throw subscriptionsError;
      const subscriptionsMap = (subscriptionsData || []).reduce((map, sub) => {
          map[sub.assistant_id] = sub;
          return map;
      }, {} as Record<string, Subscription>);

      // Fetch pending payments WITHOUT the join for simplicity, we have subscription_id
      const { data: pendingPaymentsData, error: pendingPaymentsError } = await supabase
          .from('subscription_payments')
          .select('*') // Select all fields including subscription_id
          .eq('status', 'pending_verification');
      if (pendingPaymentsError) throw pendingPaymentsError;
      
      // Group pending payments by subscription_id first
      const pendingPaymentsBySubId = (pendingPaymentsData || []).reduce((map, payment) => {
          if (!map[payment.subscription_id]) {
              map[payment.subscription_id] = [];
          }
          map[payment.subscription_id].push(payment);
          return map;
      }, {} as Record<string, SubscriptionPayment[]>);

      // Combine data
      const combinedAssistants: Assistant[] = (assistantsData || []).map(assistant => {
          const subscription = subscriptionsMap[assistant.id] || null;
          const pendingPayments = subscription ? pendingPaymentsBySubId[subscription.id] || [] : [];
          return {
              ...assistant,
              subscription: subscription,
              pending_payments: pendingPayments
          };
      });
      setAssistants(combinedAssistants);

    } catch (err: any) {
      console.error("Admin Panel data fetching error:", err);
      setError("Veriler yüklenirken bir hata oluştu: " + err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate('/admin/giris'); // Çıkış sonrası admin girişine yönlendir
  };

  // Profesyonelleri asistan ID'sine göre grupla
  const professionalsByAssistant = professionals.reduce((acc, prof) => {
    const assistantId = prof.assistant_id;
    if (!acc[assistantId]) {
      acc[assistantId] = [];
    }
    acc[assistantId].push(prof);
    return acc;
  }, {} as Record<string, Professional[]>); // Tip belirtimi

  const handleApproveTransfer = async (payment: SubscriptionPayment) => {
    if (!adminUser || !payment.subscription_id) return;
    const confirmApproval = window.confirm(
        `${payment.bank_transfer_reference || 'Referanssız'} havale ödemesini onaylamak istediğinizden emin misiniz?`
    );
    if (!confirmApproval) return;

    setUpdatingPaymentId(payment.id);
    setError(null);

    try {
        // Ödeme kaydını güncelle
        const { error: paymentUpdateError } = await supabase
            .from('subscription_payments')
            .update({
                status: 'verified',
                verified_by_admin_id: adminUser.id,
                verified_at: new Date().toISOString(),
            })
            .eq('id', payment.id);
        if (paymentUpdateError) throw paymentUpdateError;

        // Aboneliği güncelle (Basit)
        const { error: subscriptionUpdateError } = await supabase
            .from('subscriptions')
            .update({ status: 'active' }) 
            .eq('id', payment.subscription_id)
            .neq('status', 'active'); 
        if (subscriptionUpdateError) {
            console.warn("Abonelik durumu güncellenirken hata (ödeme onaylandı):", subscriptionUpdateError);
        }

        // State'i güncelle
        setAssistants(prevAssistants => {
            // Find the index of the assistant whose subscription matches the payment
            const assistantIndex = prevAssistants.findIndex(a => a.subscription?.id === payment.subscription_id);
            
            if (assistantIndex === -1) {
                console.warn("Assistant not found in state for approved payment:", payment);
                return prevAssistants; // Assistant not found, return original state
            }

            // Create a new array to avoid direct state mutation
            const updatedAssistants = [...prevAssistants];
            const assistantToUpdate = { ...updatedAssistants[assistantIndex] }; // Copy the assistant object

            // Filter out the approved payment
            assistantToUpdate.pending_payments = (assistantToUpdate.pending_payments || []).filter(p => p.id !== payment.id);
            
            // Update the subscription status in the state
            if (assistantToUpdate.subscription) {
                assistantToUpdate.subscription = { ...assistantToUpdate.subscription, status: 'active' };
            }

            // Replace the old assistant object with the updated one
            updatedAssistants[assistantIndex] = assistantToUpdate;
            
            return updatedAssistants;
        });

        alert("Ödeme başarıyla onaylandı!");

    } catch (err: any) {
        console.error("Havale onaylama hatası:", err);
        setError(`Ödeme onaylanırken hata oluştu: ${err.message}`);
        alert(`Ödeme onaylanırken hata oluştu: ${err.message}`);
    } finally {
        setUpdatingPaymentId(null);
    }
  };

  // --- Yeni Fonksiyon: Abonelik İptali --- 
  const promptCancelSubscription = (subscription: Subscription) => {
      setSelectedSubscriptionToCancel(subscription);
      setShowCancelConfirm(true);
  }

  const handleCancelSubscription = async () => {
      if (!selectedSubscriptionToCancel || !adminUser) return;

      setCancellingSubscriptionId(selectedSubscriptionToCancel.id);
      setShowCancelConfirm(false); // Close dialog
      setError(null);

      try {
          // Option 1: Cancel immediately
          // const { error } = await supabase
          //   .from('subscriptions')
          //   .update({ status: 'cancelled', cancelled_at: new Date().toISOString() })
          //   .eq('id', selectedSubscriptionToCancel.id);

          // Option 2: Cancel at period end (Safer default)
          const { error } = await supabase
              .from('subscriptions')
              .update({ cancel_at_period_end: true })
              .eq('id', selectedSubscriptionToCancel.id);

          if (error) throw error;

          // Refresh data to show the change
          await fetchData();
          alert("Abonelik dönem sonunda iptal edilecek şekilde işaretlendi.");

      } catch (err: any) {
          console.error("Abonelik iptal hatası:", err);
          setError(`Abonelik iptal edilirken hata oluştu: ${err.message}`);
          alert(`Abonelik iptal edilirken hata oluştu: ${err.message}`);
      } finally {
          setCancellingSubscriptionId(null);
          setSelectedSubscriptionToCancel(null);
      }
  }
  // --- Bitiş: Abonelik İptali ---

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-900 text-slate-900 dark:text-slate-100 transition-colors duration-300">
      <header className="bg-white dark:bg-slate-800 shadow-sm sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <h1 className="text-xl font-semibold text-slate-800 dark:text-slate-200">
            Yönetim Paneli
          </h1>
          <div className="flex items-center space-x-2">
             {admin && <span className="text-sm font-medium hidden sm:block text-slate-600 dark:text-slate-400 mr-2">Hoşgeldin, {admin.full_name || admin.email || 'Admin'}</span>}
             <Button
               variant="ghost"
               size="icon"
               onClick={toggleTheme}
               title={isDarkMode ? 'Açık Mod' : 'Koyu Mod'}
             >
               {isDarkMode ? <Sun className="h-5 w-5 text-amber-500" /> : <Moon className="h-5 w-5 text-slate-500" />}
             </Button>
             <Button variant="ghost" size="icon" onClick={handleSignOut} title="Çıkış Yap">
               <LogOut className="h-5 w-5" />
             </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h2 className="text-2xl font-semibold mb-6 text-slate-800 dark:text-slate-200">Kayıtlı Klinikler / Asistanlar</h2>
        
        {loading && (
          <div className="flex justify-center items-center p-10">
            <LoadingSpinner size="large" />
          </div>
        )}

        {error && (
          <div className="p-4 mb-6 text-sm text-red-800 rounded-lg bg-red-50 dark:bg-red-900/30 border border-red-300 dark:border-red-600/30" role="alert">
            <span className="font-medium">Hata:</span> {error}
          </div>
        )}

        {!loading && !error && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {assistants.length === 0 ? (
              <p className="text-center text-slate-500 dark:text-slate-400 col-span-full">Henüz kayıtlı asistan/klinik bulunmuyor.</p>
            ) : (
              assistants.map(assistant => (
                <Card key={assistant.id} className="flex flex-col">
                  <CardHeader className="flex flex-row items-start justify-between pb-4">
                    <div>
                        <CardTitle className="text-lg flex items-center">
                           <Building className="h-5 w-5 mr-2 text-primary-600 dark:text-primary-400" />
                           {assistant.clinic_name || 'İsimsiz Klinik'}
                        </CardTitle>
                        <CardDescription className="mt-1 flex items-center text-sm">
                            <User className="h-4 w-4 mr-1.5 text-slate-400 dark:text-slate-500"/>
                            {assistant.full_name}
                        </CardDescription>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="-mt-2 -mr-2">
                           <MoreVertical className="h-5 w-5 text-slate-500 dark:text-slate-400" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Yönetim İşlemleri</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                            disabled={!assistant.subscription || assistant.subscription.status === 'cancelled' || !!cancellingSubscriptionId} 
                            onClick={() => assistant.subscription && promptCancelSubscription(assistant.subscription)}
                            className="text-red-600 dark:text-red-500 focus:bg-red-50 dark:focus:bg-red-900/50 focus:text-red-700 dark:focus:text-red-400"
                        >
                           <XCircle className="mr-2 h-4 w-4" />
                          <span>Aboneliği İptal Et</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem disabled>
                           <Edit className="mr-2 h-4 w-4" />
                           <span>Aboneliği Düzenle</span>
                        </DropdownMenuItem>
                         <DropdownMenuItem disabled>
                           <Power className="mr-2 h-4 w-4" />
                           <span>Hesabı Askıya Al</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </CardHeader>

                  <CardContent className="flex-grow space-y-4">
                     <div className="text-sm text-slate-600 dark:text-slate-400 space-y-1">
                       {assistant.email && (
                         <div className="flex items-center">
                          <Mail className="h-4 w-4 mr-2 text-slate-400 dark:text-slate-500 flex-shrink-0"/> <span className="truncate">{assistant.email}</span>
                         </div>
                       )}
                       {assistant.phone && (
                          <div className="flex items-center">
                           <Phone className="h-4 w-4 mr-2 text-slate-400 dark:text-slate-500 flex-shrink-0"/> <span>{assistant.phone}</span>
                          </div>
                       )}
                    </div>

                    <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
                      <h4 className="text-sm font-medium mb-2 text-slate-800 dark:text-slate-200">Abonelik</h4>
                      {assistant.subscription ? (
                          <div className="space-y-1.5 text-sm">
                              <div className="flex justify-between items-center">
                                  <span className="text-slate-500 dark:text-slate-400">Durum:</span>
                                   <Badge variant={getStatusVariant(assistant.subscription.status)} className="capitalize">
                                        {translateSubscriptionStatus(assistant.subscription.status)}
                                   </Badge>
                              </div>
                              <div className="flex justify-between">
                                  <span className="text-slate-500 dark:text-slate-400">Plan:</span>
                                  <span className="font-medium text-slate-700 dark:text-slate-300">
                                      {translatePlanName(assistant.subscription.plan_type)} ({assistant.subscription.billing_cycle === 'annual' ? 'Yıllık' : 'Aylık'})
                                  </span>
                              </div>
                               <div className="flex justify-between">
                                  <span className="text-slate-500 dark:text-slate-400">Dönem Sonu:</span>
                                  <span className="font-medium text-slate-700 dark:text-slate-300">
                                      {formatDate(assistant.subscription.status === 'trial' ? assistant.subscription.trial_end : assistant.subscription.current_period_end)}
                                  </span>
                              </div>
                              {assistant.subscription.cancel_at_period_end && (
                                   <div className="flex justify-between text-yellow-600 dark:text-yellow-400 font-medium">
                                       <span className="flex items-center"><AlertTriangle className="w-4 h-4 mr-1"/>İptal:</span>
                                       <span>Dönem sonunda</span>
                                   </div>
                              )}
                          </div>
                      ) : (
                          <p className="text-sm text-slate-500 dark:text-slate-400 italic">Aktif abonelik bulunmuyor.</p>
                      )}
                    </div>

                    {assistant.pending_payments && assistant.pending_payments.length > 0 && (
                       <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
                          <h4 className="text-sm font-medium mb-2 text-yellow-700 dark:text-yellow-400 flex items-center">
                             <AlertTriangle className="h-4 w-4 mr-1.5" />
                             Onay Bekleyen Havale(ler)
                          </h4>
                          <ul className="space-y-2">
                            {assistant.pending_payments.map(payment => (
                                <li key={payment.id} className="p-2 bg-yellow-50 dark:bg-yellow-900/30 rounded-md border border-yellow-200 dark:border-yellow-800/40 flex justify-between items-center">
                                    <div>
                                        <p className="text-xs font-medium text-yellow-900 dark:text-yellow-200">Ref: {payment.bank_transfer_reference || '-'}</p>
                                        <p className="text-xs text-yellow-700 dark:text-yellow-400">{formatDate(payment.created_at)}</p>
                                    </div>
                                    <Button
                                        variant="default"
                                        size="sm"
                                        onClick={() => handleApproveTransfer(payment)}
                                        disabled={updatingPaymentId === payment.id}
                                        className="whitespace-nowrap"
                                    >
                                         {updatingPaymentId === payment.id ? (
                                            <LoadingSpinner size="small" />
                                         ) : (
                                            <CheckCircle className="w-3.5 h-3.5 mr-1"/>
                                         )}
                                        Onayla
                                    </Button>
                                </li>
                            ))}
                          </ul>
                       </div>
                    )}

                    <Accordion type="single" collapsible className="w-full pt-4 border-t border-slate-200 dark:border-slate-700">
                      <AccordionItem value="item-1">
                        <AccordionTrigger className="text-sm font-medium text-slate-800 dark:text-slate-200">
                          <span className="flex items-center">
                             <Users className="h-4 w-4 mr-1.5 text-slate-500 dark:text-slate-400" />
                              Bağlı Uzmanlar ({professionalsByAssistant[assistant.id]?.length || 0})
                          </span>
                        </AccordionTrigger>
                        <AccordionContent>
                         {(professionalsByAssistant[assistant.id] && professionalsByAssistant[assistant.id].length > 0) ? (
                            <ul className="space-y-2 pt-2">
                                {professionalsByAssistant[assistant.id].map(professional => (
                                <li key={professional.id} className="p-2 bg-slate-50 dark:bg-slate-800/50 rounded-md border border-slate-200 dark:border-slate-700/50 flex justify-between items-center">
                                    <div>
                                    <p className="text-sm font-medium text-slate-900 dark:text-slate-100">{professional.full_name}</p>
                                    {professional.title && <p className="text-xs text-slate-500 dark:text-slate-400">{professional.title}</p>}
                                    </div>
                                    {professional.email && <span className="text-xs text-slate-600 dark:text-slate-400 hidden sm:block truncate max-w-[150px]" title={professional.email}>{professional.email}</span>}
                                </li>
                                ))}
                            </ul>
                            ) : (
                            <p className="text-sm text-slate-500 dark:text-slate-400 italic px-3 py-2">Bu asistana bağlı uzman bulunmuyor.</p>
                            )}
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion>

                  </CardContent>
                </Card>
              ))
            )}
          </div>
        )}

        {admin && !loading && (
          <Card className="mt-8">
             <CardHeader>
                <CardTitle className="text-base">Oturum Açan Admin (Debug)</CardTitle>
             </CardHeader>
             <CardContent>
                <pre className="text-xs text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 p-3 rounded overflow-x-auto">
                {JSON.stringify(admin, null, 2)}
                </pre>
             </CardContent>
          </Card>
        )}
      </main>

      <AlertDialog open={showCancelConfirm} onOpenChange={setShowCancelConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Aboneliği İptal Etmeyi Onayla</AlertDialogTitle>
            <AlertDialogDescription>
              Bu işlem seçili aboneliğin dönem sonunda yenilenmesini engelleyecektir.
              ({selectedSubscriptionToCancel?.assistant_id ? `Asistan ID: ${selectedSubscriptionToCancel.assistant_id}` : ''})
              Devam etmek istediğinizden emin misiniz?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={!!cancellingSubscriptionId}>Vazgeç</AlertDialogCancel>
            <Button
                variant="destructive"
                onClick={handleCancelSubscription}
                disabled={!!cancellingSubscriptionId}
            >
                 {cancellingSubscriptionId === selectedSubscriptionToCancel?.id ? (
                    <LoadingSpinner size="small" />
                 ) : (
                    <XCircle className="mr-2 h-4 w-4" />
                 )}
                Evet, Dönem Sonunda İptal Et
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

    </div>
  );
}

export default AdminPanel; 