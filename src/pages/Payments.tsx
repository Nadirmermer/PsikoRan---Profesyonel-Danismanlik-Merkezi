import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Payment, Professional } from '../types/database';
import {
  Search,
  FileDown,
  Filter,
  CreditCard,
  Wallet,
  ChevronLeft,
  ChevronRight,
  Plus,
  FileText,
  CalendarDays,
  Receipt,
  User,
  X,
  Check
} from 'lucide-react';
import { format, startOfDay, endOfDay, startOfMonth, endOfMonth, subMonths, parseISO } from 'date-fns';
import { tr } from 'date-fns/locale';
import { useAuth } from '../lib/auth';
import { TurkLiraIcon } from '../components/icons/TurkLiraIcon';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';

type PaymentView = 'daily' | 'settlements' | 'cash';
type PaymentStatus = 'pending' | 'paid_to_clinic' | 'paid_to_professional';

interface CashStatus {
  opening_balance: number;
  from_professionals: number;
  to_professionals: number;
}

interface ProfessionalSettlement {
  professional_id: string;
  professional_name: string;
  to_collect: number;
  to_pay: number;
  net_amount: number;
}

const PAYMENT_STATUS_LABELS: Record<PaymentStatus, string> = {
  pending: 'İşlem yapılmadı',
  paid_to_clinic: 'Kliniğe ödendi',
  paid_to_professional: 'Psikoloğa ödendi',
};

