import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Test, Question } from '../data/tests/types';

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

      default:
        scoreLevel = 'Değerlendirme';
        scoreColor = colors.primary;
    }

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

    let contentY = y + 50;

    // Puanlama kriterleri
    pdf.setFont("times", "bold");
    pdf.setFontSize(12);
    pdf.setTextColor(colors.text.r, colors.text.g, colors.text.b);
    pdf.text(turkishToAscii('Puanlama Kriterleri:'), margin.left + 20, contentY);
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
    pdf.text(turkishToAscii('Test Bilgisi:'), margin.left + 20, contentY);

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
  
  // SCL-90-R için özel rapor
  if (test.id === 'scl90r' && test.generateReport) {
    const report = test.generateReport(result.answers);
    const reportData = report as any;
    
    // Yeni sayfa - Detaylı analiz
    pdf.addPage();
    drawModernHeader();
    y = 160;
    
    // Analiz kartı
    pdf.setFillColor(colors.light.r, colors.light.g, colors.light.b);
    pdf.roundedRect(margin.left, y, pageWidth - (margin.left + margin.right), pageHeight - y - 80, 4, 4, 'F');
    
    // Başlık
    pdf.setFont("times", "bold");
    pdf.setFontSize(16);
    pdf.setTextColor(colors.primary.r, colors.primary.g, colors.primary.b);
    pdf.text(turkishToAscii('Alt Ölçek Analizi'), margin.left + 20, y + 30);
    
    // Alt çizgi
    pdf.setDrawColor(colors.primary.r, colors.primary.g, colors.primary.b);
    pdf.setLineWidth(1);
    pdf.line(margin.left + 20, y + 36, margin.left + 160, y + 36);
    
    y += 60;
    
    // Çizgi grafiği çiz
    const chartWidth = pageWidth - (margin.left + margin.right) - 40;
    const chartHeight = 220;
    const chartX = margin.left + 20;
    const chartY = y;
    
    // Grafik alanı
    pdf.setFillColor(255, 255, 255);
    pdf.setDrawColor(200, 200, 200);
    pdf.rect(chartX, chartY, chartWidth, chartHeight, 'FD');
    
    // Veri noktaları ve çizgiler
    const data = reportData.chartData?.datasets?.[0]?.data || [];
    const labels = reportData.chartData?.labels || [];
    
    if (data.length > 0 && labels.length > 0) {
      // X ve Y eksenleri
      pdf.setDrawColor(100, 100, 100);
      pdf.setLineWidth(0.5);
      
      // Y ekseni
      pdf.line(chartX, chartY, chartX, chartY + chartHeight);
      
      // X ekseni
      pdf.line(chartX, chartY + chartHeight, chartX + chartWidth, chartY + chartHeight);
      
      // Y ekseni değerleri
      pdf.setFont("times", "normal");
      pdf.setFontSize(8);
      pdf.setTextColor(100, 100, 100);
      
      const maxValue = Math.max(...data, 4); // En az 4'e kadar göster
      const yStep = chartHeight / maxValue;
      
      for (let i = 0; i <= maxValue; i++) {
        if (i % 1 === 0) { // Tam sayıları göster
          const yPos = chartY + chartHeight - (i * yStep);
          pdf.line(chartX - 2, yPos, chartX, yPos); // Çentik
          pdf.text(i.toString(), chartX - 10, yPos + 3, { align: 'right' });
        }
      }
      
      // Kritik seviye çizgileri
      pdf.setDrawColor(colors.error.r, colors.error.g, colors.error.b);
      pdf.setLineWidth(0.3);
      // Kesikli çizgi için alternatif yöntem
      const criticalY = chartY + chartHeight - (3 * yStep);
      
      // Kesikli çizgi çizme (manuel)
      const dashLength = 3;
      const gapLength = 2;
      let currentX = chartX;
      while (currentX < chartX + chartWidth) {
        pdf.line(currentX, criticalY, currentX + dashLength, criticalY);
        currentX += dashLength + gapLength;
      }
      
      pdf.setDrawColor(colors.warning.r, colors.warning.g, colors.warning.b);
      const warningY = chartY + chartHeight - (2 * yStep);
      
      // Kesikli çizgi çizme (manuel)
      currentX = chartX;
      while (currentX < chartX + chartWidth) {
        pdf.line(currentX, warningY, currentX + dashLength, warningY);
        currentX += dashLength + gapLength;
      }
      
      pdf.setDrawColor(colors.primary.r, colors.primary.g, colors.primary.b);
      const normalY = chartY + chartHeight - (1 * yStep);
      
      // Kesikli çizgi çizme (manuel)
      currentX = chartX;
      while (currentX < chartX + chartWidth) {
        pdf.line(currentX, normalY, currentX + dashLength, normalY);
        currentX += dashLength + gapLength;
      }
      
      // Çizgi stilini sıfırla
      pdf.setLineWidth(0.5);
      
      // X ekseni değerleri ve veri noktaları
      const xStep = chartWidth / (data.length + 1);
      let points: Array<{x: number, y: number}> = [];
      
      data.forEach((value: number, index: number) => {
        const xPos = chartX + ((index + 1) * xStep);
        const yPos = chartY + chartHeight - (value * yStep);
        
        // Veri noktası
        points.push({x: xPos, y: yPos});
        
        // X ekseni etiketi
        pdf.setFont("times", "normal");
        pdf.setFontSize(8);
    pdf.setTextColor(100, 100, 100);
        
        // Etiketleri açılı göster
        pdf.text(turkishToAscii(labels[index] || ''), xPos, chartY + chartHeight + 15, { angle: 45, align: 'center' });
        
        // Dikey çizgi
      pdf.setDrawColor(220, 220, 220);
      pdf.setLineWidth(0.2);
        pdf.line(xPos, chartY, xPos, chartY + chartHeight);
      });
      
      // Çizgi çiz
      pdf.setDrawColor(colors.primary.r, colors.primary.g, colors.primary.b);
      pdf.setLineWidth(1.5);
      
      for (let i = 0; i < points.length - 1; i++) {
        pdf.line(points[i].x, points[i].y, points[i+1].x, points[i+1].y);
      }
      
      // Veri noktalarını çiz
      points.forEach((point, index) => {
        const value = data[index];
        let pointColor = colors.success;
        
        if (value > 3) {
          pointColor = colors.error;
        } else if (value > 2) {
          pointColor = colors.warning;
        } else if (value > 1) {
          pointColor = colors.primary;
        }
        
        pdf.setFillColor(pointColor.r, pointColor.g, pointColor.b);
        pdf.circle(point.x, point.y, 3, 'F');
        
        // Değeri göster
        pdf.setFont("times", "bold");
        pdf.setFontSize(8);
        pdf.setTextColor(50, 50, 50);
        pdf.text(value.toFixed(2), point.x, point.y - 8, { align: 'center' });
      });
    }
    
    y += chartHeight + 60;
    
    // Alt ölçek değerlendirmeleri - 2 sütunlu layout
    const itemsPerColumn = Math.ceil(reportData.chartData?.datasets?.[0]?.data.length / 2);
    const columnWidth = (pageWidth - (margin.left + margin.right) - 60) / 2;
    let currentColumn = 0;
    let originalY = y;
    
    reportData.chartData?.datasets?.[0]?.data.forEach((value: number, index: number) => {
      const label = reportData.chartData.labels[index];
      if (!label) return;
      
      // Sütun değişimi kontrolü
      if (index === itemsPerColumn) {
        y = originalY;
        currentColumn = 1;
      }
      
      const xOffset = currentColumn * (columnWidth + 30);
      
      // Değerlendirme kutusu
      const boxColor = value <= 1.5 ? colors.success : value <= 2.5 ? colors.warning : colors.error;
      pdf.setFillColor(boxColor.r, boxColor.g, boxColor.b);
      pdf.roundedRect(margin.left + 20 + xOffset, y - 15, 50, 25, 3, 3, 'F');
      
      // Puan - sadece 2 ondalık basamak göster
      pdf.setFont("times", "bold");
      pdf.setTextColor(255, 255, 255);
      pdf.text(value.toFixed(2), margin.left + 45 + xOffset, y, { align: 'center' });
      
      // Alt ölçek adı
      pdf.setTextColor(colors.text.r, colors.text.g, colors.text.b);
      pdf.text(turkishToAscii(label), margin.left + 80 + xOffset, y);
      
      // Değerlendirme
      pdf.setFont("times", "normal");
      pdf.setFontSize(10);
      let description = '';
      if (value <= 1.5) {
        description = 'Normal düzey';
      } else if (value <= 2.5) {
        description = 'Yüksek düzey';
      } else {
        description = 'Çok yüksek düzey';
      }
      
      const descLines = pdf.splitTextToSize(description, columnWidth - 70);
      pdf.text(descLines, margin.left + 80 + xOffset, y + 15);
      
      y += 45;
    });
  }

  // Yeni sayfa - Cevaplar
  pdf.addPage();
  drawModernHeader();
  y = 160;

  // Cevaplar tablosu
  const tableData = Object.entries(result.answers).map(([questionId, answer]) => {
    const question = test.questions.find((q: Question) => q.id === questionId);
    const option = question?.options?.find((o: { value: number; text: string }) => o.value === Number(answer));
    return [
      turkishToAscii(question?.text || ''),
      turkishToAscii(option?.text || '')
    ];
  });

  // Modern tablo stili
  autoTable(pdf, {
    startY: y,
    head: [['Soru', 'Yanıt']].map(row => row.map(cell => turkishToAscii(cell))),
    body: tableData,
    theme: 'grid',
    headStyles: {
      fillColor: [colors.primary.r, colors.primary.g, colors.primary.b],
      textColor: [255, 255, 255],
      fontSize: 12,
      font: 'times',
      fontStyle: 'bold',
      halign: 'left',
      cellPadding: 12
    },
    bodyStyles: {
      fontSize: 10,
      font: 'times',
      fontStyle: 'normal',
      textColor: [colors.text.r, colors.text.g, colors.text.b],
      cellPadding: 10
    },
    alternateRowStyles: {
      fillColor: [colors.light.r, colors.light.g, colors.light.b]
    },
    margin: { 
      top: margin.top,
      right: margin.right,
      bottom: margin.bottom,
      left: margin.left
    },
    styles: {
      font: 'times',
      overflow: 'linebreak',
      cellWidth: 'auto',
      halign: 'left',
      valign: 'middle',
      fontSize: 10,
      cellPadding: 8,
      lineColor: [229, 231, 235],
      lineWidth: 0.1
    },
    columnStyles: {
      0: { cellWidth: 'auto' },
      1: { cellWidth: 'auto' }
    }
  });

  // Modern footer
  const addModernFooter = () => {
    const totalPages = pdf.internal.getNumberOfPages();
    
    for (let i = 1; i <= totalPages; i++) {
      pdf.setPage(i);
      
      // Footer alanı
      pdf.setFillColor(colors.light.r, colors.light.g, colors.light.b);
      pdf.rect(0, pageHeight - 40, pageWidth, 40, 'F');
      
      // Footer çizgisi
      pdf.setDrawColor(colors.primary.r, colors.primary.g, colors.primary.b);
      pdf.setLineWidth(0.5);
      pdf.line(margin.left, pageHeight - 40, pageWidth - margin.right, pageHeight - 40);
      
      // Footer metni
      pdf.setFont("times", "normal");
      pdf.setFontSize(9);
      pdf.setTextColor(colors.text.r, colors.text.g, colors.text.b);
      
      // Sol taraf - Kurum adı
      pdf.text(turkishToAscii(client.professional?.clinic_name || ''), margin.left, pageHeight - 15);
      
      // Orta - Test adı
      pdf.text(
        turkishToAscii(test.name),
        pageWidth / 2,
        pageHeight - 15,
        { align: 'center' }
      );
      
      // Sağ taraf - Sayfa numarası
      pdf.text(
        turkishToAscii(`Sayfa ${i} / ${totalPages}`),
        pageWidth - margin.right,
        pageHeight - 15,
        { align: 'right' }
      );
    }
  };
  
  addModernFooter();

  return pdf;
} 