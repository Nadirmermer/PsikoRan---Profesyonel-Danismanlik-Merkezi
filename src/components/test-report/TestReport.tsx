import React, { useRef } from 'react';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import { QRCodeSVG } from 'qrcode.react';
import { Printer, ChevronLeft, AlertTriangle } from 'lucide-react';
import { Bar } from 'react-chartjs-2';
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  BarElement, 
  Title, 
  Tooltip, 
  Legend 
} from 'chart.js';

// Varsayılan logo URL'si - uygulama logosu
const DEFAULT_LOGO_URL = "/assets/logo/logo.webp";

// Chart.js bileşenlerini kaydet
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface TestReportProps {
  testResult: {
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
  };
  client: {
    full_name: string;
    birth_date?: string;
    email?: string;
    phone?: string;
  };
  professional: {
    full_name: string;
    title?: string;
    clinic_name?: string;
  };
  clinic: {
    name: string;
    address: string;
    phone?: string;
    email?: string;
    logo_url?: string;
  };
}

// Test tiplerine göre kullanım kılavuzları (örnek)
const testUsageGuides: Record<string, string> = {
  "beck_depression": `Bu ölçek, depresyon belirtilerinin şiddetini ölçmek için kullanılan bir kendi kendini değerlendirme aracıdır. 
  0-13 puan minimal depresyon, 14-19 puan hafif depresyon, 20-28 puan orta şiddetli depresyon, 
  29-63 puan şiddetli depresyon düzeyine işaret edebilir.`,
  
  "beck_anxiety": `Bu ölçek, anksiyete belirtilerinin şiddetini ölçmek için kullanılan bir kendi kendini değerlendirme aracıdır. 
  0-7 puan minimal anksiyete, 8-15 puan hafif anksiyete, 16-25 puan orta şiddetli anksiyete, 
  26-63 puan şiddetli anksiyete düzeyine işaret edebilir.`,
  
  "mmpi": `Minnesota Çok Yönlü Kişilik Envanteri (MMPI), geniş kapsamlı bir kişilik değerlendirme aracıdır. 
  Farklı alt ölçeklerdeki puanlar, bireyin kişilik özellikleri ve psikopatoloji belirtilerini değerlendirmede kullanılır.`,
  
  // Diğer testler için kılavuzlar eklenebilir
  "default": `Bu test raporu, bireyin belirti düzeylerini veya kişilik özelliklerini değerlendirmede kullanılan 
  standartlaştırılmış bir ölçümün sonuçlarını içerir. Sonuçların yorumlanması için lütfen uzman ile görüşün.`
};

