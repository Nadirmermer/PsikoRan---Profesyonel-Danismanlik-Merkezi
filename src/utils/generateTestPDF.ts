import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Test, Question } from '../data/tests/types';
import { scid5SpqCriteria } from '../data/tests/scid-5-spq';

interface Client {
  id: string;
  full_name: string;
  professional?: {
    full_name: string;
    title?: string;
    clinic_name?: string;
  };
}

interface Professional {
  id: string;
  full_name: string;
  title?: string;
}

interface TestResult {
  id: string;
  test_type: string;
  score: number;
  answers: Record<string, any>;
  created_at: string;
  notes?: string;
  duration_seconds?: number;
  started_at?: string;
  completed_at?: string;
}

// Türkçe karakterleri ASCII'ye dönüştürme fonksiyonu
function turkishToAscii(text: string): string {
  return (text || '').replace(/[şŞıİğĞüÜöÖçÇ]/g, (match: string) => {
    const replacements: { [key: string]: string } = {
      'ş': 's', 'Ş': 'S', 'ı': 'i', 'İ': 'I',
      'ğ': 'g', 'Ğ': 'G', 'ü': 'u', 'Ü': 'U',
      'ö': 'o', 'Ö': 'O', 'ç': 'c', 'Ç': 'C'
    };
    return replacements[match] || match;
  });
}

// Süreyi formatla
function formatDuration(seconds?: number): string {
  if (!seconds) return '-';
  
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}