export function Payments() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState(
    format(new Date(), 'yyyy-MM-dd')
  );
  const [viewMode, setViewMode] = useState<PaymentView>('daily');
  const [cashStatus, setCashStatus] = useState<CashStatus>({
    opening_balance: 0,
    from_professionals: 0,
    to_professionals: 0,
  });
  const [settlements, setSettlements] = useState<ProfessionalSettlement[]>([]);
  const navigate = useNavigate();
  const { professional, assistant } = useAuth();

  useEffect(() => {
    loadPayments();
    if (viewMode === 'cash') {
      loadCashStatus();
    }
    if (viewMode === 'settlements') {
      calculateSettlements();
    }
  }, [dateFilter, viewMode, professional?.id]);

  async function loadPayments() {
    try {
      const startDate = startOfDay(new Date(dateFilter));
      const endDate = endOfDay(new Date(dateFilter));

      let query = supabase
        .from('payments')
        .select(`
          *,
          appointment:appointments(
            *,
            professional:professionals(*),
            client:clients(*)
          )
        `)
        .gte('payment_date', startDate.toISOString())
        .lte('payment_date', endDate.toISOString());

      if (professional) {
        query = query.eq('appointment.professional_id', professional.id);
      } else if (assistant) {
        const { data: managedProfessionals } = await supabase
          .from('professionals')
          .select('id')
          .eq('assistant_id', assistant.id);

        if (managedProfessionals && managedProfessionals.length > 0) {
          const professionalIds = managedProfessionals.map(p => p.id);
          query = query.in('appointment.professional_id', professionalIds);
        }
      }

      const { data, error } = await query.order('payment_date', {
        ascending: false,
      });

      if (error) throw error;
      
      // Filter out payments with missing or invalid data
      const validPayments = (data || []).filter(payment => 
        payment.appointment?.professional && 
        payment.appointment?.client &&
        payment.appointment.professional.full_name &&
        payment.appointment.client.full_name
      );
      
      setPayments(validPayments);
    } catch (error) {
      console.error('Error loading payments:', error);
    } finally {
      setLoading(false);
    }
  }

  async function loadCashStatus() {
    try {
      if (!assistant?.id) {
        console.warn('Asistan ID bulunamadı');
        return;
      }

      const startDate = startOfDay(new Date(dateFilter));
      const endDate = endOfDay(new Date(dateFilter));

      // Mevcut kasa durumunu kontrol et
      const { data: existingData, error: queryError } = await supabase
        .from('cash_status')
        .select('*')
        .eq('assistant_id', assistant.id)
        .eq('date', dateFilter);

      // Eğer veri yoksa veya hata varsa yeni kayıt oluştur
      let finalCashData;
      if (!existingData || existingData.length === 0 || queryError) {
        const { data: newData, error: insertError } = await supabase
          .from('cash_status')
          .upsert({
            assistant_id: assistant.id,
            date: dateFilter,
            opening_balance: 0
          })
          .select();

        if (insertError) {
          throw insertError;
        }

        finalCashData = newData?.[0];
      } else {
        finalCashData = existingData[0];
      }

      // Günlük ödemeleri getir
      const { data: payments, error: paymentsError } = await supabase
        .from('payments')
        .select()
        .gte('payment_date', startDate.toISOString())
        .lte('payment_date', endDate.toISOString());

      if (paymentsError) {
        throw paymentsError;
      }

      const fromProfessionals = payments?.reduce((sum, payment) => {
        if (payment.payment_status === 'paid_to_professional') {
          return sum + Number(payment.clinic_amount || 0);
        }
        return sum;
      }, 0) || 0;

      const toProfessionals = payments?.reduce((sum, payment) => {
        if (payment.payment_status === 'paid_to_clinic') {
          return sum + Number(payment.clinic_amount || 0);
        }
        return sum;
      }, 0) || 0;

      setCashStatus({
        opening_balance: finalCashData?.opening_balance || 0,
        from_professionals: fromProfessionals,
        to_professionals: toProfessionals,
      });
    } catch (error) {
      console.error('Kasa durumu yüklenirken hata oluştu:', error);
      setCashStatus({
        opening_balance: 0,
        from_professionals: 0,
        to_professionals: 0
      });
    }
  }

  async function calculateSettlements() {
    const startDate = startOfDay(new Date(dateFilter));
    const endDate = endOfDay(new Date(dateFilter));

    try {
      let query = supabase.from('professionals').select('*');
      
      if (assistant) {
        query = query.eq('assistant_id', assistant.id);
      }

      const { data: professionals, error: profError } = await query;

      if (profError) throw profError;

      const { data: payments, error: payError } = await supabase
        .from('payments')
        .select(
          `
          *,
          appointment:appointments(professional_id)
        `
        )
        .gte('payment_date', startDate.toISOString())
        .lte('payment_date', endDate.toISOString());

      if (payError) throw payError;

      const professionalSettlements = professionals.map((prof) => {
        const profPayments =
          payments?.filter(
            (payment) => payment.appointment?.professional_id === prof.id
          ) || [];

        const settlement = profPayments.reduce(
          (acc, payment) => {
            if (payment.payment_status === 'paid_to_clinic') {
              acc.to_pay += Number(payment.clinic_amount);
            } else if (payment.payment_status === 'paid_to_professional') {
              acc.to_collect += Number(payment.clinic_amount);
            }
            return acc;
          },
          { to_collect: 0, to_pay: 0 }
        );

        return {
          professional_id: prof.id,
          professional_name: prof.full_name,
          to_collect: settlement.to_collect,
          to_pay: settlement.to_pay,
          net_amount: settlement.to_pay - settlement.to_collect,
        };
      });

      setSettlements(professionalSettlements);
    } catch (error) {
      console.error('Error calculating settlements:', error);
    }
  }

  async function handleUpdatePaymentStatus(
    paymentId: string,
    status: PaymentStatus,
    paymentMethod?: 'cash' | 'credit_card'
  ) {
    try {
      const updates: any = { payment_status: status };
      if (paymentMethod) {
        updates.payment_method = paymentMethod;
      }

      const { error } = await supabase
        .from('payments')
        .update(updates)
        .eq('id', paymentId);

      if (error) throw error;

      await loadPayments();
      if (viewMode === 'settlements') {
        await calculateSettlements();
      }
      if (viewMode === 'cash') {
        await loadCashStatus();
      }
    } catch (error) {
      console.error('Error updating payment status:', error);
      alert('Ödeme durumu güncellenirken bir hata oluştu.');
    }
  }

  async function handleUpdateCashStatus(updates: Partial<CashStatus>) {
    try {
      const { error } = await supabase
        .from('cash_status')
        .update({ opening_balance: updates.opening_balance })
        .eq('date', dateFilter);

      if (error) throw error;
      await loadCashStatus();
    } catch (error) {
      console.error('Error updating cash status:', error);
      alert('Kasa durumu güncellenirken bir hata oluştu.');
    }
  }

  const filteredPayments = payments.filter((payment) => {
    // Null check for nested objects
    if (!payment?.appointment?.client?.full_name || !payment?.appointment?.professional?.full_name) {
      return false;
    }

    const searchString = searchTerm.toLowerCase();
    return (
      payment.appointment.client.full_name.toLowerCase().includes(searchString) ||
      payment.appointment.professional.full_name.toLowerCase().includes(searchString)
    );
  });

  const totalCash =
    cashStatus.opening_balance +
    cashStatus.from_professionals -
    cashStatus.to_professionals;

  if (loading) {
    return (
      <LoadingSpinner fullPage size="medium" showLoadingText={false} />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent">
          Ödemeler
        </h1>
        <div className="flex space-x-2">
          <button
            onClick={() => setViewMode('daily')}
            className={`px-4 py-2 rounded-xl transition-all duration-200 ${
              viewMode === 'daily'
                ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-sm'
                : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            Günlük Ödemeler
          </button>
          <button
            onClick={() => setViewMode('settlements')}
            className={`px-4 py-2 rounded-xl transition-all duration-200 ${
              viewMode === 'settlements'
                ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-sm'
                : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            Hesaplaşmalar
          </button>
          <button
            onClick={() => {
              setViewMode('cash');
              loadCashStatus();
            }}
            className={`px-4 py-2 rounded-xl transition-all duration-200 ${
              viewMode === 'cash'
                ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-sm'
                : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            Kasa Durumu
          </button>
        </div>
      </div>

      <div className="flex justify-end">
        <input
          type="date"
          value={dateFilter}
          onChange={(e) => setDateFilter(e.target.value)}
          className="rounded-xl border border-gray-300 dark:border-gray-700 bg-white/50 dark:bg-gray-800/50 text-gray-900 dark:text-white px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
        />
      </div>

      {viewMode === 'daily' && (
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl shadow-lg rounded-2xl border border-gray-200/50 dark:border-gray-700/50 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Danışan veya Psikoterapist ara..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full h-10 pl-10 pr-4 rounded-xl border border-gray-300 dark:border-gray-700 bg-white/50 dark:bg-gray-700/50 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              />
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50/50 dark:bg-gray-700/50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Danışan
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Psikoterapist
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Tutar
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Durum
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white/50 dark:bg-gray-800/50 divide-y divide-gray-200 dark:divide-gray-700">
                {filteredPayments.map((payment) => (
                  <tr key={payment.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-700/50 transition-colors duration-150">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {payment.appointment?.client?.full_name}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-white">
                        {payment.appointment?.professional?.full_name}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {Number(payment.amount).toLocaleString('tr-TR', {
                          style: 'currency',
                          currency: 'TRY',
                        })}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        Psikoterapist:{' '}
                        {Number(payment.professional_amount).toLocaleString(
                          'tr-TR',
                          {
                            style: 'currency',
                            currency: 'TRY',
                          }
                        )}
                        <br />
                        Klinik:{' '}
                        {Number(payment.clinic_amount).toLocaleString('tr-TR', {
                          style: 'currency',
                          currency: 'TRY',
                        })}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <select
                        value={payment.payment_status}
                        onChange={(e) =>
                          handleUpdatePaymentStatus(
                            payment.id,
                            e.target.value as PaymentStatus,
                            e.target.value === 'paid_to_clinic'
                              ? payment.payment_method
                              : undefined
                          )
                        }
                        className="block w-full rounded-xl border border-gray-300 dark:border-gray-700 bg-white/50 dark:bg-gray-700/50 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      >
                        {Object.entries(PAYMENT_STATUS_LABELS).map(
                          ([value, label]) => (
                            <option key={value} value={value}>
                              {label}
                            </option>
                          )
                        )}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {viewMode === 'settlements' && (
        <div className="space-y-6">
          {settlements.map((settlement) => (
            <div
              key={settlement.professional_id}
              className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl shadow-lg p-6 border border-gray-200/50 dark:border-gray-700/50"
            >
              <h3 className="text-lg font-semibold bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent mb-4">
                {settlement.professional_name}
              </h3>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Tahsil Edilecek
                  </p>
                  <p className="text-lg font-semibold text-green-600 dark:text-green-400">
                    {settlement.to_collect.toLocaleString('tr-TR', {
                      style: 'currency',
                      currency: 'TRY',
                    })}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Ödenecek
                  </p>
                  <p className="text-lg font-semibold text-red-600 dark:text-red-400">
                    {settlement.to_pay.toLocaleString('tr-TR', {
                      style: 'currency',
                      currency: 'TRY',
                    })}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Net Durum
                  </p>
                  <p
                    className={`text-lg font-semibold ${
                      settlement.net_amount >= 0
                        ? 'text-green-600 dark:text-green-400'
                        : 'text-red-600 dark:text-red-400'
                    }`}
                  >
                    {settlement.net_amount.toLocaleString('tr-TR', {
                      style: 'currency',
                      currency: 'TRY',
                    })}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {viewMode === 'cash' && (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl shadow-lg p-6 border border-gray-200/50 dark:border-gray-700/50">
            <h3 className="text-lg font-semibold bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent mb-4">
              Açılış Bakiyesi
            </h3>
            <input
              type="text"
              value={cashStatus.opening_balance.toString()}
              onChange={(e) => {
                const value = e.target.value.replace(/[^0-9]/g, '');
                handleUpdateCashStatus({
                  opening_balance: Number(value),
                });
              }}
              className="w-full rounded-xl border border-gray-300 dark:border-gray-700 bg-white/50 dark:bg-gray-700/50 text-gray-900 dark:text-white px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            />
          </div>
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl shadow-lg p-6 border border-gray-200/50 dark:border-gray-700/50">
            <h3 className="text-lg font-semibold bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent mb-4">
              Psikoterapistlardan Alınacaklar
            </h3>
            <p className="text-2xl font-bold text-green-600 dark:text-green-400">
              {cashStatus.from_professionals.toLocaleString('tr-TR', {
                style: 'currency',
                currency: 'TRY',
              })}
            </p>
          </div>
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl shadow-lg p-6 border border-gray-200/50 dark:border-gray-700/50">
            <h3 className="text-lg font-semibold bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent mb-4">
              Psikoterapistlara Ödenecekler
            </h3>
            <p className="text-2xl font-bold text-red-600 dark:text-red-400">
              {cashStatus.to_professionals.toLocaleString('tr-TR', {
                style: 'currency',
                currency: 'TRY',
              })}
            </p>
          </div>
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl shadow-lg p-6 border border-gray-200/50 dark:border-gray-700/50">
            <h3 className="text-lg font-semibold bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent mb-4">
              Kasada Olan Para
            </h3>
            <p
              className={`text-2xl font-bold ${
                totalCash >= 0
                  ? 'text-green-600 dark:text-green-400'
                  : 'text-red-600 dark:text-red-400'
              }`}
            >
              {totalCash.toLocaleString('tr-TR', {
                style: 'currency',
                currency: 'TRY',
              })}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}