import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import TestReport from '../../components/test-report/TestReport';
import { Loader2, ChevronLeft } from 'lucide-react';

// Veri tipleri
interface TestResult {
  id: string;
  test_type: string;
  test_name: string;
  created_at: string;
  score?: number;
  result?: string;
  professional_name?: string;
  answers?: Record<string, any>;
  client_id: string;
  professional_id: string;
  duration_seconds?: number;
  is_public_access?: boolean;
}

interface Client {
  id: string;
  full_name: string;
  birth_date?: string;
  email?: string;
  phone?: string;
}

interface Professional {
  id: string;
  full_name: string;
  title?: string;
  email?: string;
  phone?: string;
  address?: string;
  clinic_name?: string;
  assistant?: Array<{
    id: string;
    clinic_name?: string;
  }>;
}

interface Clinic {
  name: string;
  address: string;
  phone?: string;
  email?: string;
  logo_url?: string;
}

interface TestReportData {
  testResult: TestResult;
  client: Client;
  professional: Professional;
  clinic: Clinic;
}

const TestResultPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<TestReportData | null>(null);

  useEffect(() => {
    const fetchTestResult = async () => {
      try {
        setLoading(true);
        setError(null);

        if (!id) {
          throw new Error('Test ID bulunamadı');
        }

        // Test sonucunu getir
        const { data: testResult, error: testError } = await supabase
          .from('test_results')
          .select('*')
          .eq('id', id)
          .single();

        if (testError) throw testError;
        if (!testResult) throw new Error('Test sonucu bulunamadı');

        // Danışan bilgilerini getir
        const { data: client, error: clientError } = await supabase
          .from('clients')
          .select('*')
          .eq('id', testResult.client_id)
          .single();

        if (clientError) throw clientError;

        // Uzman bilgilerini getir
        const { data: professional, error: profError } = await supabase
          .from('professionals')
          .select(`
            *,
            assistant:assistants(
              clinic_name
            )
          `)
          .eq('id', testResult.professional_id)
          .single();

        if (profError) throw profError;

        // Klinik bilgileri
        const clinicInfo: Clinic = {
          name: professional.assistant?.[0]?.clinic_name || 'Klinik Adı',
          address: professional.address || 'Klinik Adresi',
          phone: professional.phone || '+90 xxx xxx xx xx',
          email: professional.email || 'info@klinik.com',
          logo_url: '/logo.png' // Logo yolu - gerçek logo yolunu buraya ekleyin
        };

        setData({
          testResult: {
            ...testResult
          },
          client,
          professional: {
            ...professional,
            clinic_name: professional.assistant?.[0]?.clinic_name
          },
          clinic: clinicInfo
        });
      } catch (err: any) {
        console.error('Veri yükleme hatası:', err);
        setError(err.message || 'Bir hata oluştu');
      } finally {
        setLoading(false);
      }
    };

    fetchTestResult();
  }, [id]);

  // Geri dönme fonksiyonu
  const handleGoBack = () => {
    window.history.back();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500 mx-auto mb-4" />
          <p className="text-gray-600">Test sonucu yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-red-700 mb-2">Hata</h2>
            <p className="text-red-600">{error}</p>
          </div>
        </div>
        <button 
          onClick={handleGoBack}
          className="mt-4 flex items-center px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg text-sm font-medium transition-colors"
        >
          <ChevronLeft size={16} className="mr-1" />
          Geri Dön
        </button>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-yellow-700 mb-2">Test Sonucu Bulunamadı</h2>
            <p className="text-yellow-600">İstediğiniz test sonucu bulunamadı veya erişim izniniz yok.</p>
          </div>
        </div>
        <button 
          onClick={handleGoBack}
          className="mt-4 flex items-center px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg text-sm font-medium transition-colors"
        >
          <ChevronLeft size={16} className="mr-1" />
          Geri Dön
        </button>
      </div>
    );
  }

  return <TestReport {...data} />;
};

export default TestResultPage; 