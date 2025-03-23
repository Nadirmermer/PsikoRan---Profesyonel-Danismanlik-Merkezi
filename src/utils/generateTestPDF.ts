import jsPDF from 'jspdf';
import { Test } from '../data/tests/types';
import { setupFonts } from './fonts';
import { getLogoUrl } from './logoUtils';

// Temel arayüzler
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
  duration_seconds?: number;
  is_public_access?: boolean;
}

// Tema sabitleri
const THEME = {
  colors: {
    primary: { r: 42, g: 72, b: 108 },      // Koyu mavi - kurumsal ana renk
    secondary: { r: 80, g: 140, b: 200 },   // Açık mavi - vurgu rengi
    accent: { r: 230, g: 126, b: 34 },      // Turuncu - vurgu rengi
    text: { r: 51, g: 51, b: 51 },          // Koyu gri - ana metin
    textLight: { r: 120, g: 120, b: 120 },  // Açık gri - ikincil metin
    white: { r: 255, g: 255, b: 255 },      // Beyaz
    lightGray: { r: 245, g: 245, b: 245 }   // Açık gri arka plan
  },
  fonts: {
    heading: {
      family: "helvetica",
      style: "bold",
      sizes: { h1: 22, h2: 16, h3: 14 }
    },
    body: {
      family: "helvetica",
      style: "normal",
      sizes: { normal: 11, small: 9, large: 12 }
    }
  },
  spacing: {
    margin: {
      top: 50, right: 50, bottom: 50, left: 50
    },
    lineHeight: {
      small: 14,
      normal: 18,
      large: 22
    }
  },
  borderRadius: 3
};

// Yardımcı fonksiyonlar
function turkishToAscii(text: string): string {
    const replacements: { [key: string]: string } = {
      'ş': 's', 'Ş': 'S', 'ı': 'i', 'İ': 'I',
      'ğ': 'g', 'Ğ': 'G', 'ü': 'u', 'Ü': 'U',
      'ö': 'o', 'Ö': 'O', 'ç': 'c', 'Ç': 'C'
    };
  return (text || '').replace(/[şŞıİğĞüÜöÖçÇ]/g, match => replacements[match] || match);
}

function formatDuration(seconds?: number): string {
  if (!seconds) return '-';
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}

class TestPDFGenerator {
  private pdf: jsPDF;
  private pageWidth: number;
  private pageHeight: number;
  private marginLeft: number;
  private marginRight: number;
  private contentWidth: number;