const TestReport: React.FC<TestReportProps> = ({
  testResult,
  client,
  professional,
  clinic
}) => {
  // Yazdırma işlevi
  const handlePrint = () => {
    window.print();
  };

  // Ana sayfaya dönme işlevi
  const handleGoBack = () => {
    window.history.back();
  };

  // Test sonuçları için grafik veri ve seçenekleri
  const prepareChartData = () => {
    // Test alt ölçekleri için grafik verisi oluştur
    let chartData = {
      labels: ['Toplam Skor'],
      datasets: [
        {
          label: 'Alınan Puan',
          data: [testResult.score || 0],
          backgroundColor: 'rgba(59, 130, 246, 0.6)',
          borderColor: 'rgb(59, 130, 246)',
          borderWidth: 1
        }
      ]
    };

    if (testResult.answers && Object.keys(testResult.answers).length > 0) {
      // Test cevaplarına göre alt ölçek puanları hazırla
      try {
        const categories: Record<string, number> = {};
        
        // Cevaplardan alt ölçek puanlarını çıkart
        Object.entries(testResult.answers).forEach(([key, value]) => {
          // Cevabın alt ölçeğini al
          const category = key.split('_')[0]; // Örnek format: "anksiyete_1", "depresyon_2" vb.
          
          if (category && category.length > 2) {
            const score = typeof value === 'object' ? (value.score || 0) : (parseInt(value.toString()) || 0);
            categories[category] = (categories[category] || 0) + score;
          }
        });
        
        // Alt ölçekleri grafik verilerine dönüştür
        if (Object.keys(categories).length > 0) {
          // Ana skorlar özelleştirilebilir isimlerle göster
          const scoreMapping: Record<string, string> = {
            'anksiyete': 'Anksiyete',
            'depresyon': 'Depresyon',
            'korku': 'Korku',
            'kaygi': 'Kaygı',
            'sosyal': 'Sosyal',
            'obsesif': 'Obsesif',
            'panik': 'Panik',
            // Diğer alt ölçekler eklenebilir
          };
          
          const sortedCategories = Object.entries(categories)
            .sort((a, b) => b[1] - a[1]); // Puanlara göre sırala
          
          chartData.labels = sortedCategories.map(([cat]) => 
            scoreMapping[cat.toLowerCase()] || cat.charAt(0).toUpperCase() + cat.slice(1)
          );
          chartData.datasets[0].data = sortedCategories.map(([_, score]) => score);
        }
      } catch (error) {
        console.error('Grafik verileri hazırlanırken hata:', error);
      }
    }
    
    return chartData;
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Alt Ölçek Puanları'
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Puan'
        }
      },
      x: {
        title: {
          display: true,
          text: 'Alt Ölçekler'
        }
      }
    }
  };

  // Test tipi için kullanım kılavuzunu al
  const getTestUsageGuide = () => {
    return testUsageGuides[testResult.test_type] || testUsageGuides.default;
  };

  return (
    <>
      {/* A4 Yazdırma Stilleri */}
      <style dangerouslySetInnerHTML={{ __html: `
        @page {
          size: A4 portrait;
          margin: 0;
        }
        
        @media print {
          body, html {
            margin: 0 !important;
            padding: 0 !important;
            width: 210mm;
            height: 297mm;
            background: #fff !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }

          .no-print, .no-print * {
            display: none !important;
          }
          
          .test-report {
            width: 210mm;
            height: 297mm;
            margin: 0 !important;
            padding: 15mm 20mm !important; /* Standart A4 kenar boşlukları */
            border: none !important;
            box-shadow: none !important;
            background: #fff !important;
            page-break-after: always;
            overflow: hidden;
            box-sizing: border-box !important;
          }

          .relative {
            position: static !important;
          }

          /* Cookie banner ve diğer istenmeyen içerikleri gizle */
          .cookie-banner, div[id*='cookie'], div[class*='cookie'], 
          div[id*='consent'], div[class*='consent'],
          #cookie-consent, .cookie-notice, #gdpr, .gdpr-banner {
            display: none !important;
            visibility: hidden !important;
            opacity: 0 !important;
            height: 0 !important;
            width: 0 !important;
            position: absolute !important;
            top: -9999px !important;
            left: -9999px !important;
          }

          table, figure, .card, .border.rounded-lg {
            page-break-inside: avoid;
          }

          h1, h2, h3, h4, h5, h6 {
             page-break-after: avoid;
          }

          .signature {
            page-break-before: auto;
          }
          
          /* Tablo ve diğer uzun içerikler için ek ayarlar */
          .overflow-hidden, .overflow-x-auto {
            overflow: visible !important;
          }
          
          /* Renkli yazdırma için gerekli */
          * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
        }
      ` }} />
      <div className="relative">
        {/* Yazdırma ve Geri Dönme Düğmeleri */}
        <div className="fixed top-4 right-4 flex space-x-2 no-print">
          <button
            onClick={handleGoBack}
            className="flex items-center px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg text-sm font-medium transition-colors"
          >
            <ChevronLeft size={16} className="mr-1" />
            Geri Dön
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
          >
            <Printer size={16} className="mr-1" />
            Yazdır
          </button>
        </div>
        
        {/* Test Raporu İçeriği */}
        <div className="test-report min-h-screen bg-white p-8 max-w-5xl mx-auto shadow-lg rounded-lg my-4">
          {/* Rapor Başlığı */}
          <div className="mb-8 text-center border-b pb-4">
            <h1 className="text-3xl font-bold text-blue-800 mb-2">
              {testResult.test_name}
            </h1>
            <p className="text-gray-600 text-lg font-medium uppercase tracking-wider">Test Raporu - Değerlendirme Sonuçları</p>
          </div>
          
          {/* Üst Kısım - Logo ve Klinik Bilgileri */}
          <div className="flex justify-between items-start mb-8 border-b pb-6">
            <div className="flex items-center space-x-4">
              <img 
                src={clinic.logo_url || DEFAULT_LOGO_URL} 
                alt={`${clinic.name} Logo`}
                className="h-16 w-auto object-contain"
                onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
                  // Logo yüklenemezse ya da CSP hatası oluşursa varsayılan logoyu göster
                  console.log("Logo yüklenemedi, varsayılan logo kullanılıyor");
                  e.currentTarget.src = DEFAULT_LOGO_URL;
                  // CSP hatası durumunda bu da çalışmazsa, görüntüyü gizle
                  e.currentTarget.onerror = () => {
                    console.log("Varsayılan logo da yüklenemedi, logo gizleniyor");
                    e.currentTarget.style.display = 'none';
                  };
                }}
              />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{clinic.name}</h1>
                <p className="text-gray-600 mt-1">{clinic.address}</p>
                <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                  {clinic.phone && <p>Tel: {clinic.phone}</p>}
                  {clinic.email && <p>E-posta: {clinic.email}</p>}
                </div>
              </div>
            </div>

            {/* QR Kod ve Rapor Tarihi */}
            <div className="text-right">
              <div className="mb-2">
                <QRCodeSVG 
                  value={`${window.location.origin}/test-results/${testResult.id}`}
                  size={64}
                  level="H"
                  className="inline-block"
                />
              </div>
              <p className="text-sm text-gray-500">
                Rapor Tarihi: {format(new Date(testResult.created_at), 'd MMMM yyyy', { locale: tr })}
              </p>
              <p className="text-sm text-gray-500">
                Rapor No: {testResult.id.slice(0, 8).toUpperCase()}
              </p>
            </div>
          </div>

          {/* Hasta ve Test Bilgileri */}
          <div className="grid grid-cols-2 gap-8 mb-8">
            {/* Hasta Bilgileri */}
            <div className="border rounded-lg p-5 bg-gradient-to-br from-white to-gray-50 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                Hasta Bilgileri
              </h2>
              <div className="space-y-3">
                <p className="text-gray-700 flex items-center">
                  <span className="font-medium w-32">Ad Soyad:</span> 
                  <span className="font-semibold text-gray-900">{client.full_name}</span>
                </p>
                {client.birth_date && (
                  <p className="text-gray-700 flex items-center">
                    <span className="font-medium w-32">Doğum Tarihi:</span>{' '}
                    <span>{format(new Date(client.birth_date), 'd MMMM yyyy', { locale: tr })}</span>
                  </p>
                )}
                {client.phone && (
                  <p className="text-gray-700 flex items-center">
                    <span className="font-medium w-32">Telefon:</span> 
                    <span>{client.phone}</span>
                  </p>
                )}
                {client.email && (
                  <p className="text-gray-700 flex items-center">
                    <span className="font-medium w-32">E-posta:</span> 
                    <span>{client.email}</span>
                  </p>
                )}
              </div>
            </div>

            {/* Test Bilgileri */}
            <div className="border rounded-lg p-5 bg-gradient-to-br from-white to-blue-50 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Test Bilgileri
              </h2>
              <div className="space-y-3">
                <p className="text-gray-700 flex items-center">
                  <span className="font-medium w-32">Test Adı:</span> 
                  <span className="font-semibold text-gray-900">{testResult.test_name}</span>
                </p>
                <p className="text-gray-700 flex items-center">
                  <span className="font-medium w-32">Test Tipi:</span> 
                  <span>{testResult.test_type}</span>
                </p>
                <p className="text-gray-700 flex items-center">
                  <span className="font-medium w-32">Uygulayan:</span>{' '}
                  <span>{professional.title ? `${professional.title} ` : ''}{professional.full_name}</span>
                </p>
                {testResult.duration_seconds && (
                  <p className="text-gray-700 flex items-center">
                    <span className="font-medium w-32">Test Süresi:</span>{' '}
                    <span>{Math.floor(testResult.duration_seconds / 60)} dakika{' '}
                    {testResult.duration_seconds % 60} saniye</span>
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Test Sonuçları */}
          <div className="mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-6 pb-2 border-b">Test Sonuçları</h2>
            
            {/* Skor Kartı */}
            <div className="score-card mb-6 bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg border border-blue-100">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm font-medium text-blue-800 uppercase mb-1">Toplam Skor</p>
                  <h3 className="text-4xl font-bold text-blue-900">
                    {testResult.score !== undefined ? testResult.score : '-'}
                  </h3>
                </div>
                {testResult.result && (
                  <div className="text-right">
                    <p className="text-sm font-medium text-blue-800 uppercase mb-1">Değerlendirme</p>
                    <p className="text-2xl font-semibold text-blue-700">{testResult.result}</p>
                    <p className="text-sm text-blue-600 mt-1">
                      Uygulama tarihi: {format(new Date(testResult.created_at), 'd MMMM yyyy', { locale: tr })}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Grafik Gösterimi */}
            {testResult.score !== undefined && (
              <div className="p-4 bg-white border rounded-lg mb-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">Puan Dağılımı</h3>
                <div className="h-64">
                  <Bar data={prepareChartData()} options={chartOptions} />
                </div>
              </div>
            )}
          </div>

          {/* Cevaplar Tablosu */}
          {testResult.answers && Object.keys(testResult.answers).length > 0 && (
            <div className="mb-8">
              <h2 className="text-xl font-bold text-gray-900 mb-6 pb-2 border-b">Test Soruları ve Cevapları</h2>
              <div className="border rounded-lg overflow-hidden shadow-sm">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Soru
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Cevap
                      </th>
                      {Object.values(testResult.answers)[0]?.score !== undefined && (
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Puan
                        </th>
                      )}
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {Object.entries(testResult.answers).map(([question, answer], index) => (
                      <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {typeof question === 'string' ? question : `Soru ${index + 1}`}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {typeof answer === 'object' 
                            ? answer.value || JSON.stringify(answer)
                            : answer.toString()}
                        </td>
                        {Object.values(testResult.answers)[0]?.score !== undefined && (
                          <td className="px-6 py-4 text-sm text-gray-900">
                            {typeof answer === 'object' && 'score' in answer ? answer.score : '-'}
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* İmza ve Onay */}
          <div className="signature mt-10 pt-6 border-t border-gray-200">
            <div className="flex justify-between items-start">
              <div className="max-w-xs">
                <p className="text-sm font-medium text-gray-900 mb-1">Değerlendiren</p>
                <p className="text-base font-semibold text-gray-900">
                  {professional.title ? `${professional.title} ` : ''}{professional.full_name}
                </p>
                {professional.clinic_name && (
                  <p className="text-sm text-gray-600 mt-1">{professional.clinic_name}</p>
                )}
              </div>
              <div className="text-right max-w-xs">
                <p className="text-sm text-gray-600">
                  Bu rapor {format(new Date(testResult.created_at), 'd MMMM yyyy', { locale: tr })} 
                  tarihinde elektronik olarak oluşturulmuştur.
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  Rapor No: {testResult.id.slice(0, 8).toUpperCase()}
                </p>
              </div>
            </div>
          </div>
          
          {/* Footer */}
          <div className="mt-12 pt-4 border-t text-center text-xs text-gray-500">
            <p>&copy; {new Date().getFullYear()} {clinic.name}. Tüm hakları saklıdır.</p>
            <p className="mt-1">Bu rapor elektronik olarak oluşturulmuştur ve {professional.full_name} tarafından onaylanmıştır.</p>
          </div>
        </div>
      </div>
    </>
  );
};

export default TestReport; 