export function generateTestPDF(
  test: Test,
  result: TestResult,
  client: Client,
  professional: Professional
): jsPDF {
  // PDF oluştur
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'pt',
    format: 'a4'
  });

  // Default font olarak Times-Roman kullan
  pdf.setFont("times", "normal");
  
  // Sayfa boyutları ve kenar boşlukları
  const pageWidth = pdf.internal.pageSize.width;
  const pageHeight = pdf.internal.pageSize.height;
  const margin = {
    top: 50,
    right: 50,
    bottom: 50,
    left: 50
  };
  
  // Renk paleti - Kurumsal renkler
  const colors = {
    primary: { r: 28, g: 55, b: 90 },      // Koyu Lacivert
    secondary: { r: 45, g: 81, b: 154 },   // Lacivert
    success: { r: 39, g: 124, b: 98 },     // Kurumsal Yeşil
    warning: { r: 183, g: 121, b: 31 },    // Kurumsal Turuncu
    error: { r: 155, g: 34, b: 34 },       // Kurumsal Kırmızı
    text: { r: 51, g: 51, b: 51 },         // Koyu Gri
    light: { r: 245, g: 247, b: 250 },     // Açık Gri
    white: { r: 255, g: 255, b: 255 }
  };
  
  // Test kriterleri ve açıklamalarını çiz
  const drawTestCriteria = () => {
    let y = 160;

    // Kriter kartı
    pdf.setFillColor(colors.light.r, colors.light.g, colors.light.b);
    pdf.roundedRect(margin.left, y, pageWidth - (margin.left + margin.right), 220, 4, 4, 'F');

    // Başlık
    pdf.setFont("times", "bold");
    pdf.setFontSize(18);
    pdf.setTextColor(colors.primary.r, colors.primary.g, colors.primary.b);
    pdf.text(turkishToAscii('Test Sonucu'), margin.left + 20, y + 30);

    // Alt çizgi
    pdf.setDrawColor(colors.primary.r, colors.primary.g, colors.primary.b);
    pdf.setLineWidth(1);
    pdf.line(margin.left + 20, y + 36, margin.left + 120, y + 36);

    // Test sonucu ve yorumu
    const score = result.score;
    let scoreLevel = '';
    let scoreColor = colors.success;

    // Puan göstergesi kartı
    const scoreBoxWidth = 140;
    const scoreBoxHeight = 100;
    const scoreBoxX = pageWidth - margin.right - scoreBoxWidth - 20;

    // Test türüne göre özel değerlendirmeler
    switch (test.id) {
      case 'beckAnxiety':
        if (score <= 7) {
          scoreLevel = 'Minimal Düzey';
          scoreColor = colors.success;
        } else if (score <= 15) {
          scoreLevel = 'Hafif Düzey';
          scoreColor = colors.primary;
        } else if (score <= 25) {
          scoreLevel = 'Orta Düzey';
          scoreColor = colors.warning;
        } else {
          scoreLevel = 'Şiddetli Düzey';
          scoreColor = colors.error;
        }
        break;

      case 'beckDepression':
        if (score <= 9) {
          scoreLevel = 'Minimal Düzey';
          scoreColor = colors.success;
        } else if (score <= 16) {
          scoreLevel = 'Hafif Düzey';
          scoreColor = colors.primary;
        } else if (score <= 29) {
          scoreLevel = 'Orta Düzey';
          scoreColor = colors.warning;
        } else {
          scoreLevel = 'Şiddetli Düzey';
          scoreColor = colors.error;
        }
        break;

      case 'scl90r':
        if (score <= 1) {
          scoreLevel = 'Normal Düzey';
          scoreColor = colors.success;
        } else if (score <= 2) {
          scoreLevel = 'Hafif Düzey';
          scoreColor = colors.primary;
        } else if (score <= 3) {
          scoreLevel = 'Orta Düzey';
          scoreColor = colors.warning;
        } else {
          scoreLevel = 'Yüksek Düzey';
          scoreColor = colors.error;
        }
        break;

      case 'scid-5-spq':
        // SCID-5-SPQ için puan göstergesi kullanılmıyor
        scoreLevel = 'Modüler Değerlendirme';
        scoreColor = colors.primary;
        break;

      default:
        scoreLevel = 'Değerlendirme';
        scoreColor = colors.primary;
    }

    // SCID-5-SPQ için farklı bir gösterim kullanıyoruz
    if (test.id === 'scid-5-spq') {
      // Puan göstergesi yerine modül bilgisi
      pdf.setFont("times", "bold");
      pdf.setFontSize(14);
      pdf.setTextColor(colors.text.r, colors.text.g, colors.text.b);
      pdf.text(turkishToAscii('Seçilen Modüller:'), margin.left + 20, y + 60);
      
      // Modül listesi
      pdf.setFont("times", "normal");
      pdf.setFontSize(12);
      
      const reportData = test.generateReport ? test.generateReport(result.answers) as any : null;
      if (reportData && reportData.solvedModules) {
        const solvedModules = reportData.solvedModules;
        const allModules = reportData.allModules || [];
        
        // Modülleri iki sütunda göster
        const modulesPerColumn = Math.ceil(allModules.length / 2);
        
        allModules.forEach((module: any, index: number) => {
          const isSolved = module.isSolved;
          const moduleName = module.name;
          const icon = isSolved ? '✓' : '✗';
          const iconColor = isSolved ? colors.success : colors.error;
          
          // Sütun ve satır pozisyonunu hesapla
          const column = Math.floor(index / modulesPerColumn);
          const row = index % modulesPerColumn;
          
          const xPos = margin.left + 20 + (column * 200);
          const yPos = y + 80 + (row * 16);
          
          // İkon
          pdf.setTextColor(iconColor.r, iconColor.g, iconColor.b);
          pdf.text(icon, xPos, yPos);
          
          // Modül adı
          pdf.setTextColor(colors.text.r, colors.text.g, colors.text.b);
          pdf.text(turkishToAscii(moduleName), xPos + 15, yPos);
        });
      } else {
        pdf.text(turkishToAscii('Modül bilgisi bulunamadı.'), margin.left + 20, y + 80);
      }
    } else {
    // Puan göstergesi
    pdf.setFillColor(scoreColor.r, scoreColor.g, scoreColor.b);
    pdf.roundedRect(scoreBoxX, y + 20, scoreBoxWidth, scoreBoxHeight, 4, 4, 'F');
    
    // Puan
    pdf.setFont("times", "bold");
    pdf.setFontSize(36);
    pdf.setTextColor(255, 255, 255);
    
    // SCL-90 için sadece 2 ondalık basamak göster
    let scoreText = test.id === 'scl90r' ? score.toFixed(2) : score.toString();
    pdf.text(scoreText, scoreBoxX + (scoreBoxWidth / 2), y + 65, { align: 'center' });
    
    // Seviye
    pdf.setFontSize(16);
    pdf.text(turkishToAscii(scoreLevel), scoreBoxX + (scoreBoxWidth / 2), y + 90, { align: 'center' });
    }

    let contentY = y + 50;

    // Puanlama kriterleri
    pdf.setFont("times", "bold");
    pdf.setFontSize(12);
    pdf.setTextColor(colors.text.r, colors.text.g, colors.text.b);
    
    // SCID-5-SPQ için farklı başlık
    if (test.id === 'scid-5-spq') {
      // Test bilgisi kısmını kaldırıyoruz
      return y + 180; // Daha az boşluk bırakarak bitir
    } else {
      pdf.text(turkishToAscii('Puanlama Kriterleri:'), margin.left + 20, contentY);
    }
    
    contentY += 20;

    // Test türüne göre puanlama kriterleri
    pdf.setFont("times", "normal");
    pdf.setFontSize(11);
    let criteria: string[] = [];
    
    switch (test.id) {
      case 'beckAnxiety':
        criteria = [
          '0-7 puan: Minimal düzeyde anksiyete',
          '8-15 puan: Hafif düzeyde anksiyete',
          '16-25 puan: Orta düzeyde anksiyete',
          '26-63 puan: Şiddetli düzeyde anksiyete'
        ];
        break;

      case 'beckDepression':
        criteria = [
          '0-9 puan: Minimal düzeyde depresyon',
          '10-16 puan: Hafif düzeyde depresyon',
          '17-29 puan: Orta düzeyde depresyon',
          '30-63 puan: Şiddetli düzeyde depresyon'
        ];
        break;

      case 'scl90r':
        criteria = [
          '0-1 puan: Normal düzey - Klinik açıdan anlamlı belirti yok',
          '1-2 puan: Hafif düzey - Hafif şiddette psikolojik sıkıntı',
          '2-3 puan: Orta düzey - Orta şiddette psikolojik sıkıntı',
          '3+ puan: Yüksek düzey - Ciddi psikolojik sıkıntı'
        ];
        break;
        
      case 'scid-5-spq':
        criteria = [
          'SCID-5-SPQ, kişilik bozukluklarını taramak için kullanılan bir öz bildirim anketidir.',
          'Her madde için "Evet", "Hayır" veya "Bilmiyorum" şeklinde cevap verilir.',
          'Test modüler yapıdadır. İstediğiniz kişilik bozukluğu modüllerini seçerek değerlendirme yapabilirsiniz.',
          'Bu anket tanı koymak için değil, tarama amaçlı kullanılır.',
          'Sonuçlar, kişilik özellikleri hakkında ön bilgi sağlar.'
        ];
        break;
        
      default:
        // Diğer testler için varsayılan kriterler
        if (test.id === 'youngSchema') {
          criteria = [
            '1-2 puan: Düşük - Şema aktif değil',
            '3-4 puan: Orta - Şema kısmen aktif',
            '5-6 puan: Yüksek - Şema aktif'
          ];
        } else if (test.id === 'traumaticExperiences') {
          criteria = [
            '0-1 puan: Minimal travmatik deneyim',
            '2-3 puan: Hafif travmatik deneyim',
            '4-5 puan: Orta düzeyde travmatik deneyim',
            '6+ puan: Şiddetli travmatik deneyim'
          ];
        } else if (test.id === 'dissociativeExperiences') {
          criteria = [
            '0-10 puan: Normal aralık',
            '11-20 puan: Hafif disosiyasyon',
            '21-30 puan: Orta düzeyde disosiyasyon',
            '31+ puan: Şiddetli disosiyasyon'
          ];
        } else {
          criteria = [
            'Düşük puan: Normal aralık',
            'Orta puan: Hafif düzey',
            'Yüksek puan: Klinik düzey'
          ];
        }
    }

    criteria.forEach((criterion, index) => {
      pdf.text(turkishToAscii(criterion), margin.left + 20, contentY + (index * 16));
    });
    contentY += (criteria.length * 16) + 20;

    // Test hakkında bilgi
    pdf.setFont("times", "bold");
    pdf.setFontSize(12);
    
    // SCID-5-SPQ için farklı başlık
    if (test.id === 'scid-5-spq') {
      pdf.text(turkishToAscii('Değerlendirme:'), margin.left + 20, contentY);
    } else {
    pdf.text(turkishToAscii('Test Bilgisi:'), margin.left + 20, contentY);
    }

    pdf.setFont("times", "normal");
    pdf.setFontSize(11);
    
    let testInfo = '';
    switch (test.id) {
      case 'beckAnxiety':
        testInfo = 'Beck Anksiyete Envanteri, anksiyete belirtilerinin şiddetini ölçmek için kullanılır.\nSon bir hafta içindeki belirtileri değerlendirir.\nHer madde 0-3 arası puanlanır.\nToplam puan 0-63 arasında değişir.\n\nPuanlama:\n0-7 puan: Minimal düzeyde anksiyete\n8-15 puan: Hafif düzeyde anksiyete\n16-25 puan: Orta düzeyde anksiyete\n26-63 puan: Şiddetli düzeyde anksiyete';
        break;
      case 'beckDepression':
        testInfo = 'Beck Depresyon Envanteri, depresyon belirtilerinin şiddetini ölçmek için kullanılır.\nHer madde 0-3 arası puanlanır.\nToplam puan 0-63 arasında değişir.\nKesme puanı 17\'dir. 17 ve üstü puanlar tedavi gerektirir.\n\nPuanlama:\n5-9 puan: Normal düzey\n10-18 puan: Hafif-orta düzey depresyon\n19-29 puan: Orta-şiddetli düzey depresyon\n30-63 puan: Şiddetli düzey depresyon';
        break;
      case 'scl90r':
        testInfo = 'SCL-90-R, çeşitli psikolojik belirtileri ve psikopatoloji düzeyini ölçen çok boyutlu bir değerlendirme aracıdır.\nHer madde 0-4 arası puanlanır.\nToplam 90 soru üzerinden değerlendirme yapılır.\n\nPuanlama:\n0-1.50: Normal düzey\n1.51-2.50: Araz düzeyi yüksek\n2.51-4.00: Araz düzeyi çok yüksek';
        break;
      case 'scid-5-spq':
        const reportData = test.generateReport ? test.generateReport(result.answers) as any : null;
        if (reportData) {
          const totalYes = reportData.totalScore || 0;
          const totalNo = reportData.totalNoAnswers || 0;
          const totalUnknown = reportData.totalUnknownAnswers || 0;
          testInfo = `SCID-5-SPQ değerlendirmesinde toplam ${totalYes} madde için "Evet", ${totalNo} madde için "Hayır", ${totalUnknown} madde için "Bilmiyorum" cevabı verilmiştir.\n\nBu değerlendirme, kişilik özellikleri hakkında ön bilgi sağlar ve tanı koymak için değil, tarama amaçlı kullanılır.\n\nDetaylı değerlendirme için SCID-5-PD görüşmesi yapılması önerilir.`;
        } else {
          testInfo = 'SCID-5-SPQ, kişilik bozukluklarını taramak için kullanılan bir öz bildirim anketidir. Her madde için "Evet", "Hayır" veya "Bilmiyorum" şeklinde cevap verilir. Test modüler yapıdadır. İstediğiniz kişilik bozukluğu modüllerini seçerek değerlendirme yapabilirsiniz.';
        }
        break;
      case 'beckHopelessness':
        testInfo = 'Beck Umutsuzluk Ölçeği, geleceğe yönelik karamsarlık düzeyini ölçer.\nToplam 20 maddeden oluşur.\nHer madde Evet/Hayır şeklinde yanıtlanır.\nBazı maddeler ters puanlanır.\nToplam puan 0-20 arasında değişir.\n\nPuanlama:\n0-3 puan: Umutsuzluk yok\n4-8 puan: Hafif düzeyde umutsuzluk\n9-14 puan: Orta düzeyde umutsuzluk\n15-20 puan: İleri düzeyde umutsuzluk';
        break;
      case 'edinburgh':
        testInfo = 'Edinburgh Doğum Sonrası Depresyon Ölçeği (EDSDÖ), doğum sonrası depresyon riskini belirlemek için kullanılır.\nSon 7 gün içindeki durumu değerlendirir.\nHer madde 0-3 arası puanlanır.\nToplam puan 0-30 arasında değişir.\nKesme puanı 12/13\'tür.\n\nPuanlama:\n0-12 puan: Normal düzey\n13 ve üzeri puan: Depresyon riski (Sevk gerektirir)';
        break;
      case 'beckSuicide':
        testInfo = 'Beck İntihar Düşüncesi Ölçeği, intihar riskini değerlendiren 19 maddelik bir ölçektir.\nHer madde 0-2 arası puanlanır.\nToplam puan 0-38 arasında değişir.\n\nPuanlama:\n0-5 puan: Düşük risk\n6-19 puan: Orta risk\n20-38 puan: Yüksek risk - Acil müdahale gerekli';
        break;
      case 'childSocialAnxiety':
        testInfo = 'Çocuklar İçin Sosyal Anksiyete Ölçeği (Yenilenmiş Biçim), çocuklarda sosyal anksiyete düzeyini ölçmek için kullanılır.\nHer madde 0-4 arası puanlanır.\nToplam puan 0-100 arasında değişir.\n\nPuanlama:\n0-24 puan: Minimal düzeyde sosyal anksiyete\n25-49 puan: Hafif düzeyde sosyal anksiyete\n50-74 puan: Orta düzeyde sosyal anksiyete\n75-100 puan: Şiddetli düzeyde sosyal anksiyete';
        break;
      case 'ytt40':
        testInfo = 'YTT-40, yeme tutumlarını ve davranışlarını değerlendirmek için kullanılan 40 maddelik bir ölçektir.\nHer madde 1-6 arası puanlanır.\nToplam puan 0-120 arasında değişir.\nKesme puanı 30 olarak belirlenmiştir.\n\nPuanlama:\n0-21 puan: Normal yeme tutumu\n22-29 puan: Hafif düzeyde bozulmuş yeme tutumu\n30-39 puan: Orta düzeyde bozulmuş yeme tutumu\n40+ puan: Şiddetli düzeyde bozulmuş yeme tutumu';
        break;
      default:
        testInfo = test.description || 'Bu test, psikolojik değerlendirme amacıyla kullanılan standardize bir ölçektir.';
    }
    
    const infoLines = pdf.splitTextToSize(turkishToAscii(testInfo), pageWidth - (margin.left + margin.right) - 180);
    contentY += 20;
    pdf.text(infoLines, margin.left + 20, contentY);

    return y + 240;
  };
  
  // Modern header tasarımı
  const drawModernHeader = () => {
    // Ana başlık alanı
    pdf.setFillColor(colors.primary.r, colors.primary.g, colors.primary.b);
    pdf.rect(0, 0, pageWidth, 120, 'F');

    // Dekoratif şeritler
    pdf.setFillColor(colors.secondary.r, colors.secondary.g, colors.secondary.b);
    pdf.rect(pageWidth - 100, 0, 20, 120, 'F');
    pdf.rect(pageWidth - 60, 0, 10, 120, 'F');

    // Test adı
    pdf.setFont("times", "bold");
    pdf.setFontSize(24);
  pdf.setTextColor(255, 255, 255);
    pdf.text(turkishToAscii(test.name), margin.left, 60);

    // Tarih ve ID
    pdf.setFontSize(12);
    pdf.setFont("times", "normal");
    const date = turkishToAscii(new Date(result.created_at).toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }));
    pdf.text(date, margin.left, 85);
    pdf.text(`Rapor No: ${result.id.slice(0, 8).toUpperCase()}`, margin.left, 100);
  };
  
  // Header çiz
  drawModernHeader();
  
  // Test kriterlerini çiz
  let y = drawTestCriteria();
  
  // Bilgi kartı
  const drawInfoCard = () => {
    // Kart arka planı
    pdf.setFillColor(colors.light.r, colors.light.g, colors.light.b);
    pdf.roundedRect(margin.left, y, pageWidth - (margin.left + margin.right), 160, 4, 4, 'F');
    
    // Danışan bilgileri
    const drawInfoSection = (title: string, value: string, x: number, baseY: number) => {
      pdf.setFont("times", "normal");
      pdf.setFontSize(10);
      pdf.setTextColor(100, 100, 100);
      pdf.text(turkishToAscii(title), x, baseY);

      pdf.setFont("times", "bold");
  pdf.setFontSize(12);
      pdf.setTextColor(colors.text.r, colors.text.g, colors.text.b);
      pdf.text(turkishToAscii(value), x, baseY + 20);
    };

    // İki kolonlu bilgi bölümleri
    const col1X = margin.left + 20;
    const col2X = margin.left + (pageWidth - (margin.left + margin.right)) / 2 + 20;
    
    // Sol kolon
    drawInfoSection('Danışan', client.full_name, col1X, y + 30);
    drawInfoSection('Uzman', `${professional.full_name}${professional.title ? `, ${professional.title}` : ''}`, col1X, y + 90);
    
    // Sağ kolon
    drawInfoSection('Test Tarihi', new Date(result.created_at).toLocaleDateString('tr-TR'), col2X, y + 30);
    drawInfoSection('Kurum', client.professional?.clinic_name || '-', col2X, y + 90);
  };
  
  drawInfoCard();
  y += 160;
  
  // Modern footer ekle
  const addModernFooter = () => {
    const footerY = pageHeight - 30;
    
    pdf.setDrawColor(colors.primary.r, colors.primary.g, colors.primary.b);
    pdf.setLineWidth(0.5);
    pdf.line(margin.left, footerY - 10, pageWidth - margin.right, footerY - 10);
    
    pdf.setFont("times", "normal");
    pdf.setFontSize(8);
    pdf.setTextColor(colors.text.r, colors.text.g, colors.text.b);
    pdf.text(turkishToAscii('Bu rapor otomatik olarak oluşturulmuştur. Klinik değerlendirme için uzman görüşü gereklidir.'), 
             pageWidth / 2, footerY, { align: 'center' });
  };
  
  // Sayfa başlığı çizme fonksiyonu
  const drawHeader = (title: string) => {
    // Başlık
    pdf.setFont("times", "bold");
    pdf.setFontSize(24);
    pdf.setTextColor(colors.primary.r, colors.primary.g, colors.primary.b);
    pdf.text(turkishToAscii(title), margin.left, margin.top + 25);
    
    // Alt çizgi
    pdf.setDrawColor(colors.primary.r, colors.primary.g, colors.primary.b);
    pdf.setLineWidth(1);
    pdf.line(margin.left, margin.top + 35, pageWidth - margin.right, margin.top + 35);
  };
  
  addModernFooter();

  // Çizgi grafiği çizme fonksiyonu
  const drawLineChart = (x: number, y: number, width: number, height: number, labels: string[], data: number[] | any, title: string, maxValue: number = 0) => {
    // Veri kontrolü
    if (!Array.isArray(data)) {
      console.error('Data must be an array');
      return;
    }

    // Veriyi number[] tipine dönüştür
    const numericData = data.map(Number);
    
    // Grafik alanı
    pdf.setDrawColor(200, 200, 200);
    pdf.setLineWidth(0.5);
    pdf.rect(x, y, width, height);
    
    // X ekseni
    pdf.line(x, y + height - 30, x + width, y + height - 30);
      
    // Y ekseni
    pdf.line(x + 50, y, x + 50, y + height);
    
    // Maksimum değer belirlenmemişse, veri içinden bul
    if (maxValue === 0) {
      maxValue = Math.max(...numericData) * 1.2; // %20 marj ekle
    }
      
    // Y ekseni değerleri
    pdf.setFont("times", "normal");
    pdf.setFontSize(8);
    pdf.setTextColor(100, 100, 100);
      
    const yStep = maxValue / 5;
    for (let i = 0; i <= 5; i++) {
      const value = i * yStep;
      const yPos = y + height - 30 - ((i * yStep / maxValue) * (height - 40));
      pdf.text(value.toFixed(1), x + 40, yPos);
      
      // Y ekseni çizgileri
      pdf.setDrawColor(240, 240, 240);
      pdf.setLineWidth(0.2);
      pdf.line(x + 50, yPos, x + width, yPos);
    }
    
    // X ekseni etiketleri
    const xStep = (width - 60) / (labels.length - 1);
    labels.forEach((label, index) => {
      const xPos = x + 50 + (index * xStep);
      
      // Etiket
      pdf.setTextColor(100, 100, 100);
      pdf.text(turkishToAscii(label), xPos, y + height - 10, { align: 'center', maxWidth: xStep });
    });
    
    // Veri noktaları ve çizgi
    let points: [number, number][] = [];
    numericData.forEach((value, index) => {
      const xPos = x + 50 + (index * xStep);
      const yPos = y + height - 30 - ((value / maxValue) * (height - 40));
      
      points.push([xPos, yPos]);
      
      // Nokta
      pdf.setFillColor(colors.primary.r, colors.primary.g, colors.primary.b);
      pdf.circle(xPos, yPos, 3, 'F');
    });
    
    // Çizgi
    pdf.setDrawColor(colors.primary.r, colors.primary.g, colors.primary.b);
    pdf.setLineWidth(1);
    
    for (let i = 1; i < points.length; i++) {
      pdf.line(points[i-1][0], points[i-1][1], points[i][0], points[i][1]);
    }
    
    // Başlık
    pdf.setFont("times", "bold");
    pdf.setFontSize(12);
    pdf.setTextColor(colors.text.r, colors.text.g, colors.text.b);
    pdf.text(turkishToAscii(title), x + (width / 2), y - 10, { align: 'center' });
  };

  // SCL-90-R için alt ölçek grafiği çiz
  const drawSCL90RSubscales = () => {
    pdf.addPage();
    drawHeader('Alt Ölçek Puanları');

    // Başlık
    pdf.setFont("times", "bold");
    pdf.setFontSize(16);
    pdf.setTextColor(colors.primary.r, colors.primary.g, colors.primary.b);
    pdf.text(turkishToAscii('SCL-90-R Alt Ölçek Puanları'), margin.left, 100);

    // Alt çizgi
      pdf.setDrawColor(colors.primary.r, colors.primary.g, colors.primary.b);
    pdf.setLineWidth(1);
    pdf.line(margin.left, 106, margin.left + 200, 106);

    // Grafik açıklaması
    pdf.setFont("times", "normal");
    pdf.setFontSize(11);
    pdf.setTextColor(colors.text.r, colors.text.g, colors.text.b);
    pdf.text(turkishToAscii('Aşağıdaki grafik, SCL-90-R testinin alt ölçeklerindeki puanları göstermektedir.'), margin.left, 120);
    pdf.text(turkishToAscii('Her bir alt ölçek için puan aralığı 0-4 arasındadır.'), margin.left, 135);

    // Grafik alanı
    const chartWidth = pageWidth - (margin.left + margin.right);
    const chartHeight = 300;
    const chartX = margin.left;
    const chartY = 150;

    // Grafik çizimi için gerekli veriler
    const reportData = test.generateReport ? test.generateReport(result.answers) as any : null;
    if (reportData && reportData.factorAverages) {
      const factorNames = [
        'Somatizasyon', 'Obsesif-Kompulsif', 'Kişilerarası Duyarlılık', 
        'Depresyon', 'Anksiyete', 'Öfke-Düşmanlık', 
        'Fobik Anksiyete', 'Paranoid Düşünce', 'Psikotizm', 'Ek Ölçek'
      ];
      
      // factorAverages'i diziye dönüştür ve number tipine zorla
      const factorScores = Object.values(reportData.factorAverages).map(value => Number(value));
      
      // Grafik çizimi
      drawLineChart(chartX, chartY, chartWidth, chartHeight, factorNames, factorScores, 'Alt Ölçek Puanları', 4);
      
      // Tablo başlıkları
      pdf.setFont("times", "bold");
      pdf.setFontSize(12);
      pdf.text(turkishToAscii('Alt Ölçek'), margin.left, chartY + chartHeight + 30);
      pdf.text(turkishToAscii('Puan'), margin.left + 200, chartY + chartHeight + 30);
      pdf.text(turkishToAscii('Değerlendirme'), margin.left + 300, chartY + chartHeight + 30);
      
      // Alt çizgi
      pdf.setDrawColor(200, 200, 200);
      pdf.setLineWidth(0.5);
      pdf.line(margin.left, chartY + chartHeight + 35, pageWidth - margin.right, chartY + chartHeight + 35);
      
      // Tablo içeriği
      pdf.setFont("times", "normal");
      factorNames.forEach((name, index) => {
        const score = Number(factorScores[index]);
        let evaluation = '';
        let evaluationColor = colors.success;
        
        if (score <= 1) {
          evaluation = 'Normal';
          evaluationColor = colors.success;
        } else if (score <= 2) {
          evaluation = 'Hafif';
          evaluationColor = colors.primary;
        } else if (score <= 3) {
          evaluation = 'Orta';
          evaluationColor = colors.warning;
        } else {
          evaluation = 'Yüksek';
          evaluationColor = colors.error;
        }
        
        const y = chartY + chartHeight + 50 + (index * 20);
        
        // Alt ölçek adı
        pdf.setTextColor(colors.text.r, colors.text.g, colors.text.b);
        pdf.text(turkishToAscii(name), margin.left, y);
        
        // Puan
        pdf.text(score.toFixed(2), margin.left + 200, y);
        
        // Değerlendirme
        pdf.setTextColor(evaluationColor.r, evaluationColor.g, evaluationColor.b);
        pdf.text(turkishToAscii(evaluation), margin.left + 300, y);
        
        // Alt çizgi
        pdf.setDrawColor(240, 240, 240);
        pdf.setLineWidth(0.2);
        pdf.line(margin.left, y + 5, pageWidth - margin.right, y + 5);
      });
    } else {
      pdf.text(turkishToAscii('Alt ölçek verileri bulunamadı.'), margin.left, chartY + 50);
    }
  };

  // Sütun grafiği çizme fonksiyonu
  const drawColumnChart = (x: number, y: number, width: number, height: number, chartData: any) => {
    const { labels, datasets } = chartData;
    
    // Grafik alanı
    pdf.setDrawColor(200, 200, 200);
    pdf.setLineWidth(0.5);
    pdf.rect(x, y, width, height);
    
    // X ekseni
    pdf.line(x, y + height - 30, x + width, y + height - 30);
    
    // Y ekseni
    pdf.line(x + 50, y, x + 50, y + height);
    
    // Maksimum değeri bul
    let maxValue = 0;
    datasets.forEach((dataset: any) => {
      const dataMax = Math.max(...dataset.data);
      if (dataMax > maxValue) maxValue = dataMax;
    });
    maxValue = Math.ceil(maxValue * 1.2); // %20 marj ekle
    
    // Y ekseni değerleri
    pdf.setFont("times", "normal");
    pdf.setFontSize(8);
    pdf.setTextColor(100, 100, 100);
        
    const yStep = Math.ceil(maxValue / 5);
    for (let i = 0; i <= 5; i++) {
      const value = i * yStep;
      const yPos = y + height - 30 - ((i * yStep / maxValue) * (height - 40));
      pdf.text(value.toString(), x + 40, yPos);
      
      // Y ekseni çizgileri
      pdf.setDrawColor(240, 240, 240);
      pdf.setLineWidth(0.2);
      pdf.line(x + 50, yPos, x + width, yPos);
    }
    
    // X ekseni etiketleri
    const barWidth = (width - 60) / labels.length;
    labels.forEach((label: string, index: number) => {
      const xPos = x + 50 + (index * barWidth) + (barWidth / 2);
      
      // Etiket
      pdf.setTextColor(100, 100, 100);
      pdf.text(turkishToAscii(label), xPos, y + height - 10, { align: 'center' });
    });
    
    // Veri setleri
    datasets.forEach((dataset: any, datasetIndex: number) => {
      const data = dataset.data;
      
      // Renk değerlerini güvenli bir şekilde al
      let colorR = 0, colorG = 0, colorB = 0;
      
      // backgroundColor bir string olabilir veya r, g, b özellikleri olan bir nesne olabilir
      if (dataset.backgroundColor) {
        if (typeof dataset.backgroundColor === 'string') {
          // Eğer renk bir string ise (örn. 'rgba(39, 124, 98, 0.7)'), varsayılan renkleri kullan
          if (datasetIndex === 0) {
            colorR = colors.success.r;
            colorG = colors.success.g;
            colorB = colors.success.b;
          } else if (datasetIndex === 1) {
            colorR = colors.error.r;
            colorG = colors.error.g;
            colorB = colors.error.b;
          } else {
            colorR = 150;
            colorG = 150;
            colorB = 150;
          }
        } else if (dataset.backgroundColor.r !== undefined && 
                  dataset.backgroundColor.g !== undefined && 
                  dataset.backgroundColor.b !== undefined) {
          // Eğer renk bir nesne ise ve r, g, b özellikleri varsa
          colorR = dataset.backgroundColor.r;
          colorG = dataset.backgroundColor.g;
          colorB = dataset.backgroundColor.b;
        }
      } else {
        // Renk tanımlanmamışsa, indekse göre varsayılan renkler kullan
        if (datasetIndex === 0) {
          colorR = colors.success.r;
          colorG = colors.success.g;
          colorB = colors.success.b;
        } else if (datasetIndex === 1) {
          colorR = colors.error.r;
          colorG = colors.error.g;
          colorB = colors.error.b;
        } else {
          colorR = 150;
          colorG = 150;
          colorB = 150;
        }
      }
      
      // Sütunları çiz
      data.forEach((value: number, index: number) => {
        const barHeight = (value / maxValue) * (height - 40);
        const xPos = x + 50 + (index * barWidth) + (datasetIndex * (barWidth / datasets.length)) + 5;
        const yPos = y + height - 30 - barHeight;
        const individualBarWidth = (barWidth / datasets.length) - 10;
        
        // Sütun
        pdf.setFillColor(colorR, colorG, colorB);
        pdf.rect(xPos, yPos, individualBarWidth, barHeight, 'F');
      });
    });
    
    // Lejant
    const legendY = y + height + 10;
    datasets.forEach((dataset: any, index: number) => {
      const legendX = x + 50 + (index * 120);
      
      // Renk değerlerini güvenli bir şekilde al
      let colorR = 0, colorG = 0, colorB = 0;
      
      // Renk değerlerini güvenli bir şekilde al (yukarıdaki ile aynı mantık)
      if (dataset.backgroundColor) {
        if (typeof dataset.backgroundColor === 'string') {
          if (index === 0) {
            colorR = colors.success.r;
            colorG = colors.success.g;
            colorB = colors.success.b;
          } else if (index === 1) {
            colorR = colors.error.r;
            colorG = colors.error.g;
            colorB = colors.error.b;
          } else {
            colorR = 150;
            colorG = 150;
            colorB = 150;
          }
        } else if (dataset.backgroundColor.r !== undefined && 
                  dataset.backgroundColor.g !== undefined && 
                  dataset.backgroundColor.b !== undefined) {
          colorR = dataset.backgroundColor.r;
          colorG = dataset.backgroundColor.g;
          colorB = dataset.backgroundColor.b;
        }
      } else {
        if (index === 0) {
          colorR = colors.success.r;
          colorG = colors.success.g;
          colorB = colors.success.b;
        } else if (index === 1) {
          colorR = colors.error.r;
          colorG = colors.error.g;
          colorB = colors.error.b;
        } else {
          colorR = 150;
          colorG = 150;
          colorB = 150;
        }
      }
      
      // Renk kutusu
      pdf.setFillColor(colorR, colorG, colorB);
      pdf.rect(legendX, legendY, 10, 10, 'F');
      
      // Etiket
      pdf.setTextColor(colors.text.r, colors.text.g, colors.text.b);
      pdf.setFont("times", "normal");
      pdf.setFontSize(10);
      pdf.text(turkishToAscii(dataset.label), legendX + 15, legendY + 8);
    });
  };
  
  // Pasta grafiği çizme fonksiyonu
  const drawPieChart = (x: number, y: number, size: number, pieData: any) => {
    const { data, colors } = pieData;
    
    // Veri kontrolü
    if (!Array.isArray(data)) {
      console.error('Pie chart data must be an array');
      return;
    }
    
    const centerX = x;
    const centerY = y + (size / 2);
    const radius = size / 2;
    
    let startAngle = 0;
    const total = data.reduce((sum: number, value: number) => sum + value, 0);
    
    // Toplam 0 ise grafik çizme
    if (total === 0) {
      return;
    }
    
    // Pasta dilimlerini çiz
    data.forEach((value: number, index: number) => {
      if (value === 0) return; // Değer 0 ise dilim çizme
      
      const angle = (value / total) * 360;
      const endAngle = startAngle + angle;
      
      // Pasta dilimi
      if (colors && colors[index] && typeof colors[index] === 'object') {
        pdf.setFillColor(colors[index].r, colors[index].g, colors[index].b);
      } else {
        // Varsayılan renk
        pdf.setFillColor(100, 100, 100);
      }
      
      // Pasta dilimini çiz
      drawPieSlice(centerX, centerY, radius, startAngle, endAngle);
      
      startAngle = endAngle;
    });
  };
  
  // Pasta dilimi çizme yardımcı fonksiyonu
  const drawPieSlice = (centerX: number, centerY: number, radius: number, startAngle: number, endAngle: number) => {
    // Açıları radyana çevir
    const startRad = (startAngle - 90) * Math.PI / 180;
    const endRad = (endAngle - 90) * Math.PI / 180;
    
    const startX = centerX + radius * Math.cos(startRad);
    const startY = centerY + radius * Math.sin(startRad);
    const endX = centerX + radius * Math.cos(endRad);
    const endY = centerY + radius * Math.sin(endRad);
    
    // Dilimi çiz
    pdf.setLineWidth(0.2);
    pdf.setDrawColor(255, 255, 255);
    
    // Başlangıç noktasına git
    pdf.lines([[radius * Math.cos(startRad), radius * Math.sin(startRad)]], centerX, centerY);
    
    // Yay çiz (yaklaşık olarak çokgen ile)
    const segments = Math.ceil((endAngle - startAngle) / 5); // Her 5 derece için bir segment
    let currentAngle = startRad;
    const angleStep = (endRad - startRad) / segments;
    
    for (let i = 0; i < segments; i++) {
      currentAngle += angleStep;
      pdf.lines([[radius * Math.cos(currentAngle) - radius * Math.cos(currentAngle - angleStep), 
                 radius * Math.sin(currentAngle) - radius * Math.sin(currentAngle - angleStep)]], 
                centerX + radius * Math.cos(currentAngle - angleStep), 
                centerY + radius * Math.sin(currentAngle - angleStep));
    }
    
    // Merkeze geri dön
    pdf.lines([[-radius * Math.cos(endRad), -radius * Math.sin(endRad)]], endX, endY);
    
    // Dilimi doldur (jsPDF'de fill() yerine alternatif bir çözüm kullanıyoruz)
    pdf.internal.write('f');
  };
  
  // SCID-5-SPQ için modül grafiği çiz
  const drawSCID5SPQModules = () => {
    const reportData = test.generateReport?.(result.answers);
    if (!reportData) return;

    // Sadece seçilen modülleri al
    const solvedModules = reportData.solvedModules || [];
    
    const moduleInfo = Object.entries(reportData.factorScores || {})
      .filter(([key]) => solvedModules.includes(key))
      .map(([key, value]) => ({
        name: scid5SpqCriteria.personalityDisorders[key as keyof typeof scid5SpqCriteria.personalityDisorders]?.name || key,
        score: value,
        key: key
      }));

    if (moduleInfo.length > 0) {
      pdf.addPage();
      // Başlık
      drawHeader('Modül Değerlendirmesi');
      
      pdf.setFont("times", "bold");
      pdf.setFontSize(16);
      pdf.setTextColor(colors.primary.r, colors.primary.g, colors.primary.b);
      pdf.text(turkishToAscii('SCID-5-SPQ Modül Değerlendirmesi'), margin.left, 100);

      // Alt çizgi
      pdf.setDrawColor(colors.primary.r, colors.primary.g, colors.primary.b);
      pdf.setLineWidth(1);
      pdf.line(margin.left, 106, margin.left + 300, 106);

      // Açıklama metni
      pdf.setFont("times", "normal");
      pdf.setFontSize(11);
      pdf.setTextColor(colors.text.r, colors.text.g, colors.text.b);
      pdf.text(turkishToAscii('Aşağıdaki grafik, her bir kişilik bozukluğu modülü için cevap dağılımını göstermektedir.'), margin.left, 120);

      // Yatay sütun grafiği için veri hazırla
      const chartData = {
        labels: moduleInfo.map(m => m.name),
        datasets: [
          {
            label: 'Evet',
            data: moduleInfo.map(m => reportData.factorScores?.[m.key] || 0),
            backgroundColor: colors.success
          },
          {
            label: 'Hayır',
            data: moduleInfo.map(m => {
              // factorNoScores özelliği yoksa hesapla
              if (reportData.factorNoScores) {
                return reportData.factorNoScores[m.key];
              } else {
                // Modüle ait soruları bul
                const moduleQuestions = test.questions.filter(q => {
                  const questionNumber = parseInt(q.id.substring(3));
                  const moduleRange = getModuleRange(m.key);
                  return questionNumber >= moduleRange.start && questionNumber <= moduleRange.end;
                });
                
                // "Hayır" cevaplarını say
                return moduleQuestions.filter(q => result.answers[q.id] === 0).length;
              }
            }),
            backgroundColor: colors.error
          },
          {
            label: 'Bilmiyorum',
            data: moduleInfo.map(m => {
              // factorUnknownCounts özelliği yoksa hesapla
              if (reportData.factorUnknownCounts) {
                return reportData.factorUnknownCounts[m.key];
              } else {
                // Modüle ait soruları bul
                const moduleQuestions = test.questions.filter(q => {
                  const questionNumber = parseInt(q.id.substring(3));
                  const moduleRange = getModuleRange(m.key);
                  return questionNumber >= moduleRange.start && questionNumber <= moduleRange.end;
                });
                
                // "Bilmiyorum" cevaplarını say
                return moduleQuestions.filter(q => result.answers[q.id] === 2 || result.answers[q.id] === undefined).length;
              }
            }),
            backgroundColor: colors.warning
          }
        ]
      };

      // Yatay sütun grafiği çiz - daha büyük boyutta
      drawHorizontalBarChart(margin.left, 140, pageWidth - margin.left - margin.right, 500, chartData);

      // Footer ekle
      addModernFooter();

      // Pasta grafikleri için yeni sayfa
      if (reportData.pieChartData && reportData.pieChartData.length > 0) {
        const filteredPieChartData = reportData.pieChartData.filter((_, index) => 
          index < moduleInfo.length && solvedModules.includes(moduleInfo[index].key)
        );
        
        if (filteredPieChartData.length > 0) {
          drawSCID5SPQPieCharts(filteredPieChartData, moduleInfo);
        }
      }

      // Soru ve cevapları tablo şeklinde listele - sadece seçilen modüller için
      drawSCID5SPQQuestionTable(reportData, moduleInfo);
    }
  };

  // SCID-5-SPQ için pasta grafikleri çiz
  const drawSCID5SPQPieCharts = (pieChartData: any[], moduleInfo: any[]) => {
    pdf.addPage();
    drawHeader('Modül Detayları - Pasta Grafikleri');

    // Başlık
    pdf.setFont("times", "bold");
    pdf.setFontSize(16);
    pdf.setTextColor(colors.primary.r, colors.primary.g, colors.primary.b);
    pdf.text(turkishToAscii('SCID-5-SPQ Cevap Dağılımları'), margin.left, 100);

    // Alt çizgi
    pdf.setDrawColor(colors.primary.r, colors.primary.g, colors.primary.b);
    pdf.setLineWidth(1);
    pdf.line(margin.left, 106, margin.left + 200, 106);
      
    // Grafik açıklaması
    pdf.setFont("times", "normal");
    pdf.setFontSize(11);
    pdf.setTextColor(colors.text.r, colors.text.g, colors.text.b);
    pdf.text(turkishToAscii('Aşağıdaki grafikler, her bir modül için "Evet", "Hayır" ve "Bilmiyorum" cevaplarının dağılımını göstermektedir.'), margin.left, 120);

    // Pasta grafikleri için değişkenler
    const pieSize = 140;
    const piesPerRow = 2;
    const pieMarginX = 60;
    const pieMarginY = 80;
    
    let currentRow = 0;
    pieChartData.forEach((chartData, index) => {
      if (index >= moduleInfo.length) return; // Modül bilgisi yoksa atla
      
      const col = index % piesPerRow;
      
      // Yeni sayfa kontrolü
      if (currentRow > 1 && col === 0) {
        pdf.addPage();
        drawHeader('Modül Detayları - Pasta Grafikleri (Devam)');
        // Footer ekle
        addModernFooter();
        currentRow = 0;
      }
      
      const centerX = margin.left + (col * (pieSize + pieMarginX)) + (pieSize / 2) + 80;
      const centerY = 160 + (currentRow * (pieSize + pieMarginY));
      
      // Modül başlığı
      pdf.setFont("times", "bold");
      pdf.setFontSize(12);
      pdf.setTextColor(colors.primary.r, colors.primary.g, colors.primary.b);
      const title = moduleInfo[index].name;
      const titleWidth = pdf.getStringUnitWidth(turkishToAscii(title)) * 12;
      pdf.text(turkishToAscii(title), centerX - (titleWidth / 2), centerY - 10);
      
      // Pasta grafiği verilerini hazırla
      const yesCount = moduleInfo[index].score || 0;
      const noCount = chartData.noCount || 0;
      const unknownCount = chartData.unknownCount || 0;
      const totalCount = yesCount + noCount + unknownCount;
      
      const pieData = {
        data: [yesCount, noCount, unknownCount],
        colors: [
          colors.success,
          colors.error,
          colors.warning
        ]
      };

      // Pasta grafiğini çiz
      drawPieChart(centerX, centerY, pieSize / 2, pieData);
      
      // Lejant
      const legendY = centerY + (pieSize / 2) + 10;
      
      // Sayısal değerleri göster
      pdf.setFont("times", "normal");
      pdf.setFontSize(10);
      pdf.setTextColor(colors.text.r, colors.text.g, colors.text.b);
      
      if (totalCount > 0) {
        const yesPercent = Math.round((yesCount / totalCount) * 100);
        const noPercent = Math.round((noCount / totalCount) * 100);
        const unknownPercent = Math.round((unknownCount / totalCount) * 100);
        
        pdf.text(`Evet: ${yesCount} (${yesPercent}%)`, centerX - 60, legendY + 15);
        pdf.text(`Hayır: ${noCount} (${noPercent}%)`, centerX - 60, legendY + 30);
        pdf.text(`Bilmiyorum: ${unknownCount} (${unknownPercent}%)`, centerX - 60, legendY + 45);
      }
      
      // Renk kutuları
      pdf.setFillColor(colors.success.r, colors.success.g, colors.success.b);
      pdf.rect(centerX - 75, legendY + 8, 10, 10, 'F');
      
      pdf.setFillColor(colors.error.r, colors.error.g, colors.error.b);
      pdf.rect(centerX - 75, legendY + 23, 10, 10, 'F');
      
      pdf.setFillColor(colors.warning.r, colors.warning.g, colors.warning.b);
      pdf.rect(centerX - 75, legendY + 38, 10, 10, 'F');
      
      // Sonraki satıra geç
      if (col === piesPerRow - 1) {
        currentRow++;
      }
    });
    
    // Footer ekle
    addModernFooter();
  };

  // SCID-5-SPQ için soru ve cevapları tablo şeklinde listele
  const drawSCID5SPQQuestionTable = (reportData: any, moduleInfo: any[]) => {
    // Her modül için soru ve cevapları listele
    moduleInfo.forEach((module, moduleIndex) => {
      pdf.addPage();
      drawHeader(`${module.name} - Sorular ve Cevaplar`);
      
      // Modül başlığı
      pdf.setFont("times", "bold");
      pdf.setFontSize(14);
      pdf.setTextColor(colors.primary.r, colors.primary.g, colors.primary.b);
      pdf.text(turkishToAscii(module.name), margin.left, 100);

      // Alt çizgi
      pdf.setDrawColor(colors.primary.r, colors.primary.g, colors.primary.b);
      pdf.setLineWidth(1);
      pdf.line(margin.left, 106, margin.left + 300, 106);

      // Açıklama metni
      pdf.setFont("times", "normal");
      pdf.setFontSize(11);
      pdf.setTextColor(colors.text.r, colors.text.g, colors.text.b);
      pdf.text(turkishToAscii('Aşağıda bu modül için verilen cevaplar listelenmiştir.'), margin.left, 120);

      // Tablo başlıkları
      const tableStartY = 140;
      const colWidths = [60, pageWidth - margin.left - margin.right - 160, 100];
      
      pdf.setFont("times", "bold");
      pdf.setFontSize(12);
      pdf.setTextColor(colors.text.r, colors.text.g, colors.text.b);
      
      pdf.text(turkishToAscii('Soru No'), margin.left, tableStartY);
      pdf.text(turkishToAscii('Soru Metni'), margin.left + colWidths[0], tableStartY);
      pdf.text(turkishToAscii('Cevap'), margin.left + colWidths[0] + colWidths[1], tableStartY);
      
      // Alt çizgi
      pdf.setDrawColor(200, 200, 200);
      pdf.setLineWidth(0.5);
      pdf.line(margin.left, tableStartY + 5, pageWidth - margin.right, tableStartY + 5);
      
      // Modüle ait soruları bul
      const moduleQuestions = test.questions.filter(q => {
        const questionNumber = parseInt(q.id.substring(3));
        const moduleRange = getModuleRange(module.key);
        return questionNumber >= moduleRange.start && questionNumber <= moduleRange.end;
      });
      
      // Soru ve cevapları listele
      pdf.setFont("times", "normal");
      pdf.setFontSize(10);
      
      let currentY = tableStartY + 20;
      
      moduleQuestions.forEach((question, index) => {
        const answer = result.answers[question.id];
        const answerText = answer === 1 ? 'Evet' : answer === 0 ? 'Hayır' : 'Bilmiyorum';
        const answerColor = answer === 1 ? colors.success : answer === 0 ? colors.error : colors.warning;
        
        // Yeni sayfa kontrolü
        if (currentY > pageHeight - margin.bottom - 20) {
          pdf.addPage();
          drawHeader(`${module.name} - Sorular ve Cevaplar (Devam)`);
          currentY = margin.top + 50;
          
          // Tablo başlıkları
          pdf.setFont("times", "bold");
          pdf.setFontSize(12);
          pdf.setTextColor(colors.text.r, colors.text.g, colors.text.b);
          
          pdf.text(turkishToAscii('Soru No'), margin.left, currentY);
          pdf.text(turkishToAscii('Soru Metni'), margin.left + colWidths[0], currentY);
          pdf.text(turkishToAscii('Cevap'), margin.left + colWidths[0] + colWidths[1], currentY);
          
          // Alt çizgi
          pdf.setDrawColor(200, 200, 200);
          pdf.setLineWidth(0.5);
          pdf.line(margin.left, currentY + 5, pageWidth - margin.right, currentY + 5);
          
          currentY += 20;
          
          // Footer ekle
          addModernFooter();
        }
        
        // Soru numarası
        pdf.setTextColor(colors.text.r, colors.text.g, colors.text.b);
        pdf.text(question.id, margin.left, currentY);
        
        // Soru metni
        const questionText = question.text || '';
        const lines = pdf.splitTextToSize(turkishToAscii(questionText), colWidths[1] - 10);
        pdf.text(lines, margin.left + colWidths[0], currentY);
        
        // Cevap
        pdf.setTextColor(answerColor.r, answerColor.g, answerColor.b);
        pdf.text(turkishToAscii(answerText), margin.left + colWidths[0] + colWidths[1], currentY);
        
        // Satır yüksekliğini hesapla
        const lineHeight = Math.max(lines.length * 12, 20);
        
        // Alt çizgi
        pdf.setDrawColor(240, 240, 240);
        pdf.setLineWidth(0.2);
        pdf.setTextColor(colors.text.r, colors.text.g, colors.text.b);
        pdf.line(margin.left, currentY + 5, pageWidth - margin.right, currentY + 5);
        
        currentY += lineHeight;
      });
      
      // Footer ekle
      addModernFooter();
    });
  };

  // Yatay sütun grafiği çizme fonksiyonu
  const drawHorizontalBarChart = (x: number, y: number, width: number, height: number, chartData: any) => {
    const { labels, datasets } = chartData;
    
    // Grafik alanı
    pdf.setDrawColor(200, 200, 200);
    pdf.setLineWidth(0.5);
    pdf.rect(x, y, width, height);
    
    // Y ekseni (yatay çizgiler)
    pdf.line(x + 150, y, x + 150, y + height);
    
    // X ekseni (dikey çizgiler)
    pdf.line(x + 150, y + height - 30, x + width, y + height - 30);
    
    // Maksimum değeri bul
    let maxValue = 0;
    datasets.forEach((dataset: any) => {
      const dataMax = Math.max(...dataset.data);
      if (dataMax > maxValue) maxValue = dataMax;
    });
    maxValue = Math.ceil(maxValue * 1.2); // %20 marj ekle
    
    // X ekseni değerleri
    pdf.setFont("times", "normal");
    pdf.setFontSize(8);
    pdf.setTextColor(100, 100, 100);
    
    const xStep = Math.ceil(maxValue / 5);
    for (let i = 0; i <= 5; i++) {
      const value = i * xStep;
      const xPos = x + 150 + ((i * xStep / maxValue) * (width - 180));
      pdf.text(value.toString(), xPos, y + height - 20);
      
      // X ekseni çizgileri
      pdf.setDrawColor(240, 240, 240);
      pdf.setLineWidth(0.2);
      pdf.line(xPos, y, xPos, y + height - 30);
    }
    
    // Y ekseni etiketleri (modül isimleri)
    const barHeight = (height - 40) / labels.length;
    labels.forEach((label: string, index: number) => {
      const yPos = y + 20 + (index * barHeight);
      
      // Etiket
      pdf.setTextColor(100, 100, 100);
      const lines = pdf.splitTextToSize(turkishToAscii(label), 140);
      pdf.text(lines, x + 5, yPos + (barHeight / 2));
    });
    
    // Veri setleri
    datasets.forEach((dataset: any, datasetIndex: number) => {
      const data = dataset.data;
      
      // Renk değerlerini güvenli bir şekilde al
      let colorR = 0, colorG = 0, colorB = 0;
      
      if (dataset.backgroundColor) {
        if (typeof dataset.backgroundColor === 'object') {
          colorR = dataset.backgroundColor.r;
          colorG = dataset.backgroundColor.g;
          colorB = dataset.backgroundColor.b;
        }
      }
      
      // Çubukları çiz
      data.forEach((value: number, index: number) => {
        const barWidth = (value / maxValue) * (width - 180);
        const xPos = x + 150;
        const yPos = y + 15 + (index * barHeight) + (datasetIndex * (barHeight / datasets.length / 1.2));
        const individualBarHeight = (barHeight / datasets.length / 1.2);
        
        // Çubuk
        pdf.setFillColor(colorR, colorG, colorB);
        pdf.rect(xPos, yPos, barWidth, individualBarHeight, 'F');
        
        // Değer etiketi
        pdf.setTextColor(colors.text.r, colors.text.g, colors.text.b);
        pdf.text(value.toString(), xPos + barWidth + 5, yPos + (individualBarHeight / 2) + 3);
      });
    });
    
    // Lejant
    const legendY = y + height + 10;
    datasets.forEach((dataset: any, index: number) => {
      const legendX = x + 150 + (index * 120);
      
      let colorR = 0, colorG = 0, colorB = 0;
      if (dataset.backgroundColor && typeof dataset.backgroundColor === 'object') {
        colorR = dataset.backgroundColor.r;
        colorG = dataset.backgroundColor.g;
        colorB = dataset.backgroundColor.b;
      }
      
      // Renk kutusu
      pdf.setFillColor(colorR, colorG, colorB);
      pdf.rect(legendX, legendY, 10, 10, 'F');
      
      // Etiket
      pdf.setTextColor(colors.text.r, colors.text.g, colors.text.b);
      pdf.text(turkishToAscii(dataset.label), legendX + 15, legendY + 8);
    });
  };

  // Modül aralıklarını belirle
  const getModuleRange = (moduleKey: string) => {
    const ranges: Record<string, { start: number; end: number }> = {
      paranoid: { start: 1, end: 15 },
      schizoid: { start: 16, end: 28 },
      schizotypal: { start: 29, end: 44 },
      antisocial: { start: 45, end: 59 },
      borderline: { start: 60, end: 76 },
      histrionic: { start: 77, end: 91 },
      narcissistic: { start: 92, end: 106 },
      avoidant: { start: 107, end: 120 },
      dependent: { start: 121, end: 135 },
      obsessiveCompulsive: { start: 136, end: 150 }
    };
    return ranges[moduleKey] || { start: 0, end: 0 };
  };

  // Test türüne göre PDF oluştur
  switch (test.id) {
    case 'scl90r':
      // SCL-90-R için alt ölçek grafiği ekle
      drawSCL90RSubscales();
      break;
    case 'scid-5-spq':
      // SCID-5-SPQ için modül grafiği ekle
      drawSCID5SPQModules();
      break;
  }

  return pdf;
} 