  constructor(
    private test: Test,
    private result: TestResult,
    private client: Client,
    private professional: Professional
  ) {
  // PDF oluştur
    this.pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'pt',
    format: 'a4'
  });

    // Font ayarlarını yap
    setupFonts(this.pdf);

    this.pageWidth = this.pdf.internal.pageSize.width;
    this.pageHeight = this.pdf.internal.pageSize.height;
    this.marginLeft = THEME.spacing.margin.left;
    this.marginRight = THEME.spacing.margin.right;
    this.contentWidth = this.pageWidth - (this.marginLeft + this.marginRight);

    this.setFont();
  }

  generate(): jsPDF {
    this.drawHeader();
    this.drawTestInfo();
    this.drawResults();
    this.drawQuestionsAndAnswers();
    this.drawFooter();
    return this.pdf;
  }

  private setFont(type: 'heading' | 'body' = 'body', size: 'normal' | 'small' | 'large' | 'h1' | 'h2' | 'h3' = 'normal'): void {
    const font = THEME.fonts[type];
    const fontSize = font.sizes[size as keyof typeof font.sizes];
    this.pdf.setFont(font.family, font.style);
    this.pdf.setFontSize(fontSize);
  }

  private setColor(color: keyof typeof THEME.colors): void {
    const { r, g, b } = THEME.colors[color];
    this.pdf.setTextColor(r, g, b);
  }

  private drawRoundedRect(x: number, y: number, width: number, height: number, color: keyof typeof THEME.colors, radius = THEME.borderRadius): void {
    const { r, g, b } = THEME.colors[color];
    this.pdf.setFillColor(r, g, b);
    this.pdf.roundedRect(x, y, width, height, radius, radius, 'F');
  }

  private drawLogo(x: number, y: number, width: number, height: number): void {
    try {
      // Logo resmini doğrudan ekle
      const logoUrl = getLogoUrl();
      this.pdf.addImage(logoUrl, 'PNG', x, y, width, height);
    } catch (error) {
      console.error('Logo eklenirken hata oluştu:', error);
      
      // Hata durumunda yedek olarak metin logo göster
      this.pdf.setFillColor(THEME.colors.primary.r, THEME.colors.primary.g, THEME.colors.primary.b);
      this.pdf.roundedRect(x, y, width, height, 3, 3, 'F');
      this.pdf.setTextColor(255, 255, 255);
      this.pdf.setFont('helvetica', 'bold');
      this.pdf.setFontSize(36);
      this.pdf.text("P", x + width / 2, y + height / 2 + 12, { align: 'center' });
    }
    
    // Logo altına "PsikoRan" yazısı
    this.setColor('primary');
    this.setFont('heading', 'h2');
    this.pdf.text("PsikoRan", x + width / 2, y + height + 20, { align: 'center' });
  }

  private drawHeader(): void {
    const headerHeight = 120;
    
    // Ana header container - beyaz arka plan
    this.drawRoundedRect(0, 0, this.pageWidth, headerHeight, 'white');
    
    // Üst kısımda ince bir çizgi
    this.pdf.setFillColor(THEME.colors.primary.r, THEME.colors.primary.g, THEME.colors.primary.b);
    this.pdf.rect(0, 0, this.pageWidth, 5, 'F');
    
    // Logo çiz
    this.drawLogo(this.marginLeft, 15, 70, 70);
    
    // Danışan adı
    const clientNameX = this.marginLeft + 90;
    this.setColor('primary');
    this.setFont('heading', 'h1');
    const clientName = turkishToAscii(this.client.full_name);
    this.pdf.text(clientName, clientNameX, 40);
    
    // İnce ayırıcı çizgi
    this.pdf.setDrawColor(THEME.colors.lightGray.r, THEME.colors.lightGray.g, THEME.colors.lightGray.b);
    this.pdf.setLineWidth(1);
    this.pdf.line(clientNameX, 45, this.pageWidth - this.marginRight, 45);

    // Test adı
    this.setColor('text');
    this.setFont('body', 'large');
    const testInfo = turkishToAscii(`${this.test.name}`);
    this.pdf.text(testInfo, clientNameX, 65);
    
    // Uzman bilgisi
    this.setColor('textLight');
    this.setFont('body', 'normal');
    const professionalInfo = turkishToAscii(`Uzman: ${this.professional.full_name}${this.professional.title ? `, ${this.professional.title}` : ''}`);
    this.pdf.text(professionalInfo, clientNameX, 85);
    
    // Test uygulama yöntemi bilgisi
    const testCompletedBy = this.result.is_public_access 
      ? turkishToAscii(`Çevrimiçi link ile tamamlandı`) 
      : turkishToAscii(`Seans sırasında tamamlandı`);
    this.pdf.text(testCompletedBy, clientNameX, 105);
    
    // Tarih ve kurum bilgileri
    const date = new Date(this.result.created_at);
    const dateTimeStr = turkishToAscii(date.toLocaleString('tr-TR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }));
    
    // Sağ tarafta bilgi kutusu
    const infoBoxWidth = 200;
    const infoBoxX = this.pageWidth - this.marginRight - infoBoxWidth;
    const infoBoxY = 50;
    
    this.drawRoundedRect(infoBoxX, infoBoxY, infoBoxWidth, 50, 'lightGray');
    
    this.setColor('text');
    this.setFont('body', 'small');
    
    const tarihText = turkishToAscii(`Tarih: ${dateTimeStr}`);
    const sureText = turkishToAscii(`Süre: ${formatDuration(this.result.duration_seconds)}`);
    const kurumText = turkishToAscii(`Kurum: ${this.client.professional?.clinic_name || '-'}`);
    
    this.pdf.text(tarihText, infoBoxX + 10, infoBoxY + 15);
    this.pdf.text(sureText, infoBoxX + 10, infoBoxY + 30);
    this.pdf.text(kurumText, infoBoxX + 10, infoBoxY + 45);
    
    // Alt kısımda ince bir çizgi
    this.pdf.setDrawColor(THEME.colors.lightGray.r, THEME.colors.lightGray.g, THEME.colors.lightGray.b);
    this.pdf.setLineWidth(1);
    this.pdf.line(this.marginLeft, headerHeight - 1, this.pageWidth - this.marginRight, headerHeight - 1);
  }

  private drawTestInfo(): void {
    const startY = 150;
    
    // Başlık
    this.setColor('primary');
    this.setFont('heading', 'h2');
    this.pdf.text(turkishToAscii("Test Bilgileri"), this.marginLeft, startY);
    
    // Alt çizgi
    this.pdf.setDrawColor(THEME.colors.primary.r, THEME.colors.primary.g, THEME.colors.primary.b);
    this.pdf.setLineWidth(0.5);
    this.pdf.line(this.marginLeft, startY + 5, this.marginLeft + 100, startY + 5);
    
    // Test bilgisi
    this.setColor('text');
    this.setFont('body', 'normal');
    const testInfoText = turkishToAscii(this.test.infoText || this.test.description || "Bu test için tanılama kriterleri bulunmamaktadır.");
    const splitText = this.pdf.splitTextToSize(testInfoText, this.contentWidth);
    this.pdf.text(splitText, this.marginLeft, startY + 25);
    
    // Referans bilgisi
    if (this.test.reference) {
      this.setFont('body', 'small');
      this.pdf.text(turkishToAscii(`Referans: ${this.test.reference}`), this.marginLeft, startY + 25 + splitText.length * 7 + 15);
    }
  }

  private drawResults(): void {
    const startY = 230;
    
    // Başlık
    this.setColor('primary');
    this.setFont('heading', 'h2');
    this.pdf.text(turkishToAscii("Test Sonuçları"), this.marginLeft, startY);

    // Alt çizgi
    this.pdf.setDrawColor(THEME.colors.primary.r, THEME.colors.primary.g, THEME.colors.primary.b);
    this.pdf.setLineWidth(0.5);
    this.pdf.line(this.marginLeft, startY + 5, this.marginLeft + 100, startY + 5);
    
    // Sonuç kutusu
    const boxY = startY + 20;
    const boxHeight = 80;
    this.drawRoundedRect(this.marginLeft, boxY, this.contentWidth, boxHeight, 'lightGray');

    // Skor
    this.setColor('primary');
    this.setFont('heading', 'h1');
    const scoreText = turkishToAscii(`${this.result.score}`);
    this.pdf.text(scoreText, this.marginLeft + 30, boxY + 45);

    // Test yorumlaması
    this.setColor('text');
    this.setFont('body', 'normal');
    
    try {
      let interpretation = '';
      if (typeof this.test.interpretScore === 'function') {
        interpretation = this.test.interpretScore(this.result.score);
      }

      if (!interpretation || interpretation.trim() === '') {
        interpretation = 'Test tamamlandı';
      }
      
      const interpretationText = turkishToAscii(`Değerlendirme: ${interpretation}`);
      const splitInterpretation = this.pdf.splitTextToSize(interpretationText, this.contentWidth - 150);
      this.pdf.text(splitInterpretation, this.marginLeft + 120, boxY + 45);
    } catch (error) {
      console.error('Skor yorumlama hatası:', error);
      const fallbackText = turkishToAscii('Değerlendirme: Test tamamlandı');
      this.pdf.text(fallbackText, this.marginLeft + 120, boxY + 45);
    }
  }

  private drawQuestionsAndAnswers(): void {
    this.pdf.addPage();
    
    // Sayfa başlığı
    this.setColor('primary');
    this.setFont('heading', 'h2');
    this.pdf.text(turkishToAscii("Test Soruları ve Cevapları"), this.marginLeft, 50);
    
    // Alt çizgi
    this.pdf.setDrawColor(THEME.colors.primary.r, THEME.colors.primary.g, THEME.colors.primary.b);
    this.pdf.setLineWidth(0.5);
    this.pdf.line(this.marginLeft, 55, this.marginLeft + 200, 55);
    
    let currentY = 80;
    const lineHeight = 35; // Satır yüksekliği artırıldı
    const rowPadding = 5; // Satır içi padding
    const columnSpacing = 15; // Sütunlar arası boşluk
    
    // Sütun genişlikleri
    const columnWidths = {
      number: 25,    // Soru No sütunu
      question: 350, // Soru sütunu
      answer: 100    // Cevap sütunu
    };
    
    // Sütun başlangıç pozisyonları
    const columnPositions = {
      number: this.marginLeft + 10,
      question: this.marginLeft + columnWidths.number + columnSpacing,
      answer: this.marginLeft + columnWidths.number + columnWidths.question + columnSpacing * 2
    };
    
    // Test questions ve options kontrolü
    if (!this.test.questions || this.test.questions.length === 0) {
      this.setColor('text');
      this.setFont('body', 'normal');
      this.pdf.text(turkishToAscii("Test soruları mevcut değil."), this.marginLeft, currentY);
      return;
    }
    
    // Tablo başlıkları
    this.setColor('primary');
    this.setFont('body', 'normal');
    this.pdf.text(turkishToAscii("No"), columnPositions.number, currentY);
    this.pdf.text(turkishToAscii("Soru"), columnPositions.question, currentY);
    this.pdf.text(turkishToAscii("Cevap"), columnPositions.answer, currentY);
    
    // Başlık altı çizgisi
    this.pdf.setDrawColor(THEME.colors.primary.r, THEME.colors.primary.g, THEME.colors.primary.b);
    this.pdf.setLineWidth(0.5);
    this.pdf.line(this.marginLeft, currentY + 5, this.pageWidth - this.marginRight, currentY + 5);
    
    currentY += 15;
    
    // Her soru için
    for (let i = 0; i < this.test.questions.length; i++) {
      const question = this.test.questions[i];
      
      // Eğer sayfa sonuna yaklaştıysak yeni sayfa ekle
      if (currentY > this.pageHeight - 100) {
        this.pdf.addPage();
        currentY = 50;
        
        // Yeni sayfada başlık
        this.setColor('primary');
        this.setFont('heading', 'h3');
        this.pdf.text(turkishToAscii("Test Soruları ve Cevapları (devam)"), this.marginLeft, 30);
        this.pdf.line(this.marginLeft, 35, this.marginLeft + 200, 35);
        currentY = 50;
        
        // Tablo başlıklarını tekrar çiz
        this.setColor('primary');
        this.setFont('body', 'normal');
        this.pdf.text(turkishToAscii("No"), columnPositions.number, currentY);
        this.pdf.text(turkishToAscii("Soru"), columnPositions.question, currentY);
        this.pdf.text(turkishToAscii("Cevap"), columnPositions.answer, currentY);
        
        // Başlık altı çizgisi
        this.pdf.setDrawColor(THEME.colors.primary.r, THEME.colors.primary.g, THEME.colors.primary.b);
        this.pdf.setLineWidth(0.5);
        this.pdf.line(this.marginLeft, currentY + 5, this.pageWidth - this.marginRight, currentY + 5);
        
        currentY += 15;
      }
      
      // Zebra çizgili arka plan
      if (i % 2 === 0) {
        this.drawRoundedRect(this.marginLeft, currentY, this.contentWidth, lineHeight, 'lightGray');
      } else {
        this.drawRoundedRect(this.marginLeft, currentY, this.contentWidth, lineHeight, 'white');
      }
      
      // Soru numarası
      this.setColor('primary');
      this.setFont('body', 'normal');
      const questionNumber = turkishToAscii(`${i + 1}`);
      this.pdf.text(questionNumber, columnPositions.number, currentY + rowPadding + 5);
      
      // Soru metni
      this.setColor('text');
      const questionText = turkishToAscii(question.text || 'Soru');
      const splitQuestion = this.pdf.splitTextToSize(questionText, columnWidths.question - 10);
      this.pdf.text(splitQuestion, columnPositions.question, currentY + rowPadding + 5);
      
      // Cevap bölümü
      const answerId = question.id;
      const answerValue = this.result.answers[answerId];
      
      // Verilen cevabı bul
      let answerText = 'Cevap bulunamadı';
      if (answerValue !== undefined && question.options) {
        const selectedOption = question.options.find(opt => opt.value === Number(answerValue));
        if (selectedOption) {
          answerText = selectedOption.text;
        }
      }
      
      // Cevap değeri ve metni
      this.setColor('accent');
      this.setFont('body', 'normal');
      const valueText = turkishToAscii(`${answerValue !== undefined ? answerValue : '-'}`);
      this.pdf.text(valueText, columnPositions.answer, currentY + rowPadding + 5);
      
      this.setColor('text');
      const formattedAnswer = turkishToAscii(answerText);
      const splitAnswer = this.pdf.splitTextToSize(formattedAnswer, columnWidths.answer - 10);
      this.pdf.text(splitAnswer, columnPositions.answer + 20, currentY + rowPadding + 5);
      
      // Bir sonraki satır için boşluk
      currentY += lineHeight;
    }
  }

  private drawFooter(): void {
    const footerY = this.pageHeight - 25;
        
        // Alt çizgi
    this.pdf.setDrawColor(THEME.colors.primary.r, THEME.colors.primary.g, THEME.colors.primary.b);
    this.pdf.setLineWidth(0.5);
    this.pdf.line(this.marginLeft, footerY - 10, this.pageWidth - this.marginRight, footerY - 10);
    
    this.setFont('body', 'small');
    this.setColor('textLight');
    
    // Rapor bilgileri
    const date = new Date(this.result.created_at);
    const dateTimeStr = turkishToAscii(date.toLocaleString('tr-TR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }));
    
    const reportInfo = turkishToAscii(`Rapor No: ${this.result.id.slice(0, 8).toUpperCase()} | ${dateTimeStr}`);
    this.pdf.text(reportInfo, this.marginLeft, footerY);
    
    // Yasal uyarı 
    const disclaimer = turkishToAscii('© 2025 Tüm hakları saklıdır. Bu rapor klinik değerlendirme için uzman görüşü ile birlikte kullanılmalıdır.');
    this.pdf.text(disclaimer, this.pageWidth - this.marginRight, footerY, { align: 'right' });
  }
}

export function generateTestPDF(
  test: Test,
  result: TestResult,
  client: Client,
  professional: Professional
): jsPDF {
  const generator = new TestPDFGenerator(test, result, client, professional);
  return generator.generate();
} 